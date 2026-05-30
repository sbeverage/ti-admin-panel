// API Configuration - Supabase Edge Function
// Gateway validates `apikey` + `Authorization` (anon JWT). Admin routes also require `X-Admin-Secret`
// matching Edge Function secret `ADMIN_SECRET_KEY` (set in Supabase Dashboard).

// The Supabase anon key is a public key — safe to include as a default fallback.
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.EtIyUJ3kFILYV6bAIETAk6RE-ra7sEDd14bDG7PDVfg';

const DEFAULT_ADMIN_BASE_URL =
  'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin';

// Built-in default — must match ADMIN_SECRET_KEY in the Supabase Edge Function dashboard.
// REACT_APP_ADMIN_SECRET in Vercel overrides this; delete the Vercel var to use this default.
// Value must be the raw secret with no quotes or extra whitespace.
const DEFAULT_ADMIN_SECRET =
  '2b7bea7907fd07a4161dda627f81e2ecccc52f4402b2cafbcd5e0f4735a14a25';

const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

/**
 * Team/settings endpoints live under /admin/... on the Edge function.
 * If REACT_APP_API_BASE_URL stops at …/functions/v1/api (no /admin), requests hit 404.
 */
function normalizeAdminBaseUrl(input: string): string {
  let raw = input.trim().replace(/\/+$/, '');
  raw = raw.replace(
    /\/settings\/team\/(?:login|reset-password|change-password)(?:\/)?$/i,
    ''
  );
  if (/\/functions\/v1\/api$/i.test(raw) && !/\/admin$/i.test(raw)) {
    raw = `${raw}/admin`;
  }
  return raw;
}

const getBaseURL = () =>
  normalizeAdminBaseUrl(process.env.REACT_APP_API_BASE_URL?.trim() || DEFAULT_ADMIN_BASE_URL);

/**
 * Dashboard copy/paste often wraps secrets in quotes or adds CR.
 * Edge Function compares exact bytes to ADMIN_SECRET_KEY.
 */
function normalizeEnvSecret(raw: string | undefined): string | undefined {
  if (raw == null) return undefined;
  let s = raw.trim().replace(/^\uFEFF/, '').replace(/\r/g, '');
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  // Strip accidental "REACT_APP_ADMIN_SECRET=" prefix if someone pasted the key=value pair
  const prefix = 'REACT_APP_ADMIN_SECRET=';
  if (s.startsWith(prefix)) {
    s = s.slice(prefix.length).trim();
  }
  return s.length > 0 ? s : undefined;
}

const getAdminHeaders = (): Record<string, string> => ({
  'X-Admin-Secret': normalizeEnvSecret(process.env.REACT_APP_ADMIN_SECRET) || DEFAULT_ADMIN_SECRET,
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
});

const API_CONFIG = {
  get baseURL() {
    return getBaseURL();
  },
  get headers() {
    return getAdminHeaders();
  },
};

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

const buildAdminUrl = (path: string) => {
  const base = normalizeBaseUrl(API_CONFIG.baseURL);
  return base.endsWith('/admin') ? `${base}${path}` : `${base}/admin${path}`;
};

const buildPublicUrl = (path: string) => {
  const base = normalizeBaseUrl(API_CONFIG.baseURL);
  return base.endsWith('/admin') ? `${base.replace(/\/admin$/, '')}${path}` : `${base}${path}`;
};

