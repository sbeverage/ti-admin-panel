import React, { useState } from 'react';
import { Modal, Steps, Form, Input, Select, Upload, Button, Row, Col, Typography, Divider, Checkbox, TimePicker } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  UploadOutlined,
  FileTextOutlined,
  TagOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  DollarOutlined
} from '@ant-design/icons';
import './InviteVendorModal.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface InviteVendorModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const InviteVendorModal: React.FC<InviteVendorModalProps> = ({
  visible,
  onCancel,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [basicDetails, setBasicDetails] = useState<any>({});
  const [priceDiscounts, setPriceDiscounts] = useState<any>({});
  const [workSchedule, setWorkSchedule] = useState<any>({});

  const steps = [
    {
      title: 'Basic Details',
      icon: <FileTextOutlined style={{ color: '#324E58' }} />,
      description: basicDetails.companyName || 'Vendor name here'
    },
    {
      title: 'Price and Discounts',
      icon: <TagOutlined style={{ color: '#324E58' }} />,
      description: priceDiscounts.minDiscount || 'Minimum discount here'
    },
    {
      title: 'Work Schedule',
      icon: <CalendarOutlined style={{ color: '#324E58' }} />,
      description: workSchedule.customTime || 'Customize time here'
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
        setPriceDiscounts(values);
        setCurrentStep(2);
      } else {
        const values = await form.validateFields();
        setWorkSchedule(values);
        onSubmit({ ...basicDetails, ...priceDiscounts, ...values });
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
    setPriceDiscounts({});
    setWorkSchedule({});
    onCancel();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Title level={4}>Register Vendor</Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="primaryContact"
                  label="Primary Contact Information *"
                  rules={[{ required: true, message: 'Please enter primary contact' }]}
                >
                  <Input placeholder="Enter primary contact name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="primaryEmail"
                  label="Primary Contact Email *"
                  rules={[{ required: true, message: 'Please enter primary email' }]}
                >
                  <Input placeholder="Enter primary contact email" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="companyName"
                  label="Company Name *"
                  rules={[{ required: true, message: 'Please enter company name' }]}
                >
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="websiteLink"
                  label="Website Link *"
                  rules={[{ required: true, message: 'Please enter website link' }]}
                >
                  <Input placeholder="Enter website link" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="address"
                  label="Address, City, State *"
                  rules={[{ required: true, message: 'Please enter address' }]}
                >
                  <Input placeholder="Enter address, city, state" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Company Phone Number *"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="Enter company phone number" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category *"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select placeholder="Select category">
                    <Option value="restaurant">Restaurant</Option>
                    <Option value="retail">Retail</Option>
                    <Option value="service">Service</Option>
                    <Option value="entertainment">Entertainment</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="tags"
                  label="Tags *"
                  rules={[{ required: true, message: 'Please enter tags' }]}
                >
                  <Input placeholder="Enter tags" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description *"
                  rules={[{ required: true, message: 'Please enter description' }]}
                >
                  <TextArea rows={4} placeholder="Enter company description" />
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div className="upload-logo-section">
                  <Title level={5}>Upload Logo *</Title>
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
                  <Title level={5}>Upload Product Images</Title>
                  <Text>Upload min of 3 additional images</Text>
                  <div className="upload-placeholder large">
                    <div className="placeholder-icon">☁️</div>
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

      case 1:
        return (
          <div className="step-content">
            <Title level={4}>Register Vendor</Title>
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Form.Item
                  name="minDiscount"
                  label="Discount Requirement *"
                  rules={[{ required: true, message: 'Please select minimum discount' }]}
                >
                  <Select placeholder="You must offer a minimum of 10% discounts to apply">
                    <Option value="10">10%</Option>
                    <Option value="15">15%</Option>
                    <Option value="20">20%</Option>
                    <Option value="25">25%</Option>
                    <Option value="30">30%</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Title level={5}>Select the tier that best describes your location pricing</Title>
                <div className="pricing-tiers">
                  <Button className="pricing-tier-btn" value="$">$</Button>
                  <Button className="pricing-tier-btn" value="$$">$$</Button>
                  <Button className="pricing-tier-btn" value="$$$">$$$</Button>
                  <Button className="pricing-tier-btn" value="$$$$">$$$$</Button>
                </div>
              </Col>
            </Row>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <Title level={4}>Register Vendor</Title>
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Title level={5}>Availability Schedule</Title>
                <div className="schedule-table">
                  <div className="schedule-header">
                    <div className="schedule-col">Weekdays</div>
                    <div className="schedule-col">Availability</div>
                    <div className="schedule-col">Start Time *</div>
                    <div className="schedule-col">End Time *</div>
                  </div>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                    <div key={day} className="schedule-row">
                      <div className="schedule-col">{day}</div>
                      <div className="schedule-col">
                        <Checkbox 
                          name={`${day.toLowerCase()}Closed`}
                          defaultChecked={day === 'Saturday' || day === 'Sunday'}
                        >
                          Closed
                        </Checkbox>
                      </div>
                      <div className="schedule-col">
                        <TimePicker 
                          format="hh:mm A"
                          placeholder="HH : MM AM"
                          className="time-picker"
                        />
                      </div>
                      <div className="schedule-col">
                        <TimePicker 
                          format="hh:mm A"
                          placeholder="HH : MM AM"
                          className="time-picker"
                        />
                      </div>
                    </div>
                  ))}
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
            <Title level={3} className="modal-title">Invite Vendor</Title>
            <Text className="modal-subtitle">Complete your details and send invite to vendor</Text>
          </div>
        </div>
      }
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      className="invite-vendor-modal"
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
            className="vendor-form"
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

export default InviteVendorModal; 