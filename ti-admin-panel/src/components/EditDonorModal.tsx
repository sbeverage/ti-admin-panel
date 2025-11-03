import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, Typography, Tabs, Card, Tag, Divider, Spin, Empty } from 'antd';
import { 
  EditOutlined, MailOutlined, PhoneOutlined, BankOutlined, DollarOutlined, 
  CalendarOutlined, EnvironmentOutlined, ArrowLeftOutlined, CreditCardOutlined,
  HeartOutlined, TrophyOutlined, HistoryOutlined, GiftOutlined,
  AppleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { donorAPI } from '../services/api';
import './InviteDonorModal.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface EditDonorModalProps {
  visible: boolean;
  donor: any | null;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const EditDonorModal: React.FC<EditDonorModalProps> = ({
  visible,
  donor,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [donorDetails, setDonorDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch detailed donor information when modal opens
  useEffect(() => {
    if (donor && visible && donor.id) {
      fetchDonorDetails(donor.id);
    } else {
      setDonorDetails(null);
    }
  }, [donor, visible]);

  // Populate form when donor data is available
  useEffect(() => {
    if (donor && visible) {
      // Parse city and state from cityState field
      const cityStateParts = donor.cityState?.split(', ') || ['', ''];
      const city = cityStateParts[0] || '';
      const state = cityStateParts[1] || '';
      
              // Extract numeric values from donation strings (e.g., "$500" -> "500")
              // Handle both formatted strings like "$15" and plain numbers
              const donationAmount = donor.donation ? 
                (typeof donor.donation === 'string' ? donor.donation.replace(/[^0-9.]/g, '') : String(donor.donation)) : 
                '0';
              const oneTimeAmount = donor.oneTime ? 
                (typeof donor.oneTime === 'string' ? donor.oneTime.replace(/[^0-9.]/g, '') : String(donor.oneTime)) : 
                '0';
      
      // Parse last donated date if available
      let lastDonatedDate = null;
      if (donor.lastDonated && donor.lastDonated !== 'Never') {
        try {
          lastDonatedDate = new Date(donor.lastDonated);
          if (isNaN(lastDonatedDate.getTime())) {
            lastDonatedDate = null;
          }
        } catch {
          lastDonatedDate = null;
        }
      }

      form.setFieldsValue({
        name: donor.name || '',
        email: donor.email || '',
        contact: donor.contact || '',
        city: city,
        state: state,
        zipCode: '',
        beneficiary: donor.beneficiary || '',
        coworking: donor.coworking || 'No',
        donation: donationAmount !== '0' ? donationAmount : '',
        oneTime: oneTimeAmount !== '0' ? oneTimeAmount : '',
        lastDonated: lastDonatedDate,
        notes: donor.notes || ''
      });
    } else if (!visible) {
      form.resetFields();
      setActiveTab('overview');
    }
  }, [donor, visible, form]);

  const fetchDonorDetails = async (donorId: number) => {
    setLoadingDetails(true);
    try {
      const response = await donorAPI.getDonorDetails(donorId);
      if (response.success && response.data) {
        setDonorDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching donor details:', error);
      // If endpoint doesn't exist, use mock/fallback data structure
      setDonorDetails({
        payment_methods: [],
        monthly_donation: null,
        current_beneficiary: null,
        donation_history: [],
        discount_redemptions: [],
        total_savings: 0,
        leaderboard_position: null
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Format the date
      if (values.lastDonated) {
        values.lastDonated = values.lastDonated.format('YYYY-MM-DD');
      }
      
      // Combine city, state, and ZIP for display/storage
      if (values.city && values.state) {
        values.cityState = `${values.city}, ${values.state}${values.zipCode ? ' ' + values.zipCode : ''}`;
      }
      
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setActiveTab('overview');
    onCancel();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      title={
        <div className="modal-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleCancel}
            className="back-btn"
          />
          <div className="header-content">
            <Title level={3} className="modal-title">
              {donor?.name || 'Donor'} Profile
            </Title>
            <Text className="modal-subtitle">View and edit donor information</Text>
          </div>
        </div>
      }
      open={visible && !!donor}
      maskClosable={false}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      className="invite-donor-modal donor-profile-modal"
      destroyOnClose={false}
    >
      <Spin spinning={loadingDetails}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          className="donor-profile-tabs"
        >
          {/* Overview Tab */}
          <TabPane tab={<span><InfoCircleOutlined /> Overview</span>} key="overview">
            <Form
              form={form}
              layout="vertical"
              className="invite-donor-form"
              initialValues={{
                coworking: donor?.coworking || 'No',
              }}
            >
              <div className="form-sections">
                {/* Personal Information Section */}
                <div className="form-section">
                  <Title level={4} className="section-title">
                    Personal Information
                  </Title>
                  <div className="form-row">
                    <Form.Item
                      name="name"
                      label="Donor Name"
                      rules={[{ required: true, message: 'Please enter the donor name' }]}
                      className="form-item"
                    >
                      <Input 
                        placeholder="Enter donor name"
                        prefix={<EditOutlined />}
                        size="large"
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: 'Please enter the email address' },
                        { type: 'email', message: 'Please enter a valid email address' }
                      ]}
                      className="form-item"
                    >
                      <Input 
                        placeholder="Enter email address"
                        prefix={<MailOutlined />}
                        size="large"
                      />
                    </Form.Item>
                  </div>
                  
                  <div className="form-row">
                    <Form.Item
                      name="contact"
                      label="Contact Number"
                      rules={[{ required: true, message: 'Please enter the contact number' }]}
                      className="form-item"
                    >
                      <Input 
                        placeholder="Enter contact number"
                        prefix={<PhoneOutlined />}
                        size="large"
                      />
                    </Form.Item>
                  </div>
                  
                  <div className="form-row form-row-three">
                    <Form.Item
                      name="city"
                      label="City"
                      rules={[{ required: true, message: 'Please enter city' }]}
                      className="form-item"
                    >
                      <Input 
                        placeholder="Enter city"
                        prefix={<EnvironmentOutlined />}
                        size="large"
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="state"
                      label="State"
                      rules={[{ required: true, message: 'Please enter state' }]}
                      className="form-item"
                    >
                      <Input 
                        placeholder="Enter state"
                        size="large"
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="zipCode"
                      label="ZIP Code"
                      rules={[{ required: false }]}
                      className="form-item"
                    >
                      <Input 
                        placeholder="Enter ZIP"
                        size="large"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Beneficiary & Donation Section */}
                <div className="form-section">
                  <Title level={4} className="section-title">
                    Beneficiary & Donation Information
                  </Title>
                  <div className="form-row">
                    <Form.Item
                      name="beneficiary"
                      label="Selected Beneficiary Name"
                      rules={[{ required: true, message: 'Please select a beneficiary' }]}
                      className="form-item"
                    >
                      <Select
                        placeholder="Select beneficiary"
                        size="large"
                      >
                        <Option value="United Way">United Way</Option>
                        <Option value="American Red Cross">American Red Cross</Option>
                        <Option value="Feeding America">Feeding America</Option>
                        <Option value="St. Jude Children's Research Hospital">St. Jude Children's Research Hospital</Option>
                        <Option value="Habitat for Humanity">Habitat for Humanity</Option>
                        <Option value="Make-A-Wish Foundation">Make-A-Wish Foundation</Option>
                        <Option value="Doctors Without Borders USA">Doctors Without Borders USA</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      name="coworking"
                      label="Coworking"
                      rules={[{ required: true, message: 'Please select coworking status' }]}
                      className="form-item"
                    >
                      <Select size="large">
                        <Option value="Yes">Yes</Option>
                        <Option value="No">No</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  
                  <div className="form-row">
                    <Form.Item
                      name="donation"
                      label="Donation Amount"
                      rules={[{ required: true, message: 'Please enter donation amount' }]}
                      className="form-item"
                    >
                      <Input 
                        placeholder="Enter donation amount"
                        prefix={<DollarOutlined />}
                        size="large"
                        type="number"
                        min={0}
                      />
                    </Form.Item>
                    
              <Form.Item
                name="oneTime"
                label="One Time Gifts"
                rules={[{ required: false }]}
                className="form-item"
              >
                <Input 
                  placeholder="Enter one time gift amount (optional)"
                  prefix={<DollarOutlined />}
                  size="large"
                  type="number"
                  min={0}
                />
              </Form.Item>
                  </div>
                  
                  <div className="form-row">
                    <Form.Item
                      name="lastDonated"
                      label="Last Donated Date"
                      className="form-item full-width"
                    >
                      <DatePicker 
                        placeholder="Select last donated date"
                        size="large"
                        style={{ width: '100%' }}
                        format="MMMM DD, YYYY"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Additional Notes Section */}
                <div className="form-section">
                  <Title level={4} className="section-title">
                    Additional Information
                  </Title>
                  <Form.Item
                    name="notes"
                    label="Notes"
                    className="form-item full-width"
                  >
                    <TextArea 
                      placeholder="Enter any additional notes about the donor"
                      rows={3}
                      size="large"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <Space size="middle">
                  <Button 
                    size="large" 
                    onClick={handleCancel}
                    className="cancel-btn"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleSubmit}
                    loading={loading}
                    icon={<EditOutlined />}
                    className="submit-btn"
                  >
                    Update Donor
                  </Button>
                </Space>
              </div>
            </Form>
          </TabPane>

          {/* Payment Methods Tab */}
          <TabPane tab={<span><CreditCardOutlined /> Payment Methods</span>} key="payment">
            <div style={{ padding: '20px 0' }}>
              {donorDetails?.payment_methods && donorDetails.payment_methods.length > 0 ? (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {donorDetails.payment_methods.map((method: any, index: number) => (
                    <Card key={index} size="small">
                      <Space>
                        {method.type === 'apple_pay' ? (
                          <AppleOutlined style={{ fontSize: '24px', color: '#000' }} />
                        ) : (
                          <CreditCardOutlined style={{ fontSize: '24px', color: '#DB8633' }} />
                        )}
                        <div>
                          <Text strong>
                            {method.type === 'apple_pay' ? 'Apple Pay' : 
                             method.brand ? `${method.brand.toUpperCase()} •••• ${method.last4}` : 
                             'Credit Card'}
                          </Text>
                          {method.is_default && (
                            <Tag color="green" style={{ marginLeft: '8px' }}>Default</Tag>
                          )}
                          <br />
                          <Text type="secondary">Expires {method.exp_month}/{method.exp_year}</Text>
                        </div>
                      </Space>
                    </Card>
                  ))}
                </Space>
              ) : (
                <Empty 
                  description="No payment methods on file"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </TabPane>

          {/* Monthly Donation Tab */}
          <TabPane tab={<span><DollarOutlined /> Monthly Donation</span>} key="monthly">
            <div style={{ padding: '20px 0' }}>
              <Card>
                {donorDetails?.monthly_donation ? (
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary">Monthly Donation Amount</Text>
                      <Title level={2} style={{ margin: '8px 0', color: '#DB8633' }}>
                        {formatCurrency(donorDetails.monthly_donation.amount)}
                      </Title>
                    </div>
                    <Divider />
                    <div>
                      <Text strong>Status: </Text>
                      <Tag color={donorDetails.monthly_donation.active ? 'green' : 'red'}>
                        {donorDetails.monthly_donation.active ? 'Active' : 'Inactive'}
                      </Tag>
                    </div>
                    {donorDetails.monthly_donation.start_date && (
                      <div>
                        <Text strong>Started: </Text>
                        <Text>{formatDate(donorDetails.monthly_donation.start_date)}</Text>
                      </div>
                    )}
                    {donorDetails.monthly_donation.next_charge_date && (
                      <div>
                        <Text strong>Next Charge: </Text>
                        <Text>{formatDate(donorDetails.monthly_donation.next_charge_date)}</Text>
                      </div>
                    )}
                  </Space>
                ) : (
                  <Empty 
                    description="No monthly donation set up"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </div>
          </TabPane>

          {/* Current Beneficiary Tab */}
          <TabPane tab={<span><HeartOutlined /> Current Beneficiary</span>} key="beneficiary">
            <div style={{ padding: '20px 0' }}>
              {donorDetails?.current_beneficiary ? (
                <Card>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>
                        {donorDetails.current_beneficiary.name}
                      </Text>
                      <br />
                      <Text type="secondary">
                        {donorDetails.current_beneficiary.category || 'Charity'}
                      </Text>
                    </div>
                    <Divider />
                    <div>
                      <Text type="secondary">Donation Amount</Text>
                      <Title level={3} style={{ margin: '8px 0', color: '#DB8633' }}>
                        {formatCurrency(donorDetails.current_beneficiary.amount)}
                      </Title>
                    </div>
                    {donorDetails.current_beneficiary.start_date && (
                      <div>
                        <Text strong>Since: </Text>
                        <Text>{formatDate(donorDetails.current_beneficiary.start_date)}</Text>
                      </div>
                    )}
                  </Space>
                </Card>
              ) : (
                <Empty 
                  description="No current beneficiary"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </TabPane>

          {/* Donation History Tab */}
          <TabPane tab={<span><HistoryOutlined /> Donation History</span>} key="history">
            <div style={{ padding: '20px 0' }}>
              {donorDetails?.donation_history && donorDetails.donation_history.length > 0 ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {donorDetails.donation_history.map((donation: any, index: number) => (
                    <Card key={index} size="small">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>{donation.beneficiary_name || 'Beneficiary'}</Text>
                          <br />
                          <Text type="secondary">{formatDate(donation.date)}</Text>
                        </div>
                        <Text strong style={{ fontSize: '18px', color: '#DB8633' }}>
                          {formatCurrency(donation.amount)}
                        </Text>
                      </div>
                      {donation.type && (
                        <Tag style={{ marginTop: '8px' }}>
                          {donation.type === 'monthly' ? 'Monthly' : 'One-time'}
                        </Tag>
                      )}
                    </Card>
                  ))}
                </Space>
              ) : (
                <Empty 
                  description="No donation history available"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </TabPane>

          {/* Discount Redemptions Tab */}
          <TabPane tab={<span><GiftOutlined /> Discount Redemptions</span>} key="discounts">
            <div style={{ padding: '20px 0' }}>
              {donorDetails?.discount_redemptions && donorDetails.discount_redemptions.length > 0 ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {donorDetails.discount_redemptions.map((redemption: any, index: number) => (
                    <Card key={index} size="small">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>{redemption.vendor_name || 'Vendor'}</Text>
                          <br />
                          <Text type="secondary">{redemption.discount_name || 'Discount'}</Text>
                          <br />
                          <Text type="secondary">{formatDate(redemption.date)}</Text>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Tag color="green">Saved {formatCurrency(redemption.savings)}</Tag>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            {redemption.location || ''}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Divider />
                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: '16px' }}>Total Savings</Text>
                      <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                        {formatCurrency(donorDetails.total_savings || 0)}
                      </Title>
                    </div>
                  </Card>
                </Space>
              ) : (
                <Empty 
                  description="No discount redemptions"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </TabPane>

          {/* Leaderboard Tab */}
          <TabPane tab={<span><TrophyOutlined /> Leaderboard</span>} key="leaderboard">
            <div style={{ padding: '20px 0' }}>
              {donorDetails?.leaderboard_position ? (
                <Card>
                  <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
                    <div>
                      <TrophyOutlined style={{ fontSize: '48px', color: '#DB8633' }} />
                      <Title level={2} style={{ margin: '16px 0' }}>
                        #{donorDetails.leaderboard_position.rank}
                      </Title>
                      <Text type="secondary">Overall Ranking</Text>
                    </div>
                    <Divider />
                    <div>
                      <Text type="secondary">Total Points</Text>
                      <Title level={3} style={{ margin: '8px 0', color: '#DB8633' }}>
                        {donorDetails.leaderboard_position.points?.toLocaleString() || 0}
                      </Title>
                    </div>
                    {donorDetails.leaderboard_position.period && (
                      <div>
                        <Text type="secondary">
                          {donorDetails.leaderboard_position.period === 'all_time' ? 'All Time' :
                           donorDetails.leaderboard_position.period === 'year' ? 'This Year' :
                           donorDetails.leaderboard_position.period === 'month' ? 'This Month' : ''}
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              ) : (
                <Empty 
                  description="No leaderboard data available"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default EditDonorModal;
