import apiClient from './apiClient'

const reviewService = {
  submitOrderReviews: async (orderId, items) => {
    return apiClient.post(`/api/reviews/orders/${orderId}`, { items })
  },

  getAdminReviews: async () => {
    return apiClient.get('/api/admin/reviews', { authScope: 'admin' })
  },

  deleteAdminReview: async (id) => {
    return apiClient.delete(`/api/admin/reviews/${id}`, { authScope: 'admin' })
  }
}

export default reviewService
