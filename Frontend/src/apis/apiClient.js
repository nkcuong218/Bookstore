import { API_ROOT } from '~/utils/constants'

const getScopeFromPath = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return 'admin'
  }
  return 'customer'
}

const getTokenKeyByScope = (scope) => {
  return scope === 'admin' ? 'adminToken' : 'token'
}

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  prepareBody(data) {
    if (data === undefined || data === null) return undefined
    if (typeof FormData !== 'undefined' && data instanceof FormData) return data
    return JSON.stringify(data)
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const {
      skipAuth,
      authScope,
      ...requestOptions
    } = options

    const scope = authScope || getScopeFromPath()
    const token = localStorage.getItem(getTokenKeyByScope(scope))

    const config = {
      ...requestOptions,
      headers: {
        ...requestOptions.headers
      }
    }

    const isFormData = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json'
    }

    if (token && !skipAuth) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, config)
    const contentType = response.headers.get('content-type') || ''
    const isJsonResponse = contentType.includes('application/json')

    // Xử lý response không thành công
    if (!response.ok) {
      const errorData = isJsonResponse
        ? await response.json().catch(() => ({}))
        : await response.text().catch(() => '')

      if (typeof errorData === 'string') {
        throw new Error(errorData || `HTTP ${response.status}`)
      }

      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }

    // Xử lý 204 No Content
    if (response.status === 204) {
      return null
    }

    if (isJsonResponse) {
      return await response.json()
    }

    return await response.text()
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: this.prepareBody(data)
    })
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: this.prepareBody(data)
    })
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: this.prepareBody(data)
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

export default new ApiClient(API_ROOT)
