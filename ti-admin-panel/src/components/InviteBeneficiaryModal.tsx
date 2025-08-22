import React, { useState } from 'react';
import { Modal, Steps, Form, Input, Select, Upload, Button, Row, Col, Typography, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  UploadOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  PictureOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
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
  const [vettingProcess, setVettingProcess] = useState<any>({});
  const [uploadImages, setUploadImages] = useState<any>({});

  const steps = [
    {
      title: 'Basic Details',
      icon: <FileTextOutlined style={{ color: '#324E58' }} />,
      description: basicDetails.companyName || 'Company name here'
    },
    {
      title: 'Vetting Process',
      icon: <SafetyCertificateOutlined style={{ color: '#324E58' }} />,
      description: vettingProcess.taxId || 'Tax ID here'
    },
    {
      title: 'Upload Images',
      icon: <PictureOutlined style={{ color: '#324E58' }} />,
      description: uploadImages.imageCount || 'Number of images here'
    }
  ];

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        const values = await form.validateFields();
        setBasicDetails(values);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        const values = await form.validateFields();
        setVettingProcess(values);
        setCurrentStep(2);
      } else {
        const values = await form.validateFields();
        setUploadImages(values);
        onSubmit({ ...basicDetails, ...vettingProcess, ...values });
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    setCurrentStep(0);
    form.resetFields();
    setBasicDetails({});
    setVettingProcess({});
    setUploadImages({});
    onCancel();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Title level={4}>Register as a Beneficiary</Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="primaryContact"
                  label="Primary Contact Information"
                  rules={[{ required: true, message: 'Please enter primary contact' }]}
                >
                  <Input placeholder="Enter primary contact name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="primaryEmail"
                  label="Primary Contact Email"
                  rules={[{ required: true, message: 'Please enter email' }]}
                >
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="companyName"
                  label="Company Name"
                  rules={[{ required: true, message: 'Please enter company name' }]}
                >
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="websiteLink"
                  label="Website Link"
                >
                  <Input placeholder="Enter website URL" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="videoUrl"
              label="Video URL Link"
            >
              <Input placeholder="Enter video URL" />
            </Form.Item>
            <Form.Item
              name="address"
              label="Address, City, State"
            >
              <Input placeholder="Enter full address" />
            </Form.Item>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Company Phone Number"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select placeholder="Select category">
                    <Option value="education">Education</Option>
                    <Option value="healthcare">Healthcare</Option>
                    <Option value="environment">Environment</Option>
                    <Option value="social-services">Social Services</Option>
                    <Option value="arts-culture">Arts & Culture</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="tags"
              label="Tags"
              rules={[{ required: true, message: 'Please enter tags' }]}
            >
              <Input placeholder="Enter tags separated by commas" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={4} placeholder="Describe your organization" />
            </Form.Item>
            <Form.Item
              name="fundsHelp"
              label="How will these funds help your organization?"
              rules={[{ required: true, message: 'Please explain how funds will help' }]}
            >
              <TextArea rows={4} placeholder="Explain how the funds will be used" />
            </Form.Item>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <Title level={4}>Register as a Non-Profit Organization (NPO)</Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="taxId"
                  label="Tax ID"
                  rules={[{ required: true, message: 'Please enter Tax ID' }]}
                >
                  <Input placeholder="Enter Tax ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="form990"
                  label="Upload Form-990"
                  rules={[{ required: true, message: 'Please upload Form-990' }]}
                >
                  <div className="upload-section">
                    <Input placeholder="Select Form-990 file" />
                    <Button className="upload-btn" icon={<UploadOutlined />}>
                      Upload Image
                    </Button>
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
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

      case 2:
        return (
          <div className="step-content">
            <Title level={4}>Register as a Non-Profit Organization (NPO)</Title>
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
              >
                {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
                <ArrowRightOutlined />
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default InviteBeneficiaryModal; 