import apiClient from './apiClient'

const discountCodeService = {
  getAvailableCodes: async () => {
    return apiClient.get('/api/discount-codes/available')
  },

  getMyCodes: async () => {
    return apiClient.get('/api/discount-codes/my')
  },

  saveMyCode: async (code) => {
    return apiClient.post('/api/discount-codes/my/save', { code })
  },

  getAllCodesAdmin: async () => {
    return apiClient.get('/api/discount-codes/admin')
  },

  createCodeAdmin: async (payload) => {
    return apiClient.post('/api/discount-codes/admin', payload)
  },

  updateCodeAdmin: async (id, payload) => {
    return apiClient.put(`/api/discount-codes/admin/${id}`, payload)
  },

  toggleCodeAdmin: async (id) => {
    return apiClient.patch(`/api/discount-codes/admin/${id}/toggle`)
  }
}

export default discountCodeService
