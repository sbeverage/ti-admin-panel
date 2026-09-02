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
  Row,
  Col
} from 'antd';
import {
  GiftOutlined,
  DollarOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  TagOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { discountAPI } from '../services/api';
import DiscountCardPreview, {
  SAMPLE_DISCOUNT, TITLE_MAX, TITLE_WARN, DESCRIPTION_MAX, TERMS_MAX, repeatsHeadline,
} from './DiscountCardPreview';
import './AddDiscountModal.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface AddDiscountModalProps {
  visible: boolean;
  vendorId: number;
  vendorName?: string;
  vendorOptions?: Array<{ id: number; name: string }>;
  onCancel: () => void;
  onSuccess: () => void;
  editingDiscount?: any; // For editing existing discount
}

type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'free';

const AddDiscountModal: React.FC<AddDiscountModalProps> = ({
  visible,
  vendorId,
  vendorName,
  vendorOptions,
  onCancel,
  onSuccess,
  editingDiscount
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType | undefined>(editingDiscount?.discountType || undefined);
  const [selectedVendorId, setSelectedVendorId] = useState<number | undefined>(vendorId || undefined);

  // Opened from inside one vendor's profile: the caller named the vendor and
  // gave no list to choose from. VendorProfile passes vendorId/vendorName but
  // no vendorOptions, so the picker rendered empty ("No data") while still
  // demanding a selection — there was no way to submit the form. The Discounts
  // page passes vendorOptions and needs the picker, so distinguish on that
  // rather than on vendorId alone.
  const lockedToVendor = !!vendorId && !(vendorOptions && vendorOptions.length > 0);

  useEffect(() => {
    if (visible) {
      if (editingDiscount) {
        // Populate form with existing discount data
        form.setFieldsValue({
          vendorId: editingDiscount.vendorId || vendorId,
          title: editingDiscount.title || editingDiscount.name,
          discountType: editingDiscount.discountType || editingDiscount.discount_type,
          discountValue: editingDiscount.discountValue || editingDiscount.discount_value,
          posCode: editingDiscount.posCode || editingDiscount.discount_code || editingDiscount.promoCode,
          usageLimit: editingDiscount.usageLimit || editingDiscount.usage_limit || 'unlimited',
          description: editingDiscount.description || editingDiscount.additionalTerms,
          terms: editingDiscount.terms || null,
          availability: editingDiscount.availability || 'in-store'
        });
        setDiscountType(editingDiscount.discountType || editingDiscount.discount_type);
        setSelectedVendorId(editingDiscount.vendorId || vendorId);
      } else {
        form.resetFields();
        setDiscountType(undefined);
        setSelectedVendorId(vendorId || undefined);
        // resetFields() clears vendorId too, so a modal opened from a vendor
        // profile had an empty required field and failed validation on submit
        // even once the picker was sorted.
        if (vendorId) {
          form.setFieldsValue({ vendorId });
        }
      }
    }
  }, [visible, editingDiscount, form, vendorId]);

  const handleDiscountTypeChange = (value: DiscountType) => {
    setDiscountType(value);
    // Reset discount value when type changes
    form.setFieldsValue({ discountValue: undefined });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const resolvedVendorId = values.vendorId || selectedVendorId || vendorId;
      if (!resolvedVendorId) {
        message.error('Please select a vendor before saving this discount.');
        setLoading(false);
        return;
      }

      // Format data for backend
      // Backend expects snake_case field names (per database schema)
      // Only include fields that exist in the database schema
      // IMPORTANT: Do NOT include minPurchase, maxDiscount - these columns don't exist in the database
      const discountData: any = {
        vendor_id: resolvedVendorId,
        vendorId: resolvedVendorId, // Send both for compatibility
        title: values.title,
        name: values.title, // Send both for compatibility (some backends use 'name')
        description: values.description || values.title,
        discount_type: values.discountType,
        discountType: values.discountType, // Send both for compatibility
        discount_code: values.posCode,
        pos_code: values.posCode, // Send both for compatibility
        discountCode: values.posCode, // Send both for compatibility
        usage_limit: values.usageLimit,
        usageLimit: values.usageLimit, // Send both for compatibility
        is_active: true,
        isActive: true, // Send both for compatibility
        start_date: new Date().toISOString(),
        startDate: new Date().toISOString(), // Send both for compatibility
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Send both for compatibility
        availability: values.availability || 'in-store',
        terms: values.terms || null,
      };

      // Set discount value based on type (send both snake_case and camelCase)
      if (values.discountType === 'percentage') {
        discountData.discount_value = values.discountValue;
        discountData.discountValue = values.discountValue;
      } else if (values.discountType === 'fixed') {
        discountData.discount_value = values.discountValue;
        discountData.discountValue = values.discountValue;
      } else if (values.discountType === 'bogo') {
        discountData.discount_value = 50; // BOGO is 50% off second item
        discountData.discountValue = 50;
      } else if (values.discountType === 'free') {
        discountData.discount_value = 100; // FREE is 100% off
        discountData.discountValue = 100;
      }

      // Explicitly exclude fields that don't exist in the database schema
      // This ensures they're never sent to the backend, even if accidentally included
      delete discountData.minPurchase;
      delete discountData.min_purchase;
      delete discountData.maxDiscount;
      delete discountData.max_discount;

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
        setSelectedVendorId(undefined);
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


  // Drives the live preview. useWatch re-renders on each keystroke, which is
  // the entire point — the vendor sees the card fill in as they write it.
  const watchedTitle = Form.useWatch('title', form);
  const watchedDescription = Form.useWatch('description', form);
  const watchedTerms = Form.useWatch('terms', form);
  const watchedAvailability = Form.useWatch('availability', form);
  const watchedUsageLimit = Form.useWatch('usageLimit', form);

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
      width={1040}
      className="add-discount-modal"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        onFinish={handleSubmit}
        className="discount-form"
      >
        <Row gutter={28}>
          <Col xs={24} lg={14}>
        {/* Keep the field registered either way so validation and submission
            behave the same; only the control changes. */}
        <Form.Item
          name="vendorId"
          label="Vendor"
          rules={[{ required: true, message: 'Please select a vendor' }]}
          hidden={lockedToVendor}
        >
          {lockedToVendor ? (
            <Input type="hidden" />
          ) : (
            <Select
              placeholder="Select vendor"
              size="large"
              value={selectedVendorId}
              onChange={(value) => setSelectedVendorId(value)}
              disabled={!!editingDiscount}
              showSearch
              optionFilterProp="children"
              notFoundContent="No vendors available"
            >
              {(vendorOptions || []).map((vendor) => (
                <Option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        {lockedToVendor && (
          <Form.Item label="Vendor">
            <Input
              value={vendorName || `Vendor #${vendorId}`}
              disabled
              size="large"
            />
          </Form.Item>
        )}


        {/* The headline on the card's orange band. One line, so it is capped
            here rather than shrunk to fit in the app. */}
        <Form.Item
          name="title"
          label="Offer headline"
          rules={[
            { required: true, message: 'Please enter the offer headline' },
            { max: TITLE_MAX, message: `Keep it to ${TITLE_MAX} characters so it fits the card` },
          ]}
          tooltip="The offer itself, in plain words. This is the big text on the orange band."
          extra="Lead with what the donor gets: “20% off your entire order”."
        >
          <Input
            placeholder="20% off your entire order"
            size="large"
            prefix={<TagOutlined />}
            maxLength={TITLE_MAX}
            showCount={{
              formatter: ({ count }) => (
                <span style={{ color: count > TITLE_WARN ? '#D48806' : undefined }}>
                  {count}/{TITLE_MAX}
                </span>
              ),
            }}
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
            />
          </Form.Item>
        )}

        {/* Availability */}
        <Form.Item
          name="availability"
          label="Availability"
          rules={[{ required: true, message: 'Please select availability' }]}
          tooltip="Where donors can redeem this discount"
        >
          <Select placeholder="Select availability" size="large">
            <Option value="in-store">In-Store Only</Option>
            <Option value="online">Online Only</Option>
            <Option value="both">In-Store & Online</Option>
          </Select>
        </Form.Item>

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
            <Option value="5">5 times per month</Option>
            <Option value="10">10 times per month</Option>
            <Option value="unlimited">Unlimited</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="What's included"
          tooltip="What the offer covers and how to use it — the detail a donor needs before walking in."
          extra="Don't repeat the headline. Say what it applies to and how it works."
          rules={[{
            warningOnly: true,
            validator: (_, value) =>
              repeatsHeadline(form.getFieldValue('title'), value)
                ? Promise.reject(new Error('This repeats the headline — tell donors something new, like what it covers or how to use it.'))
                : Promise.resolve(),
          }]}
        >
          <TextArea
            placeholder="Valid on all food and non-alcoholic drinks, dine-in or takeout. Show the code at the register before you pay."
            rows={3}
            maxLength={DESCRIPTION_MAX}
            showCount
          />
        </Form.Item>

        {/* Previously missing entirely, which pushed restrictions into the
            description and left both fields saying the same thing. */}
        <Form.Item
          name="terms"
          label="Fine print"
          tooltip="Restrictions and exclusions. Shown in small italics at the bottom of the card."
          extra="Limits and exclusions only — not a second description."
        >
          <TextArea
            placeholder="One per visit. Not valid with other offers or on holidays."
            rows={2}
            maxLength={TERMS_MAX}
            showCount
          />
        </Form.Item>

          </Col>

          {/* Live preview. Sticky so it stays in view while the form scrolls —
              a preview you have to scroll back to find is a preview nobody
              looks at. */}
          <Col xs={24} lg={10}>
            <div style={{ position: 'sticky', top: 0 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                How donors will see it
              </Text>
              <DiscountCardPreview
                title={watchedTitle}
                description={watchedDescription}
                terms={watchedTerms}
                availability={watchedAvailability}
                usageLimit={watchedUsageLimit}
              />

              <Divider style={{ margin: '20px 0 12px' }} />

              <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                A good example — each field does a different job
              </Text>
              <DiscountCardPreview {...SAMPLE_DISCOUNT} sample />

              <div
                style={{
                  marginTop: 12, padding: '10px 12px', background: '#FAFAFA',
                  border: '1px solid #F0F0F0', borderRadius: 8,
                  fontSize: 12, color: '#8C8C8C', lineHeight: '18px',
                }}
              >
                <div><strong>Headline</strong> — the offer</div>
                <div><strong>What's included</strong> — what it covers, how to use it</div>
                <div><strong>Fine print</strong> — limits and exclusions</div>
                <div style={{ marginTop: 6 }}>
                  If all three say the same thing, donors learn nothing from two of them.
                </div>
              </div>
            </div>
          </Col>
        </Row>

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

