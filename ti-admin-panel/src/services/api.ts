// API Configuration - Use HTTP since backend doesn't support HTTPS
const API_CONFIG = {
  baseURL: 'http://thrive-backend-final.eba-fxvg5pyf.us-east-1.elasticbeanstalk.com/api/admin',
  headers: {
    'X-Admin-Secret': 'test-key',
    'Content-Type': 'application/json'
  }
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
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Vendor API functions
export const vendorAPI = {
  // Get all vendors
  getVendors: async (page = 1, limit = 20): Promise<PaginatedResponse<Vendor>> => {
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
      
      return response.json();
    } catch (error) {
      console.log('API call failed:', error);
      throw error;
    }
  },

  // Get single vendor by ID
  getVendor: async (id: number): Promise<ApiResponse<Vendor>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/vendors/${id}`, {
      headers: API_CONFIG.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Create new vendor
  createVendor: async (vendorData: Partial<Vendor>): Promise<ApiResponse<Vendor>> => {
    const response = await fetch(`${API_CONFIG.baseURL}/vendors`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(vendorData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
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
