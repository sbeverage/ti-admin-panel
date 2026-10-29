/** Stands in for services/api so BeneficiaryProfile can mount with no backend. */
const charity = {
  id: 32,
  name: 'Harness Test Charity',
  category: 'Childhood Illness',
  type: 'Nonprofit',
  about: 'A charity used only by the crop harness.',
  description: 'A charity used only by the crop harness.',
  imageUrl: '',
  logo_url: '',
  highlight_url: '',
  imageUrls: [],
  location: '44 Milton Ave, Alpharetta, GA 30009',
  website: 'https://example.com',
  ein: '00-0000000',
  isActive: true,
  is_active: true,
};

export const beneficiaryAPI = {
  getBeneficiary: async () => ({ success: true, data: charity }),
  updateBeneficiary: async (_id: number, body: any) => {
    (window as any).__lastUpdate = body;
    return { success: true, data: { ...charity, ...body } };
  },
};

export const settingsAPI = {};
export const donorAPI = {};
export const analyticsAPI = {};
export const vendorAPI = {};
export const discountAPI = {};
export const API_CONFIG = { baseURL: '/stub', headers: {} };
export const fetchWithTimeout = async () => new Response('{}');