/** Map Edge / gateway errors to something operators can fix in Vercel env. */
function adminRequestErrorMessage(status: number, errorText: string): string {
  let parsed: { message?: string; error?: string; code?: number } = {};
  try {
    parsed = JSON.parse(errorText) as typeof parsed;
  } catch {
    return errorText?.trim() || `Request failed (${status})`;
  }
  const msg = String(parsed.message || parsed.error || errorText || `HTTP ${status}`);
  if (status === 404 && (/not found/i.test(msg) || /route not found/i.test(msg))) {
    return 'API URL not found (404). Set REACT_APP_API_BASE_URL to …/functions/v1/api/admin (or …/functions/v1/api — the app will append /admin). No trailing slash.';
  }
  if (status === 401) {
    if (/invalid jwt/i.test(msg) || (parsed.code === 401 && /jwt/i.test(msg))) {
      return 'Supabase blocked the request (invalid anon JWT). In Vercel, set REACT_APP_SUPABASE_ANON_KEY to the anon key from Supabase → Project Settings → API.';
    }
    if (/unauthorized admin/i.test(msg)) {
      return 'Admin auth failed. Set REACT_APP_ADMIN_SECRET equal to Supabase Edge secret ADMIN_SECRET_KEY and redeploy. Remove quotes/extra characters if you pasted the value.';
    }
  }
  return msg;
}

/** Fetch with AbortController-based timeout. Default: 15 seconds. */
const DEFAULT_TIMEOUT_MS = 15000;

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

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
  is_active?: boolean;
  active?: boolean;
  is_enabled?: boolean;
  enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Discount {
  id: number;
  vendor_id: number;
  name: string;
  title?: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'bogo' | 'free';
  discount_value: number;
  discount_code?: string;
  pos_code?: string;
  usage_limit?: string;
  // NOTE: min_purchase and max_discount do NOT exist in the database schema
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

export interface NotificationRecord {
  id: number;
  title: string;
  message?: string;
  level: 'info' | 'success' | 'warning' | 'error';
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
  created_at: string;
  read_at?: string | null;
}

export interface NotificationsResponse {
  success: boolean;
  data?: NotificationRecord[];
  unreadCount?: number;
  error?: string;
  message?: string;
}

export const notificationsAPI = {
  getNotifications: async (params?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<NotificationsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');

    const url = `${API_CONFIG.baseURL}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetchWithTimeout(url, { headers: API_CONFIG.headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  createNotification: async (payload: {
    title: string;
    message?: string;
    level?: 'info' | 'success' | 'warning' | 'error';
    entity_type?: string;
    entity_id?: string;
    metadata?: any;
  }): Promise<NotificationsResponse> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/notifications`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  markRead: async (ids: string[]): Promise<NotificationsResponse> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/notifications/read`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  markAllRead: async (): Promise<NotificationsResponse> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/notifications/read`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ all: true }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },
};

