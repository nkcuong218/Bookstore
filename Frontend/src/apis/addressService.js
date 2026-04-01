import apiClient from './apiClient'

const addressService = {
  getMyAddresses: async () => {
    return apiClient.get('/api/addresses', { authScope: 'customer' })
  },

  createAddress: async (data) => {
    return apiClient.post('/api/addresses', data, { authScope: 'customer' })
  },

  setDefaultAddress: async (id) => {
    return apiClient.patch(`/api/addresses/${id}/default`, null, { authScope: 'customer' })
  },

  deleteAddress: async (id) => {
    return apiClient.delete(`/api/addresses/${id}`, { authScope: 'customer' })
  }
}

export default addressService
