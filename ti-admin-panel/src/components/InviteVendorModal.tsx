import React, { useState } from 'react';
import { Modal, Steps, Form, Input, Select, Upload, Button, Row, Col, Typography, Divider, Checkbox, TimePicker, message, Spin } from 'antd';
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
import { vendorAPI, discountAPI } from '../services/api';
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
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [currentDiscount, setCurrentDiscount] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const steps = [
    {
      title: 'Basic Details',
      icon: <FileTextOutlined style={{ color: '#324E58' }} />,
      description: basicDetails.companyName || 'Vendor name here'
    },
    {
      title: 'Price and Discounts',
      icon: <TagOutlined style={{ color: '#324E58' }} />,
      description: 'Configure discounts'
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
        await handleSubmit({ ...basicDetails, ...priceDiscounts, ...values });
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const handleSubmit = async (allData: any) => {
    setSaving(true);
    try {
      // Transform data to API format
      const vendorData = {
        name: allData.companyName,
        email: allData.primaryEmail,
        phone: allData.phoneNumber,
        website: allData.websiteLink,
        category: allData.category,
        address: {
          street: allData.address || '',
          city: allData.city || '',
          state: allData.state || '',
          zipCode: allData.zipCode || '',
          latitude: 0, // These would need to be geocoded
          longitude: 0
        },
        hours: {
          monday: allData.monday || '9:00 AM - 5:00 PM',
          tuesday: allData.tuesday || '9:00 AM - 5:00 PM',
          wednesday: allData.wednesday || '9:00 AM - 5:00 PM',
          thursday: allData.thursday || '9:00 AM - 5:00 PM',
          friday: allData.friday || '9:00 AM - 5:00 PM',
          saturday: allData.saturday || 'Closed',
          sunday: allData.sunday || 'Closed'
        },
        social_links: {
          facebook: allData.facebook || '',
          instagram: allData.instagram || '',
          twitter: allData.twitter || ''
        }
      };

      // Create vendor
      const vendorResponse = await vendorAPI.createVendor(vendorData);
      if (vendorResponse.success) {
        const vendorId = vendorResponse.data.id;
        
        // Create discounts for this vendor
        if (discounts.length > 0) {
          for (const discount of discounts) {
            const discountData = {
              vendor_id: vendorId,
              name: discount.discountName,
              description: discount.discountOn,
              discount_type: discount.discountType,
              discount_value: parseFloat(discount.discountValue),
              min_purchase: discount.minPurchase ? parseFloat(discount.minPurchase) : undefined,
              max_discount: discount.maxDiscount ? parseFloat(discount.maxDiscount) : undefined,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
              is_active: true
            };
            
            await discountAPI.createDiscount(discountData);
          }
        }
        
        message.success('Vendor created successfully!');
        onSubmit(allData);
        handleCancel();
      } else {
        message.error('Failed to create vendor. Please try again.');
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      message.error('Failed to create vendor. Please try again.');
    } finally {
      setSaving(false);
    }
  };


  const handleSaveAndAddNew = async () => {
    try {
      const values = await form.validateFields();
      
      // Create a new discount object from the current form values
      const newDiscount = {
        id: Date.now(), // Simple unique ID
        discountName: values.discountName,
        discountType: values.discountType,
        discountValue: values.discountValue,
        discountOn: values.discountOn,
        frequency: values.frequency,
        promoCode: values.promoCode,
        additionalTerms: values.additionalTerms,
        approvedBy: values.approvedBy,
        approvalDate: values.approvalDate,
        pricingTier: values.pricingTier
      };
      
      // Add the new discount to the discounts array
      setDiscounts([...discounts, newDiscount]);
      
      // Clear only the discount form fields, keep vendor details
      form.setFieldsValue({
        discountName: "",
        discountType: undefined,
        discountValue: "",
        discountOn: "",
        frequency: undefined,
        promoCode: "",
        additionalTerms: "",
        approvedBy: "",
        approvalDate: null,
        pricingTier: undefined
      });
      
      // Show success message
      message.success("Discount added successfully! You can now add another discount for this vendor.");
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };  const handlePrev = () => {
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
            <Title level={4}>Discount Configuration</Title>
            
            {/* Discount Basic Information */}
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="discountName"
                  label="Discount Name *"
                  rules={[{ required: true, message: 'Please enter discount name' }]}
                >
                  <Input placeholder="e.g., Summer Special, Happy Hour" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discountType"
                  label="Discount Type *"
                  rules={[{ required: true, message: 'Please select discount type' }]}
                >
                  <Select placeholder="Select discount type">
                    <Option value="free">Free</Option>
                    <Option value="percentage">% Off</Option>
                    <Option value="dollar">$ Off</Option>
                    <Option value="bogo">BOGO</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Discount Value and Target */}
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="discountValue"
                  label="Discount Value *"
                  rules={[{ required: true, message: 'Please enter discount value' }]}
                >
                  <Input 
                    placeholder={form.getFieldValue('discountType') === 'percentage' ? 'e.g., 20' : 
                               form.getFieldValue('discountType') === 'dollar' ? 'e.g., 5.00' : 
                               form.getFieldValue('discountType') === 'bogo' ? 'e.g., Buy 1 Get 1' : 'e.g., Free item'}
                    suffix={form.getFieldValue('discountType') === 'percentage' ? '%' : 
                           form.getFieldValue('discountType') === 'dollar' ? '$' : ''}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discountOn"
                  label="Discount On *"
                  rules={[{ required: true, message: 'Please specify what the discount applies to' }]}
                >
                  <Input placeholder="e.g., appetizers, desserts, clothing items, services" />
                </Form.Item>
              </Col>
            </Row>

            {/* Frequency and Promo Code */}
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="frequency"
                  label="Monthly Frequency *"
                  rules={[{ required: true, message: 'Please select monthly frequency' }]}
                >
                  <Select placeholder="How many times per month can users get this discount?">
                    <Option value="1">1 time per month</Option>
                    <Option value="2">2 times per month</Option>
                    <Option value="3">3 times per month</Option>
                    <Option value="4">4 times per month</Option>
                    <Option value="5">5 times per month</Option>
                    <Option value="unlimited">Unlimited</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="promoCode"
                  label="Promo Code *"
                  rules={[{ required: true, message: 'Please enter promo code' }]}
                >
                  <Input placeholder="e.g., SUMMER20, HAPPYHOUR" />
                </Form.Item>
              </Col>
            </Row>

            {/* Additional Terms */}
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Form.Item
                  name="additionalTerms"
                  label="Additional Terms"
                  rules={[{ required: false }]}
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Any additional terms, conditions, or restrictions for this discount..."
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Approval Information */}
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="approvedBy"
                  label="Approved By *"
                  rules={[{ required: true, message: 'Please enter who approved this discount' }]}
                >
                  <Input placeholder="e.g., John Smith, Marketing Manager" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="approvalDate"
                  label="Approval Date *"
                  rules={[{ required: true, message: 'Please select approval date' }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>



            {/* Pricing Tier */}
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
                <Button 
                  onClick={handlePrev} 
                  className="prev-btn"
                  disabled={saving}
                >
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

export default InviteVendorModal; 