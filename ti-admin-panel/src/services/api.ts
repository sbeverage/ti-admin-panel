// API Configuration - Supabase Edge Function (Migrated from AWS)
// Now using Supabase Edge Functions instead of AWS Elastic Beanstalk
const getBaseURL = () => {
  // Supabase Edge Function URL (always use this - backend migrated to Supabase)
  const SUPABASE_EDGE_FUNCTION_URL = 'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin';
  
  // Always use Supabase URL (ignore any environment variable overrides)
  console.log('🔒 Using Supabase Edge Function URL:', SUPABASE_EDGE_FUNCTION_URL);
  return SUPABASE_EDGE_FUNCTION_URL;
};

const API_CONFIG = {
  baseURL: getBaseURL(),
  headers: {
    'X-Admin-Secret': '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e',
    'Content-Type': 'application/json',
    // Supabase Edge Functions require apikey header
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A'
  }
};

// Log configuration for debugging
console.log('🚀 API Config loaded:');
console.log('   - Environment:', process.env.NODE_ENV);
console.log('   - Base URL:', API_CONFIG.baseURL);
console.log('   - HTTPS Enforced: ✅');

// Backend is fully operational - disable mock data
const USE_MOCK_DATA = false; // Using real backend now!

// Mock data for development when backend is down
const mockVendors: Vendor[] = [
  {
    id: 1,
    name: "Sample Restaurant",
    description: "A great local restaurant",
    category: "restaurant",
    website: "https://example.com",
    phone: "555-0123",
    email: "contact@example.com",
    social_links: { 
      facebook: "https://facebook.com/example",
      instagram: "https://instagram.com/example",
      twitter: "https://twitter.com/example"
    },
    address: {
      street: "123 Main St",
      city: "Sample City",
      state: "CA",
      zipCode: "12345",
      latitude: 37.7749,
      longitude: -122.4194
    },
    hours: {
      monday: "9:00 AM - 9:00 PM",
      tuesday: "9:00 AM - 9:00 PM",
      wednesday: "9:00 AM - 9:00 PM",
      thursday: "9:00 AM - 9:00 PM",
      friday: "9:00 AM - 10:00 PM",
      saturday: "10:00 AM - 10:00 PM",
      sunday: "10:00 AM - 8:00 PM"
    },
    logo_url: "",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "Coffee Shop",
    description: "Local coffee shop",
    category: "coffee",
    website: "https://coffeeshop.com",
    phone: "555-0456",
    email: "info@coffeeshop.com",
    social_links: { 
      facebook: "https://facebook.com/coffeeshop",
      instagram: "https://instagram.com/coffeeshop"
    },
    address: {
      street: "456 Coffee St",
      city: "Coffee City",
      state: "CA",
      zipCode: "90210",
      latitude: 34.0522,
      longitude: -118.2437
    },
    hours: {
      monday: "6:00 AM - 6:00 PM",
      tuesday: "6:00 AM - 6:00 PM",
      wednesday: "6:00 AM - 6:00 PM",
      thursday: "6:00 AM - 6:00 PM",
      friday: "6:00 AM - 8:00 PM",
      saturday: "7:00 AM - 8:00 PM",
      sunday: "7:00 AM - 5:00 PM"
    },
    logo_url: "",
    status: "inactive",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z"
  }
];

const mockDonors = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "555-0123",
    total_donated: 500.00,
    last_donation: "2024-01-01T00:00:00Z",
    created_at: "2024-01-01T00:00:00Z"
  }
];

const mockDashboardStats = {
  totalVendors: 5,
  totalDonors: 25,
  totalBeneficiaries: 100,
  totalRevenue: 15000.00
};

