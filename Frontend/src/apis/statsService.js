import apiClient from './apiClient'

const statsService = {
  /**
   * Lấy dữ liệu thống kê cho Dashboard (Admin only)
   * @returns {Promise<Object>} Dashboard stats object
   */
  getDashboardStats: async () => {
    return apiClient.get('/api/admin/dashboard', { authScope: 'admin' })
  }
}

export default statsService
