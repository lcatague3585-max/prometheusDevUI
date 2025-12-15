/**
 * Header Component - Shared header for all main pages
 */

import { useState } from 'react'
import { THEME } from '../constants/theme'
import { useCourse } from '../context/CourseContext'
import { useAuth } from '../context/AuthContext'

function Header({ pageTitle }) {
  const { currentCourse } = useCourse()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const courseTitle = currentCourse?.title || 'Untitled Course'
  const courseCode = currentCourse?.code || '---'

  return (
    <div
      style={{
        height: '64px',
        borderBottom: `1px solid ${THEME.BORDER}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        background: 'rgba(0, 0, 0, 0.3)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            padding: '6px 12px',
            background: 'rgba(212, 115, 12, 0.1)',
            border: `1px solid ${THEME.AMBER}`,
            borderRadius: '4px'
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_MONO,
              letterSpacing: '1px'
            }}
          >
            {courseCode}
          </span>
        </div>

        <div>
          <h1
            style={{
              fontSize: '14px',
              color: THEME.TEXT_PRIMARY,
              fontWeight: 'normal',
              letterSpacing: '1px',
              margin: 0
            }}
          >
            {courseTitle}
          </h1>
          <span
            style={{
              fontSize: '9px',
              color: THEME.TEXT_MUTED,
              letterSpacing: '2px'
            }}
          >
            {currentCourse?.id ? `ID: ${currentCourse.id.slice(0, 8)}...` : 'UNSAVED'}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '12px',
            color: THEME.TEXT_DIM,
            fontWeight: 'normal',
            letterSpacing: '4px',
            margin: 0
          }}
        >
          {pageTitle}
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          position: 'relative'
        }}
      >
        <span
          style={{
            fontSize: '9px',
            color: THEME.TEXT_MUTED,
            letterSpacing: '1px',
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '3px'
          }}
        >
          V2.1 + PKE
        </span>

        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'transparent',
            border: `1px solid ${THEME.BORDER}`,
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: THEME.GRADIENT_BUTTON,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '11px', color: '#000', fontWeight: 'bold' }}>
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: THEME.TEXT_SECONDARY }}>
            {user?.name || user?.email?.split('@')[0] || 'User'}
          </span>
          <span style={{ fontSize: '10px', color: THEME.TEXT_MUTED }}>▼</span>
        </button>

        {showUserMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: THEME.BG_MEDIUM,
              border: `1px solid ${THEME.BORDER}`,
              borderRadius: '4px',
              minWidth: '180px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              zIndex: 1000
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${THEME.BORDER}`
              }}
            >
              <div style={{ fontSize: '11px', color: THEME.TEXT_PRIMARY }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '10px', color: THEME.TEXT_MUTED, marginTop: '2px' }}>
                {user?.email || '---'}
              </div>
            </div>

            <div style={{ padding: '8px 0' }}>
              <MenuButton label="Settings" icon="⚙️" onClick={() => setShowUserMenu(false)} />
              <MenuButton label="Help" icon="❓" onClick={() => setShowUserMenu(false)} />
              <div style={{ height: '1px', background: THEME.BORDER, margin: '8px 0' }} />
              <MenuButton
                label="Logout"
                icon="🚪"
                onClick={() => {
                  setShowUserMenu(false)
                  logout?.()
                }}
                danger
              />
            </div>
          </div>
        )}
      </div>

      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}

function MenuButton({ label, icon, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left'
      }}
    >
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span
        style={{
          fontSize: '11px',
          color: danger ? '#F44336' : THEME.TEXT_SECONDARY,
          letterSpacing: '1px'
        }}
      >
        {label}
      </span>
    </button>
  )
}

export default Header
