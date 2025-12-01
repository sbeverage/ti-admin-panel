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
      coworking: [
        'Shared Workspace', 'Private Office', 'Hot Desk', 'Meeting Rooms', 'Event Space',
        'Virtual Office', 'Dedicated Desk', 'Day Pass', 'Monthly Membership', 'Conference Room',
        'Phone Booth', 'Printing Services', 'High-Speed Internet', 'Kitchen Facilities', 'Parking'
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

  const loadVendorData = async (showLoading: boolean = true, logoUrlToPreserve?: string | null) => {
    if (showLoading) {
      setLoading(true);
    }
    
    // Create timeout promise that rejects after 3 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 3000);
    });

    const vendorIdNum = parseInt(vendorId);
    const timerName = `Vendor Profile API Call ${vendorIdNum}-${Date.now()}`;
    
    try {
      console.log('Loading vendor profile data...');
      console.time(timerName);
      
      // Load vendor data with timeout
      const vendorResponse = await Promise.race([
        vendorAPI.getVendor(vendorIdNum),
        timeoutPromise
      ]) as any;
      
      console.timeEnd(timerName);
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
        // Handle both JSON and plain text descriptions
        let formData: any = {};
        try {
          if (vendor.description) {
            // Try to parse as JSON first
            try {
              formData = JSON.parse(vendor.description);
              console.log('Parsed form data from description (JSON):', formData);
            } catch (jsonError) {
              // If JSON parsing fails, treat as plain text
              console.log('Description is plain text, not JSON:', vendor.description);
              formData = { description: vendor.description };
            }
          }
        } catch (error) {
          console.log('Could not parse form data from description:', error);
          // Fallback: use description as plain text
          if (vendor.description) {
            formData = { description: vendor.description };
          }
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
          // Images from vendor data - preserve uploaded logo_url if backend returns null/empty
          // CRITICAL: If logoUrlToPreserve is provided (after save), use it to prevent loss
          // Otherwise, use backend's logo_url value
          logo_url: logoUrlToPreserve !== undefined && logoUrlToPreserve !== null 
            ? logoUrlToPreserve 
            : (vendor.logo_url || null),
          // Form data parsed from description field
          tags: formData.tags || [],
          pricingTier: formData.pricingTier || 'Not Set',
          description: formData.description || 'No description provided',
          logo_file_name: formData.logo_file_name,
          product_images: formData.product_images || [],
          image_upload_status: formData.image_upload_status
        };

        console.log('Setting vendor data:', transformedData);
        // Store original vendor object for reference (especially for address structure, hours, social_links)
        (transformedData as any).originalVendor = vendor;
        setVendorData(transformedData);
        setFormData(transformedData);
        setSelectedCategory(transformedData.category || '');
        console.log('Vendor profile data loaded successfully');
        console.log('Original vendor object stored:', vendor);
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
      // End timer if it was started
      try {
        console.timeEnd(timerName);
      } catch {}
      console.error('Error loading vendor data:', error);
      console.error('Error details:', error);
      console.log('API failed, showing fallback vendor data');
      message.error('Failed to load vendor data.');
      setVendorData(null);
      setFormData(null);
      setSelectedCategory('');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };


  const handleEdit = () => {
    console.log('✏️ Edit button clicked - entering edit mode');
    console.log('✏️ Current vendorData:', vendorData);
    setIsEditing(true);
    setFormData({ ...vendorData });
    console.log('✏️ isEditing set to true, formData updated');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...vendorData });
  };

  const handleSave = async () => {
    console.log('💾 ========================================');
    console.log('💾 SAVE BUTTON CLICKED - Starting vendor update...');
    console.log('💾 Current formData:', JSON.stringify(formData, null, 2));
    console.log('💾 Current vendorData:', JSON.stringify(vendorData, null, 2));
    console.log('💾 ========================================');
    
    if (saving) {
      console.warn('💾 Already saving, ignoring duplicate save request');
      return;
    }
    
    setSaving(true);
    try {
      const vendorIdNum = parseInt(vendorId);
      console.log('💾 Parsed vendor ID:', vendorIdNum);
      
      // Get the original vendor data to preserve fields we're not updating
      const originalVendor = vendorData as any;
      const originalVendorFromAPI = originalVendor?.originalVendor;
      
      // Transform form data back to API format
      // Match the structure used when creating vendors (from InviteVendorModal)
      // Use original vendor data as fallback to ensure we always have values
      const apiData: any = {
        name: formData.companyName || formData.vendorName || originalVendor?.companyName || originalVendorFromAPI?.name || '',
        email: formData.primaryEmail || formData.email || originalVendor?.email || originalVendorFromAPI?.email || '',
        phone: formData.phoneNumber || formData.contactNumber || originalVendor?.phoneNumber || originalVendorFromAPI?.phone || 'NA',
        website: formData.websiteLink || originalVendor?.websiteLink || originalVendorFromAPI?.website || '',
        category: formData.category || originalVendor?.category || originalVendorFromAPI?.category || '',
      };
      
      console.log('💾 Constructed apiData:', apiData);
      
      // Preserve hours if available (work schedule)
      if (originalVendorFromAPI?.hours) {
        apiData.hours = originalVendorFromAPI.hours;
      } else if (originalVendor?.workSchedule) {
        apiData.hours = originalVendor.workSchedule;
      }
      
      // Preserve social_links if available
      if (originalVendorFromAPI?.social_links) {
        apiData.social_links = originalVendorFromAPI.social_links;
      }
      
      // Always include tags (even if empty array) - send directly to API
      const tagsToSave = formData.tags && Array.isArray(formData.tags) 
        ? formData.tags 
        : originalVendor?.tags && Array.isArray(originalVendor.tags)
        ? originalVendor.tags
        : [];
      apiData.tags = tagsToSave;
      console.log('🏷️ Tags to save:', tagsToSave);
      
      // Handle description field - it stores JSON with tags, pricingTier, and description text
      // Parse existing description to preserve other fields, then update with new values
      let descriptionData: any = {};
      try {
        // Try to parse existing description as JSON (from InviteVendorModal format)
        if (originalVendorFromAPI?.description) {
          try {
            descriptionData = JSON.parse(originalVendorFromAPI.description);
            console.log('📝 Parsed existing description JSON:', descriptionData);
          } catch {
            // If not JSON, treat as plain text
            descriptionData = { description: originalVendorFromAPI.description };
          }
        } else if (originalVendor?.description) {
          try {
            descriptionData = JSON.parse(originalVendor.description);
          } catch {
            descriptionData = { description: originalVendor.description };
          }
        }
      } catch (error) {
        console.log('Could not parse description, using as plain text');
        descriptionData = { description: formData.description || originalVendor?.description || 'No description provided' };
      }
      
      // Update description data with current form values
      descriptionData.tags = tagsToSave; // Include tags in description JSON too (for consistency)
      descriptionData.pricingTier = formData.pricingTier || originalVendor?.pricingTier || descriptionData.pricingTier || 'Not Set';
      descriptionData.description = formData.description || descriptionData.description || 'No description provided';
      
      // Preserve other fields from description JSON if they exist
      if (descriptionData.logo_file_name) {
        // Keep existing logo_file_name
      }
      if (descriptionData.product_images) {
        // Keep existing product_images
      }
      if (descriptionData.image_upload_status) {
        // Keep existing image_upload_status
      }
      
      // Stringify the description data to match InviteVendorModal format
      apiData.description = JSON.stringify(descriptionData);
      console.log('📝 Description JSON to save:', descriptionData);
      console.log('📝 Description string to save:', apiData.description);
      
      // Handle address - use original API address structure if available
      if (originalVendorFromAPI?.address && typeof originalVendorFromAPI.address === 'object') {
        // Use original address structure from API
        apiData.address = {
          street: originalVendorFromAPI.address.street || '',
          city: originalVendorFromAPI.address.city || '',
          state: originalVendorFromAPI.address.state || '',
          zipCode: originalVendorFromAPI.address.zipCode || '',
          latitude: originalVendorFromAPI.address.latitude || 0,
          longitude: originalVendorFromAPI.address.longitude || 0
        };
      } else if (originalVendor?.address && typeof originalVendor.address === 'object') {
        // Fallback to vendorData address if it's an object
        apiData.address = {
          street: originalVendor.address.street || '',
          city: originalVendor.address.city || '',
          state: originalVendor.address.state || '',
          zipCode: originalVendor.address.zipCode || '',
          latitude: originalVendor.address.latitude || 0,
          longitude: originalVendor.address.longitude || 0
        };
      } else {
        // Try to parse from formData if original not available
        const addressString = formData.address || '';
        const cityStateString = formData.cityState || '';
        
        // Parse address string (format: "street, city, state zip")
        let street = '';
        let city = '';
        let state = '';
        let zipCode = '';
        
        if (addressString) {
          const addressParts = addressString.split(',');
          street = addressParts[0]?.trim() || '';
          if (addressParts.length > 1) {
            city = addressParts[1]?.trim() || '';
          }
        }
        
        if (cityStateString) {
          const cityStateParts = cityStateString.split(',');
          city = cityStateParts[0]?.trim() || city;
          state = cityStateParts[1]?.trim() || '';
        }
        
        // Try to extract zipCode from address string
        const zipMatch = addressString.match(/\b\d{5}(-\d{4})?\b/);
        if (zipMatch) {
          zipCode = zipMatch[0];
        }
        
        apiData.address = {
          street: street || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          latitude: 0,
          longitude: 0
        };
      }
      
      // Include logo URL - send multiple field name variations for backend compatibility
      // CRITICAL: Prioritize formData.logo_url (what user just uploaded) over everything else
      // Backend might expect logoUrl (camelCase) which saves to logo_url column
      const logoUrl = formData.logo_url || formData.logoUrl || vendorData?.logo_url || originalVendorFromAPI?.logo_url;
      console.log('🖼️ Logo URL resolution:', {
        'formData.logo_url': formData.logo_url,
        'formData.logoUrl': formData.logoUrl,
        'vendorData?.logo_url': vendorData?.logo_url,
        'originalVendorFromAPI?.logo_url': originalVendorFromAPI?.logo_url,
        'final logoUrl': logoUrl
      });
      
      // Always send logo_url field if we have a value (even if empty string, to preserve existing)
      // Only skip if it's explicitly null (user removed it)
      if (logoUrl !== undefined && logoUrl !== null && logoUrl !== '') {
        // Send all field name variations for maximum compatibility
        apiData.logoUrl = logoUrl; // Backend expects camelCase
        apiData.logo_url = logoUrl; // Also send snake_case for compatibility
        apiData.logo = logoUrl; // Send plain 'logo' as well
        console.log('✅ logoUrl included in apiData:', logoUrl);
      } else if (logoUrl === null && formData.logo_url === null) {
        // User explicitly removed the logo - send null to clear it
        apiData.logoUrl = null;
        apiData.logo_url = null;
        apiData.logo = null;
        console.log('🗑️ Logo explicitly removed by user - sending null to clear');
      } else {
        // Logo URL is missing but wasn't explicitly removed - preserve existing
        console.warn('⚠️ Logo URL is missing but not explicitly removed - preserving existing logo_url');
        const existingLogoUrl = originalVendorFromAPI?.logo_url || vendorData?.logo_url;
        if (existingLogoUrl) {
          apiData.logoUrl = existingLogoUrl;
          apiData.logo_url = existingLogoUrl;
          apiData.logo = existingLogoUrl;
          console.log('✅ Preserving existing logo_url:', existingLogoUrl);
        }
      }
      
      // Ensure address is always a valid object (backend requires it)
      if (!apiData.address || typeof apiData.address !== 'object') {
        apiData.address = {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          latitude: 0,
          longitude: 0
        };
      }
      
      // Ensure required fields are not empty - use original vendor data as fallback
      if (!apiData.name || apiData.name.trim() === '') {
        // Try to get from original vendor
        const fallbackName = originalVendorFromAPI?.name || originalVendor?.companyName || originalVendor?.vendorName;
        if (fallbackName) {
          apiData.name = fallbackName;
          console.log('⚠️ Using fallback name from original vendor:', fallbackName);
        } else {
          message.error('Company name is required');
          setSaving(false);
          return;
        }
      }
      
      if (!apiData.email || apiData.email.trim() === '') {
        // Try to get from original vendor
        const fallbackEmail = originalVendorFromAPI?.email || originalVendor?.email || originalVendor?.primaryEmail;
        if (fallbackEmail) {
          apiData.email = fallbackEmail;
          console.log('⚠️ Using fallback email from original vendor:', fallbackEmail);
        } else {
          message.error('Email is required');
          setSaving(false);
          return;
        }
      }
      
      console.log('💾 Updating vendor with data:', JSON.stringify(apiData, null, 2));
      console.log('💾 Vendor ID:', vendorIdNum);
      console.log('💾 About to call vendorAPI.updateVendor...');
      
      try {
        const result = await vendorAPI.updateVendor(vendorIdNum, apiData);
        console.log('💾 Vendor update result received:', result);
        console.log('💾 Result success:', result.success);
        console.log('💾 Result data:', result.data);
        console.log('💾 Result error:', result.error);
        console.log('💾 Full result object:', JSON.stringify(result, null, 2));
        
        // Check for success - be explicit about what constitutes success
        const isSuccess = result.success === true || 
                         (result.success === undefined && result.data && !result.error);
        
        if (isSuccess) {
          // CRITICAL: Prioritize formData.logo_url over API response since backend might return null
          // even though we sent it (backend might not be saving it properly, but we want to preserve it in UI)
          const savedLogoUrl = formData.logo_url || (result.data as any)?.logo_url || vendorData?.logo_url;
          const backendReturnedLogoUrl = (result.data as any)?.logo_url;
          
          // WORKAROUND: If we sent a logo_url but backend returned null, make a separate API call to update it
          if (savedLogoUrl && savedLogoUrl !== '' && !backendReturnedLogoUrl) {
            console.warn('⚠️ Backend did not save logo_url, attempting separate update...');
            try {
              const logoUpdateResult = await vendorAPI.updateVendorLogoUrl(vendorIdNum, savedLogoUrl);
              if (logoUpdateResult.success) {
                console.log('✅ Logo URL updated successfully via separate API call');
              } else {
                console.error('❌ Failed to update logo URL separately:', logoUpdateResult.error);
                // Continue anyway - logo is preserved in UI
              }
            } catch (logoError) {
              console.error('❌ Error updating logo URL separately:', logoError);
              // Continue anyway - logo is preserved in UI
            }
          }
          
          // Update local state with the response data if available
          if (result.data) {
            // Convert API response to VendorData format - only include VendorData properties
            const apiResponse = result.data as any;
            const updatedData: Partial<VendorData> = {
              id: String(apiResponse.id || vendorIdNum),
              vendorName: apiResponse.name || formData.vendorName || vendorData?.vendorName,
              companyName: apiResponse.name || formData.companyName || vendorData?.companyName,
              email: apiResponse.email || formData.email || vendorData?.email,
              primaryEmail: apiResponse.email || formData.primaryEmail || vendorData?.primaryEmail,
              phoneNumber: apiResponse.phone || formData.phoneNumber || vendorData?.phoneNumber,
              contactNumber: apiResponse.phone || formData.contactNumber || vendorData?.contactNumber,
              websiteLink: apiResponse.website || formData.websiteLink || vendorData?.websiteLink,
              category: apiResponse.category || formData.category || vendorData?.category,
              // CRITICAL: Use formData logo_url first (what user uploaded), then API response, then fallback
              logo_url: savedLogoUrl,
              // Preserve other VendorData fields
              contactName: formData.contactName || vendorData?.contactName,
              bankAccount: vendorData?.bankAccount,
              revenue: vendorData?.revenue,
              dateOfJoin: vendorData?.dateOfJoin,
              cityState: vendorData?.cityState,
              vendorType: vendorData?.vendorType,
              customers: vendorData?.customers,
              active: vendorData?.active,
              enabled: vendorData?.enabled,
              status: vendorData?.status,
              discounts: vendorData?.discounts,
              workSchedule: apiResponse.hours || vendorData?.workSchedule,
              tags: formData.tags || vendorData?.tags,
              description: apiResponse.description || formData.description || vendorData?.description
            };
            console.log('💾 Updated data with logo_url:', savedLogoUrl);
            setVendorData((prev: VendorData | null) => prev ? { ...prev, ...updatedData } as VendorData : null);
            setFormData((prev: any) => ({ ...prev, ...updatedData }));
          } else {
            // If no response data, use formData but ensure logo_url is preserved
            const finalFormData = { ...formData, logo_url: savedLogoUrl };
            setVendorData(finalFormData);
            setFormData(finalFormData);
          }
          setIsEditing(false);
          
          // Reload vendor data to get the latest from API (including logo_url)
          // CRITICAL: Preserve logo_url during reload in case backend returns null
          // Don't show loading spinner during reload to avoid window appearing to close/reopen
          console.log('🔄 Reloading vendor data after successful update...');
          console.log('🔄 Preserving logo_url during reload:', savedLogoUrl);
          try {
            await loadVendorData(false, savedLogoUrl); // Pass logoUrlToPreserve to prevent loss
          } catch (reloadError) {
            console.error('Error reloading vendor data:', reloadError);
            // Don't fail the save if reload fails
          }
          
          // Call onUpdate to refresh the parent list
          if (onUpdate) {
            onUpdate({ 
              success: true, 
              vendorId: vendorIdNum
            });
          }
          
          message.success('Vendor updated successfully!');
        } else {
          const errorMsg = result.error || result.message || 'Failed to update vendor. Please try again.';
          console.error('❌ Vendor update failed:', errorMsg);
          console.error('❌ Full error response:', result);
          console.error('❌ Request payload was:', JSON.stringify(apiData, null, 2));
          
          // Show more detailed error message
          let displayError = errorMsg;
          if (errorMsg.includes('400') || errorMsg.includes('Bad Request')) {
            displayError = 'Invalid data. Please check all fields and try again.';
          } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
            displayError = 'Authentication failed. Please refresh and try again.';
          } else if (errorMsg.includes('404') || errorMsg.includes('Not Found')) {
            displayError = 'Vendor not found. Please refresh the page.';
          } else if (errorMsg.includes('500') || errorMsg.includes('Internal Server Error')) {
            displayError = 'Server error. Please try again later.';
          }
          
          message.error(displayError);
        }
      } catch (apiError: any) {
        console.error('❌ API call exception:', apiError);
        console.error('❌ Error details:', {
          message: apiError.message,
          stack: apiError.stack
        });
        message.error(apiError.message || 'Failed to update vendor. Please check console for details.');
      }
    } catch (error: any) {
      console.error('Error updating vendor:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      const errorMessage = error.message || error.response?.data?.error || 'Failed to update vendor. Please try again.';
      message.error(errorMessage);
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
                  console.log('Selected category:', value);
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
                onDropdownVisibleChange={(open) => {
                  if (open) {
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
                      { value: 'coworking', label: 'Coworking' },
                      { value: 'other', label: 'Other' }
                    ];
                    console.log('Category options:', categoryOptions);
                    console.log('Looking for coworking:', categoryOptions.find(opt => opt.value === 'coworking'));
                  }
                }}
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
                  { value: 'coworking', label: 'Coworking' },
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
          {isEditing ? (
            <ImageUpload
              currentImageUrl={formData?.logo_url || vendorData?.logo_url}
              onImageChange={(url) => {
                console.log('🖼️ Logo URL changed:', url);
                const logoUrl = url || '';
                // Update formData immediately so it shows in the UI and gets saved
                // CRITICAL: This is what gets sent to the backend when Save is clicked
                setFormData((prev: any) => {
                  const updated = { ...prev, logo_url: logoUrl };
                  console.log('🖼️ Updated formData with logo_url:', logoUrl);
                  console.log('🖼️ formData after update:', updated);
                  return updated;
                });
                // Also update vendorData for immediate display
                setVendorData((prev: VendorData | null) => prev ? { ...prev, logo_url: logoUrl } : null);
                console.log('🖼️ Updated vendorData and formData with logo URL:', logoUrl);
                // Note: User must click Save button to persist to database
              }}
              title="Upload Vendor Logo"
              description="Click or drag an image file to upload"
              bucketName="vendor-logos"
            />
          ) : (
            vendorData?.logo_url ? (
              <div>
                <Image
                  src={vendorData.logo_url}
                  alt="Vendor logo"
                  style={{ 
                    maxWidth: 200, 
                    maxHeight: 200,
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9'
                  }}
                />
                <div style={{ marginTop: '12px' }}>
                  <Text type="secondary">Click "Edit Profile" to change the logo</Text>
                </div>
              </div>
            ) : (
              <div style={{ 
                border: '2px dashed #d9d9d9', 
                borderRadius: '8px', 
                padding: '40px', 
                textAlign: 'center',
                backgroundColor: '#fafafa'
              }}>
                <PictureOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '12px' }} />
                <Text type="secondary" style={{ display: 'block' }}>No logo uploaded</Text>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                  Click "Edit Profile" to upload a logo
                </Text>
              </div>
            )
          )}
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
              <Avatar 
                size={64} 
                src={vendorData?.logo_url}
                style={{ 
                  backgroundColor: vendorData?.logo_url ? 'transparent' : '#DB8633',
                  border: vendorData?.logo_url ? '2px solid #DB8633' : 'none'
                }}
              >
                {!vendorData?.logo_url && (vendorData.companyName || vendorData.vendorName).charAt(0)}
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
            {(() => {
              console.log('🔍 Rendering header actions, isEditing:', isEditing, 'saving:', saving);
              return isEditing ? (
                <Space>
                  <Button 
                    onClick={(e) => {
                      console.log('❌ Cancel button clicked');
                      handleCancel();
                    }} 
                    icon={<CloseOutlined />}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="button"
                    onClick={(e) => {
                      console.log('💾💾💾 SAVE BUTTON CLICKED - EVENT FIRED 💾💾💾');
                      console.log('💾 Button event:', e);
                      console.log('💾 isEditing:', isEditing);
                      console.log('💾 saving:', saving);
                      console.log('💾 vendorData:', vendorData);
                      console.log('💾 formData:', formData);
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent?.stopImmediatePropagation();
                      try {
                        console.log('💾 About to call handleSave...');
                        handleSave();
                        console.log('💾 handleSave called (async, may not be complete)');
                      } catch (error) {
                        console.error('❌ Error calling handleSave:', error);
                        message.error('Failed to save. Please check console for details.');
                      }
                    }}
                    icon={<SaveOutlined />}
                    loading={saving}
                    disabled={saving}
                    style={{ 
                      pointerEvents: saving ? 'none' : 'auto',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      zIndex: 9999
                    }}
                  >
                    Save Changes
                  </Button>
                </Space>
              ) : (
                <Button
                  type="primary"
                  onClick={(e) => {
                    console.log('✏️ Edit Profile button clicked');
                    handleEdit();
                  }}
                  icon={<EditOutlined />}
                >
                  Edit Profile
                </Button>
              );
            })()}
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
