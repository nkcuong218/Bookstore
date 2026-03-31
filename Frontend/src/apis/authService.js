import apiClient from './apiClient'

const authService = {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} data - { fullName, email, password, phone }
   * @returns {Promise<Object>} { token, id, fullName, email, role, phone, address }
   */
  register: async (data) => {
    const response = await apiClient.post('/api/auth/register', data, { skipAuth: true })
    if (response.token) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('currentUser', JSON.stringify({
        id: response.id,
        username: response.fullName,
        email: response.email,
        role: response.role,
        phone: response.phone,
        address: response.address
      }))
    }
    return response
  },

  /**
   * Đăng nhập
   * @param {Object} data - { email, password }
   * @returns {Promise<Object>} { token, id, fullName, email, role, phone, address }
   */
  login: async (data) => {
    const response = await apiClient.post('/api/auth/login', data, { skipAuth: true })
    if (response.token) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('currentUser', JSON.stringify({
        id: response.id,
        username: response.fullName,
        email: response.email,
        role: response.role,
        phone: response.phone,
        address: response.address
      }))
    }
    return response
  },

  /**
   * Đăng xuất
   */
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  },

  /**
   * Lấy thông tin user hiện tại từ localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser')
    return userStr ? JSON.parse(userStr) : null
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  /**
   * Kiểm tra user có phải admin không
   */
  isAdmin: () => {
    const user = authService.getCurrentUser()
    return user?.role === 'admin'
  }
}

export default authService