// Types for API responses
export interface Vendor {
  id: number;
  name: string;
  description: string;
  category: string;
  website: string;
  phone: string;
  email: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  logo_url: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Discount {
  id: number;
  vendor_id: number;
  name: string;
  title?: string; // Display title for the discount
  description: string;
  discount_type: 'percentage' | 'fixed' | 'bogo' | 'free';
  discount_value: number;
  discount_code?: string; // POS/Discount code
  pos_code?: string; // Alternative field name for POS code
  usage_limit?: string; // Usage limit (e.g., '1', '5', 'unlimited')
  // NOTE: min_purchase and max_discount do NOT exist in the database schema
  // Do not include these fields when creating/updating discounts
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
  message?: string;
}

// Vendor API functions
export const vendorAPI = {
  // Get all vendors
  getVendors: async (page = 1, limit = 20): Promise<PaginatedResponse<Vendor>> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for vendors');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: mockVendors,
            pagination: {
              page,
              limit,
              total: mockVendors.length,
              pages: Math.ceil(mockVendors.length / limit)
            }
          });
        }, 500); // Simulate network delay
      });
    }

    // Create a timeout promise that rejects after 3 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 3000);
    });

    try {
      const response = await Promise.race([
        fetch(`${API_CONFIG.baseURL}/vendors?page=${page}&limit=${limit}`, {
          headers: API_CONFIG.headers
        }),
        timeoutPromise
      ]) as Response;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get response text first to see what we're actually receiving
      const responseText = await response.text();
      console.log('🔍 Raw response text:', responseText.substring(0, 500));
      
      // Parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Response text:', responseText);
        throw new Error('Failed to parse API response as JSON');
      }
      
      console.log('🔍 Parsed API response:', data);
      console.log('📋 data:', data);
      console.log('📋 data.data:', data?.data);
      console.log('📋 data.vendors:', data?.vendors);
      console.log('📋 data.success:', data?.success);
      console.log('📋 data.pagination:', data?.pagination);
      console.log('📋 typeof data.data:', typeof data?.data);
      console.log('📋 Array.isArray(data.data):', Array.isArray(data?.data));
      console.log('📋 data.data === undefined:', data?.data === undefined);
      console.log('📋 data.data === null:', data?.data === null);
      
      // The backend returns {success: true, data: [...], pagination: {...}} OR {vendors: [...], pagination: {...}}
      // Handle both formats for compatibility
      let vendorsArray = [];
      
      if (data && Array.isArray(data.data)) {
        vendorsArray = data.data;
        console.log('✅ Found vendors in data.data, length:', vendorsArray.length);
      } else if (data && Array.isArray(data.vendors)) {
        vendorsArray = data.vendors;
        console.log('✅ Found vendors in data.vendors, length:', vendorsArray.length);
      } else {
        console.warn('⚠️ No vendors array found!');
        console.warn('⚠️ data.data type:', typeof data?.data);
        console.warn('⚠️ data.data value:', data?.data);
        vendorsArray = [];
      }
      
      console.log('✅ Final vendors array:', vendorsArray);
      console.log('✅ Final vendors array length:', vendorsArray.length);
      
      // CRITICAL FIX: If vendorsArray is empty but data exists, try alternative extraction
      if (vendorsArray.length === 0 && data && data.data !== undefined) {
        console.warn('⚠️ Vendors array empty, trying alternative extraction...');
        console.warn('⚠️ data.data value:', data.data);
        console.warn('⚠️ data.data type:', typeof data.data);
        
        // Try to extract as array regardless of type
        if (data.data && typeof data.data === 'object') {
          // If it's an object but not an array, check if it has array-like properties
          if (Array.isArray(data.data)) {
            vendorsArray = data.data;
          } else if (data.data.length !== undefined) {
            // Might be an array-like object
            vendorsArray = Array.from(data.data);
          } else if (Object.keys(data.data).length > 0) {
            // Might be an object with vendors, convert to array
            vendorsArray = Object.values(data.data);
          }
        }
        console.log('✅ After alternative extraction, length:', vendorsArray.length);
      }
      
      return {
        success: data?.success !== false, // true unless explicitly false
        data: vendorsArray,
        pagination: data?.pagination || {}
      };
    } catch (error) {
      console.log('API call failed:', error);
      throw error;
    }
  },

  // Get single vendor by ID
  getVendor: async (id: number): Promise<ApiResponse<Vendor>> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for single vendor');
      return new Promise((resolve) => {
        setTimeout(() => {
          const vendor = mockVendors.find(v => v.id === id);
          if (vendor) {
            resolve({
              success: true,
              data: vendor
            });
          } else {
            resolve({
              success: false,
              error: 'Vendor not found'
            });
          }
        }, 300); // Simulate network delay
      });
    }

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/vendors/${id}`, {
        headers: API_CONFIG.headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const vendor = await response.json();
      
      // The backend returns the vendor object directly
      // Wrap it in the format the frontend expects
      return {
        success: true,
        data: vendor
      };
      
    } catch (error) {
      console.error('Vendor fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Create new vendor
  createVendor: async (vendorData: Partial<Vendor>): Promise<ApiResponse<Vendor>> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for vendor creation');
      return new Promise((resolve) => {
        setTimeout(() => {
          const newVendor: Vendor = {
            id: Date.now(), // Simple ID generation
            name: vendorData.name || '',
            description: vendorData.description || '',
            category: vendorData.category || '',
            website: vendorData.website || '',
            phone: vendorData.phone || '',
            email: vendorData.email || '',
            social_links: vendorData.social_links || {},
            address: vendorData.address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              latitude: 0,
              longitude: 0
            },
            hours: vendorData.hours || {
              monday: '',
              tuesday: '',
              wednesday: '',
              thursday: '',
              friday: '',
              saturday: '',
              sunday: ''
            },
            logo_url: vendorData.logo_url || "",
            status: vendorData.status || "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          mockVendors.push(newVendor);
          resolve({
            success: true,
            data: newVendor
          });
        }, 1000); // Simulate network delay
      });
    }

    const url = `${API_CONFIG.baseURL}/vendors`;
    console.log('🌐 API Request URL:', url);
    console.log('🔑 Headers:', API_CONFIG.headers);
    console.log('📦 Payload:', JSON.stringify(vendorData, null, 2));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify(vendorData),
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const vendor = await response.json();
      console.log('✅ Vendor created successfully:', vendor);
      
      // The backend returns the vendor object directly
      // Wrap it in the format the frontend expects
      return {
        success: true,
        data: vendor
      };
      
    } catch (error) {
      console.error('❌ Vendor creation error:', error);
      console.error('❌ Error type:', error instanceof TypeError ? 'TypeError' : error instanceof Error ? 'Error' : 'Unknown');
      console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Update vendor
  updateVendor: async (id: number, vendorData: Partial<Vendor>): Promise<ApiResponse<Vendor>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/vendors/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(vendorData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Update vendor status (active/inactive)
  updateVendorStatus: async (id: number, status: 'active' | 'inactive'): Promise<ApiResponse<Vendor>> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for vendor status update');
      return new Promise((resolve) => {
        setTimeout(() => {
          // Find and update the vendor in mock data
          const vendorIndex = mockVendors.findIndex(v => v.id === id);
          if (vendorIndex !== -1) {
            mockVendors[vendorIndex].status = status;
            mockVendors[vendorIndex].updated_at = new Date().toISOString();
            resolve({
              success: true,
              data: mockVendors[vendorIndex]
            });
          } else {
            resolve({
              success: false,
              error: 'Vendor not found'
            });
          }
        }, 500); // Simulate network delay
      });
    }

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/vendors/${id}/status`, {
        method: 'PATCH',
        headers: API_CONFIG.headers,
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Vendor status update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Delete vendor
  deleteVendor: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/vendors/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Upload vendor logo
  uploadVendorLogo: async (vendorId: number, file: File): Promise<ApiResponse<{url: string}>> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`${API_CONFIG.baseURL}/vendors/${vendorId}/logo`, {
      method: 'POST',
      headers: {
        'X-Admin-Secret': API_CONFIG.headers['X-Admin-Secret']
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Discount API functions
export const discountAPI = {
  // Get all discounts
  getDiscounts: async (page = 1, limit = 20): Promise<PaginatedResponse<Discount>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/discounts?page=${page}&limit=${limit}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get discounts by vendor ID
  // Falls back to fetching all discounts and filtering client-side if vendor-specific endpoint doesn't exist
  getDiscountsByVendor: async (vendorId: number): Promise<ApiResponse<Discount[]>> => {
    // Create a timeout promise that rejects after 3 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 3000);
    });

    try {
      // First, try the vendor-specific endpoint (if it exists)
      const response = await Promise.race([
        fetch(`${API_CONFIG.baseURL}/vendors/${vendorId}/discounts`, {
          headers: API_CONFIG.headers
        }),
        timeoutPromise
      ]) as Response;
      
      // Check if response is actually a Response object (not an error from timeout)
      if (!(response instanceof Response)) {
        throw response; // Re-throw timeout or other errors
      }
      
      if (response.ok) {
        // Vendor-specific endpoint exists and works
        return response.json();
      } else if (response.status === 404) {
        // Vendor-specific endpoint doesn't exist, fall back to fetching all discounts
        console.log(`🔄 Vendor-specific discounts endpoint not found (404), fetching all discounts and filtering by vendor_id=${vendorId}`);
        
        // Fetch all discounts (with a reasonable limit)
        const allDiscountsResponse = await Promise.race([
          fetch(`${API_CONFIG.baseURL}/discounts?page=1&limit=1000`, {
            headers: API_CONFIG.headers
          }),
          timeoutPromise
        ]) as Response;
        
        if (!(allDiscountsResponse instanceof Response)) {
          throw allDiscountsResponse; // Re-throw timeout or other errors
        }
        
        if (!allDiscountsResponse.ok) {
          throw new Error(`HTTP error! status: ${allDiscountsResponse.status}`);
        }
        
        const allDiscountsData = await allDiscountsResponse.json();
        console.log('📦 All discounts response:', allDiscountsData);
        
        // Handle different response structures
        let allDiscounts: Discount[] = [];
        if (Array.isArray(allDiscountsData)) {
          allDiscounts = allDiscountsData;
        } else if (allDiscountsData.data && Array.isArray(allDiscountsData.data)) {
          allDiscounts = allDiscountsData.data;
        } else if (allDiscountsData.discounts && Array.isArray(allDiscountsData.discounts)) {
          allDiscounts = allDiscountsData.discounts;
        }
        
        console.log(`📊 Found ${allDiscounts.length} total discounts`);
        console.log('🔍 Filtering for vendor_id:', vendorId, 'type:', typeof vendorId);
        
        // Filter discounts by vendor_id (handle both string and number types)
        const vendorDiscounts = allDiscounts.filter((discount: Discount) => {
          const discountVendorId = discount.vendor_id;
          const matches = discountVendorId === vendorId || 
                        discountVendorId === Number(vendorId) || 
                        Number(discountVendorId) === vendorId ||
                        String(discountVendorId) === String(vendorId);
          
          if (matches) {
            console.log('✅ Matched discount:', discount.id, 'vendor_id:', discountVendorId, 'type:', typeof discountVendorId);
          }
          
          return matches;
        });
        
        console.log(`✅ Found ${vendorDiscounts.length} discounts for vendor ${vendorId}`);
        
        return {
          success: true,
          data: vendorDiscounts
        };
      } else {
        // Other error - but don't throw, try fallback instead
        console.log(`⚠️ Vendor-specific endpoint returned ${response.status}, falling back to fetching all discounts`);
        
        // Fall back to fetching all discounts
        const allDiscountsResponse = await Promise.race([
          fetch(`${API_CONFIG.baseURL}/discounts?page=1&limit=1000`, {
            headers: API_CONFIG.headers
          }),
          timeoutPromise
        ]) as Response;
        
        if (!(allDiscountsResponse instanceof Response)) {
          throw allDiscountsResponse;
        }
        
        if (!allDiscountsResponse.ok) {
          throw new Error(`HTTP error! status: ${allDiscountsResponse.status}`);
        }
        
        const allDiscountsData = await allDiscountsResponse.json();
        
        // Handle different response structures
        let allDiscounts: Discount[] = [];
        if (Array.isArray(allDiscountsData)) {
          allDiscounts = allDiscountsData;
        } else if (allDiscountsData.data && Array.isArray(allDiscountsData.data)) {
          allDiscounts = allDiscountsData.data;
        } else if (allDiscountsData.discounts && Array.isArray(allDiscountsData.discounts)) {
          allDiscounts = allDiscountsData.discounts;
        }
        
        // Filter discounts by vendor_id
        const vendorDiscounts = allDiscounts.filter((discount: Discount) => {
          const discountVendorId = discount.vendor_id;
          return discountVendorId === vendorId || 
                 discountVendorId === Number(vendorId) || 
                 Number(discountVendorId) === vendorId ||
                 String(discountVendorId) === String(vendorId);
        });
        
        return {
          success: true,
          data: vendorDiscounts
        };
      }
    } catch (error) {
      // If it's a 404 or network error, try fallback
      if (error instanceof Error && error.message.includes('404')) {
        console.log('🔄 Caught 404 error, trying fallback to fetch all discounts');
        try {
          const allDiscountsResponse = await fetch(`${API_CONFIG.baseURL}/discounts?page=1&limit=1000`, {
            headers: API_CONFIG.headers
          });
          
          if (!allDiscountsResponse.ok) {
            throw new Error(`HTTP error! status: ${allDiscountsResponse.status}`);
          }
          
          const allDiscountsData = await allDiscountsResponse.json();
          
          let allDiscounts: Discount[] = [];
          if (Array.isArray(allDiscountsData)) {
            allDiscounts = allDiscountsData;
          } else if (allDiscountsData.data && Array.isArray(allDiscountsData.data)) {
            allDiscounts = allDiscountsData.data;
          } else if (allDiscountsData.discounts && Array.isArray(allDiscountsData.discounts)) {
            allDiscounts = allDiscountsData.discounts;
          }
          
          const vendorDiscounts = allDiscounts.filter((discount: Discount) => {
            const discountVendorId = discount.vendor_id;
            return discountVendorId === vendorId || 
                   discountVendorId === Number(vendorId) || 
                   Number(discountVendorId) === vendorId ||
                   String(discountVendorId) === String(vendorId);
          });
          
          return {
            success: true,
            data: vendorDiscounts
          };
        } catch (fallbackError) {
          console.log('❌ Fallback also failed:', fallbackError);
          throw error; // Throw original error
        }
      }
      
      console.log('❌ API call failed for discounts:', error);
      throw error;
    }
  },

  // Get single discount by ID
  getDiscount: async (id: number): Promise<ApiResponse<Discount>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/discounts/${id}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Create new discount
  // Note: Backend expects camelCase field names, not snake_case
  createDiscount: async (discountData: any): Promise<ApiResponse<any>> => {
    console.log('💰 Creating discount with data:', discountData);
    
    const response = await fetch(`${API_CONFIG.baseURL}/discounts`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(discountData)
    });
    
    console.log('💰 Discount API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('💰 Discount creation failed:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('💰 Discount created successfully:', result);
    
    return {
      success: true,
      data: result
    };
  },

  // Update discount
  updateDiscount: async (id: number, discountData: Partial<Discount>): Promise<ApiResponse<Discount>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/discounts/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(discountData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete discount
  deleteDiscount: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/discounts/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Upload discount image
  uploadDiscountImage: async (discountId: number, file: File): Promise<ApiResponse<{url: string}>> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_CONFIG.baseURL}/discounts/${discountId}/image`, {
      method: 'POST',
      headers: {
        'X-Admin-Secret': API_CONFIG.headers['X-Admin-Secret']
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Donor API functions
export const donorAPI = {
  // Get all donors
  getDonors: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/donors?page=${page}&limit=${limit}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Create new donor
  createDonor: async (donorData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/donors`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(donorData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Update donor
  updateDonor: async (id: number, donorData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/donors/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(donorData)
    });
    
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response isn't JSON, use status message
        errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  // Delete donor
  deleteDonor: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/donors/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get detailed donor information (for profile view)
  getDonorDetails: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/donors/${id}/details`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Resend invitation email to a donor
  resendInvitation: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/donors/${id}/resend-invitation`, {
        method: 'POST',
        headers: API_CONFIG.headers
      });
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
          errorDetails = errorData.details || errorData.error || null;
          
          // Parse nested error details if they exist (common with email services)
          if (errorData.details) {
            try {
              // Check if details is a JSON string that needs parsing
              let parsedDetails = errorData.details;
              if (typeof parsedDetails === 'string' && parsedDetails.startsWith('{')) {
                parsedDetails = JSON.parse(parsedDetails);
              }
              
              // Extract more specific error messages from nested errors
              if (parsedDetails && typeof parsedDetails === 'object') {
                if (parsedDetails.message) {
                  errorDetails = parsedDetails.message;
                } else if (parsedDetails.error) {
                  errorDetails = parsedDetails.error;
                } else if (parsedDetails.statusCode) {
                  // For Resend API errors
                  errorDetails = `Email service error (${parsedDetails.statusCode}): ${parsedDetails.message || errorData.details}`;
                }
              }
            } catch (parseError) {
              // If parsing fails, use the details as-is
              errorDetails = errorData.details;
            }
          }
          
          // Log error details for debugging
          console.error('❌ Resend invitation error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error,
            message: errorData.message,
            details: errorData.details,
            parsedDetails: errorDetails,
            fullResponse: errorData
          });
        } catch (parseError) {
          // If response isn't JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || `HTTP error! status: ${response.status} ${response.statusText}`;
            console.error('❌ Resend invitation error (non-JSON):', errorText);
          } catch {
            // If response isn't JSON, use status message
            errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
          }
        }
        
        // Throw error with message
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).details = errorDetails;
        throw error;
      }
      
      const data = await response.json();
      
      // Log success for debugging
      console.log('✅ Resend invitation success:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Resend invitation network error:', error);
      
      // If it's already our formatted error, re-throw it
      if (error.message && error.status) {
        throw error;
      }
      
      // Otherwise, create a formatted error
      throw new Error(error.message || 'Network error. Please check your connection and try again.');
    }
  }
};

