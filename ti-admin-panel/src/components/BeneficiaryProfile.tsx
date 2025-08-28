import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Divider,
  Space,
  Input,
  Select,
  Checkbox,
  InputNumber,
  Upload,
  message,
  Spin,
  Tabs,
  Badge,
  Statistic,
  Descriptions,
  Image
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  StarOutlined,
  HeartOutlined,
  SafetyOutlined,
  TeamOutlined,
  PictureOutlined,
  UploadOutlined,
  CheckCircleFilled,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  IdcardOutlined,
  TrophyOutlined,
  BankOutlined
} from '@ant-design/icons';
import './BeneficiaryProfile.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface BeneficiaryProfileProps {
  beneficiaryId: string;
  onClose: () => void;
  onUpdate: (updatedData: any) => void;
}

interface BeneficiaryData {
  id: string;
  beneficiaryName: string;
  contactName: string;
  email: string;
  contactNumber: string;
  bankAccount: string;
  donation: string;
  dateOfJoin: string;
  cityState: string;
  beneficiaryCause: string;
  beneficiaryType: string;
  donors: number;
  active: boolean;
  enabled: boolean;
  // New fields
  about?: string;
  mainImageUrl?: string;
  whyThisMatters?: string;
  successStory?: string;
  storyAuthor?: string;
  familiesHelped?: string;
  communitiesServed?: number;
  directToPrograms?: number;
  impactStatement1?: string;
  impactStatement2?: string;
  ein?: string;
  website?: string;
  verificationStatus?: boolean;
  volunteerInfo?: string;
}

