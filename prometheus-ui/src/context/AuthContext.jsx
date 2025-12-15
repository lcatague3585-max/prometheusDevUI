/**
 * Authentication Context
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const userData = await authService.getMe()
          setUser(userData)
          setIsAuthenticated(true)
        } catch (err) {
          console.error('Auth check failed:', err)
          localStorage.removeItem('auth_token')
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  // Listen for auth:expired events
  useEffect(() => {
    const handleExpired = () => {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('auth_token')
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await authService.login(email, password)
      if (response.token) {
        localStorage.setItem('auth_token', response.token)
      }
      setUser(response.user)
      setIsAuthenticated(true)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (email, password, name) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await authService.register(email, password, name)
      if (response.token) {
        localStorage.setItem('auth_token', response.token)
      }
      setUser(response.user)
      setIsAuthenticated(true)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
