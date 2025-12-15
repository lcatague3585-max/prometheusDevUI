/**
 * API Service - Base API configuration and utilities
 * 
 * Handles:
 * - Base URL configuration
 * - Token management
 * - Request/response interceptors
 * - Error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Token management
 */
export const TokenManager = {
  getToken: () => localStorage.getItem('pke_token'),
  setToken: (token) => localStorage.setItem('pke_token', token),
  removeToken: () => localStorage.removeItem('pke_token'),
  hasToken: () => !!localStorage.getItem('pke_token')
}

/**
 * User management
 */
export const UserManager = {
  getUser: () => {
    const user = localStorage.getItem('pke_user')
    return user ? JSON.parse(user) : null
  },
  setUser: (user) => localStorage.setItem('pke_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('pke_user'),
  hasUser: () => !!localStorage.getItem('pke_user')
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Base fetch wrapper with auth and error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  // Add auth token if available
  const token = TokenManager.getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const config = {
    ...options,
    headers
  }
  
  try {
    const response = await fetch(url, config)
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      TokenManager.removeToken()
      UserManager.removeUser()
      window.dispatchEvent(new CustomEvent('auth:expired'))
      throw new ApiError('Session expired. Please login again.', 401)
    }
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      
      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || 'An error occurred',
          response.status,
          data
        )
      }
      
      return data
    } else {
      // Return blob for file downloads
      if (!response.ok) {
        throw new ApiError('Request failed', response.status)
      }
      return response.blob()
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Network error
    throw new ApiError(
      error.message || 'Network error. Please check your connection.',
      0
    )
  }
}

/**
 * API methods
 */
const api = {
  get: (endpoint, options = {}) => 
    apiFetch(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint, data, options = {}) =>
    apiFetch(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
  put: (endpoint, data, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    
  patch: (endpoint, data, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    
  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'DELETE' }),
  
  // File upload
  upload: async (endpoint, formData, options = {}) => {
    const token = TokenManager.getToken()
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      ...options
    })
    
    const data = await response.json()
    if (!response.ok) {
      throw new ApiError(data.error || 'Upload failed', response.status, data)
    }
    return data
  },
  
  // File download
  download: async (endpoint, options = {}) => {
    const token = TokenManager.getToken()
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      ...options
    })
    
    if (!response.ok) {
      throw new ApiError('Download failed', response.status)
    }
    return response.blob()
  }
}

export default api