const BeneficiaryProfile: React.FC<BeneficiaryProfileProps> = ({
  beneficiaryId,
  onClose,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockData: BeneficiaryData = {
      id: beneficiaryId,
      beneficiaryName: 'United Way',
      contactName: 'Keith Arnold',
      email: 'keitharnold@gmail.com',
      contactNumber: '+1 (555) 123-4567',
      bankAccount: '****1234',
      donation: '$25,000',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Springfield, IL',
      beneficiaryCause: 'Health and Medical Charities',
      beneficiaryType: 'National',
      donors: 300,
      active: false,
      enabled: false,
      about: 'United Way is a global network of more than 1,800 local nonprofit fundraising affiliates. We work to create lasting positive change in communities across the world by mobilizing the caring power of communities around the globe to advance the common good.',
      whyThisMatters: 'Every donation directly supports families in need, providing immediate relief and long-term solutions. Your generosity creates real change in our community and helps build a stronger future for everyone. We believe that everyone deserves access to basic necessities and opportunities to thrive.',
      successStory: 'Thanks to generous donors like you, we were able to provide emergency housing for the Johnson family during their crisis. When they lost their home due to a devastating fire, your support made it possible for us to secure temporary housing, replace essential items, and connect them with long-term housing resources. Your support makes these miracles possible and transforms lives every day.',
      storyAuthor: 'Sarah M., Program Director',
      familiesHelped: '10,000+',
      communitiesServed: 25,
      directToPrograms: 95,
      impactStatement1: 'Every $25 provides a family with essential supplies for one week',
      impactStatement2: 'Every $100 helps provide emergency housing for families in crisis',
      ein: '12-3456789',
      website: 'https://unitedway.org',
      verificationStatus: true,
      volunteerInfo: 'Beyond financial support, there are many ways to make a difference: volunteer at events, spread awareness, join committees, and participate in community outreach programs. Contact us to learn more about volunteer opportunities and how you can get involved in making a positive impact.'
    };

    setBeneficiaryData(mockData);
    setFormData(mockData);
    setLoading(false);
  }, [beneficiaryId]);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...beneficiaryData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...beneficiaryData });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here you would make an API call to update the beneficiary
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setBeneficiaryData(formData);
      setIsEditing(false);
      onUpdate(formData);
      message.success('Beneficiary updated successfully!');
    } catch (error) {
      message.error('Failed to update beneficiary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="beneficiary-profile-loading">
        <Spin size="large" />
        <Text>Loading beneficiary profile...</Text>
      </div>
    );
  }

  if (!beneficiaryData) {
    return (
      <div className="beneficiary-profile-error">
        <Text>Beneficiary not found</Text>
        <Button onClick={onClose}>Go Back</Button>
      </div>
    );
  }

  const renderBasicInfo = () => (
    <Card title="Basic Information" className="profile-section-card">
      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Beneficiary Name</label>
            {isEditing ? (
              <Input
                value={formData.beneficiaryName}
                onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                placeholder="Enter beneficiary name"
              />
            ) : (
              <Text strong>{beneficiaryData.beneficiaryName}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Category</label>
            {isEditing ? (
              <Select
                value={formData.beneficiaryCause}
                onChange={(value) => handleInputChange('beneficiaryCause', value)}
                placeholder="Select category"
                style={{ width: '100%' }}
              >
                <Option value="healthcare">Healthcare</Option>
                <Option value="education">Education</Option>
                <Option value="housing">Housing</Option>
                <Option value="hunger">Hunger Relief</Option>
                <Option value="environment">Environment</Option>
                <Option value="children">Children & Youth</Option>
                <Option value="social-services">Social Services</Option>
                <Option value="arts-culture">Arts & Culture</Option>
              </Select>
            ) : (
              <Tag color="blue">{beneficiaryData.beneficiaryCause}</Tag>
            )}
          </div>
        </Col>
      </Row>
      
      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Location</label>
            {isEditing ? (
              <Input
                value={formData.cityState}
                onChange={(e) => handleInputChange('cityState', e.target.value)}
                placeholder="City, State"
              />
            ) : (
              <Text>{beneficiaryData.cityState}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Beneficiary Type</label>
            {isEditing ? (
              <Select
                value={formData.beneficiaryType}
                onChange={(value) => handleInputChange('beneficiaryType', value)}
                placeholder="Select type"
                style={{ width: '100%' }}
              >
                <Option value="local">Local</Option>
                <Option value="national">National</Option>
                <Option value="international">International</Option>
              </Select>
            ) : (
              <Tag color="green">{beneficiaryData.beneficiaryType}</Tag>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Primary Contact</label>
            {isEditing ? (
              <Input
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder="Enter contact name"
              />
            ) : (
              <Text>{beneficiaryData.contactName}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Email</label>
            {isEditing ? (
              <Input
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email"
              />
            ) : (
              <Text>{beneficiaryData.email}</Text>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Phone Number</label>
            {isEditing ? (
              <Input
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                placeholder="Enter phone number"
              />
            ) : (
              <Text>{beneficiaryData.contactNumber}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Bank Account</label>
            {isEditing ? (
              <Input
                value={formData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                placeholder="Enter bank account"
              />
            ) : (
              <Text>{beneficiaryData.bankAccount}</Text>
            )}
          </div>
        </Col>
      </Row>

      <div className="form-field">
        <label>About</label>
        {isEditing ? (
          <Input.TextArea
            value={formData.about}
            onChange={(e) => handleInputChange('about', e.target.value)}
            rows={4}
            placeholder="Describe the beneficiary organization and their mission..."
            showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
            maxLength={1000}
          />
        ) : (
          <Paragraph>{beneficiaryData.about}</Paragraph>
        )}
      </div>
    </Card>
  );

  const renderImpactStory = () => (
    <Card title="Impact & Story" className="profile-section-card">
      <div className="form-field">
        <label>Why This Matters</label>
        {isEditing ? (
          <Input.TextArea
            value={formData.whyThisMatters}
            onChange={(e) => handleInputChange('whyThisMatters', e.target.value)}
            rows={4}
            placeholder="Explain why this cause is important..."
            showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
            maxLength={500}
          />
        ) : (
          <Paragraph>{beneficiaryData.whyThisMatters}</Paragraph>
        )}
      </div>

      <div className="form-field">
        <label>Success Story</label>
        {isEditing ? (
          <Input.TextArea
            value={formData.successStory}
            onChange={(e) => handleInputChange('successStory', e.target.value)}
            rows={4}
            placeholder="Share a compelling story..."
            showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
            maxLength={500}
          />
        ) : (
          <Paragraph>{beneficiaryData.successStory}</Paragraph>
        )}
      </div>

      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Story Author</label>
            {isEditing ? (
              <Input
                value={formData.storyAuthor}
                onChange={(e) => handleInputChange('storyAuthor', e.target.value)}
                placeholder="e.g., Sarah M., Program Director"
                maxLength={50}
              />
            ) : (
              <Text>{beneficiaryData.storyAuthor}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Families Helped</label>
            {isEditing ? (
              <Input
                value={formData.familiesHelped}
                onChange={(e) => handleInputChange('familiesHelped', e.target.value)}
                placeholder="e.g., 10,000+"
              />
            ) : (
              <Text>{beneficiaryData.familiesHelped}</Text>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Communities Served</label>
            {isEditing ? (
              <InputNumber
                value={formData.communitiesServed}
                onChange={(value) => handleInputChange('communitiesServed', value)}
                placeholder="e.g., 25"
                style={{ width: '100%' }}
                min={0}
              />
            ) : (
              <Text>{beneficiaryData.communitiesServed}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Direct to Programs (%)</label>
            {isEditing ? (
              <InputNumber
                value={formData.directToPrograms}
                onChange={(value) => handleInputChange('directToPrograms', value)}
                placeholder="e.g., 95"
                style={{ width: '100%' }}
                min={0}
                max={100}
              />
            ) : (
              <Text>{beneficiaryData.directToPrograms}%</Text>
            )}
          </div>
        </Col>
      </Row>

      <div className="form-field">
        <label>Impact Statement 1</label>
        {isEditing ? (
          <Input
            value={formData.impactStatement1}
            onChange={(e) => handleInputChange('impactStatement1', e.target.value)}
            placeholder="e.g., Every $25 provides a family with essential supplies for one week"
          />
        ) : (
          <Text>{beneficiaryData.impactStatement1}</Text>
        )}
      </div>

      <div className="form-field">
        <label>Impact Statement 2</label>
        {isEditing ? (
          <Input
            value={formData.impactStatement2}
            onChange={(e) => handleInputChange('impactStatement2', e.target.value)}
            placeholder="e.g., Every $100 helps provide emergency housing for families in crisis"
          />
        ) : (
          <Text>{beneficiaryData.impactStatement2}</Text>
        )}
      </div>
    </Card>
  );

  const renderTrustTransparency = () => (
    <Card title="Trust & Transparency" className="profile-section-card">
      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>EIN Number</label>
            {isEditing ? (
              <Input
                value={formData.ein}
                onChange={(e) => handleInputChange('ein', e.target.value)}
                placeholder="e.g., 12-3456789"
              />
            ) : (
              <Text>{beneficiaryData.ein}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Website</label>
            {isEditing ? (
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.org"
              />
            ) : (
              <Text>
                {beneficiaryData.website && (
                  <a href={beneficiaryData.website} target="_blank" rel="noopener noreferrer">
                    {beneficiaryData.website}
                  </a>
                )}
              </Text>
            )}
          </div>
        </Col>
      </Row>

      <div className="form-field">
        <label>Verification Status</label>
        {isEditing ? (
          <Checkbox
            checked={formData.verificationStatus}
            onChange={(e) => handleInputChange('verificationStatus', e.target.checked)}
          >
            Verified 501(c)(3) Nonprofit
          </Checkbox>
        ) : (
          <Badge
            status={beneficiaryData.verificationStatus ? 'success' : 'default'}
            text={beneficiaryData.verificationStatus ? 'Verified' : 'Not Verified'}
          />
        )}
      </div>
    </Card>
  );

  const renderVolunteerInfo = () => (
    <Card title="Get Involved" className="profile-section-card">
      <div className="form-field">
        <label>Volunteer Information</label>
        {isEditing ? (
          <Input.TextArea
            value={formData.volunteerInfo}
            onChange={(e) => handleInputChange('volunteerInfo', e.target.value)}
            rows={4}
            placeholder="Information about volunteer opportunities..."
            showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
            maxLength={500}
          />
        ) : (
          <Paragraph>{beneficiaryData.volunteerInfo}</Paragraph>
        )}
      </div>
    </Card>
  );

  const renderStats = () => (
    <Card title="Quick Stats" className="profile-section-card">
      <Row gutter={[24, 16]}>
        <Col span={6}>
          <Statistic
            title="Total Donations"
            value={beneficiaryData.donation}
            prefix={<BankOutlined />}
            valueStyle={{ color: '#DB8633' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Donors"
            value={beneficiaryData.donors}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Date Joined"
            value={beneficiaryData.dateOfJoin}
            prefix={<StarOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Status"
            value={beneficiaryData.active ? 'Active' : 'Inactive'}
            prefix={beneficiaryData.active ? <CheckCircleFilled /> : <CloseOutlined />}
            valueStyle={{ color: beneficiaryData.active ? '#52c41a' : '#ff4d4f' }}
          />
        </Col>
      </Row>
    </Card>
  );

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <UserOutlined />,
      children: (
        <div className="tab-content">
          {renderStats()}
          {renderBasicInfo()}
        </div>
      )
    },
    {
      key: 'impact',
      label: 'Impact & Story',
      icon: <HeartOutlined />,
      children: (
        <div className="tab-content">
          {renderImpactStory()}
        </div>
      )
    },
    {
      key: 'trust',
      label: 'Trust & Transparency',
      icon: <SafetyOutlined />,
      children: (
        <div className="tab-content">
          {renderTrustTransparency()}
        </div>
      )
    },
    {
      key: 'volunteer',
      label: 'Get Involved',
      icon: <TeamOutlined />,
      children: (
        <div className="tab-content">
          {renderVolunteerInfo()}
        </div>
      )
    }
  ];

  return (
    <div className="beneficiary-profile-overlay">
      <div className="beneficiary-profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="header-left">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onClose}
              className="back-button"
            >
              Back to Beneficiaries
            </Button>
            <div className="beneficiary-title">
              <Avatar size={64} style={{ backgroundColor: '#DB8633' }}>
                {beneficiaryData.beneficiaryName.charAt(0)}
              </Avatar>
              <div className="title-content">
                <Title level={2} style={{ margin: 0 }}>
                  {beneficiaryData.beneficiaryName}
                </Title>
                <Text type="secondary">
                  {beneficiaryData.beneficiaryCause} • {beneficiaryData.cityState}
                </Text>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            {isEditing ? (
              <Space>
                <Button onClick={handleCancel} icon={<CloseOutlined />}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleSave}
                  icon={<SaveOutlined />}
                  loading={saving}
                >
                  Save Changes
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                onClick={handleEdit}
                icon={<EditOutlined />}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="profile-content">
          <Tabs
            items={tabItems}
            defaultActiveKey="overview"
            className="profile-tabs"
            size="large"
          />
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryProfile;
