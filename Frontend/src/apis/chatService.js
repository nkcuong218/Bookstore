import apiClient from './apiClient'

const chatService = {
  sendMessage(payload) {
    return apiClient.post('/api/chat', payload, { skipAuth: true })
  }
}

export default chatService
