import apiClient from './apiClient'

const bannerService = {
  // Get all banners
  getBanners: async () => {
    const response = await apiClient.get('/api/banners', { skipAuth: true })
    return response
  },

  // Create new banner (ADMIN)
  createBanner: async (imageUrl, displayOrder) => {
    const response = await apiClient.post('/api/banners', {
      imageUrl,
      displayOrder
    })
    return response
  },

  // Update banner (ADMIN)
  updateBanner: async (id, imageUrl, displayOrder) => {
    const response = await apiClient.put(`/api/banners/${id}`, {
      imageUrl,
      displayOrder
    })
    return response
  },

  // Delete banner (ADMIN)
  deleteBanner: async (id) => {
    const response = await apiClient.delete(`/api/banners/${id}`)
    return response
  },

  // Reorder banners (ADMIN)
  reorderBanners: async (reorderRequests) => {
    const response = await apiClient.post('/api/banners/reorder', reorderRequests)
    return response
  }
}

export default bannerService
