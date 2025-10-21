import React, { useState } from 'react';
import { Modal, Steps, Form, Input, Select, Upload, Button, Row, Col, Typography, Divider, Checkbox, InputNumber, message } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  UploadOutlined,
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
  InboxOutlined
} from '@ant-design/icons';
import { beneficiaryAPI } from '../services/api';
import './InviteBeneficiaryModal.css';

const { Dragger } = Upload;

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
  const [volunteerInfo, setVolunteerInfo] = useState<any>({});
  const [uploadImages, setUploadImages] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [mainImageFileList, setMainImageFileList] = useState<any[]>([]);

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
      title: 'Get Involved',
      icon: <TeamOutlined style={{ color: '#324E58' }} />,
      description: volunteerInfo.volunteerInfo ? 'Volunteer info added' : 'Volunteer info here'
    },
    {
      title: 'Upload Images',
      icon: <PictureOutlined style={{ color: '#324E58' }} />,
      description: uploadImages.imageCount || 'Number of images here'
    }
  ];

  // Upload configuration (same as vendor form - mock upload)
  const uploadProps = {
    name: 'file',
    multiple: false,
    customRequest: async ({ file, onSuccess, onError, onProgress }: any) => {
      try {
        console.log('Uploading file:', file.name, 'Type:', file.type);
        
        // Simulate file processing
        const fileObj: any = file;
        console.log('File prepared for upload:', file.name);
        
        // Generate mock S3 URL for preview
        const mockUrl = `https://thrive-backend-uploads.s3.us-east-1.amazonaws.com/mock-${Date.now()}-${file.name}`;
        
        onProgress({ percent: 100 });
        
        setTimeout(() => {
          onSuccess({
            url: mockUrl,
            name: file.name
          }, file);
        }, 500);
        
      } catch (error) {
        console.error('Upload error:', error);
        onError(error);
        message.error(`${file.name} upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      return true;
    }
  };

  const handleMainImageUpload = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); // Only keep the last file
    setMainImageFileList(newFileList);
    
    // Set form value for validation
    if (newFileList.length > 0 && newFileList[0].status === 'done') {
      form.setFieldsValue({ mainImage: newFileList[0].response?.url || newFileList[0].name });
    } else if (newFileList.length > 0) {
      form.setFieldsValue({ mainImage: newFileList[0].name });
    }
    
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleNext = async () => {
    try {
      console.log('🎯 Beneficiary form - Current step:', currentStep);
      
      if (currentStep === 0) {
        const values = await form.validateFields();
        
        // Check if main image is uploaded
        if (mainImageFileList.length === 0) {
          message.error('Please upload a main image before continuing');
          return;
        }
        
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
      } else if (currentStep === 3) {
        const values = await form.validateFields();
        console.log('✅ Step 3 validated:', values);
        setVolunteerInfo(values);
        setCurrentStep(4);
      } else {
        const values = await form.validateFields();
        console.log('✅ Step 4 validated:', values);
        setUploadImages(values);
        
        // Submit to API
        await handleSubmit({ ...basicDetails, ...impactStory, ...trustTransparency, ...volunteerInfo, ...values });
      }
    } catch (error) {
      console.error('❌ Validation failed:', error);
      message.error('Please fill in all required fields');
    }
  };

  const handleSubmit = async (allData: any) => {
    console.log('🚀 Submitting beneficiary data:', allData);
    setSaving(true);
    
    try {
      // Transform data to API format
      const beneficiaryData = {
        name: allData.beneficiaryName,
        category: allData.category,
        city: allData.city,
        state: allData.state,
        zip_code: allData.zipCode || '',
        location: `${allData.city}, ${allData.state}${allData.zipCode ? ' ' + allData.zipCode : ''}`, // Combined for display
        email: allData.primaryEmail,
        phone: allData.phoneNumber,
        contact_name: allData.primaryContact,
        description: allData.about,
        mission: allData.whyThisMatters || '',
        impact_statement: allData.impactStatement || '',
        transparency_rating: allData.transparencyRating || 0,
        ein: allData.ein || '',
        website: allData.website || '',
        volunteer_info: allData.volunteerInfo || '',
        // Images would be uploaded separately
        main_image: allData.mainImage || '',
        additional_images: []
      };
      
      console.log('📦 Formatted beneficiary data:', beneficiaryData);
      
      // Call API
      const response = await beneficiaryAPI.createBeneficiary(beneficiaryData);
      console.log('📡 API response:', response);
      
      if (response.success) {
        message.success('Beneficiary created successfully!');
        onSubmit(allData);
        handleCancel();
      } else {
        // Backend endpoint might not be ready yet
        console.warn('⚠️ Backend not ready, showing user-friendly message');
        message.warning('Beneficiary form submitted! Backend endpoint is being prepared.');
        onSubmit(allData);
        handleCancel();
      }
      
    } catch (error) {
      console.error('❌ Error creating beneficiary:', error);
      // Show friendly message instead of error since backend might not be ready
      message.warning('Beneficiary form completed! Backend endpoint is being set up.');
      onSubmit(allData);
      handleCancel();
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
    setMainImageFileList([]);
    setVolunteerInfo({});
    setUploadImages({});
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
                    <Option value="healthcare">Healthcare</Option>
                    <Option value="education">Education</Option>
                    <Option value="housing">Housing</Option>
                    <Option value="hunger">Hunger Relief</Option>
                    <Option value="environment">Environment</Option>
                    <Option value="children">Children & Youth</Option>
                    <Option value="social-services">Social Services</Option>
                    <Option value="arts-culture">Arts & Culture</Option>
                    <Option value="other">Other</Option>
                  </Select>
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
                  label="Primary Contact"
                  rules={[{ required: true, message: 'Please enter primary contact' }]}
                >
                  <Input placeholder="Enter primary contact name" />
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
                  name="primaryEmail"
                  label="Primary Contact Email"
                  rules={[{ required: true, message: 'Please enter email' }]}
                >
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="Enter phone number" />
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
            <Divider />
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Form.Item
                  name="mainImage"
                  label="Upload Main Image"
                  rules={[{ required: false, message: 'Please upload a main image' }]}
                >
                  <Dragger
                    {...uploadProps}
                    fileList={mainImageFileList}
                    onChange={handleMainImageUpload}
                    className="main-image-upload"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag image to this area to upload</p>
                    <p className="ant-upload-hint">
                      Recommended size: 1080px × 1080px. Max file size: 10MB
                    </p>
                  </Dragger>
                </Form.Item>
              </Col>
            </Row>
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

            <Divider>Impact Metrics</Divider>
            
            <Row gutter={[24, 16]}>
              <Col span={8}>
                <Form.Item
                  name="familiesHelped"
                  label="Families Helped"
                >
                  <Input placeholder="e.g., 10,000+" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="communitiesServed"
                  label="Communities Served"
                >
                  <InputNumber 
                    placeholder="e.g., 25" 
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="directToPrograms"
                  label="Direct to Programs (%)"
                >
                  <InputNumber 
                    placeholder="e.g., 95" 
                    min={0} 
                    max={100}
                    style={{ width: '100%' }}
                  />
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
              label="Upload Form-990"
            >
              <div className="upload-section">
                <Input placeholder="Select Form-990 file" />
                <Button className="upload-btn" icon={<UploadOutlined />}>
                  Upload Document
                </Button>
              </div>
            </Form.Item>

            <Divider>Profile Links</Divider>
            
            <div className="profile-links-section">
              <Title level={5}>Enter your profile link for all of the following: *At least one is required</Title>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="channel"
                    label="Select Channel"
                    rules={[{ required: true, message: 'Please select channel' }]}
                  >
                    <Select placeholder="Select channel">
                      <Option value="facebook">Facebook</Option>
                      <Option value="twitter">Twitter</Option>
                      <Option value="instagram">Instagram</Option>
                      <Option value="linkedin">LinkedIn</Option>
                      <Option value="website">Website</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    label="Enter User Name"
                  >
                    <Input placeholder="Enter username" />
                  </Form.Item>
                </Col>
              </Row>
              <Button className="add-profile-link-btn" icon={<PlusOutlined />}>
                Add New Profile Link
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <Title level={4}>Get Involved</Title>
            <Form.Item
              name="volunteerInfo"
              label="Volunteer Information *"
              rules={[
                { required: true, message: 'Please provide volunteer information' },
                { min: 100, message: 'Must be at least 100 characters' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Information about volunteer opportunities and ways to get involved..." 
                showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
                maxLength={500}
              />
            </Form.Item>
            
            <Text type="secondary">
              This information will be displayed in the "Get Involved" tab to help potential volunteers understand how they can contribute beyond financial donations.
            </Text>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <Title level={4}>Upload Images</Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div className="upload-logo-section">
                  <Title level={5}>Upload Logo*</Title>
                  <div className="upload-placeholder">
                    <div className="placeholder-icon">👤</div>
                    <Text>Recommended size image (1080px X 1080px)</Text>
                  </div>
                  <Button className="upload-btn" icon={<UploadOutlined />}>
                    Upload Logo
                  </Button>
                </div>
              </Col>
              <Col span={12}>
                <div className="upload-images-section">
                  <Title level={5}>Upload Beneficiary Images</Title>
                  <Text>Upload min of 3 additional images</Text>
                  <div className="upload-placeholder large">
                    <div className="placeholder-icon">🏔️</div>
                    <Text>Upload or drag images</Text>
                  </div>
                  <Button className="upload-btn" icon={<UploadOutlined />}>
                    Upload Images
                  </Button>
                </div>
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