import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Card,
  Row,
  Col,
  Avatar,
  Tag,
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
  Divider,
  Upload,
  Image
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  StarOutlined,
  ShopOutlined,
  SafetyOutlined,
  TeamOutlined,
  CheckCircleFilled,
  BankOutlined,
  DollarOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  IdcardOutlined,
  TrophyOutlined,
  RiseOutlined,
  TagOutlined,
  PictureOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { vendorAPI, discountAPI, Vendor as VendorType, Discount as DiscountType } from '../services/api';
import './VendorProfile.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface VendorProfileProps {
  vendorId: string;
  onClose: () => void;
  onUpdate: (updatedData: any) => void;
}

interface VendorData {
  id: string;
  vendorName: string;
  contactName: string;
  email: string;
  contactNumber: string;
  bankAccount: string;
  revenue: string;
  dateOfJoin: string;
  cityState: string;
  vendorType: string;
  customers: number;
  active: boolean;
  enabled: boolean;
  // Basic vendor information (from invite form)
  companyName?: string;
  primaryContact?: string;
  primaryEmail?: string;
  websiteLink?: string;
  address?: string;
  phoneNumber?: string;
  category?: string;
  tags?: string[];
  // Discount information (core of the app)
  discounts?: Discount[];
  pricingTier?: string;
  // Work schedule
  workSchedule?: any;
  // Images
  logo_url?: string;
  product_images?: string[];
}

interface Discount {
  id: number;
  discountName: string;
  discountType: 'free' | 'percentage' | 'dollar' | 'bogo';
  discountValue: string;
  discountOn: string;
  frequency: string;
  promoCode: string;
  additionalTerms?: string;
  approvedBy: string;
  approvalDate: string;
  pricingTier: string;
}

