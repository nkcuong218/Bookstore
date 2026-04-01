import apiClient from './apiClient'
import authService from './authService'

const userService = {
  /**
   * Lấy thông tin profile của user hiện tại
   * @returns {Promise<Object>} User profile
   */
  getProfile: async () => {
    return apiClient.get('/api/profile', { authScope: 'customer' })
  },

  /**
   * Cập nhật profile của user hiện tại
   * @param {Object} data - { fullName, phone, address, password }
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (data) => {
    const response = await apiClient.put('/api/profile', data, { authScope: 'customer' })

    // Cập nhật localStorage nếu thành công
    const currentUser = authService.getCurrentUser('customer') || {}
    authService.updateCurrentUser({
      username: response.fullName || currentUser.username,
      phone: response.phone || currentUser.phone,
      address: response.address || currentUser.address
    }, 'customer')

    return response
  },

  // ===== ADMIN ENDPOINTS =====

  /**
   * Lấy danh sách tất cả users (Admin only)
   * @param {Object} params - { page, size }
   * @returns {Promise<Object>} Paginated users
   */
  getAllUsers: async (params = {}) => {
    const queryParams = new URLSearchParams()

    if (params.page !== undefined) queryParams.append('page', params.page)
    if (params.size !== undefined) queryParams.append('size', params.size)

    const queryString = queryParams.toString()
    return apiClient.get(`/api/admin/users${queryString ? '?' + queryString : ''}`)
  },

  /**
   * Lấy chi tiết user theo ID (Admin only)
   * @param {Number} id - User ID
   * @returns {Promise<Object>} User details
   */
  getUserById: async (id) => {
    return apiClient.get(`/api/admin/users/${id}`)
  },

  /**
   * Toggle trạng thái user (ACTIVE ↔ BLOCKED) (Admin only)
   * @param {Number} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  toggleUserStatus: async (id) => {
    return apiClient.patch(`/api/admin/users/${id}/status`)
  },

  /**
   * Thay đổi role của user (Admin only)
   * @param {Number} id - User ID
   * @param {String} role - New role (CUSTOMER or ADMIN)
   * @returns {Promise<Object>} Updated user
   */
  changeUserRole: async (id, role) => {
    return apiClient.patch(`/api/admin/users/${id}/role?role=${role}`)
  },

  /**
   * Xóa user (Admin only)
   * @param {Number} id - User ID
   * @returns {Promise<Object>} Success message
   */
  deleteUser: async (id) => {
    return apiClient.delete(`/api/admin/users/${id}`)
  }
}

export default userService
