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
  DollarOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { vendorAPI, discountAPI } from '../services/api';
import './InviteVendorModal.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

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
  const [logoFileList, setLogoFileList] = useState<any[]>([]);
  const [productImagesFileList, setProductImagesFileList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Predefined categories for consistency
  const categoryOptions = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'retail', label: 'Retail' },
    { value: 'service', label: 'Service' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'technology', label: 'Technology' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'beauty', label: 'Beauty & Wellness' },
    { value: 'fitness', label: 'Fitness & Sports' },
    { value: 'travel', label: 'Travel & Tourism' },
    { value: 'finance', label: 'Finance & Insurance' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'legal', label: 'Legal Services' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'construction', label: 'Construction' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'energy', label: 'Energy & Utilities' },
    { value: 'other', label: 'Other' }
  ];

  // Predefined tags for each category
  const getTagsForCategory = (category: string) => {
    const tagMap: { [key: string]: string[] } = {
      restaurant: [
        'Fine Dining', 'Casual Dining', 'Fast Food', 'Cafe', 'Coffee Shop',
        'Pizza', 'Italian', 'Mexican', 'Asian', 'American', 'Seafood',
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Family-Friendly', 'Date Night'
      ],
      retail: [
        'Clothing', 'Shoes', 'Accessories', 'Electronics', 'Home & Garden',
        'Books', 'Toys', 'Jewelry', 'Beauty Products', 'Sports Equipment',
        'Furniture', 'Art & Crafts', 'Pet Supplies', 'Gift Shop', 'Outlet'
      ],
      service: [
        'Cleaning', 'Laundry', 'Dry Cleaning', 'Pet Grooming', 'Hair Salon',
        'Nail Salon', 'Massage', 'Spa', 'Photography', 'Event Planning',
        'Moving', 'Storage', 'Repair', 'Consulting', 'Legal Services'
      ],
      entertainment: [
        'Movie Theater', 'Bowling', 'Arcade', 'Escape Room', 'Mini Golf',
        'Concert Venue', 'Comedy Club', 'Nightclub', 'Bar', 'Pub',
        'Live Music', 'Dance Club', 'Karaoke', 'Gaming', 'Theater'
      ],
      healthcare: [
        'Primary Care', 'Dentist', 'Optometrist', 'Dermatologist', 'Chiropractor',
        'Physical Therapy', 'Mental Health', 'Pediatric', 'Geriatric', 'Urgent Care',
        'Specialist', 'Pharmacy', 'Medical Equipment', 'Wellness', 'Preventive Care'
      ],
      education: [
        'Tutoring', 'Language Learning', 'Music Lessons', 'Art Classes', 'Dance Classes',
        'Cooking Classes', 'Computer Training', 'Test Prep', 'Early Childhood', 'Adult Education',
        'Online Learning', 'Vocational Training', 'Certification', 'Workshops', 'Summer Camps'
      ],
      technology: [
        'Software Development', 'IT Support', 'Web Design', 'Digital Marketing', 'Cybersecurity',
        'Cloud Services', 'Mobile Apps', 'E-commerce', 'Data Analytics', 'AI & Machine Learning',
        'Tech Consulting', 'Hardware Repair', 'Network Services', 'Tech Training', 'Startup'
      ],
      automotive: [
        'Auto Repair', 'Oil Change', 'Tire Service', 'Car Wash', 'Auto Detailing',
        'Body Shop', 'Mechanic', 'Auto Parts', 'Car Rental', 'Auto Insurance',
        'Vehicle Inspection', 'Transmission', 'Brake Service', 'Engine Repair', 'Auto Sales'
      ],
      beauty: [
        'Hair Styling', 'Hair Color', 'Hair Extensions', 'Facial', 'Skincare',
        'Makeup', 'Eyebrows', 'Eyelashes', 'Nail Art', 'Manicure',
        'Pedicure', 'Massage', 'Spa Treatment', 'Anti-Aging', 'Bridal Beauty'
      ],
      fitness: [
        'Personal Training', 'Group Fitness', 'Yoga', 'Pilates', 'CrossFit',
        'Swimming', 'Tennis', 'Golf', 'Martial Arts', 'Dance Fitness',
        'Cycling', 'Running', 'Weight Training', 'Cardio', 'Sports Coaching'
      ],
      travel: [
        'Hotels', 'Vacation Rentals', 'Travel Agency', 'Tour Guide', 'Airport Shuttle',
        'Car Rental', 'Travel Insurance', 'Cruise', 'Adventure Tours', 'City Tours',
        'Restaurant Tours', 'Wine Tours', 'Photography Tours', 'Cultural Tours', 'Eco Tours'
      ],
      finance: [
        'Banking', 'Investment', 'Insurance', 'Tax Services', 'Financial Planning',
        'Credit Repair', 'Loan Services', 'Mortgage', 'Real Estate', 'Accounting',
        'Bookkeeping', 'Payroll Services', 'Business Consulting', 'Retirement Planning', 'Estate Planning'
      ],
      'real-estate': [
        'Residential Sales', 'Commercial Sales', 'Property Management', 'Real Estate Investment', 'Home Staging',
        'Property Appraisal', 'Real Estate Law', 'Mortgage Broker', 'Home Inspection', 'Property Development',
        'Rental Properties', 'Luxury Homes', 'First-Time Buyers', 'Relocation Services', 'Property Marketing'
      ],
      'energy': [
        'Solar Installation', 'Energy Efficiency', 'HVAC Services', 'Electrical Services', 'Plumbing',
        'Home Insulation', 'Smart Home Technology', 'Energy Audits', 'Renewable Energy', 'Utility Services',
        'Generator Installation', 'Energy Storage', 'Green Building', 'Energy Consulting', 'Maintenance'
      ],
      other: [
        'Custom Services', 'Specialized', 'Unique', 'Boutique', 'Artisan',
        'Handmade', 'Local', 'Family-Owned', 'Eco-Friendly', 'Sustainable',
        'Innovative', 'Traditional', 'Modern', 'Vintage', 'Professional'
      ]
    };
    return tagMap[category] || [];
  };

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
      console.log('🔍 Current step:', currentStep);
      console.log('📝 All form values:', form.getFieldsValue());
      
      if (currentStep === 0) {
        // Step 0: Basic Details - validate required fields only
        const fieldsToValidate = [
          'primaryContact', 'primaryEmail', 'companyName', 'websiteLink',
          'street', 'phoneNumber', 'city', 'state', 'zipCode', 'category', 'description'
        ];
        const values = await form.validateFields(fieldsToValidate);
        console.log('✅ Step 0 validation passed');
        setBasicDetails(values);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // Step 1: Discounts - all fields optional, just get values
        const allValues = form.getFieldsValue();
        console.log('✅ Step 1 - collecting discount values (optional)');
        setPriceDiscounts(allValues);
        setCurrentStep(2);
      } else {
        // Step 2: Work Schedule - all fields optional, just get values
        console.log('🚀 Step 2 - Preparing to submit...');
        const allValues = form.getFieldsValue();
        console.log('📦 All collected values:', { ...basicDetails, ...priceDiscounts, ...allValues });
        setWorkSchedule(allValues);
        await handleSubmit({ ...basicDetails, ...priceDiscounts, ...allValues });
      }
    } catch (error) {
      console.error('❌ Validation failed:', error);
      console.error('📋 Error details:', JSON.stringify(error, null, 2));
      if (error && typeof error === 'object' && 'errorFields' in error && Array.isArray((error as any).errorFields) && (error as any).errorFields.length > 0) {
        const firstError = (error as any).errorFields[0];
        console.error('🔴 First validation error:', firstError);
        message.error(`Validation Error: ${firstError.name.join('.')}: ${firstError.errors[0]}`);
      } else {
        console.error('🔴 Unknown validation error:', error);
        message.error('Please check the form and try again');
      }
    }
  };

  const handleSubmit = async (allData: any) => {
    console.log('🎯 handleSubmit CALLED!');
    console.log('📦 Submitting vendor data:', allData);
    console.log('🖼️ Logo file list:', logoFileList);
    console.log('📸 Product images file list:', productImagesFileList);
    
    setSaving(true);
    try {
      
      // Get uploaded file URLs (for now using mock URLs until we fix the upload endpoint)
      const logoUrl = logoFileList.length > 0 && logoFileList[0].response ? logoFileList[0].response.url : null;
      const productImageUrls = productImagesFileList
        .filter(file => file.response && file.response.url)
        .map(file => file.response.url);

      // Helper function to format time from TimePicker
      const formatTime = (time: any) => {
        if (!time) return null;
        return time.format ? time.format('hh:mm A') : time;
      };

      // Helper function to format hours for a day
      const formatDayHours = (day: string) => {
        const dayLower = day.toLowerCase();
        const isClosed = allData[`${dayLower}Closed`];
        
        if (isClosed) {
          return 'Closed';
        }
        
        const startTime = formatTime(allData[`${dayLower}Start`]);
        const endTime = formatTime(allData[`${dayLower}End`]);
        
        if (startTime && endTime) {
          return `${startTime} - ${endTime}`;
        } else if (startTime || endTime) {
          return startTime || endTime || 'Closed';
        } else {
          return '9:00 AM - 5:00 PM'; // Default hours
        }
      };

      // Transform data to API format
      const vendorData = {
        name: allData.companyName,
        email: allData.primaryEmail,
        phone: allData.phoneNumber,
        website: allData.websiteLink,
        category: allData.category,
        tags: allData.tags || [],
        description: allData.description || '',
        logo_url: logoUrl,
        product_images: productImageUrls,
        address: {
          street: allData.street || '',
          city: allData.city || '',
          state: allData.state || '',
          zipCode: allData.zipCode || '',
          latitude: 0, // These would need to be geocoded
          longitude: 0
        },
        hours: {
          monday: formatDayHours('monday'),
          tuesday: formatDayHours('tuesday'),
          wednesday: formatDayHours('wednesday'),
          thursday: formatDayHours('thursday'),
          friday: formatDayHours('friday'),
          saturday: formatDayHours('saturday'),
          sunday: formatDayHours('sunday')
        },
        social_links: {
          facebook: allData.facebook || '',
          instagram: allData.instagram || '',
          twitter: allData.twitter || ''
        }
      };

      console.log('Sending vendor data to API:', vendorData);

      // Store form data in description as JSON since backend doesn't support custom fields
      const formData = {
        tags: allData.tags || [],
        pricingTier: allData.pricingTier || 'Not Set',
        description: allData.description || '',
        logo_file_name: logoFileList.length > 0 ? logoFileList[0].name : null,
        product_images: productImagesFileList.map(file => file.name),
        image_upload_status: 'pending'
      };

      const vendorDataWithImages = {
        ...vendorData,
        description: JSON.stringify(formData) // Store form data as JSON in description
      };

      // Create vendor
      console.log('About to call vendorAPI.createVendor with:', vendorDataWithImages);
      const vendorResponse = await vendorAPI.createVendor(vendorDataWithImages);
      console.log('Vendor API response:', vendorResponse);
      console.log('Response success:', vendorResponse?.success);
      console.log('Response data:', vendorResponse?.data);
      console.log('Response error:', vendorResponse?.error);
      
      // Check if vendor was created (handle both response formats)
      const vendorCreated = vendorResponse?.success && vendorResponse?.data;
      if (vendorCreated && vendorResponse.data) {
        const vendorId = vendorResponse.data.id;
        console.log('✅ Vendor created successfully with ID:', vendorId);
        
        // Upload logo to S3 if provided
        if (logoFileList.length > 0 && logoFileList[0].originFileObj) {
          try {
            console.log('Uploading logo to S3...');
            const logoUploadResponse = await vendorAPI.uploadVendorLogo(vendorId, logoFileList[0].originFileObj);
            console.log('Logo upload response:', logoUploadResponse);
            if (logoUploadResponse.success) {
              message.success('Logo uploaded successfully!');
            }
          } catch (error) {
            console.error('Logo upload failed:', error);
            message.warning('Vendor created but logo upload failed. You can upload it later.');
          }
        }
        
        // Create discounts for this vendor if any were provided
        if (allData.discountName && allData.discountType && allData.discountValue) {
          try {
            // Backend expects camelCase field names
            // Tags should be an array for JSONB format in Supabase
            const tagsArray = allData.tags && Array.isArray(allData.tags) 
              ? allData.tags 
              : allData.tags 
              ? [allData.tags] 
              : [];
            
            const discountData = {
              vendorId: vendorId,
              title: allData.discountName,
              description: allData.discountOn || allData.discountName,
              discountType: allData.discountType,
              discountValue: parseFloat(allData.discountValue),
              discountCode: allData.promoCode || null,
              category: allData.category || null,
              tags: tagsArray.length > 0 ? tagsArray : null, // Send as array for JSONB
              minPurchase: allData.minPurchase ? parseFloat(allData.minPurchase) : undefined,
              maxDiscount: allData.maxDiscount ? parseFloat(allData.maxDiscount) : undefined,
              terms: allData.additionalTerms || null,
              startDate: allData.startDate ? new Date(allData.startDate).toISOString() : new Date().toISOString(),
              endDate: allData.endDate ? new Date(allData.endDate).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
              isActive: true
            };
            
            console.log('Creating discount:', discountData);
            const discountResponse = await discountAPI.createDiscount(discountData);
            console.log('Discount API response:', discountResponse);
            
            if (discountResponse.success && discountResponse.data) {
              message.success('Discount created successfully!');
              
              // Upload discount image to S3 if provided
              if (productImagesFileList.length > 0) {
                try {
                  console.log('Uploading discount image to S3...');
                  const discountId = discountResponse.data.id;
                  const imageUploadResponse = await discountAPI.uploadDiscountImage(discountId, productImagesFileList[0].originFileObj);
                  console.log('Discount image upload response:', imageUploadResponse);
                  if (imageUploadResponse.success) {
                    message.success('Discount image uploaded successfully!');
                  }
                } catch (error) {
                  console.error('Discount image upload failed:', error);
                  message.warning('Discount created but image upload failed. You can upload it later.');
                }
              }
            } else {
              console.warn('Discount creation failed, but vendor was created successfully');
              message.warning('Vendor created! Discount setup can be completed later from the vendor profile.');
            }
          } catch (error) {
            console.error('Error creating discount:', error);
            message.warning('Vendor created successfully! Discount setup can be completed later from the vendor profile.');
          }
        }
        
        message.success('Vendor created successfully!');
        // Call onSubmit callback first to trigger parent refresh
        onSubmit(allData);
        // Small delay to ensure backend has finished processing
        setTimeout(() => {
          handleCancel();
        }, 100);
      } else {
        console.error('❌ Vendor creation failed:', vendorResponse);
        console.error('Response details:', JSON.stringify(vendorResponse, null, 2));
        const errorMessage = vendorResponse?.error || vendorResponse?.message || 'Unknown error';
        message.error(`Failed to create vendor: ${errorMessage}`);
        setSaving(false);
        return; // Don't close modal on error
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      message.error(`Failed to create vendor: ${error instanceof Error ? error.message : 'Please try again.'}`);
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
    setLogoFileList([]);
    setProductImagesFileList([]);
    onCancel();
  };

  // Upload handlers
  const handleLogoUpload = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); // Only keep the last file
    setLogoFileList(newFileList);
    
    // Set form value for validation
    if (newFileList.length > 0 && newFileList[0].status === 'done') {
      form.setFieldsValue({ logo: newFileList[0].response?.url || newFileList[0].name });
    } else if (newFileList.length > 0) {
      form.setFieldsValue({ logo: newFileList[0].name });
    }
    
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleProductImagesUpload = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-5); // Keep up to 5 files
    setProductImagesFileList(newFileList);
    
    // Set form value for validation
    const uploadedFiles = newFileList.filter(file => file.status === 'done');
    if (uploadedFiles.length > 0) {
      form.setFieldsValue({ productImages: uploadedFiles.map(file => file.response?.url || file.name) });
    }
    
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    customRequest: async ({ file, onSuccess, onError, onProgress }: any) => {
      try {
        console.log('Uploading file:', file.name, 'Type:', file.type);
        
        // For now, we'll create a mock URL and store the file for later upload
        // This allows the form to work while we figure out the correct upload endpoint
        const mockUrl = `https://thrive-backend-uploads.s3.us-east-1.amazonaws.com/mock-${Date.now()}-${file.name}`;
        
        // Simulate upload progress
        onProgress({ percent: 50 });
        setTimeout(() => {
          onProgress({ percent: 100 });
          
          onSuccess({
            url: mockUrl,
            name: file.name,
            status: 'done',
            file: file // Store the actual file for later processing
          });
          
        message.success(`${file.name} ready for upload (Note: Upload endpoint needs backend configuration)`);
        console.log('File prepared for upload:', file.name);
        }, 1000);
        
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
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Image must be smaller than 10MB!');
        return false;
      }
      return true;
    },
    onChange: (info: any) => {
      if (info.file.status === 'done') {
        console.log('Upload completed:', info.file.name);
      } else if (info.file.status === 'error') {
        console.error('Upload error:', info.file.error);
      } else if (info.file.status === 'uploading') {
        console.log('Uploading:', info.file.name);
      }
    },
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
                  name="street"
                  label="Street Address *"
                  rules={[{ required: true, message: 'Please enter street address' }]}
                >
                  <Input placeholder="Enter street address" />
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
                  label="ZIP Code *"
                  rules={[{ required: true, message: 'Please enter ZIP code' }]}
                >
                  <Input placeholder="Enter ZIP code" />
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
                  <Select 
                    placeholder="Select or search category"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={categoryOptions}
                    onChange={(value) => setSelectedCategory(value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="tags"
                  label="Tags"
                  rules={[{ required: false, message: 'Please select tags' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select relevant tags"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={getTagsForCategory(selectedCategory).map(tag => ({
                      value: tag,
                      label: tag
                    }))}
                    disabled={!selectedCategory}
                    notFoundContent={selectedCategory ? "No tags found" : "Please select a category first"}
                  />
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
                <Form.Item
                  name="logo"
                  label="Upload Logo"
                  rules={[{ required: false, message: 'Please upload a logo' }]}
                >
                  <Dragger
                    {...uploadProps}
                    fileList={logoFileList}
                    onChange={handleLogoUpload}
                    className="logo-upload"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag logo to this area to upload</p>
                    <p className="ant-upload-hint">
                      Recommended size: 1080px × 1080px. Max file size: 10MB
                    </p>
                  </Dragger>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="productImages"
                  label="Upload Product Images"
                >
                  <Dragger
                    {...uploadProps}
                    multiple={true}
                    fileList={productImagesFileList}
                    onChange={handleProductImagesUpload}
                    className="product-images-upload"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag images to this area to upload</p>
                    <p className="ant-upload-hint">
                      Upload minimum 3 additional images. Max 5 files, 10MB each
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
            <Title level={4}>Discount Configuration</Title>
            
            {/* Discount Basic Information */}
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  name="discountName"
                  label="Discount Name"
                  rules={[{ required: false, message: 'Please enter discount name' }]}
                >
                  <Input placeholder="e.g., Summer Special, Happy Hour" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discountType"
                  label="Discount Type"
                  rules={[{ required: false, message: 'Please select discount type' }]}
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
                  label="Discount Value"
                  rules={[{ required: false, message: 'Please enter discount value' }]}
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
                  label="Discount On"
                  rules={[{ required: false, message: 'Please specify what the discount applies to' }]}
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
                  label="Monthly Frequency"
                  rules={[{ required: false, message: 'Please select monthly frequency' }]}
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
                  label="Promo Code"
                  rules={[{ required: false, message: 'Please enter promo code' }]}
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
                  label="Approved By"
                  rules={[{ required: false, message: 'Please enter who approved this discount' }]}
                >
                  <Input placeholder="e.g., John Smith, Marketing Manager" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="approvalDate"
                  label="Approval Date"
                  rules={[{ required: false, message: 'Please select approval date' }]}
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
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                  Set business hours for each day. Leave checkboxes checked for closed days.
                </Text>
                <div className="schedule-table">
                  <div className="schedule-header">
                    <div className="schedule-col">Weekdays</div>
                    <div className="schedule-col">Availability</div>
                    <div className="schedule-col">Start Time</div>
                    <div className="schedule-col">End Time</div>
                  </div>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                    <div key={day} className="schedule-row">
                      <div className="schedule-col">{day}</div>
                      <div className="schedule-col">
                        <Form.Item 
                          name={`${day.toLowerCase()}Closed`}
                          valuePropName="checked"
                          initialValue={day === 'Saturday' || day === 'Sunday'}
                          style={{ margin: 0 }}
                        >
                          <Checkbox>
                            Closed
                          </Checkbox>
                        </Form.Item>
                      </div>
                      <div className="schedule-col">
                        <Form.Item 
                          name={`${day.toLowerCase()}Start`}
                          style={{ margin: 0 }}
                        >
                          <TimePicker 
                            format="hh:mm A"
                            placeholder="HH : MM AM"
                            className="time-picker"
                            use12Hours
                          />
                        </Form.Item>
                      </div>
                      <div className="schedule-col">
                        <Form.Item 
                          name={`${day.toLowerCase()}End`}
                          style={{ margin: 0 }}
                        >
                          <TimePicker 
                            format="hh:mm A"
                            placeholder="HH : MM AM"
                            className="time-picker"
                            use12Hours
                          />
                        </Form.Item>
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
                onClick={() => {
                  console.log('🖱️ Submit/Next button clicked! Current step:', currentStep);
                  handleNext();
                }}
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