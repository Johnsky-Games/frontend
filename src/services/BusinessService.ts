import api from './ApiService';

interface BusinessVerificationRequest {
  businessId: number;
}

const BusinessService = {
  // Request business verification
  requestVerification: async (businessId: number) => {
    try {
      const response = await api.post(`/businesses/${businessId}/request-verification`, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all businesses that need verification (for admins)
  getBusinessesNeedingVerification: async () => {
    try {
      const response = await api.get('/admin/businesses/pending-verification');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve a business (for admins)
  approveBusiness: async (businessId: number, notes?: string) => {
    try {
      const response = await api.patch(`/admin/businesses/${businessId}/approve`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject a business (for admins)
  rejectBusiness: async (businessId: number, notes?: string) => {
    try {
      const response = await api.patch(`/admin/businesses/${businessId}/reject`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default BusinessService;