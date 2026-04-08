import apiClient from './apiClient'

const AUTH_STORAGE_KEYS = {
  customer: {
    token: 'token',
    user: 'currentUser'
  },
  admin: {
    token: 'adminToken',
    user: 'adminCurrentUser'
  }
}

const resolveScope = (scope) => {
  if (scope === 'admin' || scope === 'customer') return scope
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return 'admin'
  }
  return 'customer'
}

const getStorageKeys = (scope) => AUTH_STORAGE_KEYS[resolveScope(scope)]

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return ''
  return role.replace(/^ROLE_/i, '').trim().toLowerCase()
}

const toStoredUser = (response) => ({
  id: response.id,
  username: response.fullName,
  email: response.email,
  role: normalizeRole(response.role),
  phone: response.phone,
  address: response.address
})

const emitAuthChange = (scope) => {
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: { scope } }))
}

const authService = {
  setSession: (authResponse, scope = 'customer') => {
    if (!authResponse?.token) return

    const resolvedScope = resolveScope(scope)
    const keys = getStorageKeys(resolvedScope)

    localStorage.setItem(keys.token, authResponse.token)
    localStorage.setItem(keys.user, JSON.stringify(toStoredUser(authResponse)))
    emitAuthChange(resolvedScope)
  },

  /**
   * Đăng ký tài khoản mới
   * @param {Object} data - { fullName, email, password, phone }
   * @returns {Promise<Object>} { token, id, fullName, email, role, phone, address }
   */
  register: async (data, scope = 'customer') => {
    const response = await apiClient.post('/api/auth/register', data, { skipAuth: true })
    return response
  },

  /**
   * Đăng nhập
   * @param {Object} data - { email, password }
   * @returns {Promise<Object>} { token, id, fullName, email, role, phone, address }
   */
  login: async (data, scope = 'customer') => {
    const resolvedScope = resolveScope(scope)
    const response = await apiClient.post('/api/auth/login', data, { skipAuth: true })
    authService.setSession(response, resolvedScope)
    return response
  },

  /**
   * Đăng nhập bằng Google ID token
   * @param {String} idToken - Google credential token
   * @returns {Promise<Object>} { token, id, fullName, email, role, phone, address }
   */
  loginWithGoogle: async (idToken) => {
    const response = await apiClient.post('/api/auth/google', { idToken }, { skipAuth: true })
    authService.setSession(response, 'customer')
    return response
  },

  verifyEmail: async (token) => {
    return apiClient.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, { skipAuth: true })
  },

  /**
   * Đăng xuất
   */
  logout: (scope) => {
    const resolvedScope = resolveScope(scope)
    const keys = getStorageKeys(resolvedScope)

    localStorage.removeItem(keys.token)
    localStorage.removeItem(keys.user)
    emitAuthChange(resolvedScope)
  },

  /**
   * Lấy thông tin user hiện tại từ localStorage
   */
  getCurrentUser: (scope) => {
    const keys = getStorageKeys(scope)
    const userStr = localStorage.getItem(keys.user)
    if (!userStr) return null

    const parsed = JSON.parse(userStr)
    return {
      ...parsed,
      role: normalizeRole(parsed?.role)
    }
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated: (scope) => {
    const keys = getStorageKeys(scope)
    return !!localStorage.getItem(keys.token)
  },

  /**
   * Kiểm tra user có phải admin không
   */
  isAdmin: (scope = 'admin') => {
    const user = authService.getCurrentUser(scope)
    return user?.role === 'admin'
  },

  isAdminRole: (role) => {
    return normalizeRole(role) === 'admin'
  },

  getAuthToken: (scope) => {
    const keys = getStorageKeys(scope)
    return localStorage.getItem(keys.token)
  },

  updateCurrentUser: (partialData, scope = 'customer') => {
    const keys = getStorageKeys(scope)
    const currentUser = authService.getCurrentUser(scope) || {}
    localStorage.setItem(keys.user, JSON.stringify({
      ...currentUser,
      ...partialData
    }))
    emitAuthChange(resolveScope(scope))
  },

  resolveCurrentScope: () => {
    return resolveScope()
  }
}

export default authService
