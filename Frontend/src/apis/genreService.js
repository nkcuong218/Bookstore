import apiClient from './apiClient'

const genreService = {
  /**
   * Lấy danh sách thể loại đang hoạt động
   * @returns {Promise<Array<{id:number,name:string,slug:string}>>}
   */
  getGenres: async () => {
    return apiClient.get('/api/genres', { skipAuth: true })
  }
}

export default genreService
