import apiClient from './apiClient'

const bookService = {
  /**
   * Lấy danh sách sách với filter và phân trang
   * @param {Object} params - { keyword, genre, page, size, sortBy }
   * @returns {Promise<Object>} Paginated books response
   */
  getBooks: async (params = {}) => {
    const queryParams = new URLSearchParams()

    if (params.keyword) queryParams.append('keyword', params.keyword)
    if (params.genre) queryParams.append('genre', params.genre)
    if (params.page !== undefined) queryParams.append('page', params.page)
    if (params.size !== undefined) queryParams.append('size', params.size)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)

    const queryString = queryParams.toString()
    return apiClient.get(`/api/books${queryString ? '?' + queryString : ''}`, { skipAuth: true })
  },

  /**
   * Lấy 8 sách nổi bật (rating cao nhất)
   * @returns {Promise<Array>} Array of featured books
   */
  getFeaturedBooks: async () => {
    return apiClient.get('/api/books/featured', { skipAuth: true })
  },

  /**
   * Lấy danh sách thể loại
   * @returns {Promise<Array>} Array of genre strings
   */
  getGenres: async () => {
    return apiClient.get('/api/books/genres', { skipAuth: true })
  },

  /**
   * Lấy chi tiết sách theo ID
   * @param {Number} id - Book ID
   * @returns {Promise<Object>} Book details
   */
  getBookById: async (id) => {
    return apiClient.get(`/api/books/${id}`, { skipAuth: true })
  },

  /**
   * Lấy danh sách đánh giá của một cuốn sách
   * @param {Number} bookId - Book ID
   * @returns {Promise<Array>} Array of reviews
   */
  getBookReviews: async (bookId) => {
    return apiClient.get(`/api/reviews/books/${bookId}`, { skipAuth: true })
  },

  /**
   * Tạo sách mới (Admin only)
   * @param {Object} data - Book data
   * @returns {Promise<Object>} Created book
   */
  createBook: async (data) => {
    return apiClient.post('/api/books', data)
  },

  /**
   * Cập nhật sách (Admin only)
   * @param {Number} id - Book ID
   * @param {Object} data - Updated book data
   * @returns {Promise<Object>} Updated book
   */
  updateBook: async (id, data) => {
    return apiClient.put(`/api/books/${id}`, data)
  },

  /**
   * Xóa sách (Admin only)
   * @param {Number} id - Book ID
   * @returns {Promise<Object>} Success message
   */
  deleteBook: async (id) => {
    return apiClient.delete(`/api/books/${id}`)
  }
}

export default bookService
