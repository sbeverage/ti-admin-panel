// API Configuration - Updated with CORRECT backend URL
const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'development' 
    ? '/api/admin'  // Use proxy in development
    : 'http://thrive-backend-fixed.eba-fxvg5pyf.us-east-1.elasticbeanstalk.com/api/admin',  // CORRECT backend URL
  headers: {
    'X-Admin-Secret': 'thrive-admin-super-secret-2024',  // Updated admin secret
    'Content-Type': 'application/json'
  }
};

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
  description: string;
  discount_type: 'percentage' | 'fixed' | 'bogo';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
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
      
      const data = await response.json();
      
      // The backend returns {vendors: [...], pagination: {...}}
      // Transform to the format the frontend expects
      return {
        success: true,
        data: data.vendors,
        pagination: data.pagination
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

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/vendors`, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify(vendorData)
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
      console.error('Vendor creation error:', error);
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
  getDiscountsByVendor: async (vendorId: number): Promise<ApiResponse<Discount[]>> => {
    // Create a timeout promise that rejects after 3 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 3000);
    });

    try {
      const response = await Promise.race([
        fetch(`${API_CONFIG.baseURL}/vendors/${vendorId}/discounts`, {
          headers: API_CONFIG.headers
        }),
        timeoutPromise
      ]) as Response;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.log('API call failed for discounts:', error);
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
  createDiscount: async (discountData: Partial<Discount>): Promise<ApiResponse<Discount>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/discounts`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(discountData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
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
      throw new Error(`HTTP error! status: ${response.status}`);
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
  }
};

// Beneficiary API functions (for future use)
export const beneficiaryAPI = {
  // Get all beneficiaries
  getBeneficiaries: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/beneficiaries?page=${page}&limit=${limit}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Create new beneficiary
  createBeneficiary: async (beneficiaryData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/beneficiaries`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(beneficiaryData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Update beneficiary
  updateBeneficiary: async (id: number, beneficiaryData: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/beneficiaries/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(beneficiaryData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete beneficiary
  deleteBeneficiary: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/beneficiaries/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};