const VendorProfile: React.FC<VendorProfileProps> = ({
  vendorId,
  onClose,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [logoFileList, setLogoFileList] = useState<any[]>([]);
  const [productImagesFileList, setProductImagesFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // Predefined tags for each category (same as InviteVendorModal)
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

  // Load vendor data from API
  useEffect(() => {
    loadVendorData();
  }, [vendorId]);

  const loadVendorData = async () => {
    setLoading(true);
    
    // Create timeout promise that rejects after 3 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 3000);
    });

    try {
      const vendorIdNum = parseInt(vendorId);
      console.log('Loading vendor profile data...');
      console.time('Vendor Profile API Call');
      
      // Load vendor data with timeout
      const vendorResponse = await Promise.race([
        vendorAPI.getVendor(vendorIdNum),
        timeoutPromise
      ]) as any;
      
      if (vendorResponse.success) {
        const vendor = vendorResponse.data;
        
        // Load discounts for this vendor with timeout
        const discountsResponse = await Promise.race([
          discountAPI.getDiscountsByVendor(vendorIdNum),
          timeoutPromise
        ]) as any;
        const discounts = discountsResponse.success ? discountsResponse.data : [];
        
        // Transform API data to match our interface
        const transformedData: VendorData = {
          id: vendor.id.toString(),
          vendorName: vendor.name,
          contactName: vendor.email, // Using email as contact name for now
          email: vendor.email,
          contactNumber: vendor.phone,
          bankAccount: '****5678', // This would come from a separate API
          revenue: '$125,000', // This would come from analytics API
          dateOfJoin: new Date(vendor.created_at).toLocaleDateString(),
          cityState: `${vendor.address.city}, ${vendor.address.state}`,
          vendorType: vendor.category,
          customers: 45, // This would come from analytics API
          active: true, // This would come from vendor status
          enabled: true, // This would come from vendor status
          // Basic vendor information (from API)
          companyName: vendor.name,
          primaryContact: vendor.email, // This would be a separate field in the API
          primaryEmail: vendor.email,
          websiteLink: vendor.website,
          address: `${vendor.address.street}, ${vendor.address.city}, ${vendor.address.state} ${vendor.address.zipCode}`,
          phoneNumber: vendor.phone,
          category: vendor.category,
          // Discount information (from discounts API)
          pricingTier: '$$$', // This would be calculated or come from vendor data
          discounts: discounts.map((discount: DiscountType) => ({
            id: discount.id,
            discountName: discount.name,
            discountType: discount.discount_type as 'free' | 'percentage' | 'dollar' | 'bogo',
            discountValue: discount.discount_value.toString(),
            discountOn: discount.description,
            frequency: 'unlimited', // This would come from discount data
            promoCode: `PROMO${discount.id}`, // This would come from discount data
            additionalTerms: discount.description,
            approvedBy: 'Admin', // This would come from discount data
            approvalDate: new Date(discount.created_at).toLocaleDateString(),
            pricingTier: '$$$'
          })),
          // Work schedule (from vendor data)
          workSchedule: vendor.hours
        };

        setVendorData(transformedData);
        setFormData(transformedData);
        setSelectedCategory(transformedData.category || '');
      } else {
        message.error('Failed to load vendor data');
        // Fallback to mock data
        const mockData = getMockVendorData();
        setVendorData(mockData);
        setFormData(mockData);
        setSelectedCategory(mockData.category || '');
      }
    } catch (error) {
      console.timeEnd('Vendor Profile API Call');
      console.error('Error loading vendor data:', error);
      console.error('Error details:', error);
      console.log('API failed, showing fallback vendor data');
      message.error('Failed to load vendor data. Using mock data.');
      // Fallback to mock data
      const mockData = getMockVendorData();
      setVendorData(mockData);
      setFormData(mockData);
      setSelectedCategory(mockData.category || '');
    } finally {
      setLoading(false);
    }
  };

  const getMockVendorData = (): VendorData => ({
    id: vendorId,
    vendorName: 'Tech Solutions Pro',
    contactName: 'Michael Chen',
    email: 'michael.chen@techsolutionspro.com',
    contactNumber: '+1 (555) 234-5678',
    bankAccount: '****5678',
    revenue: '$125,000',
    dateOfJoin: 'March 15, 2023',
    cityState: 'San Francisco, CA',
    vendorType: 'Technology Services',
    customers: 45,
    active: true,
    enabled: true,
    // Basic vendor information (from invite form)
    companyName: 'Tech Solutions Pro',
    primaryContact: 'Michael Chen',
    primaryEmail: 'michael.chen@techsolutionspro.com',
    websiteLink: 'https://techsolutionspro.com',
    address: '123 Tech Street, San Francisco, CA 94105',
    phoneNumber: '+1 (555) 234-5678',
    category: 'technology',
    tags: ['Software Development', 'IT Support', 'Web Design', 'Tech Consulting'],
    // Discount information (core of the app)
    pricingTier: '$$$',
    discounts: [
      {
        id: 1,
        discountName: 'Summer Special',
        discountType: 'percentage',
        discountValue: '25',
        discountOn: 'All software development services',
        frequency: '3',
        promoCode: 'SUMMER25',
        additionalTerms: 'Valid for new clients only. Cannot be combined with other offers.',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-06-01',
        pricingTier: '$$$'
      },
      {
        id: 2,
        discountName: 'First Time Client',
        discountType: 'dollar',
        discountValue: '500',
        discountOn: 'Initial consultation and project setup',
        frequency: '1',
        promoCode: 'FIRST500',
        additionalTerms: 'One-time use for new clients. Applies to projects over $5,000.',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-05-15',
        pricingTier: '$$$'
      },
      {
        id: 3,
        discountName: 'Referral Bonus',
        discountType: 'percentage',
        discountValue: '15',
        discountOn: 'Next project for referring new clients',
        frequency: 'unlimited',
        promoCode: 'REFERRAL15',
        additionalTerms: 'Valid when referred client completes a project. No expiration.',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-04-01',
        pricingTier: '$$$'
      }
    ],
    // Work schedule
    workSchedule: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 2:00 PM',
      sunday: 'Closed'
    },
    // Sample images
    logo_url: 'https://via.placeholder.com/200x200/DB8633/FFFFFF?text=LOGO',
    product_images: [
      'https://via.placeholder.com/400x300/DB8633/FFFFFF?text=Product+1',
      'https://via.placeholder.com/400x300/324E58/FFFFFF?text=Product+2',
      'https://via.placeholder.com/400x300/DB8633/FFFFFF?text=Product+3'
    ]
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...vendorData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...vendorData });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const vendorIdNum = parseInt(vendorId);
      
      // Transform form data back to API format
      const apiData = {
        name: formData.companyName || formData.vendorName,
        email: formData.primaryEmail || formData.email,
        phone: formData.phoneNumber || formData.contactNumber,
        website: formData.websiteLink,
        category: formData.category,
        address: {
          street: formData.address?.split(',')[0] || '',
          city: formData.cityState?.split(',')[0] || '',
          state: formData.cityState?.split(',')[1]?.trim() || '',
          zipCode: formData.address?.split(' ').pop() || '',
          latitude: 0, // These would need to be geocoded
          longitude: 0
        }
      };
      
      const result = await vendorAPI.updateVendor(vendorIdNum, apiData);
      if (result.success) {
        setVendorData(formData);
        setIsEditing(false);
        onUpdate(formData);
        message.success('Vendor updated successfully!');
      } else {
        message.error('Failed to update vendor. Please try again.');
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      message.error('Failed to update vendor. Please try again.');
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
      <div className="vendor-profile-loading">
        <Spin size="large" />
        <Text>Loading vendor profile...</Text>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="vendor-profile-error">
        <Text>Vendor not found</Text>
        <Button onClick={onClose}>Go Back</Button>
      </div>
    );
  }

  const renderBasicInfo = () => (
    <Card title="Basic Information" className="profile-section-card">
      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Company Name</label>
            {isEditing ? (
              <Input
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter company name"
              />
            ) : (
              <Text strong>{vendorData.companyName}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Category</label>
            {isEditing ? (
              <Select
                value={formData.category}
                onChange={(value) => {
                  handleInputChange('category', value);
                  setSelectedCategory(value);
                }}
                placeholder="Select or search category"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                options={[
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
                ]}
              />
            ) : (
              <Tag color="blue">{vendorData.category}</Tag>
            )}
          </div>
        </Col>
      </Row>
      
      <Row gutter={[24, 16]}>
        <Col span={24}>
          <div className="form-field">
            <label>Tags</label>
            {isEditing ? (
              <Select
                mode="multiple"
                value={formData.tags || []}
                onChange={(value) => handleInputChange('tags', value)}
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
                style={{ width: '100%' }}
              />
            ) : (
              <div>
                {vendorData.tags && vendorData.tags.length > 0 ? (
                  vendorData.tags.map((tag: string, index: number) => (
                    <Tag key={index} color="orange" style={{ marginBottom: '4px' }}>
                      {tag}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No tags selected</Text>
                )}
              </div>
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
                value={formData.primaryContact}
                onChange={(e) => handleInputChange('primaryContact', e.target.value)}
                placeholder="Enter primary contact name"
              />
            ) : (
              <Text>{vendorData.primaryContact}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Primary Email</label>
            {isEditing ? (
              <Input
                value={formData.primaryEmail}
                onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                placeholder="Enter primary email"
              />
            ) : (
              <Text>{vendorData.primaryEmail}</Text>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Address</label>
            {isEditing ? (
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter address, city, state"
              />
            ) : (
              <Text>{vendorData.address}</Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Phone Number</label>
            {isEditing ? (
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter company phone number"
              />
            ) : (
              <Text>{vendorData.phoneNumber}</Text>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 16]}>
        <Col span={12}>
          <div className="form-field">
            <label>Website</label>
            {isEditing ? (
              <Input
                value={formData.websiteLink}
                onChange={(e) => handleInputChange('websiteLink', e.target.value)}
                placeholder="Enter website link"
              />
            ) : (
              <Text>
                {vendorData.websiteLink && (
                  <a href={vendorData.websiteLink} target="_blank" rel="noopener noreferrer">
                    {vendorData.websiteLink}
                  </a>
                )}
              </Text>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="form-field">
            <label>Pricing Tier</label>
            {isEditing ? (
              <Select
                value={formData.pricingTier}
                onChange={(value) => handleInputChange('pricingTier', value)}
                placeholder="Select pricing tier"
                style={{ width: '100%' }}
              >
                <Option value="$">$ (Budget)</Option>
                <Option value="$$">$$ (Moderate)</Option>
                <Option value="$$$">$$$ (Premium)</Option>
                <Option value="$$$$">$$$$ (Luxury)</Option>
              </Select>
            ) : (
              <Tag color="gold">{vendorData.pricingTier}</Tag>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderDiscountsInfo = () => (
    <Card title="Discounts & Offers" className="profile-section-card">
      <div className="form-field">
        <label>Current Discounts</label>
        {vendorData.discounts && vendorData.discounts.length > 0 ? (
          <div className="discounts-list">
            {vendorData.discounts.map((discount) => (
              <Card 
                key={discount.id} 
                size="small" 
                className="discount-card"
                style={{ marginBottom: '16px', border: '1px solid #e8e8e8' }}
              >
                <Row gutter={[16, 8]}>
                  <Col span={24}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Text strong style={{ fontSize: '16px', color: '#DB8633' }}>
                        {discount.discountName}
                      </Text>
                      <Tag color="blue">{discount.promoCode}</Tag>
                    </div>
                  </Col>
                </Row>
                
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text type="secondary">Type:</Text>
                    <br />
                    <Tag color={
                      discount.discountType === 'percentage' ? 'green' : 
                      discount.discountType === 'dollar' ? 'blue' : 
                      discount.discountType === 'free' ? 'gold' : 'purple'
                    }>
                      {discount.discountType === 'percentage' ? `${discount.discountValue}% Off` :
                       discount.discountType === 'dollar' ? `$${discount.discountValue} Off` :
                       discount.discountType === 'free' ? 'Free' : discount.discountValue}
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Frequency:</Text>
                    <br />
                    <Text>{discount.frequency === 'unlimited' ? 'Unlimited' : `${discount.frequency} time(s) per month`}</Text>
                  </Col>
                </Row>

                <Row gutter={[16, 8]}>
                  <Col span={24}>
                    <Text type="secondary">Applies to:</Text>
                    <br />
                    <Text>{discount.discountOn}</Text>
                  </Col>
                </Row>

                {discount.additionalTerms && (
                  <Row gutter={[16, 8]}>
                    <Col span={24}>
                      <Text type="secondary">Terms:</Text>
                      <br />
                      <Text>{discount.additionalTerms}</Text>
                    </Col>
                  </Row>
                )}

                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text type="secondary">Approved by:</Text>
                    <br />
                    <Text>{discount.approvedBy}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Approval date:</Text>
                    <br />
                    <Text>{discount.approvalDate}</Text>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        ) : (
          <Text type="secondary">No discounts configured yet.</Text>
        )}
      </div>
    </Card>
  );





  const renderStats = () => (
    <Card title="Quick Stats" className="profile-section-card">
      <Row gutter={[24, 16]}>
        <Col span={6}>
          <Statistic
            title="Total Revenue"
            value={vendorData.revenue}
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#DB8633' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Customers"
            value={vendorData.customers}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Date Joined"
            value={vendorData.dateOfJoin}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Status"
            value={vendorData.active ? 'Active' : 'Inactive'}
            prefix={vendorData.active ? <CheckCircleFilled /> : <CloseOutlined />}
            valueStyle={{ color: vendorData.active ? '#52c41a' : '#ff4d4f' }}
          />
        </Col>
      </Row>
    </Card>
  );

  const renderImagesInfo = () => (
    <div className="images-section">
      <Card title="Logo" className="profile-section-card" style={{ marginBottom: '24px' }}>
        <div className="logo-section">
          {vendorData?.logo_url ? (
            <div className="image-preview">
              <Image
                src={vendorData.logo_url}
                alt="Vendor Logo"
                style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: '8px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
              <div className="image-actions" style={{ marginTop: '12px' }}>
                <Button 
                  icon={<EyeOutlined />} 
                  size="small"
                  onClick={() => window.open(vendorData.logo_url, '_blank')}
                >
                  View Full Size
                </Button>
                <Button 
                  icon={<DeleteOutlined />} 
                  size="small" 
                  danger
                  style={{ marginLeft: '8px' }}
                  onClick={() => {
                    setVendorData(prev => prev ? { ...prev, logo_url: '' } : null);
                    message.success('Logo removed');
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="no-image">
              <PictureOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                No logo uploaded
              </Text>
            </div>
          )}
        </div>
      </Card>

      <Card title="Product Images" className="profile-section-card">
        <div className="product-images-section">
          {vendorData?.product_images && vendorData.product_images.length > 0 ? (
            <div className="images-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {vendorData.product_images.map((imageUrl, index) => (
                <div key={index} className="image-item" style={{ border: '1px solid #e8e8e8', borderRadius: '8px', padding: '8px' }}>
                  <Image
                    src={imageUrl}
                    alt={`Product ${index + 1}`}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                  />
                  <div className="image-actions" style={{ marginTop: '8px', textAlign: 'center' }}>
                    <Button 
                      icon={<EyeOutlined />} 
                      size="small"
                      onClick={() => window.open(imageUrl, '_blank')}
                    >
                      View
                    </Button>
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                      style={{ marginLeft: '4px' }}
                      onClick={() => {
                        const newImages = vendorData.product_images.filter((_, i) => i !== index);
                        setVendorData(prev => prev ? { ...prev, product_images: newImages } : null);
                        message.success('Image removed');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-images" style={{ textAlign: 'center', padding: '40px' }}>
              <PictureOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                No product images uploaded
              </Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <ShopOutlined />,
      children: (
        <div className="tab-content">
          {renderStats()}
          {renderBasicInfo()}
        </div>
      )
    },
    {
      key: 'discounts',
      label: 'Discounts & Offers',
      icon: <TagOutlined />,
      children: (
        <div className="tab-content">
          {renderDiscountsInfo()}
        </div>
      )
    },
    {
      key: 'images',
      label: 'Images',
      icon: <PictureOutlined />,
      children: (
        <div className="tab-content">
          {renderImagesInfo()}
        </div>
      )
    }
  ];

  return (
    <div className="vendor-profile-overlay">
      <div className="vendor-profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="header-left">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onClose}
              className="back-button"
            >
              Back to Vendors
            </Button>
            <div className="vendor-title">
                                      <Avatar size={64} style={{ backgroundColor: '#DB8633' }}>
                {(vendorData.companyName || vendorData.vendorName).charAt(0)}
              </Avatar>
              <div className="title-content">
                <Title level={2} style={{ margin: 0 }}>
                  {vendorData.companyName || vendorData.vendorName}
                </Title>
                <Text type="secondary">
                  {vendorData.category || vendorData.vendorType} • {vendorData.address || vendorData.cityState}
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

export default VendorProfile;
