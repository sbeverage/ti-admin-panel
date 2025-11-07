import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Typography,
  Divider,
  message,
  Card,
  Row,
  Col
} from 'antd';
import {
  GiftOutlined,
  DollarOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  TagOutlined,
  CloseOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { discountAPI } from '../services/api';
import './AddDiscountModal.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface AddDiscountModalProps {
  visible: boolean;
  vendorId: number;
  vendorName?: string;
  onCancel: () => void;
  onSuccess: () => void;
  editingDiscount?: any; // For editing existing discount
}

type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'free';

const AddDiscountModal: React.FC<AddDiscountModalProps> = ({
  visible,
  vendorId,
  vendorName,
  onCancel,
  onSuccess,
  editingDiscount
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType | undefined>(editingDiscount?.discountType || undefined);

  useEffect(() => {
    if (visible) {
      if (editingDiscount) {
        // Populate form with existing discount data
        form.setFieldsValue({
          title: editingDiscount.title || editingDiscount.name,
          discountType: editingDiscount.discountType || editingDiscount.discount_type,
          discountValue: editingDiscount.discountValue || editingDiscount.discount_value,
          posCode: editingDiscount.posCode || editingDiscount.discount_code || editingDiscount.promoCode,
          usageLimit: editingDiscount.usageLimit || editingDiscount.usage_limit || 'unlimited',
          description: editingDiscount.description || editingDiscount.additionalTerms
        });
        setDiscountType(editingDiscount.discountType || editingDiscount.discount_type);
      } else {
        form.resetFields();
        setDiscountType(undefined);
      }
    }
  }, [visible, editingDiscount, form]);

  const handleDiscountTypeChange = (value: DiscountType) => {
    setDiscountType(value);
    // Reset discount value when type changes
    form.setFieldsValue({ discountValue: undefined });
  };

  const getDiscountTypeIcon = (type: DiscountType) => {
    switch (type) {
      case 'percentage':
        return <PercentageOutlined />;
      case 'fixed':
        return <DollarOutlined />;
      case 'bogo':
        return <ShoppingOutlined />;
      case 'free':
        return <GiftOutlined />;
      default:
        return <TagOutlined />;
    }
  };

  const getDiscountTypeLabel = (type: DiscountType) => {
    switch (type) {
      case 'percentage':
        return 'Percentage Off';
      case 'fixed':
        return 'Fixed Amount Off';
      case 'bogo':
        return 'Buy One Get One';
      case 'free':
        return 'Free Item';
      default:
        return 'Select Type';
    }
  };

  const formatDiscountPreview = (values: any) => {
    if (!values.discountType || !values.title) return null;

    const { discountType, discountValue, title } = values;
    
    switch (discountType) {
      case 'percentage':
        return `${discountValue || 'X'}% off ${title}`;
      case 'fixed':
        return `$${discountValue || 'X'} off ${title}`;
      case 'bogo':
        return `Buy One Get One ${title}`;
      case 'free':
        return `FREE ${title}`;
      default:
        return title;
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format data for backend
      const discountData: any = {
        vendorId: vendorId,
        title: values.title,
        description: values.description || values.title,
        discountType: values.discountType,
        discountCode: values.posCode,
        usageLimit: values.usageLimit,
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      };

      // Set discount value based on type
      if (values.discountType === 'percentage') {
        discountData.discountValue = values.discountValue;
      } else if (values.discountType === 'fixed') {
        discountData.discountValue = values.discountValue;
      } else if (values.discountType === 'bogo') {
        discountData.discountValue = 50; // BOGO is 50% off second item
      } else if (values.discountType === 'free') {
        discountData.discountValue = 100; // FREE is 100% off
      }

      console.log('Creating/updating discount:', discountData);

      let response;
      if (editingDiscount) {
        // Update existing discount
        response = await discountAPI.updateDiscount(editingDiscount.id, discountData);
      } else {
        // Create new discount
        response = await discountAPI.createDiscount(discountData);
      }

      if (response.success || response.data) {
        message.success(editingDiscount ? 'Discount updated successfully!' : 'Discount added successfully!');
        form.resetFields();
        setDiscountType(undefined);
        onSuccess();
        onCancel();
      } else {
        message.error(response.error || 'Failed to save discount');
      }
    } catch (error: any) {
      console.error('Error saving discount:', error);
      if (error.errorFields) {
        // Form validation errors
        message.error('Please fill in all required fields');
      } else {
        message.error(error.message || 'Failed to save discount. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const preview = Form.useWatch([], form);

  return (
    <Modal
      title={
        <Space>
          <GiftOutlined />
          <span>{editingDiscount ? 'Edit Discount' : 'Add New Discount'}</span>
          {vendorName && (
            <>
              <Text type="secondary">for</Text>
              <Text strong>{vendorName}</Text>
            </>
          )}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="add-discount-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="discount-form"
      >
        {/* Discount Preview Card */}
        {preview && formatDiscountPreview(preview) && (
          <Card 
            className="discount-preview-card"
            style={{ 
              marginBottom: 24,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            <Row align="middle" gutter={16}>
              <Col flex="auto">
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                  {formatDiscountPreview(preview)}
                </Text>
                {preview.posCode && (
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ color: '#fff', opacity: 0.9, fontSize: 14 }}>
                      Code: <Text strong style={{ color: '#fff' }}>{preview.posCode}</Text>
                    </Text>
                  </div>
                )}
              </Col>
              {preview.usageLimit && preview.usageLimit !== 'unlimited' && (
                <Col>
                  <Text style={{ color: '#fff', opacity: 0.9, fontSize: 12 }}>
                    {preview.usageLimit === '1' ? '1x per month' : `${preview.usageLimit}x per month`}
                  </Text>
                </Col>
              )}
            </Row>
          </Card>
        )}

        {/* Title */}
        <Form.Item
          name="title"
          label="Discount Title"
          rules={[{ required: true, message: 'Please enter a discount title' }]}
          tooltip="This is what donors will see (e.g., '10% off Pizza', 'FREE Coffee')"
        >
          <Input
            placeholder="e.g., 10% off Pizza, FREE Coffee, Buy One Get One"
            size="large"
            prefix={<TagOutlined />}
          />
        </Form.Item>

        {/* Discount Type */}
        <Form.Item
          name="discountType"
          label="Discount Type"
          rules={[{ required: true, message: 'Please select a discount type' }]}
        >
          <Select
            placeholder="Select discount type"
            size="large"
            onChange={handleDiscountTypeChange}
            value={discountType}
          >
            <Option value="percentage">
              <Space>
                <PercentageOutlined />
                <span>Percentage Off (e.g., 10% off)</span>
              </Space>
            </Option>
            <Option value="fixed">
              <Space>
                <DollarOutlined />
                <span>Fixed Amount Off (e.g., $10 off)</span>
              </Space>
            </Option>
            <Option value="bogo">
              <Space>
                <ShoppingOutlined />
                <span>Buy One Get One (BOGO)</span>
              </Space>
            </Option>
            <Option value="free">
              <Space>
                <GiftOutlined />
                <span>Free Item</span>
              </Space>
            </Option>
          </Select>
        </Form.Item>

        {/* Discount Value - Only show for percentage and fixed */}
        {(discountType === 'percentage' || discountType === 'fixed') && (
          <Form.Item
            name="discountValue"
            label={
              discountType === 'percentage' 
                ? 'Discount Percentage' 
                : 'Discount Amount'
            }
            rules={[
              { required: true, message: `Please enter ${discountType === 'percentage' ? 'percentage' : 'amount'}` },
              {
                validator: (_, value) => {
                  if (discountType === 'percentage' && (value < 1 || value > 100)) {
                    return Promise.reject(new Error('Percentage must be between 1 and 100'));
                  }
                  if (discountType === 'fixed' && value <= 0) {
                    return Promise.reject(new Error('Amount must be greater than 0'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            tooltip={
              discountType === 'percentage'
                ? 'Enter the percentage off (e.g., 10 for 10%)'
                : 'Enter the dollar amount off (e.g., 10 for $10 off)'
            }
          >
            <InputNumber
              placeholder={discountType === 'percentage' ? '10' : '10.00'}
              size="large"
              min={discountType === 'percentage' ? 1 : 0.01}
              max={discountType === 'percentage' ? 100 : undefined}
              prefix={discountType === 'percentage' ? <PercentageOutlined /> : <DollarOutlined />}
              style={{ width: '100%' }}
              formatter={discountType === 'percentage' ? (value) => `${value}%` : (value) => `$${value}`}
              parser={(value) => {
                if (!value) return 0;
                const cleaned = discountType === 'percentage' 
                  ? value.replace('%', '') 
                  : value.replace('$', '');
                return parseFloat(cleaned) || 0;
              }}
            />
          </Form.Item>
        )}

        {/* POS/Discount Code */}
        <Form.Item
          name="posCode"
          label="POS/Discount Code"
          rules={[{ required: true, message: 'Please enter a POS/discount code' }]}
          tooltip="The code that donors will enter at checkout to redeem this discount"
        >
          <Input
            placeholder="e.g., PIZZA10, FREECOFFEE, BOGO2024"
            size="large"
            prefix={<TagOutlined />}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => {
              form.setFieldsValue({ posCode: e.target.value.toUpperCase() });
            }}
          />
        </Form.Item>

        {/* Usage Limit */}
        <Form.Item
          name="usageLimit"
          label="Usage Limit"
          rules={[{ required: true, message: 'Please select usage limit' }]}
          tooltip="How many times per month a donor can use this discount"
          initialValue="unlimited"
        >
          <Select
            placeholder="Select usage limit"
            size="large"
          >
            <Option value="1">1 time per month</Option>
            <Option value="2">2 times per month</Option>
            <Option value="3">3 times per month</Option>
            <Option value="5">5 times per month</Option>
            <Option value="10">10 times per month</Option>
            <Option value="unlimited">Unlimited</Option>
          </Select>
        </Form.Item>

        {/* Description (Optional) */}
        <Form.Item
          name="description"
          label="Additional Details (Optional)"
          tooltip="Any additional terms or conditions for this discount"
        >
          <TextArea
            placeholder="e.g., Valid on weekdays only, Excludes alcohol, Minimum purchase required"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Divider />

        {/* Action Buttons */}
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={editingDiscount ? null : <PlusOutlined />}
            >
              {editingDiscount ? 'Update Discount' : 'Add Discount'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDiscountModal;