// Vendor API functions
export const vendorAPI = {
  getVendors: async (page = 1, limit = 20): Promise<PaginatedResponse<Vendor>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/vendors?page=${page}&limit=${limit}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error('Failed to parse API response as JSON');
    }

    // Handle both {success, data: [...]} and {vendors: [...]} response shapes
    let vendorsArray: Vendor[] = [];
    if (data && Array.isArray(data.data)) {
      vendorsArray = data.data;
    } else if (data && Array.isArray(data.vendors)) {
      vendorsArray = data.vendors;
    } else if (data && data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      // Object with array-like properties
      if (data.data.length !== undefined) {
        vendorsArray = Array.from(data.data);
      } else if (Object.keys(data.data).length > 0) {
        vendorsArray = Object.values(data.data) as Vendor[];
      }
    }

    return {
      success: data?.success !== false,
      data: vendorsArray,
      pagination: data?.pagination || { page, limit, total: vendorsArray.length, pages: 1 },
    };
  },

  getVendor: async (id: number): Promise<ApiResponse<Vendor>> => {
    try {
      const primaryUrl = buildAdminUrl(`/vendors/${id}`);
      let response = await fetchWithTimeout(primaryUrl, { headers: API_CONFIG.headers });

      if (!response.ok && response.status === 404) {
        const fallbackUrl = buildPublicUrl(`/vendors/${id}`);
        if (fallbackUrl !== primaryUrl) {
          response = await fetchWithTimeout(fallbackUrl, { headers: API_CONFIG.headers });
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const vendorResponse = await response.json();
      const resolvedVendor = vendorResponse?.data && vendorResponse?.success !== false
        ? vendorResponse.data
        : vendorResponse;

      if (resolvedVendor && resolvedVendor.id) {
        return { success: true, data: resolvedVendor };
      }

      return {
        success: false,
        error: vendorResponse?.error || vendorResponse?.message || 'Vendor not found',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  createVendor: async (vendorData: Partial<Vendor>): Promise<ApiResponse<Vendor>> => {
    try {
      const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/vendors`, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify(vendorData),
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const vendorResponse = await response.json();
      const resolvedVendor = vendorResponse?.data && vendorResponse?.success !== false
        ? vendorResponse.data
        : vendorResponse;

      if (resolvedVendor && resolvedVendor.id) {
        return { success: true, data: resolvedVendor };
      }

      return {
        success: false,
        error: vendorResponse?.error || vendorResponse?.message || 'Vendor creation failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  updateVendor: async (id: number, vendorData: Partial<Vendor>): Promise<ApiResponse<Vendor>> => {
    try {
      const primaryUrl = buildAdminUrl(`/vendors/${id}`);
      let response = await fetchWithTimeout(primaryUrl, {
        method: 'PUT',
        headers: API_CONFIG.headers,
        body: JSON.stringify(vendorData),
      });

      if (!response.ok && response.status === 404) {
        const fallbackUrl = buildPublicUrl(`/vendors/${id}`);
        if (fallbackUrl !== primaryUrl) {
          response = await fetchWithTimeout(fallbackUrl, {
            method: 'PUT',
            headers: API_CONFIG.headers,
            body: JSON.stringify(vendorData),
          });
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        return { success: false, error: errorMessage };
      }

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        return {
          success: false,
          error: `Invalid response from server: ${responseText.substring(0, 200)}`,
        };
      }

      if (result.success === false || result.error) {
        return { success: false, error: result.error || result.message || 'Update failed' };
      } else if (result.success === true) {
        return { success: true, data: result.data || result };
      } else if (result.id) {
        return { success: true, data: result };
      }
      // Assume success on 200
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update vendor' };
    }
  },

  updateVendorStatus: async (id: number, status: 'active' | 'inactive'): Promise<ApiResponse<Vendor>> => {
    return vendorAPI.updateVendor(id, { status });
  },

  deleteVendor: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/vendors/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  uploadVendorLogo: async (vendorId: number, file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/vendors/${vendorId}/logo`, {
      method: 'POST',
      headers: {
        'X-Admin-Secret': API_CONFIG.headers['X-Admin-Secret'],
        // Content-Type intentionally omitted — browser sets multipart boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  updateVendorLogoUrl: async (vendorId: number, logoUrl: string): Promise<ApiResponse<Vendor>> => {
    try {
      const payload = { logoUrl, logo_url: logoUrl, logo: logoUrl };
      const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: API_CONFIG.headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const putResponse = await fetchWithTimeout(`${API_CONFIG.baseURL}/vendors/${vendorId}`, {
          method: 'PUT',
          headers: API_CONFIG.headers,
          body: JSON.stringify(payload),
        });

        if (!putResponse.ok) {
          const errorText = await putResponse.text();
          throw new Error(`Failed to update logo URL: ${errorText}`);
        }

        const result = await putResponse.json();
        return { success: true, data: result };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update logo URL' };
    }
  },
};

// Discount API functions
export const discountAPI = {
  getDiscounts: async (page = 1, limit = 20): Promise<PaginatedResponse<Discount>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/discounts?page=${page}&limit=${limit}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getDiscountsByVendor: async (vendorId: number): Promise<ApiResponse<Discount[]>> => {
    const matchesVendorId = (discount: Discount) => {
      const id = discount.vendor_id;
      return (
        id === vendorId ||
        id === Number(vendorId) ||
        Number(id) === vendorId ||
        String(id) === String(vendorId)
      );
    };

    const fetchAllAndFilter = async (): Promise<ApiResponse<Discount[]>> => {
      const allResp = await fetchWithTimeout(
        `${API_CONFIG.baseURL}/discounts?page=1&limit=1000`,
        { headers: API_CONFIG.headers }
      );
      if (!allResp.ok) throw new Error(`HTTP error! status: ${allResp.status}`);
      const allData = await allResp.json();

      let allDiscounts: Discount[] = [];
      if (Array.isArray(allData)) allDiscounts = allData;
      else if (allData.data && Array.isArray(allData.data)) allDiscounts = allData.data;
      else if (allData.discounts && Array.isArray(allData.discounts)) allDiscounts = allData.discounts;

      return { success: true, data: allDiscounts.filter(matchesVendorId) };
    };

    try {
      const response = await fetchWithTimeout(
        `${API_CONFIG.baseURL}/vendors/${vendorId}/discounts`,
        { headers: API_CONFIG.headers }
      );

      if (response.ok) {
        return response.json();
      } else if (response.status === 404) {
        return fetchAllAndFilter();
      } else {
        return fetchAllAndFilter();
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return fetchAllAndFilter();
      }
      throw error;
    }
  },

  getDiscount: async (id: number): Promise<ApiResponse<Discount>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/discounts/${id}`, {
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  createDiscount: async (discountData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/discounts`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(discountData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  },

  updateDiscount: async (id: number, discountData: Partial<Discount>): Promise<ApiResponse<Discount>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/discounts/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(discountData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  deleteDiscount: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/discounts/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  uploadDiscountImage: async (discountId: number, file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/discounts/${discountId}/image`, {
      method: 'POST',
      headers: {
        'X-Admin-Secret': API_CONFIG.headers['X-Admin-Secret'],
        // Content-Type intentionally omitted — browser sets multipart boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Donor API functions
export const donorAPI = {
  getDonors: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/donors?page=${page}&limit=${limit}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  createDonor: async (donorData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/donors`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(donorData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const donorResponse = await response.json();
    const resolvedDonor = donorResponse?.data && donorResponse?.success !== false
      ? donorResponse.data
      : donorResponse;

    if (resolvedDonor && (resolvedDonor.id || resolvedDonor.user_id)) {
      return { success: true, data: resolvedDonor };
    }

    if (donorResponse?.success === false || donorResponse?.error) {
      return {
        success: false,
        error: donorResponse?.error || donorResponse?.message || 'Failed to create donor',
      };
    }

    return { success: true, data: donorResponse };
  },

  updateDonor: async (id: number, donorData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/donors/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(donorData),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  deleteDonor: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/donors/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getDonorDetails: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/donors/${id}/details`, {
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  resendInvitation: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/donors/${id}/resend-invitation`, {
        method: 'POST',
        headers: API_CONFIG.headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
          errorDetails = errorData.details || errorData.error || null;

          if (errorData.details) {
            try {
              let parsedDetails = errorData.details;
              if (typeof parsedDetails === 'string' && parsedDetails.startsWith('{')) {
                parsedDetails = JSON.parse(parsedDetails);
              }
              if (parsedDetails && typeof parsedDetails === 'object') {
                if (parsedDetails.message) errorDetails = parsedDetails.message;
                else if (parsedDetails.error) errorDetails = parsedDetails.error;
                else if (parsedDetails.statusCode) {
                  errorDetails = `Email service error (${parsedDetails.statusCode}): ${parsedDetails.message || errorData.details}`;
                }
              }
            } catch {
              errorDetails = errorData.details;
            }
          }
        } catch {
          try {
            const errorText = await response.text();
            errorMessage = errorText || `HTTP error! status: ${response.status} ${response.statusText}`;
          } catch {
            errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
          }
        }

        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).details = errorDetails;
        throw error;
      }

      return response.json();
    } catch (error: any) {
      if (error.message && error.status) throw error;
      throw new Error(error.message || 'Network error. Please check your connection and try again.');
    }
  },
};

// Event API functions
export const eventAPI = {
  getEvents: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/events?page=${page}&limit=${limit}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  createEvent: async (eventData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/events`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  updateEvent: async (id: number, eventData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/events/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  deleteEvent: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/events/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Tenant API functions
export const tenantAPI = {
  getTenants: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/tenants?page=${page}&limit=${limit}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  createTenant: async (tenantData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/tenants`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(tenantData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  updateTenant: async (id: number, tenantData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/tenants/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(tenantData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  deleteTenant: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/tenants/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Dashboard Analytics API functions
export const dashboardAPI = {
  getDashboardStats: async (period?: string): Promise<ApiResponse<any>> => {
    const query = period ? `?period=${encodeURIComponent(period)}` : '';
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/dashboard/stats${query}`, {
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getDonorOverview: async (): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/donor-overview`,
      { headers: API_CONFIG.headers },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getDonorCharts: async (): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/donor-charts`,
      { headers: API_CONFIG.headers },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getDonationOverview: async (): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/donation-overview`,
      { headers: API_CONFIG.headers },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getSavingsOverview: async (): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/savings-overview`,
      { headers: API_CONFIG.headers },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getRecentActivity: async (limit = 10): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/dashboard/activity?limit=${limit}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getChartData: async (
    type: 'donations' | 'users' | 'vendors' | 'beneficiaries',
    period = '30d'
  ): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/dashboard/charts/${type}?period=${period}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Pending Approvals API functions
export const approvalsAPI = {
  getPendingApprovals: async (page = 1, limit = 20): Promise<PaginatedResponse<any>> => {
    try {
      const response = await fetchWithTimeout(
        `${API_CONFIG.baseURL}/approvals?page=${page}&limit=${limit}`,
        { headers: API_CONFIG.headers }
      );

      if (!response.ok) {
        return { success: true, data: [], pagination: { page, limit, total: 0, pages: 0 } };
      }

      return response.json();
    } catch {
      return { success: true, data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
  },

  approveItem: async (id: number, type: string): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/approvals/${id}/approve`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  rejectItem: async (id: number, type: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/approvals/${id}/reject`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ type, reason }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Analytics API functions
export const analyticsAPI = {
  getReferralAnalytics: async (period = '30d'): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/referrals?period=${period}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getGeographicAnalytics: async (period = '30d'): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/geographic?period=${period}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getLeaderboard: async (
    type: 'donors' | 'beneficiaries' | 'vendors' = 'donors',
    period = '30d'
  ): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/leaderboard/${type}?period=${period}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getReferralInvitations: async (period = '30d', status?: string): Promise<ApiResponse<any>> => {
    const url = status
      ? `${API_CONFIG.baseURL}/analytics/referrals/invitations?period=${period}&status=${status}`
      : `${API_CONFIG.baseURL}/analytics/referrals/invitations?period=${period}`;

    const response = await fetchWithTimeout(url, { headers: API_CONFIG.headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  resendReferralInvitation: async (invitationId: number): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/referrals/invitations/resend`,
      {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({ invitationIds: [invitationId] }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  resendReferralInvitations: async (invitationIds: number[]): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/referrals/invitations/resend`,
      {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({ invitationIds }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  sendReferralInvitationsByEmail: async (emails: string[]): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/analytics/referrals/invitations/send`,
      {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({ emails }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getAllDonorsWithReferrals: async (): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/admin/users/referrals`, {
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getUserReferralDetails: async (userId: number): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/admin/users/${userId}/referrals`, {
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  grantCredit: async (
    userId: number,
    amount: number,
    description: string,
    expiresInDays?: number
  ): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/admin/users/${userId}/credits`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({
        amount,
        description,
        expiresInDays: expiresInDays || 90,
        source: 'manual',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  extendCreditExpiration: async (
    creditId: number,
    newExpirationDate: string
  ): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/admin/credits/${creditId}/extend`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ expiresAt: newExpirationDate }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Settings API functions
export const settingsAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/settings`, {
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  updateSettings: async (settingsData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/settings`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(settingsData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getTeamMembers: async (): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/settings/team`, {
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  addTeamMember: async (memberData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/settings/team`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  updateTeamMember: async (id: number, memberData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/settings/team/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  changeTeamMemberPassword: async (payload: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/settings/team/change-password`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  loginTeamMember: async (payload: { email: string; password: string }): Promise<ApiResponse<any>> => {
    const loginUrl = `${API_CONFIG.baseURL}/settings/team/login`;
    let response: Response;
    try {
      response = await fetchWithTimeout(loginUrl, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify(payload),
      });
    } catch (e: unknown) {
      const netMsg = e instanceof Error ? e.message : 'Network error';
      throw new Error(
        `${netMsg} — Check your connection, ad blockers, and that the API URL is reachable (CORS).`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(adminRequestErrorMessage(response.status, errorText));
    }

    let data: ApiResponse<any>;
    try {
      data = await response.json();
    } catch {
      throw new Error('Login response was not valid JSON. Check REACT_APP_API_BASE_URL and network/proxy.');
    }
    if (data && data.success === false) {
      throw new Error(data.error || data.message || 'Login failed');
    }
    return data;
  },

  resetTeamMemberPassword: async (payload: { email: string }): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/settings/team/reset-password`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(adminRequestErrorMessage(response.status, errorText));
    }

    return response.json();
  },

  deleteTeamMember: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/settings/team/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(adminRequestErrorMessage(response.status, errorText));
    }

    return response.json();
  },

  deleteUserByEmail: async (email: string): Promise<ApiResponse<any>> => {
    const baseUrl = API_CONFIG.baseURL.replace('/functions/v1/api/admin', '/functions/v1/api');
    const response = await fetchWithTimeout(`${baseUrl}/auth/delete-user`, {
      method: 'DELETE',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Beneficiary/Charity API functions
// Uses /admin/charities endpoints (backend uses 'charities' table)

// One-Time Gifts API functions
export const oneTimeGiftsAPI = {
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

    const response = await fetchWithTimeout(url, { headers: API_CONFIG.headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getOneTimeGift: async (id: string): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/one-time-gifts/${id}`, {
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

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

    const response = await fetchWithTimeout(url, { headers: API_CONFIG.headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  refundOneTimeGift: async (
    id: string,
    data: { amount?: number; reason?: string; admin_notes?: string }
  ): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/one-time-gifts/${id}/refund`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  updateAdminNotes: async (id: string, admin_notes: string): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/one-time-gifts/${id}/admin-notes`, {
      method: 'PATCH',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ admin_notes }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getBeneficiaryOneTimeGiftStats: async (beneficiaryId: string): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/beneficiaries/${beneficiaryId}/one-time-gifts/stats`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getUserOneTimeGiftHistory: async (userId: string, page = 1, limit = 20): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/users/${userId}/one-time-gifts?page=${page}&limit=${limit}`,
      { headers: API_CONFIG.headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

export const beneficiaryAPI = {
  getBeneficiaries: async (
    page = 1,
    limit = 20,
    options?: { includeInactive?: boolean }
  ): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (options?.includeInactive) {
      params.set('includeInactive', 'true');
      params.set('include_inactive', 'true');
    }
    params.set('_t', String(Date.now())); // Cache-bust for admin panel
    const url = `${API_CONFIG.baseURL}/charities?${params}`;
    const response = await fetchWithTimeout(url, { headers: API_CONFIG.headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      return {
        success: true,
        data: Array.isArray(data.data) ? data.data : [],
        pagination: data.pagination || { page, limit, total: data.data?.length || 0, pages: 1 },
      };
    } else if (data.charities && Array.isArray(data.charities)) {
      return {
        success: true,
        data: data.charities,
        pagination: { page, limit, total: data.charities.length, pages: 1 },
      };
    } else if (Array.isArray(data)) {
      return {
        success: true,
        data: data,
        pagination: { page, limit, total: data.length, pages: 1 },
      };
    }

    return data;
  },

  getBeneficiary: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/charities/${id}`, {
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) return { success: true, data: data.data };
    else if (data.id) return { success: true, data: data };

    return data;
  },

  createBeneficiary: async (beneficiaryData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/charities`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(beneficiaryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  updateBeneficiary: async (id: number, beneficiaryData: any): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/charities/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(beneficiaryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  deleteBeneficiary: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/charities/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },
};

export const reportingAPI = {
  getPayoutData: async (startDate: string, endDate: string): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/reporting/payouts?startDate=${startDate}&endDate=${endDate}`,
      { headers: API_CONFIG.headers }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  backfillPaymentDates: async (): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/reporting/backfill-payment-dates`,
      {
        method: 'POST',
        headers: API_CONFIG.headers,
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  updateBankInfo: async (
    beneficiaryId: number,
    bankInfo: {
      bank_name?: string;
      account_holder_name?: string;
      routing_number?: string;
      account_number?: string;
      payment_method?: 'direct_deposit' | 'check';
      accountName?: string;
      routingNumber?: string;
      accountNumber?: string;
      paymentMethod?: 'direct_deposit' | 'check';
    }
  ): Promise<ApiResponse<any>> => {
    const payload = {
      ...bankInfo,
      accountName: bankInfo.accountName ?? bankInfo.account_holder_name,
      routingNumber: bankInfo.routingNumber ?? bankInfo.routing_number,
      accountNumber: bankInfo.accountNumber ?? bankInfo.account_number,
      paymentMethod: bankInfo.paymentMethod ?? bankInfo.payment_method,
    };
    const primaryUrl = buildAdminUrl(`/reporting/beneficiaries/${beneficiaryId}/bank-info`);
    let response = await fetchWithTimeout(primaryUrl, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok && response.status === 404) {
      const fallbackUrl = buildPublicUrl(`/reporting/beneficiaries/${beneficiaryId}/bank-info`);
      if (fallbackUrl !== primaryUrl) {
        response = await fetchWithTimeout(fallbackUrl, {
          method: 'PUT',
          headers: API_CONFIG.headers,
          body: JSON.stringify(payload),
        });
      }
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  updatePayoutStatus: async (
    beneficiaryId: number,
    statusData: { payout_status: string; payout_date?: string; notes?: string }
  ): Promise<ApiResponse<any>> => {
    const primaryUrl = buildAdminUrl(`/reporting/beneficiaries/${beneficiaryId}/payout-status`);
    let response = await fetchWithTimeout(primaryUrl, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify(statusData),
    });

    if (!response.ok && response.status === 404) {
      const fallbackUrl = buildPublicUrl(`/reporting/beneficiaries/${beneficiaryId}/payout-status`);
      if (fallbackUrl !== primaryUrl) {
        response = await fetchWithTimeout(fallbackUrl, {
          method: 'PUT',
          headers: API_CONFIG.headers,
          body: JSON.stringify(statusData),
        });
      }
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getStripeReconciliation: async (startDate: string, endDate: string): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}/reporting/stripe-reconciliation?startDate=${startDate}&endDate=${endDate}`,
      { headers: API_CONFIG.headers }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

// Invitations API functions
export const invitationsAPI = {
  getInvitations: async (params?: {
    type?: 'vendor' | 'beneficiary';
    status?: 'pending' | 'approved' | 'rejected' | 'contacted';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_CONFIG.baseURL}/invitations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetchWithTimeout(url, { headers: API_CONFIG.headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  updateInvitationStatus: async (
    id: number,
    status: 'pending' | 'approved' | 'rejected' | 'contacted',
    notes?: string
  ): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/invitations/${id}/status`, {
      method: 'PUT',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  inviteUser: async (id: number): Promise<ApiResponse<any>> => {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/invitations/${id}/invite`, {
      method: 'POST',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },
};
