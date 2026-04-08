import apiClient from './apiClient'

const bannerService = {
  // Get all banners
  getBanners: async () => {
    const response = await apiClient.get('/api/banners', { skipAuth: true })
    return response
  },

  // Create new banner (ADMIN)
  createBanner: async (imageSource, displayOrder) => {
    if (typeof File !== 'undefined' && imageSource instanceof File) {
      const formData = new FormData()
      formData.append('imageFile', imageSource)
      formData.append('displayOrder', String(displayOrder))
      return apiClient.post('/api/banners', formData)
    }

    const response = await apiClient.post('/api/banners', {
      imageUrl: imageSource,
      displayOrder
    })
    return response
  },

  // Update banner (ADMIN)
  updateBanner: async (id, imageSource, displayOrder) => {
    if (typeof File !== 'undefined' && imageSource instanceof File) {
      const formData = new FormData()
      formData.append('imageFile', imageSource)
      formData.append('displayOrder', String(displayOrder))
      return apiClient.put(`/api/banners/${id}`, formData)
    }

    const response = await apiClient.put(`/api/banners/${id}`, {
      imageUrl: imageSource,
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
