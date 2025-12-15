/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls:
 * - Login/Register
 * - Logout
 * - Token validation
 * - User profile
 */

import api, { TokenManager, UserManager } from './api'

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { email, password, name }
   * @returns {Promise<Object>} - { user, token }
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    
    if (response.token) {
      TokenManager.setToken(response.token)
    }
    if (response.user) {
      UserManager.setUser(response.user)
    }
    
    return response
  },
  
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - { user, token }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    
    if (response.token) {
      TokenManager.setToken(response.token)
    }
    if (response.user) {
      UserManager.setUser(response.user)
    }
    
    return response
  },
  
  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout', {})
    } catch (error) {
      // Ignore logout errors
      console.warn('Logout API error:', error)
    } finally {
      TokenManager.removeToken()
      UserManager.removeUser()
    }
  },
  
  /**
   * Get current user profile
   * @returns {Promise<Object>} - User object
   */
  getMe: async () => {
    const response = await api.get('/auth/me')
    
    if (response.user) {
      UserManager.setUser(response.user)
      return response.user
    }
    
    return response
  },
  
  /**
   * Update user preferences
   * @param {Object} preferences - User preferences object
   * @returns {Promise<Object>} - Updated user
   */
  updatePreferences: async (preferences) => {
    const response = await api.patch('/auth/preferences', { preferences })
    
    if (response.user) {
      UserManager.setUser(response.user)
    }
    
    return response
  },
  
  /**
   * Change password
   * @param {Object} passwords - { currentPassword, newPassword }
   * @returns {Promise<Object>}
   */
  changePassword: async (passwords) => {
    return api.post('/auth/change-password', passwords)
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return TokenManager.hasToken()
  },
  
  /**
   * Get stored user
   * @returns {Object|null}
   */
  getStoredUser: () => {
    return UserManager.getUser()
  },
  
  /**
   * Validate current token
   * @returns {Promise<boolean>}
   */
  validateToken: async () => {
    if (!TokenManager.hasToken()) {
      return false
    }
    
    try {
      await api.get('/auth/me')
      return true
    } catch (error) {
      TokenManager.removeToken()
      UserManager.removeUser()
      return false
    }
  }
}

export default authService
