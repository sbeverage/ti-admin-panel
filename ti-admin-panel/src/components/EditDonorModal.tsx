import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, Typography, message } from 'antd';
import { EditOutlined, MailOutlined, PhoneOutlined, BankOutlined, DollarOutlined, CalendarOutlined, EnvironmentOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './InviteDonorModal.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

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

  // Populate form when donor data is available
  useEffect(() => {
    if (donor && visible) {
      // Parse city and state from cityState field
      const cityStateParts = donor.cityState?.split(', ') || ['', ''];
      const city = cityStateParts[0] || '';
      const state = cityStateParts[1] || '';
      
      // Extract numeric values from donation strings (e.g., "$500" -> "500")
      const donationAmount = donor.donation?.replace(/[^0-9.]/g, '') || '0';
      const oneTimeAmount = donor.oneTime?.replace(/[^0-9.]/g, '') || '0';
      
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
        zipCode: '', // Not available in current data structure
        beneficiary: donor.beneficiary || '',
        coworking: donor.coworking || 'No',
        donation: donationAmount !== '0' ? donationAmount : '',
        oneTime: oneTimeAmount !== '0' ? oneTimeAmount : '',
        lastDonated: lastDonatedDate,
        notes: donor.notes || ''
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [donor, visible, form]);

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
      
      console.log('📦 Updated donor data:', values);
      
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Don't return null - always render modal, just disable it if no donor
  // This ensures the modal can be shown/hidden properly

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
            <Title level={3} className="modal-title">Edit Donor</Title>
            <Text className="modal-subtitle">Update donor information and details</Text>
          </div>
        </div>
      }
      open={visible && !!donor}
      maskClosable={false}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="invite-donor-modal"
      destroyOnClose={false}
    >
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
                rules={[{ required: true, message: 'Please enter one time gift amount' }]}
                className="form-item"
              >
                <Input 
                  placeholder="Enter one time gift amount"
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
    </Modal>
  );
};

export default EditDonorModal;
