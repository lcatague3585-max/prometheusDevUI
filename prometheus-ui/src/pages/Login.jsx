/**
 * Login Page - Authentication with real backend
 * 
 * Features:
 * - Login / Register toggle
 * - Real API authentication
 * - Demo mode fallback if backend unavailable
 */

import { useState } from 'react'
import { THEME } from '../constants/theme'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/burntorangelogo.png'

function Login({ onLogin }) {
  const { login, register, error, clearError, isLoading } = useAuth()
  
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    // Validation
    if (!email || !password) {
      setLocalError('Please enter email and password')
      return
    }

    if (isRegisterMode && !name) {
      setLocalError('Please enter your name')
      return
    }

    try {
      if (isRegisterMode) {
        await register(email, password, name)
      } else {
        await login(email, password)
      }
      onLogin?.()
    } catch (err) {
      // Check if it's a network error (backend not running)
      if (err.status === 0) {
        // Demo mode - allow login without backend
        console.warn('Backend not available, using demo mode')
        setLocalError('Backend not available. Starting in demo mode...')
        setTimeout(() => {
          onLogin?.()
        }, 1500)
      }
      // Other errors are handled by AuthContext
    }
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    setLocalError('')
    clearError()
  }

  const displayError = localError || error

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: THEME.BG_DARK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '400px',
          padding: '48px',
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${THEME.BORDER}`,
          borderRadius: '8px'
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src={logo}
            alt="Prometheus"
            style={{ width: '80px', height: '80px', marginBottom: '16px' }}
          />
          <h1
            style={{
              fontSize: '18px',
              color: THEME.OFF_WHITE,
              letterSpacing: '4px',
              fontFamily: THEME.FONT_PRIMARY,
              margin: 0
            }}
          >
            PROMETHEUS
          </h1>
          <p
            style={{
              fontSize: '10px',
              color: THEME.TEXT_DIM,
              letterSpacing: '2px',
              marginTop: '8px'
            }}
          >
            COURSE GENERATION SYSTEM
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name field (register only) */}
          {isRegisterMode && (
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  color: THEME.TEXT_DIM,
                  letterSpacing: '2px',
                  marginBottom: '8px'
                }}
              >
                NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${THEME.BORDER}`,
                  borderRadius: '4px',
                  color: THEME.TEXT_PRIMARY,
                  fontSize: '14px',
                  fontFamily: THEME.FONT_MONO,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Email field */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                color: THEME.TEXT_DIM,
                letterSpacing: '2px',
                marginBottom: '8px'
              }}
            >
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '4px',
                color: THEME.TEXT_PRIMARY,
                fontSize: '14px',
                fontFamily: THEME.FONT_MONO,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '10px',
                color: THEME.TEXT_DIM,
                letterSpacing: '2px',
                marginBottom: '8px'
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '4px',
                color: THEME.TEXT_PRIMARY,
                fontSize: '14px',
                fontFamily: THEME.FONT_MONO,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Remember Me (login only) */}
          {!isRegisterMode && (
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: '11px',
                  color: THEME.TEXT_SECONDARY,
                  cursor: 'pointer'
                }}
              >
                Remember me
              </label>
            </div>
          )}

          {/* Error display */}
          {displayError && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px',
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid #F44336',
                borderRadius: '4px',
                color: '#F44336',
                fontSize: '12px',
                fontFamily: THEME.FONT_MONO
              }}
            >
              {displayError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: THEME.GRADIENT_BUTTON,
              border: `1px solid ${THEME.AMBER}`,
              borderRadius: '4px',
              color: '#000',
              fontSize: '12px',
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '3px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? 'PLEASE WAIT...' : isRegisterMode ? 'CREATE ACCOUNT' : 'LOGIN'}
          </button>
        </form>

        {/* Toggle login/register */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={toggleMode}
            style={{
              background: 'transparent',
              border: 'none',
              color: THEME.AMBER,
              fontSize: '11px',
              cursor: 'pointer',
              letterSpacing: '1px'
            }}
          >
            {isRegisterMode ? 'Already have an account? LOGIN' : "Don't have an account? REGISTER"}
          </button>
        </div>

        {/* Version */}
        <div
          style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '9px',
            color: THEME.TEXT_MUTED,
            letterSpacing: '1px'
          }}
        >
          V2.1 + PKE BACKEND
        </div>
      </div>
    </div>
  )
}

export default Login
