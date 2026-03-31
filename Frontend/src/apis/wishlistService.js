import apiClient from './apiClient'

const emitWishlistUpdated = () => {
  window.dispatchEvent(new Event('wishlist-updated'))
}

const wishlistService = {
  getMyWishlist: async () => {
    return apiClient.get('/api/wishlist', { authScope: 'customer' })
  },

  addToWishlist: async (bookId) => {
    const response = await apiClient.post('/api/wishlist', { bookId }, { authScope: 'customer' })
    emitWishlistUpdated()
    return response
  },

  removeFromWishlist: async (bookId) => {
    const response = await apiClient.delete(`/api/wishlist/${bookId}`, { authScope: 'customer' })
    emitWishlistUpdated()
    return response
  },

  containsBook: async (bookId) => {
    return apiClient.get(`/api/wishlist/contains/${bookId}`, { authScope: 'customer' })
  },

  clearWishlist: async () => {
    const response = await apiClient.delete('/api/wishlist', { authScope: 'customer' })
    emitWishlistUpdated()
    return response
  }
}

export default wishlistService
