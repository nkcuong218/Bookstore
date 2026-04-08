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
        'Content-Type': 'application/json',
        ...requestOptions.headers
      }
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
      body: JSON.stringify(data)
    })
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

export default new ApiClient(API_ROOT)
