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
  Image,
  Modal
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
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { vendorAPI, discountAPI, Vendor as VendorType, Discount as DiscountType } from '../services/api';
import ImageUpload from './ImageUpload';
import AddDiscountModal from './AddDiscountModal';
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
  status?: 'active' | 'inactive';
  // Basic vendor information (from invite form)
  companyName?: string;
  primaryContact?: string;
  primaryEmail?: string;
  websiteLink?: string;
  address?: string;
  phoneNumber?: string;
  category?: string;
  // Discount information (core of the app)
  discounts?: Discount[];
  pricingTier?: string;
  // Work schedule
  workSchedule?: any;
  // Images
  logo_url?: string;
  logo_file_name?: string;
  product_images?: string[];
  image_upload_status?: string;
  // Form data
  tags?: string[];
  description?: string;
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
  const [isAddDiscountModalVisible, setIsAddDiscountModalVisible] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);

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
      
      console.log('Vendor API response:', vendorResponse);
      if (vendorResponse.success && vendorResponse.data) {
        const vendor = vendorResponse.data;
        console.log('Vendor data from API:', vendor);
        
        // Load discounts for this vendor with timeout (optional - don't fail if endpoint doesn't exist)
        let discounts = [];
        try {
          console.log('🔍 Fetching discounts for vendor ID:', vendorIdNum);
          
          // First, try to fetch all discounts directly to see what we get
          try {
            const allDiscountsTest = await discountAPI.getDiscounts(1, 1000);
            console.log('🧪 TEST: All discounts response:', allDiscountsTest);
            console.log('🧪 TEST: All discounts data:', allDiscountsTest.data);
            console.log('🧪 TEST: Total discounts found:', allDiscountsTest.data?.length || 0);
            
            if (allDiscountsTest.data && Array.isArray(allDiscountsTest.data)) {
              const vendorDiscounts = allDiscountsTest.data.filter((d: any) => {
                const vid = d.vendor_id || d.vendorId;
                const matches = vid === vendorIdNum || vid === Number(vendorIdNum) || String(vid) === String(vendorIdNum);
                if (matches) {
                  console.log('✅ TEST: Found matching discount:', d.id, 'vendor_id:', vid);
                }
                return matches;
              });
              console.log('🧪 TEST: Filtered discounts for vendor:', vendorDiscounts);
              if (vendorDiscounts.length > 0) {
                discounts = vendorDiscounts;
                console.log(`✅ TEST: Using ${discounts.length} discounts from direct fetch`);
              }
            }
          } catch (testError) {
            console.log('🧪 TEST: Direct fetch failed, trying vendor-specific endpoint:', testError);
          }
          
          // If we didn't get discounts from direct fetch, try the vendor-specific endpoint
          if (discounts.length === 0) {
            const discountsResponse = await Promise.race([
              discountAPI.getDiscountsByVendor(vendorIdNum),
              timeoutPromise
            ]) as any;
            
            console.log('📦 Discounts API response:', discountsResponse);
            
            if (discountsResponse && discountsResponse.success) {
              discounts = Array.isArray(discountsResponse.data) ? discountsResponse.data : [];
              console.log(`✅ Loaded ${discounts.length} discounts:`, discounts);
            } else {
              console.log('⚠️ Discounts response not successful:', discountsResponse);
              discounts = [];
            }
          }
        } catch (discountError) {
          console.error('❌ Error loading discounts:', discountError);
          console.log('Discounts endpoint not available, continuing without discounts:', discountError);
          discounts = [];
        }
        
        console.log(`🎯 Final discounts array for vendor ${vendorIdNum}:`, discounts);
        console.log(`🎯 Final discounts count:`, discounts.length);
        
        // Parse form data from description field (stored as JSON)
        let formData: any = {};
        try {
          if (vendor.description) {
            formData = JSON.parse(vendor.description);
            console.log('Parsed form data from description:', formData);
          }
        } catch (error) {
          console.log('Could not parse form data from description:', error);
        }

        // Transform API data to match our interface
        console.log('Transforming vendor data for profile...');
        const transformedData: VendorData = {
          id: vendor.id.toString(),
          vendorName: vendor.name,
          contactName: vendor.email, // Using email as contact name for now
          email: vendor.email,
          contactNumber: vendor.phone,
          bankAccount: 'Not Available', // This would come from a separate API
          revenue: 'Not Available', // This would come from analytics API
          dateOfJoin: new Date(vendor.created_at).toLocaleDateString(),
          cityState: vendor.address && vendor.address.city && vendor.address.state 
            ? `${vendor.address.city}, ${vendor.address.state}`
            : vendor.address && vendor.address.city 
            ? vendor.address.city
            : 'Location not specified',
          vendorType: vendor.category || 'Uncategorized',
          customers: 0, // This would come from analytics API
          active: vendor.status === 'active', // Use actual vendor status
          enabled: vendor.status === 'active', // Use actual vendor status
          status: vendor.status || 'active', // Add status field
          // Basic vendor information (from API)
          companyName: vendor.name,
          primaryContact: vendor.email, // This would be a separate field in the API
          primaryEmail: vendor.email,
          websiteLink: vendor.website || 'Not provided',
          address: vendor.address && vendor.address.street 
            ? `${vendor.address.street}, ${vendor.address.city}, ${vendor.address.state} ${vendor.address.zipCode}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '')
            : 'Address not provided',
          phoneNumber: vendor.phone,
          category: vendor.category || 'Uncategorized',
          // Discount information (from discounts API)
          discounts: (Array.isArray(discounts) ? discounts : []).map((discount: DiscountType) => {
            // Map API discount_type to UI format
            // API uses 'fixed' but UI expects 'dollar' for display
            let displayType: 'free' | 'percentage' | 'dollar' | 'bogo' = discount.discount_type as any;
            if (discount.discount_type === 'fixed') {
              displayType = 'dollar';
            }
            
            return {
              id: discount.id,
              discountName: discount.title || discount.name,
              discountType: displayType,
              discountValue: discount.discount_value.toString(),
              discountOn: discount.description,
              frequency: discount.usage_limit || 'unlimited',
              promoCode: discount.discount_code || discount.pos_code || `PROMO${discount.id}`,
              additionalTerms: discount.description,
              approvedBy: 'Admin', // This would come from discount data
              approvalDate: new Date(discount.created_at).toLocaleDateString(),
              pricingTier: 'Not Set'
            };
          }),
          // Work schedule (from vendor data)
          workSchedule: vendor.hours,
          // Images from vendor data
          logo_url: vendor.logo_url,
          // Form data parsed from description field
          tags: formData.tags || [],
          pricingTier: formData.pricingTier || 'Not Set',
          description: formData.description || 'No description provided',
          logo_file_name: formData.logo_file_name,
          product_images: formData.product_images || [],
          image_upload_status: formData.image_upload_status
        };

        console.log('Setting vendor data:', transformedData);
        setVendorData(transformedData);
        setFormData(transformedData);
        setSelectedCategory(transformedData.category || '');
        console.log('Vendor profile data loaded successfully');
      } else {
        console.error('❌ Vendor API response failed:', vendorResponse);
        message.error('Failed to load vendor data');
        // No data available
        console.log('No vendor data available');
        setVendorData(null);
        setFormData(null);
        setSelectedCategory('');
      }
    } catch (error) {
      console.timeEnd('Vendor Profile API Call');
      console.error('Error loading vendor data:', error);
      console.error('Error details:', error);
      console.log('API failed, showing fallback vendor data');
      message.error('Failed to load vendor data.');
      setVendorData(null);
      setFormData(null);
      setSelectedCategory('');
    } finally {
      setLoading(false);
    }
  };


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
        <Col span={24}>
          <div className="form-field">
            <label>Description</label>
            {isEditing ? (
              <Input.TextArea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter vendor description"
                rows={3}
              />
            ) : (
              <Text>{vendorData.description || 'No description provided'}</Text>
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

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setIsAddDiscountModalVisible(true);
  };

  const handleEditDiscount = (discount: any) => {
    // Map the discount to the format expected by AddDiscountModal
    const discountToEdit = {
      id: discount.id,
      title: discount.discountName,
      discountType: discount.discountType === 'dollar' ? 'fixed' : discount.discountType,
      discountValue: parseFloat(discount.discountValue),
      posCode: discount.promoCode,
      usageLimit: discount.frequency,
      description: discount.additionalTerms || discount.discountOn
    };
    setEditingDiscount(discountToEdit);
    setIsAddDiscountModalVisible(true);
  };

  const handleDeleteDiscount = async (discountId: number) => {
    try {
      const response = await discountAPI.deleteDiscount(discountId);
      if (response.success) {
        message.success('Discount deleted successfully');
        await loadVendorData(); // Reload vendor data to refresh discounts
      } else {
        message.error('Failed to delete discount');
      }
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      message.error(error.message || 'Failed to delete discount');
    }
  };

  const handleDiscountSuccess = async () => {
    await loadVendorData(); // Reload vendor data to refresh discounts
  };

  const renderDiscountsInfo = () => {
    // Safety check
    if (!vendorData) {
      return (
        <Card title="Discounts & Offers" className="profile-section-card">
          <Spin />
        </Card>
      );
    }

    const discounts = vendorData.discounts || [];
    
    return (
      <Card 
        title="Discounts & Offers"
        className="profile-section-card"
      >
        <div className="form-field">
          <label>Current Discounts</label>
          {discounts.length > 0 ? (
          <div className="discounts-list">
            {discounts.map((discount) => (
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

                <Row gutter={[16, 8]} style={{ marginTop: '12px' }}>
                  <Col span={24}>
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditDiscount(discount)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          Modal.confirm({
                            title: 'Delete Discount',
                            content: `Are you sure you want to delete "${discount.discountName}"?`,
                            okText: 'Delete',
                            okType: 'danger',
                            cancelText: 'Cancel',
                            onOk: () => handleDeleteDiscount(discount.id)
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '24px', fontSize: '16px' }}>
              No discounts configured yet.
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddDiscount}
              size="large"
              style={{ 
                height: '48px',
                fontSize: '16px',
                fontWeight: 600,
                padding: '0 32px',
                boxShadow: '0 4px 12px rgba(219, 134, 51, 0.4)'
              }}
            >
              <PlusOutlined /> Add Your First Discount
            </Button>
          </div>
        )}
      </div>
      
        {/* Add Discount button at bottom */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '24px', 
          borderTop: '2px solid #f0f0f0'
        }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddDiscount}
            size="large"
            block
            style={{ 
              height: '48px',
              fontSize: '16px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(219, 134, 51, 0.4)',
              backgroundColor: '#DB8633',
              borderColor: '#DB8633'
            }}
          >
            <PlusOutlined /> Add New Discount
          </Button>
        </div>
      </Card>
    );
  };





  const renderStats = () => (
    <Card title="Quick Stats" className="profile-section-card">
      <Row gutter={[24, 16]}>
        <Col span={8}>
          <Statistic
            title="Total Revenue"
            value={vendorData.revenue}
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#DB8633' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Customers"
            value={vendorData.customers}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Date Joined"
            value={vendorData.dateOfJoin}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>
    </Card>
  );

  const renderImagesInfo = () => (
    <div className="images-section">
      <Card title="Logo" className="profile-section-card" style={{ marginBottom: '24px' }}>
        <div className="logo-section">
          <ImageUpload
            currentImageUrl={vendorData?.logo_url}
            onImageChange={(url) => {
              setVendorData(prev => prev ? { ...prev, logo_url: url || '' } : null);
            }}
            title="Upload Vendor Logo"
            description="Click or drag an image file to upload"
          />
        </div>
      </Card>

      <Card title="Product Images" className="profile-section-card">
        <div className="product-images-section">
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Upload product images to showcase your offerings
          </Text>
          <div className="product-images-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Placeholder for product images - can be expanded later */}
            <div style={{ 
              border: '2px dashed #d9d9d9', 
              borderRadius: '8px', 
              padding: '20px', 
              textAlign: 'center',
              backgroundColor: '#fafafa'
            }}>
              <PictureOutlined style={{ fontSize: '32px', color: '#d9d9d9' }} />
              <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                Product Images
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Coming Soon
              </Text>
            </div>
          </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Text type="secondary">
                    {vendorData.category || vendorData.vendorType} • {vendorData.address || vendorData.cityState}
                  </Text>
                  <span 
                    className={`status-badge ${vendorData.status === 'active' ? 'active' : 'inactive'}`}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: vendorData.status === 'active' ? '#f6ffed' : '#fff2e8',
                      color: vendorData.status === 'active' ? '#52c41a' : '#fa8c16',
                      border: `1px solid ${vendorData.status === 'active' ? '#b7eb8f' : '#ffd591'}`
                    }}
                  >
                    {vendorData.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
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

      {/* Add/Edit Discount Modal */}
      <AddDiscountModal
        visible={isAddDiscountModalVisible}
        vendorId={parseInt(vendorId)}
        vendorName={vendorData?.vendorName}
        onCancel={() => {
          setIsAddDiscountModalVisible(false);
          setEditingDiscount(null);
        }}
        onSuccess={handleDiscountSuccess}
        editingDiscount={editingDiscount}
      />
    </div>
  );
};

export default VendorProfile;