// Event API functions
export const eventAPI = {
  // Get all events
  getEvents: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/events?page=${page}&limit=${limit}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Create new event
  createEvent: async (eventData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/events`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Update event
  updateEvent: async (id: number, eventData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/events/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete event
  deleteEvent: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/events/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Tenant API functions
export const tenantAPI = {
  // Get all tenants
  getTenants: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/tenants?page=${page}&limit=${limit}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Create new tenant
  createTenant: async (tenantData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/tenants`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(tenantData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Update tenant
  updateTenant: async (id: number, tenantData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/tenants/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(tenantData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete tenant
  deleteTenant: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/tenants/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Dashboard Analytics API functions
export const dashboardAPI = {
  // Get dashboard summary statistics
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/dashboard/stats`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get recent activity
  getRecentActivity: async (limit = 10): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/dashboard/activity?limit=${limit}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get chart data for analytics
  getChartData: async (type: 'donations' | 'users' | 'vendors' | 'beneficiaries', period = '30d'): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/dashboard/charts/${type}?period=${period}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Pending Approvals API functions
export const approvalsAPI = {
  // Get pending approvals
  getPendingApprovals: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/approvals?page=${page}&limit=${limit}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Approve item
  approveItem: async (id: number, type: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/approvals/${id}/approve`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ type })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Reject item
  rejectItem: async (id: number, type: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/approvals/${id}/reject`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ type, reason })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Analytics API functions
export const analyticsAPI = {
  // Get referral analytics
  getReferralAnalytics: async (period = '30d'): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/analytics/referrals?period=${period}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get geographic analytics
  getGeographicAnalytics: async (period = '30d'): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/analytics/geographic?period=${period}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get leaderboard data
  getLeaderboard: async (type: 'donors' | 'beneficiaries' | 'vendors' = 'donors', period = '30d'): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/analytics/leaderboard/${type}?period=${period}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get referral invitations
  getReferralInvitations: async (period = '30d', status?: string): Promise<ApiResponse<any>> => {
    const url = status 
      ? `${API_CONFIG.baseURL}/analytics/referrals/invitations?period=${period}&status=${status}`
      : `${API_CONFIG.baseURL}/analytics/referrals/invitations?period=${period}`;
    
    const response = await fetch(url, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Settings API functions
export const settingsAPI = {
  // Get system settings
  getSettings: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/settings`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Update system settings
  updateSettings: async (settingsData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/settings`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(settingsData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get team members
  getTeamMembers: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/settings/team`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Add team member
  addTeamMember: async (memberData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/settings/team`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(memberData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Update team member
  updateTeamMember: async (id: number, memberData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/settings/team/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(memberData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete team member
  deleteTeamMember: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/settings/team/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete user by email (permanently deletes user and all associated data)
  deleteUserByEmail: async (email: string): Promise<ApiResponse<any>> => {
    // Use the auth endpoint for deleting users by email
    // The base URL includes '/admin', so we need to replace it with just the base path
    const baseUrl = API_CONFIG.baseURL.replace('/functions/v1/api/admin', '/functions/v1/api');
    const response = await fetch(`${baseUrl}/auth/delete-user`, {
      method: 'DELETE',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Beneficiary/Charity API functions
// Uses /admin/charities endpoints (backend uses 'charities' table)
// One-Time Gifts API functions
export const oneTimeGiftsAPI = {
  // Get all one-time gifts with filters
  getOneTimeGifts: async (
    page = 1,
    limit = 20,
    filters?: {
      beneficiary_id?: string;
      status?: string;
      start_date?: string;
      end_date?: string;
      min_amount?: number;
      max_amount?: number;
      search?: string;
    }
  ): Promise<ApiResponse<any>> => {
    let url = `${API_CONFIG.baseURL}/one-time-gifts?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.beneficiary_id) url += `&beneficiary_id=${filters.beneficiary_id}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.start_date) url += `&start_date=${filters.start_date}`;
      if (filters.end_date) url += `&end_date=${filters.end_date}`;
      if (filters.min_amount) url += `&min_amount=${filters.min_amount}`;
      if (filters.max_amount) url += `&max_amount=${filters.max_amount}`;
      if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    }

    const response = await fetch(url, {
      headers: API_CONFIG.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get one-time gift by ID
  getOneTimeGift: async (id: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/one-time-gifts/${id}`, {
      headers: API_CONFIG.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get summary statistics
  getOneTimeGiftsStats: async (filters?: {
    beneficiary_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any>> => {
    let url = `${API_CONFIG.baseURL}/one-time-gifts/stats`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.beneficiary_id) params.append('beneficiary_id', filters.beneficiary_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (params.toString()) url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: API_CONFIG.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Refund one-time gift
  refundOneTimeGift: async (
    id: string,
    data: {
      amount?: number;
      reason?: string;
      admin_notes?: string;
    }
  ): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/one-time-gifts/${id}/refund`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Update admin notes
  updateAdminNotes: async (id: string, admin_notes: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/one-time-gifts/${id}/admin-notes`, {
      method: 'PATCH',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ admin_notes })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get beneficiary one-time gift stats
  getBeneficiaryOneTimeGiftStats: async (beneficiaryId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/beneficiaries/${beneficiaryId}/one-time-gifts/stats`, {
      headers: API_CONFIG.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get user one-time gift history (admin view)
  getUserOneTimeGiftHistory: async (userId: string, page = 1, limit = 20): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/users/${userId}/one-time-gifts?page=${page}&limit=${limit}`, {
      headers: API_CONFIG.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};

export const beneficiaryAPI = {
  // Get all beneficiaries/charities
  getBeneficiaries: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/charities?page=${page}&limit=${limit}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle different response structures
    // Backend might return {success: true, data: [...], pagination: {...}} or {charities: [...]}
    if (data.success && data.data) {
      return {
        success: true,
        data: Array.isArray(data.data) ? data.data : [],
        pagination: data.pagination || { page, limit, total: data.data?.length || 0, pages: 1 }
      };
    } else if (data.charities && Array.isArray(data.charities)) {
      return {
        success: true,
        data: data.charities,
        pagination: { page, limit, total: data.charities.length, pages: 1 }
      };
    } else if (Array.isArray(data)) {
      return {
        success: true,
        data: data,
        pagination: { page, limit, total: data.length, pages: 1 }
      };
    }
    
    return data;
  },

  // Get single beneficiary/charity by ID
  getBeneficiary: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/charities/${id}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle different response structures
    if (data.success && data.data) {
      return { success: true, data: data.data };
    } else if (data.id) {
      return { success: true, data: data };
    }
    
    return data;
  },

  // Create new beneficiary/charity
  createBeneficiary: async (beneficiaryData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/charities`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(beneficiaryData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  },

  // Update beneficiary/charity
  updateBeneficiary: async (id: number, beneficiaryData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/charities/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(beneficiaryData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  },

  // Delete beneficiary/charity (soft delete)
  deleteBeneficiary: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/charities/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  }
};
