import apiClient from './apiClient'

const orderService = {
  /**
   * Tạo đơn hàng mới
   * @param {Object} data - { customerName, email, phone, address, paymentMethod, note, items: [{bookId, quantity}] }
   * @returns {Promise<Object>} Created order
   */
  createOrder: async (data) => {
    return apiClient.post('/api/orders', data)
  },

  /**
   * Lấy danh sách đơn hàng của user hiện tại
   * @returns {Promise<Array>} Array of orders
   */
  getMyOrders: async () => {
    return apiClient.get('/api/orders/my')
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   * @param {Number} id - Order ID
   * @returns {Promise<Object>} Order details
   */
  getOrderById: async (id) => {
    return apiClient.get(`/api/orders/${id}`)
  },

  /**
   * Lấy tất cả đơn hàng (Admin only)
   * @param {Object} params - { page, size }
   * @returns {Promise<Object>} Paginated orders
   */
  getAllOrders: async (params = {}) => {
    const queryParams = new URLSearchParams()

    if (params.page !== undefined) queryParams.append('page', params.page)
    if (params.size !== undefined) queryParams.append('size', params.size)

    const queryString = queryParams.toString()
    return apiClient.get(`/api/orders/admin${queryString ? '?' + queryString : ''}`)
  },

  /**
   * Cập nhật trạng thái đơn hàng (Admin only)
   * @param {Number} id - Order ID
   * @param {String} status - New status (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED)
   * @returns {Promise<Object>} Updated order
   */
  updateOrderStatus: async (id, status) => {
    return apiClient.patch(`/api/orders/${id}/status?status=${status}`)
  },

  /**
   * User xác nhận đã nhận hàng
   * @param {Number} id - Order ID
   * @returns {Promise<Object>} Updated order
   */
  confirmReceived: async (id) => {
    return apiClient.patch(`/api/orders/${id}/confirm-received`)
  }
}

export default orderService
