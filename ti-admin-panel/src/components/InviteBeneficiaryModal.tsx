import React, { useState } from 'react';
import { Modal, Steps, Form, Input, Select, Button, Row, Col, Typography, Divider, Checkbox, InputNumber, message, Card, Upload } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  PictureOutlined,
  CheckCircleFilled,
  HeartOutlined,
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  SafetyOutlined,
  UserOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { beneficiaryAPI } from '../services/api';
import ImageUpload from './ImageUpload';
import './InviteBeneficiaryModal.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface InviteBeneficiaryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const InviteBeneficiaryModal: React.FC<InviteBeneficiaryModalProps> = ({
  visible,
  onCancel,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [basicDetails, setBasicDetails] = useState<any>({});
  const [impactStory, setImpactStory] = useState<any>({});
  const [trustTransparency, setTrustTransparency] = useState<any>({});
  const [uploadImages, setUploadImages] = useState<any>({});
  const [saving, setSaving] = useState(false);
  // Image URLs from S3 uploads
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  // Form 990 file
  const [form990File, setForm990File] = useState<any>(null);
  // Profile links
  const [profileLinks, setProfileLinks] = useState<Array<{ channel: string; username: string }>>([{ channel: '', username: '' }]);

  const steps = [
    {
      title: 'Basic Information',
      icon: <FileTextOutlined style={{ color: '#324E58' }} />,
      description: basicDetails.beneficiaryName || basicDetails.city ? `${basicDetails.beneficiaryName || ''} ${basicDetails.city ? `(${basicDetails.city}, ${basicDetails.state || ''})` : ''}` : 'Organization name here'
    },
    {
      title: 'Impact & Story',
      icon: <HeartOutlined style={{ color: '#324E58' }} />,
      description: impactStory.whyThisMatters ? 'Impact details added' : 'Impact details here'
    },
    {
      title: 'Trust & Transparency',
      icon: <SafetyOutlined style={{ color: '#324E58' }} />,
      description: trustTransparency.ein || 'Trust info here'
    },
    {
      title: 'Upload Images',
      icon: <PictureOutlined style={{ color: '#324E58' }} />,
      description: uploadImages.imageCount || 'Number of images here'
    }
  ];

  // Image upload handlers - using real AWS S3 uploads
  const handleMainImageChange = (url: string | null) => {
    setMainImageUrl(url);
    form.setFieldsValue({ mainImage: url });
  };

  const handleLogoChange = (url: string | null) => {
    setLogoUrl(url);
    form.setFieldsValue({ logo: url });
  };

  const handleAdditionalImageChange = (url: string | null, index: number) => {
    if (url) {
      const newImages = [...additionalImages];
      newImages[index] = url;
      setAdditionalImages(newImages);
    } else {
      const newImages = additionalImages.filter((_, i) => i !== index);
      setAdditionalImages(newImages);
    }
  };

  const handleNext = async () => {
    try {
      console.log('🎯 Beneficiary form - Current step:', currentStep);
      
      if (currentStep === 0) {
        const values = await form.validateFields();
        
        // Main image is optional, but you can add validation if needed
        // if (!mainImageUrl) {
        //   message.error('Please upload a main image before continuing');
        //   return;
        // }
        
        console.log('✅ Step 0 validated:', values);
        setBasicDetails(values);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        const values = await form.validateFields();
        console.log('✅ Step 1 validated:', values);
        setImpactStory(values);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        const values = await form.validateFields();
        console.log('✅ Step 2 validated:', values);
        setTrustTransparency(values);
        setCurrentStep(3);
      } else {
        const values = await form.validateFields();
        console.log('✅ Step 3 validated:', values);
        setUploadImages(values);
        
        // CRITICAL: Get ALL form values, not just the state variables
        // The state variables might be incomplete if user went back and changed values
        const allFormValues = form.getFieldsValue();
        console.log('📋 All form values from form instance:', allFormValues);
        console.log('📋 State variables:', { basicDetails, impactStory, trustTransparency, values });
        
        // Combine: Use form values as source of truth, but include profileLinks from state
        const allData = {
          ...allFormValues,
          profileLinks: profileLinks.filter(link => link.channel && link.username), // Only include valid links
          // Ensure image URLs are included
          mainImageUrl: mainImageUrl,
          logoUrl: logoUrl,
          additionalImages: additionalImages.filter(img => img)
        };
        
        console.log('📦 Combined data for submission:', allData);
        
        // Submit to API
        await handleSubmit(allData);
      }
    } catch (error) {
      console.error('❌ Validation failed:', error);
      message.error('Please fill in all required fields');
    }
  };

  // Add profile link
  const addProfileLink = () => {
    setProfileLinks([...profileLinks, { channel: '', username: '' }]);
  };

  // Remove profile link
  const removeProfileLink = (index: number) => {
    const newLinks = profileLinks.filter((_, i) => i !== index);
    setProfileLinks(newLinks);
  };

  // Update profile link
  const updateProfileLink = (index: number, field: 'channel' | 'username', value: string) => {
    const newLinks = [...profileLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setProfileLinks(newLinks);
    form.setFieldsValue({ profileLinks: newLinks });
  };

  const handleSubmit = async (allData: any) => {
    console.log('🚀 Submitting beneficiary data:', allData);
    console.log('🚀 AllData keys:', Object.keys(allData));
    console.log('🚀 AllData values:', {
      beneficiaryName: allData.beneficiaryName,
      category: allData.category,
      type: allData.type,
      city: allData.city,
      state: allData.state,
      zipCode: allData.zipCode,
      location: allData.location,
      primaryContact: allData.primaryContact,
      phoneNumber: allData.phoneNumber,
      primaryEmail: allData.primaryEmail,
      about: allData.about,
      whyThisMatters: allData.whyThisMatters,
      successStory: allData.successStory,
      storyAuthor: allData.storyAuthor,
      ein: allData.ein,
      website: allData.website,
      isActive: allData.isActive,
      mainImageUrl: allData.mainImageUrl || mainImageUrl,
      logoUrl: allData.logoUrl || logoUrl
    });
    setSaving(true);
    
    try {
      // Transform data to API format
      // CRITICAL: Only include fields that definitely exist in the backend schema
      // We use a conservative approach to avoid 400 errors
      
      // Build minimal safe payload with only core required fields
      const beneficiaryData: any = {
        // Core required fields (definitely exist)
        name: allData.beneficiaryName || '',
        category: allData.category || '',
        type: allData.type || 'Medium', // Large, Medium, or Small
        about: allData.about || '',
        why_this_matters: allData.whyThisMatters || '',
        success_story: allData.successStory || '',
        story_author: allData.storyAuthor || '',
        is_active: allData.isActive !== undefined ? allData.isActive : true,
        isActive: allData.isActive !== undefined ? allData.isActive : true, // Send both for compatibility
      };
      
      // Location fields (always include, even if empty)
      beneficiaryData.city = allData.city || '';
      beneficiaryData.state = allData.state || '';
      beneficiaryData.zip_code = allData.zipCode || '';
      beneficiaryData.location = allData.location || (allData.city && allData.state ? `${allData.city}, ${allData.state}${allData.zipCode ? ' ' + allData.zipCode : ''}` : '');
      
      // Contact fields (always include, even if empty - these are important fields)
      beneficiaryData.phone = allData.phoneNumber || '';
      beneficiaryData.contact_name = allData.primaryContact || '';
      // NOTE: Backend doesn't have email column, but we collect it for reference
      // Don't send email to backend as it causes 400 errors
      
      // Trust & Transparency fields (always include, even if empty)
      beneficiaryData.ein = allData.ein || '';
      beneficiaryData.website = allData.website || '';
      
      // Images (use from allData first, then fallback to state)
      const finalMainImageUrl = allData.mainImageUrl || mainImageUrl;
      const finalLogoUrl = allData.logoUrl || logoUrl;
      
      if (finalMainImageUrl) {
        beneficiaryData.imageUrl = finalMainImageUrl; // Backend expects camelCase
        beneficiaryData.main_image = finalMainImageUrl;
        beneficiaryData.main_image_url = finalMainImageUrl;
      }
      if (finalLogoUrl) {
        beneficiaryData.logoUrl = finalLogoUrl; // Backend expects camelCase
        beneficiaryData.logo = finalLogoUrl;
        beneficiaryData.logo_url = finalLogoUrl;
      }
      
      // Impact Metrics - Only include if they have values AND backend supports them
      // These are NEW fields that may not exist yet - comment out if causing errors
      if (allData.livesImpacted) {
        beneficiaryData.livesImpacted = allData.livesImpacted;
        beneficiaryData.lives_impacted = allData.livesImpacted;
      }
      if (allData.programsActive !== null && allData.programsActive !== undefined) {
        beneficiaryData.programsActive = allData.programsActive;
        beneficiaryData.programs_active = allData.programsActive;
      }
      if (allData.directToProgramsPercentage !== null && allData.directToProgramsPercentage !== undefined) {
        beneficiaryData.directToProgramsPercentage = allData.directToProgramsPercentage;
        beneficiaryData.direct_to_programs_percentage = allData.directToProgramsPercentage;
      }
      
      // NOTE: The following fields are NOT included as they may not exist in backend:
      // - verification_status (doesn't exist - confirmed)
      // - likes, mutual, social (may not exist)
      // - additional_images (may not exist)
      // - profile_links (may not exist)
      // - latitude, longitude (can be null, but may cause issues)
      
      // Explicitly remove fields that don't exist in backend schema
      // This is a defensive cleanup to ensure no problematic fields slip through
      const fieldsToRemove = [
        // Email fields (don't exist)
        'email',
        'primaryEmail',
        // Verification status (doesn't exist - confirmed)
        'verification_status',
        'verificationStatus',
        // Old impact metrics fields (replaced by new ones)
        'communities_served',
        'families_helped',
        'direct_to_programs',
        'communitiesServed',
        'familiesHelped',
        'directToPrograms',
        // Impact statements (may not exist)
        'impact_statement_1',
        'impact_statement_2',
        'impactStatement1',
        'impactStatement2',
        // Other potentially problematic fields
        'transparency_rating',
        'likes', // May not exist
        'mutual', // May not exist
        'social', // May not exist
        'additional_images', // May not exist
        'profile_links', // May not exist
        'latitude', // May cause issues if null
        'longitude', // May cause issues if null
      ];
      
      fieldsToRemove.forEach(field => {
        if (beneficiaryData.hasOwnProperty(field)) {
          console.warn(`⚠️ Removing potentially problematic field: ${field}`);
          delete beneficiaryData[field];
        }
      });
      
      // Final verification
      const hasRemovedFields = fieldsToRemove.some(field => beneficiaryData.hasOwnProperty(field));
      if (hasRemovedFields) {
        console.error('❌ CRITICAL: Some removed fields are still in payload!', fieldsToRemove.filter(f => beneficiaryData.hasOwnProperty(f)));
      }
      
      // Logging for debugging
      console.log('📦 Formatted beneficiary data:', beneficiaryData);
      console.log('📦 All keys being sent:', Object.keys(beneficiaryData));
      console.log('📦 Payload size:', Object.keys(beneficiaryData).length, 'fields');
      console.log('📦 Full payload structure:', JSON.stringify(beneficiaryData, null, 2));
      
      // Verify critical fields are removed
      const criticalRemovedFields = ['verification_status', 'communities_served', 'email', 'likes', 'mutual'];
      criticalRemovedFields.forEach(field => {
        const isRemoved = !beneficiaryData.hasOwnProperty(field);
        console.log(`✅ Verified: ${field} NOT in payload:`, isRemoved);
        if (!isRemoved) {
          console.error(`❌ CRITICAL: ${field} is still in payload!`);
        }
      });
      
      console.log('📦 Core fields being sent:', {
        name: beneficiaryData.name,
        category: beneficiaryData.category,
        type: beneficiaryData.type,
        city: beneficiaryData.city,
        state: beneficiaryData.state,
        zip_code: beneficiaryData.zip_code,
        location: beneficiaryData.location,
        phone: beneficiaryData.phone,
        contact_name: beneficiaryData.contact_name,
        ein: beneficiaryData.ein,
        website: beneficiaryData.website,
        is_active: beneficiaryData.is_active,
        hasAbout: !!beneficiaryData.about,
        hasWhyThisMatters: !!beneficiaryData.why_this_matters,
        hasImage: !!beneficiaryData.imageUrl,
        hasLogo: !!beneficiaryData.logoUrl
      });
      
      // Call API
      console.log('📡 Calling API with payload:', beneficiaryData);
      const response = await beneficiaryAPI.createBeneficiary(beneficiaryData);
      console.log('📡 API response:', response);
      
      // Handle different response formats
      // Backend might return: { success: true, data: {...} } OR just the data directly
      const responseData = response.data || response;
      const isSuccess = response.success !== false; // Default to true if not specified
      
      console.log('📡 Response success:', isSuccess);
      console.log('📡 Response data:', responseData);
      
      if (responseData) {
        const beneficiaryId = responseData.id || responseData;
        console.log('📡 Created beneficiary ID:', beneficiaryId);
        if (typeof responseData === 'object') {
          console.log('📡 Created beneficiary is_active:', responseData.is_active || responseData.isActive);
        }
      }
      
      if (isSuccess) {
        message.success('Beneficiary created successfully!');
        // Call onSubmit callback (which should refresh the beneficiaries list)
        onSubmit(allData);
        handleCancel();
        // Note: The parent component (Beneficiaries) should refresh the list
        // in its onSubmit handler to show the newly created beneficiary
      } else {
        const errorMsg = response.error || responseData?.error || 'Failed to create beneficiary';
        console.error('❌ Backend error:', errorMsg);
        message.error(`Failed to create beneficiary: ${errorMsg}`);
      }
      
    } catch (error: any) {
      console.error('❌ Error creating beneficiary:', error);
      const errorMsg = error?.message || 'Failed to create beneficiary. Please try again.';
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    setCurrentStep(0);
    form.resetFields();
    setBasicDetails({});
    setImpactStory({});
    setTrustTransparency({});
    setUploadImages({});
    // Reset image states
    setMainImageUrl(null);
    setLogoUrl(null);
    setAdditionalImages([]);
    setForm990File(null);
    setProfileLinks([{ channel: '', username: '' }]);
    onCancel();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Title level={4}>Basic Information</Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="beneficiaryName"
                  label="Beneficiary Name *"
                  rules={[{ required: true, message: 'Please enter beneficiary name' }]}
                >
                  <Input placeholder="Enter organization name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category *"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select placeholder="Select category">
                    <Option value="Childhood Illness">Childhood Illness</Option>
                    <Option value="Animal Welfare">Animal Welfare</Option>
                    <Option value="Low Income Families">Low Income Families</Option>
                    <Option value="Education">Education</Option>
                    <Option value="Environment">Environment</Option>
                    <Option value="Disabilities">Disabilities</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Type *"
                  rules={[{ required: true, message: 'Please select type' }]}
                >
                  <Select placeholder="Select type">
                    <Option value="Large">Large</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="Small">Small</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Form.Item
                  name="location"
                  label="Location *"
                  rules={[{ required: true, message: 'Please enter location (City, State)' }]}
                  tooltip="Enter location as 'City, State' format (e.g., 'Atlanta, GA')"
                >
                  <Input placeholder="Atlanta, GA" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={8}>
                <Form.Item
                  name="city"
                  label="City *"
                  rules={[{ required: true, message: 'Please enter city' }]}
                >
                  <Input placeholder="Enter city" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="state"
                  label="State *"
                  rules={[{ required: true, message: 'Please enter state' }]}
                >
                  <Input placeholder="Enter state" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="zipCode"
                  label="ZIP Code"
                  rules={[{ required: false }]}
                >
                  <Input placeholder="Enter ZIP code" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="primaryContact"
                  label="Primary Contact *"
                  rules={[{ required: true, message: 'Please enter primary contact' }]}
                >
                  <Input placeholder="Enter primary contact name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="primaryEmail"
                  label="Primary Contact Email *"
                  rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Please enter a valid email' }]}
                >
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[{ required: false }]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Website"
                  rules={[{ required: false }]}
                >
                  <Input placeholder="https://..." />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="social"
                  label="Social Media"
                  rules={[{ max: 100, message: 'Social media handle must be 100 characters or less' }]}
                  tooltip="Social media handle (e.g., @organizationname)"
                >
                  <Input placeholder="@organizationname" maxLength={100} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Active Status"
                  valuePropName="checked"
                  initialValue={true}
                  style={{ marginTop: 30 }}
                >
                  <Checkbox>Active (show in app)</Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="likes"
                  label="Likes"
                  initialValue={0}
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="mutual"
                  label="Mutual Connections"
                  initialValue={0}
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="about"
              label="About *"
              rules={[
                { required: true, message: 'Please enter description' },
                { min: 200, message: 'Description must be at least 200 characters' }
              ]}
            >
              <TextArea 
                rows={6} 
                placeholder="Detailed description of the beneficiary organization and their mission..." 
                showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
                maxLength={1000}
              />
            </Form.Item>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <Title level={4}>Impact & Story</Title>
            <Form.Item
              name="whyThisMatters"
              label="Why This Matters *"
              rules={[
                { required: true, message: 'Please explain why this cause is important' },
                { min: 200, message: 'Must be at least 200 characters' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Explain why this cause is important and what makes it special..." 
                showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
                maxLength={500}
              />
            </Form.Item>
            
            <Form.Item
              name="successStory"
              label="Success Story *"
              rules={[
                { required: true, message: 'Please share a success story' },
                { min: 150, message: 'Must be at least 150 characters' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Share a compelling story that shows the impact of donations..." 
                showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
                maxLength={500}
              />
            </Form.Item>
            
            <Form.Item
              name="storyAuthor"
              label="Story Author"
              rules={[{ max: 50, message: 'Author name must be 50 characters or less' }]}
            >
              <Input placeholder="e.g., Sarah M., Program Director" maxLength={50} />
            </Form.Item>

            <Divider>Impact Metrics (Optional)</Divider>
            <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
              These metrics help showcase the impact of the organization. All fields are optional.
            </Text>
            
            <Row gutter={[24, 16]}>
              <Col span={8}>
                  <Form.Item
                  name="livesImpacted"
                  label="Lives Impacted"
                  rules={[
                    { max: 50, message: 'Must be 50 characters or less' }
                  ]}
                >
                  <Input 
                    placeholder="e.g., 10,000+, 1M+, 50,000" 
                    maxLength={50}
                  />
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    ℹ️ Can include +, K, M (e.g., 1M+)
                  </Text>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="programsActive"
                  label="Programs Active"
                  rules={[
                    { type: 'number', min: 0, message: 'Must be a positive number' }
                  ]}
                >
                  <InputNumber 
                    placeholder="e.g., 25" 
                    min={0}
                    style={{ width: '100%' }}
                    precision={0}
                  />
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    ℹ️ Number of active programs
                  </Text>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="directToProgramsPercentage"
                  label="Direct to Programs (%)"
                  rules={[
                    { type: 'number', min: 0, max: 100, message: 'Must be between 0 and 100' }
                  ]}
                >
                  <InputNumber 
                    placeholder="e.g., 95.00" 
                    min={0} 
                    max={100}
                    step={0.01}
                    precision={2}
                    style={{ width: '100%' }}
                  />
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    ℹ️ Percentage (e.g., 95.00 for 95%)
                  </Text>
                </Form.Item>
              </Col>
            </Row>

            <Divider>Your Impact</Divider>
            
            <Form.Item
              name="impactStatement1"
              label="Impact Statement 1"
            >
              <Input placeholder="e.g., Every $25 provides a family with essential supplies for one week" />
            </Form.Item>
            
            <Form.Item
              name="impactStatement2"
              label="Impact Statement 2"
            >
              <Input placeholder="e.g., Every $100 helps provide emergency housing for families in crisis" />
            </Form.Item>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <Title level={4}>Trust & Transparency</Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="ein"
                  label="EIN Number"
                >
                  <Input placeholder="e.g., 12-3456789" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Website"
                >
                  <Input placeholder="https://example.org" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="verificationStatus"
              label="Verification Status"
              valuePropName="checked"
            >
              <Checkbox>Verified 501(c)(3) Nonprofit</Checkbox>
            </Form.Item>

            <Divider>Additional Documents</Divider>
            
            <Form.Item
              name="form990"
              label="Upload Form-990 (Optional)"
            >
              <Upload
                beforeUpload={(file) => {
                  setForm990File(file);
                  form.setFieldsValue({ form990: file });
                  return false; // Prevent auto upload
                }}
                onRemove={() => {
                  setForm990File(null);
                  form.setFieldsValue({ form990: null });
                }}
                maxCount={1}
                accept=".pdf,.doc,.docx"
              >
                <Button icon={<UploadOutlined />} className="upload-btn">
                  Select Form-990 File
                </Button>
              </Upload>
              {form990File && (
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  Selected: {form990File.name}
                </Text>
              )}
            </Form.Item>

            <Divider>Profile Links</Divider>
            
            <div className="profile-links-section">
              <Title level={5} style={{ marginBottom: 16 }}>Enter your profile links (Optional)</Title>
              {profileLinks.map((link, index) => (
                <Row gutter={[16, 16]} key={index} style={{ marginBottom: 16, alignItems: 'flex-start' }}>
                  <Col span={10}>
                    <Form.Item
                      label={index === 0 ? 'Select Channel' : ''}
                      rules={index === 0 ? [{ required: false }] : []}
                    >
                      <Select
                        placeholder="Select channel"
                        value={link.channel}
                        onChange={(value) => updateProfileLink(index, 'channel', value)}
                      >
                        <Option value="facebook">Facebook</Option>
                        <Option value="twitter">Twitter</Option>
                        <Option value="instagram">Instagram</Option>
                        <Option value="linkedin">LinkedIn</Option>
                        <Option value="website">Website</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      label={index === 0 ? 'Enter Username/URL' : ''}
                      rules={index === 0 ? [{ required: false }] : []}
                    >
                      <Input
                        placeholder="Enter username or URL"
                        value={link.username}
                        onChange={(e) => updateProfileLink(index, 'username', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4} style={{ paddingTop: index === 0 ? 30 : 0 }}>
                    {profileLinks.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeProfileLink(index)}
                        style={{ marginTop: index === 0 ? 0 : 0 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button
                className="add-profile-link-btn"
                icon={<PlusOutlined />}
                onClick={addProfileLink}
              >
                Add New Profile Link
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <Title level={4}>Upload Images</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
              Upload images to showcase your beneficiary organization. All images are optional but recommended.
            </Text>
            
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="Main Image" style={{ marginBottom: '16px' }}>
                  <Form.Item
                    name="mainImage"
                    label="Upload Main Image (Optional)"
                    rules={[{ required: false }]}
                  >
                    <ImageUpload
                      currentImageUrl={mainImageUrl || undefined}
                      onImageChange={handleMainImageChange}
                      title="Upload Beneficiary Main Image"
                      description="Main image displayed on beneficiary profile. Recommended: 1080px × 1080px. Max 5MB"
                    />
                  </Form.Item>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Organization Logo" style={{ marginBottom: '16px' }}>
                  <Form.Item
                    name="logo"
                    label="Upload Logo (Optional)"
                    rules={[{ required: false }]}
                  >
                    <ImageUpload
                      currentImageUrl={logoUrl || undefined}
                      onImageChange={handleLogoChange}
                      title="Upload Organization Logo"
                      description="Logo displayed in beneficiary listings. Recommended: 1080px × 1080px. Max 5MB"
                    />
                  </Form.Item>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Additional Images (Optional)">
                  <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                    Upload up to 3 additional images showcasing your programs and impact
                  </Text>
                  
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>Image 1</Text>
                      <ImageUpload
                        currentImageUrl={additionalImages[0] || undefined}
                        onImageChange={(url) => handleAdditionalImageChange(url, 0)}
                        title="Upload Image"
                        description="Click or drag"
                      />
                    </Col>
                    <Col span={8}>
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>Image 2</Text>
                      <ImageUpload
                        currentImageUrl={additionalImages[1] || undefined}
                        onImageChange={(url) => handleAdditionalImageChange(url, 1)}
                        title="Upload Image"
                        description="Click or drag"
                      />
                    </Col>
                    <Col span={8}>
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>Image 3</Text>
                      <ImageUpload
                        currentImageUrl={additionalImages[2] || undefined}
                        onImageChange={(url) => handleAdditionalImageChange(url, 2)}
                        title="Upload Image"
                        description="Click or drag"
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>
        );

      default:
        return null;
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
            <Title level={3} className="modal-title">Invite Beneficiaries</Title>
            <Text className="modal-subtitle">Complete your details and send invite to beneficiaries</Text>
          </div>
        </div>
      }
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      className="invite-beneficiary-modal"
    >
      <div className="modal-content">
        <div className="steps-sidebar">
          <Steps
            direction="vertical"
            current={currentStep}
            onChange={setCurrentStep}
            items={steps.map((step, index) => ({
              title: step.title,
              description: step.description,
              icon: index < currentStep ? <CheckCircleFilled style={{ color: '#DB8633' }} className="completed-icon" /> : step.icon,
              status: index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait'
            }))}
          />
        </div>
        <div className="form-content">
          <Form
            form={form}
            layout="vertical"
            className="beneficiary-form"
          >
            {renderStepContent()}
            <div className="form-actions">
              {currentStep > 0 && (
                <Button onClick={handlePrev} className="prev-btn">
                  <ArrowLeftOutlined /> Previous
                </Button>
              )}
              <Button 
                type="primary" 
                onClick={handleNext}
                className="next-btn"
                loading={saving}
                disabled={saving}
              >
                {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
                {!saving && <ArrowRightOutlined />}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default InviteBeneficiaryModal; 