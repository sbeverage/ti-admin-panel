import React, { useState, useEffect } from 'react';
import {
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
  message,
  Spin,
  Tabs,
  Badge,
  Statistic,
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
  CheckCircleFilled,
  BankOutlined
} from '@ant-design/icons';
import './BeneficiaryProfile.css';
import ImageUpload from './ImageUpload';
import { beneficiaryAPI } from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface BeneficiaryProfileProps {
  beneficiaryId: string;
  beneficiaryData?: any; // Raw beneficiary data from API
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
  logoUrl?: string;
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
  // Fields from spec
  latitude?: number | string;
  longitude?: number | string;
  location?: string;
  likes?: number;
  mutual?: number;
  social?: string;
  isActive?: boolean;
}

const BeneficiaryProfile: React.FC<BeneficiaryProfileProps> = ({
  beneficiaryId,
  beneficiaryData: rawBeneficiaryData,
  onClose,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Fetch full beneficiary details by ID
  useEffect(() => {
    const fetchBeneficiary = async () => {
      if (!beneficiaryId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Always fetch fresh data from API to ensure we have all fields
        const response = await beneficiaryAPI.getBeneficiary(parseInt(beneficiaryId));
        
        if (response.success && response.data) {
          // Use the fetched data instead of rawBeneficiaryData
          const apiData = response.data;
          console.log('📋 BeneficiaryProfile: Fetched beneficiary data:', apiData);
          console.log('📋 BeneficiaryProfile: All keys in response:', Object.keys(apiData));
          console.log('📋 BeneficiaryProfile: Full response structure:', JSON.stringify(apiData, null, 2));
          transformAndSetData(apiData);
        } else if (rawBeneficiaryData) {
          // Fallback to passed data if API call fails
          transformAndSetData(rawBeneficiaryData);
        } else {
          message.error('Failed to load beneficiary details');
        }
      } catch (error) {
        console.error('Error fetching beneficiary:', error);
        // Fallback to passed data if available
        if (rawBeneficiaryData) {
          transformAndSetData(rawBeneficiaryData);
        } else {
          message.error('Failed to load beneficiary details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiary();
  }, [beneficiaryId]); // Only depend on beneficiaryId, not rawBeneficiaryData

  // Transform API data to display format
  const transformAndSetData = (apiData: any) => {
    // Transform API data to match our interface
    const transformed: BeneficiaryData = {
        id: apiData.id?.toString() || beneficiaryId,
        beneficiaryName: apiData.name || apiData.beneficiaryName || 'Unknown',
        contactName: apiData.contact_name || apiData.contactName || '',
        email: apiData.email || '',
        contactNumber: apiData.phone || apiData.contactNumber || apiData.phoneNumber || '',
        bankAccount: apiData.bank_account || apiData.bankAccount || '',
        donation: apiData.total_donations ? `$${apiData.total_donations.toLocaleString()}` : apiData.donation || '$0',
        dateOfJoin: apiData.createdAt || apiData.created_at || apiData.dateOfJoin || '',
        cityState: apiData.location || 
                   (apiData.address ? `${apiData.address.city || ''}, ${apiData.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') : '') ||
                   apiData.cityState || '',
        beneficiaryCause: apiData.category || apiData.cause || apiData.beneficiaryCause || '',
        beneficiaryType: apiData.type || apiData.beneficiaryType || '',
        donors: apiData.donor_count || apiData.mutual || apiData.donors || 0,
        active: apiData.isActive !== undefined ? apiData.isActive : 
                (apiData.is_active !== undefined ? apiData.is_active : true),
        enabled: apiData.isActive !== undefined ? apiData.isActive : 
                 (apiData.is_active !== undefined ? apiData.is_active : true),
        // Additional fields
        about: apiData.about || apiData.description || '',
        mainImageUrl: apiData.imageUrl || apiData.main_image || apiData.main_image_url || apiData.mainImageUrl || '',
        logoUrl: apiData.logo || apiData.logo_url || apiData.logoUrl || '',
        whyThisMatters: apiData.why_this_matters || apiData.mission || apiData.whyThisMatters || '',
        successStory: apiData.success_story || apiData.successStory || '',
        storyAuthor: apiData.story_author || apiData.storyAuthor || '',
        familiesHelped: apiData.families_helped || apiData.familiesHelped || '',
        communitiesServed: apiData.communities_served || apiData.communitiesServed || 0,
        directToPrograms: apiData.direct_to_programs || apiData.directToPrograms || 0,
        impactStatement1: apiData.impact_statement_1 || apiData.impactStatement1 || '',
        impactStatement2: apiData.impact_statement_2 || apiData.impactStatement2 || '',
        ein: apiData.ein || '',
        website: apiData.website || '',
        verificationStatus: apiData.verification_status || apiData.verificationStatus || false,
        volunteerInfo: apiData.volunteer_info || apiData.volunteerInfo || '',
        // New fields from spec
        latitude: apiData.latitude || '',
        longitude: apiData.longitude || '',
        location: apiData.location || '',
        likes: apiData.likes || 0,
        mutual: apiData.mutual || 0,
        social: apiData.social || '',
        isActive: apiData.isActive !== undefined ? apiData.isActive : 
                  (apiData.is_active !== undefined ? apiData.is_active : true),
      };
      setBeneficiaryData(transformed);
      setFormData(transformed);
  };

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
      // Transform form data to match backend API format
      const updateData: any = {
        name: formData.beneficiaryName,
        category: formData.beneficiaryCause,
        type: formData.beneficiaryType,
        location: formData.location || formData.cityState,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        phone: formData.contactNumber || '',
        contact_name: formData.contactName || '',
        // Send both field names for backend compatibility
        about: formData.about || '',
        description: formData.about || '', // Backend might use 'description'
        why_this_matters: formData.whyThisMatters || '',
        mission: formData.whyThisMatters || '', // Backend might use 'mission'
        success_story: formData.successStory || '',
        story_author: formData.storyAuthor || '',
        families_helped: formData.familiesHelped || '',
        communities_served: formData.communitiesServed || 0,
        direct_to_programs: formData.directToPrograms || 0,
        impact_statement_1: formData.impactStatement1 || '',
        impact_statement_2: formData.impactStatement2 || '',
        impact_statement: formData.impactStatement1 || '', // Legacy field
        transparency_rating: 0, // Default if not in form
        verification_status: formData.verificationStatus || false,
        ein: formData.ein || '',
        website: formData.website || '',
        social: formData.social || '',
        likes: formData.likes || 0,
        mutual: formData.mutual || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        main_image: formData.mainImageUrl || '',
        logo: formData.logoUrl || '', // If we have logo field
        volunteer_info: formData.volunteerInfo || ''
      };

      console.log('💾 Updating beneficiary:', beneficiaryId);
      console.log('💾 Update payload:', updateData);
      console.log('💾 All keys being sent:', Object.keys(updateData));

      // Call API to update beneficiary
      const response = await beneficiaryAPI.updateBeneficiary(parseInt(beneficiaryId), updateData);
      
      console.log('📡 Update API response:', response);

      if (response.success) {
        // Refresh the data by fetching again
        const fetchResponse = await beneficiaryAPI.getBeneficiary(parseInt(beneficiaryId));
        if (fetchResponse.success && fetchResponse.data) {
          transformAndSetData(fetchResponse.data);
        } else {
          // Fallback: update local state
          setBeneficiaryData(formData);
        }
        
        setIsEditing(false);
        onUpdate(formData);
        message.success('Beneficiary updated successfully!');
      } else {
        const errorMsg = response.error || 'Failed to update beneficiary';
        console.error('❌ Update error:', errorMsg);
        message.error(`Failed to update beneficiary: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('❌ Error updating beneficiary:', error);
      const errorMsg = error?.message || 'Failed to update beneficiary. Please try again.';
      message.error(errorMsg);
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
                <Option value="Childhood Illness">Childhood Illness</Option>
                <Option value="Animal Welfare">Animal Welfare</Option>
                <Option value="Low Income Families">Low Income Families</Option>
                <Option value="Education">Education</Option>
                <Option value="Environment">Environment</Option>
                <Option value="Disabilities">Disabilities</Option>
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
                value={formData.location || formData.cityState}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State"
              />
            ) : (
              <Text>{beneficiaryData.location || beneficiaryData.cityState}</Text>
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
                <Option value="Large">Large</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Small">Small</Option>
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
            <label>Latitude</label>
            {isEditing ? (
              <InputNumber
                value={formData.latitude}
                onChange={(value) => handleInputChange('latitude', value)}
                placeholder="e.g., 33.7490"
                style={{ width: '100%' }}
                precision={8}
                min={-90}
                max={90}
              />
            ) : (
              <Text>{beneficiaryData.latitude || 'N/A'}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Longitude</label>
            {isEditing ? (
              <InputNumber
                value={formData.longitude}
                onChange={(value) => handleInputChange('longitude', value)}
                placeholder="e.g., -84.3880"
                style={{ width: '100%' }}
                precision={8}
                min={-180}
                max={180}
              />
            ) : (
              <Text>{beneficiaryData.longitude || 'N/A'}</Text>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Likes</label>
            {isEditing ? (
              <InputNumber
                value={formData.likes}
                onChange={(value) => handleInputChange('likes', value)}
                placeholder="0"
                style={{ width: '100%' }}
                min={0}
              />
            ) : (
              <Text>{beneficiaryData.likes || 0}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Mutual Connections</label>
            {isEditing ? (
              <InputNumber
                value={formData.mutual}
                onChange={(value) => handleInputChange('mutual', value)}
                placeholder="0"
                style={{ width: '100%' }}
                min={0}
              />
            ) : (
              <Text>{beneficiaryData.mutual || 0}</Text>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Social Media</label>
            {isEditing ? (
              <Input
                value={formData.social}
                onChange={(e) => handleInputChange('social', e.target.value)}
                placeholder="@organizationname"
                maxLength={100}
              />
            ) : (
              <Text>{beneficiaryData.social || 'N/A'}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Active Status</label>
            {isEditing ? (
              <Checkbox
                checked={formData.isActive !== false}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              >
                Active (show in app)
              </Checkbox>
            ) : (
              <Tag color={beneficiaryData.isActive !== false ? 'success' : 'default'}>
                {beneficiaryData.isActive !== false ? 'Active' : 'Inactive'}
              </Tag>
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

      <Divider />

      <div className="form-field">
        <label>Main Image</label>
        <div style={{ marginTop: '8px' }}>
          {isEditing ? (
            <ImageUpload
              currentImageUrl={formData.mainImageUrl}
              onImageChange={(url) => handleInputChange('mainImageUrl', url)}
              title="Upload Beneficiary Image"
              description="Upload a main image for the beneficiary organization"
            />
          ) : (
            beneficiaryData.mainImageUrl ? (
              <Image
                src={beneficiaryData.mainImageUrl}
                alt="Beneficiary main image"
                style={{ maxWidth: 300, borderRadius: '8px' }}
              />
            ) : (
              <Text type="secondary">No image uploaded</Text>
            )
          )}
        </div>
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
