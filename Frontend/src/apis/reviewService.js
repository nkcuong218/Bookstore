import apiClient from './apiClient'

const reviewService = {
  submitOrderReviews: async (orderId, items) => {
    return apiClient.post(`/api/reviews/orders/${orderId}`, { items })
  }
}

export default reviewService
