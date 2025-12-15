/**
 * Footer Component - Shared footer for all main pages
 *
 * Features:
 * - Mini NavWheel for navigation
 * - PKE Interface button
 * - Action buttons (DELETE, CLEAR, SAVE)
 * - Info row (OWNER, START DATE, STATUS, PROGRESS, DATE TIME)
 */

import { useState, useCallback, useEffect } from 'react'
import { THEME } from '../constants/theme'
import NavWheel from './NavWheel'
import pkeButton from '../assets/PKE_Button.png'

function Footer({
  currentSection,
  onNavigate,
  isPKEActive,
  onPKEToggle,
  onSave,
  onClear,
  onDelete,
  user,
  courseState,
  progress
}) {
  const [wheelExpanded, setWheelExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Handle navigation from NavWheel
  const handleNavigate = useCallback((section) => {
    setWheelExpanded(false)
    onNavigate?.(section)
  }, [onNavigate])

  // Format date/time
  const formatDateTime = () => {
    return currentTime.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).toUpperCase()
  }

  // Get status text based on progress
  const getStatus = () => {
    if (progress >= 100) return 'COMPLETE'
    if (progress >= 80) return 'FINAL REVIEW'
    if (progress >= 60) return 'IN PROGRESS'
    if (progress >= 20) return 'DEFINING'
    return 'STARTED'
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '110px',
        background: 'rgba(0, 0, 0, 0.6)',
        borderTop: `1px solid ${THEME.BORDER}`,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Main Footer Row */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px'
        }}
      >
        {/* Left: Mini NavWheel */}
        <div style={{ position: 'relative', width: '100px' }}>
          <NavWheel
            size="mini"
            expanded={wheelExpanded}
            onToggle={() => setWheelExpanded(!wheelExpanded)}
            onNavigate={handleNavigate}
            currentSection={currentSection}
          />
        </div>

        {/* Analytics Ring (placeholder) */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: `2px solid ${THEME.BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '20px'
          }}
        >
          <span
            style={{
              fontSize: '8px',
              color: THEME.TEXT_DIM,
              letterSpacing: '1px',
              textAlign: 'center'
            }}
          >
            ANALYTICS
          </span>
        </div>

        {/* PKE Button */}
        <div
          style={{
            marginLeft: '24px',
            cursor: 'pointer'
          }}
          onClick={() => onPKEToggle?.(!isPKEActive)}
        >
          <img
            src={pkeButton}
            alt="PKE"
            style={{
              width: '48px',
              height: '48px',
              filter: isPKEActive
                ? 'drop-shadow(0 0 10px rgba(212, 115, 12, 0.8))'
                : 'none',
              transition: 'filter 0.3s ease'
            }}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <ActionButton
            label="DELETE"
            onClick={onDelete}
            variant="danger"
          />
          <ActionButton
            label="CLEAR"
            onClick={onClear}
            variant="warning"
          />
          <ActionButton
            label="SAVE"
            onClick={onSave}
            variant="primary"
          />
        </div>
      </div>

      {/* Info Row */}
      <div
        style={{
          height: '36px',
          borderTop: `1px solid ${THEME.BORDER}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          gap: '32px'
        }}
      >
        <InfoField label="OWNER" value={user?.name || user?.email || '---'} />
        <InfoField label="START DATE" value={courseState?.startDate || '---'} />
        <InfoField
          label="STATUS"
          value={getStatus()}
          valueColor={
            progress >= 100 ? '#4CAF50' :
            progress >= 60 ? THEME.AMBER :
            THEME.TEXT_SECONDARY
          }
        />
        <InfoField
          label="PROGRESS"
          value={`${progress || 0}%`}
          valueColor={
            progress >= 100 ? '#4CAF50' :
            progress >= 60 ? THEME.AMBER :
            THEME.TEXT_SECONDARY
          }
        />
        
        <div style={{ flex: 1 }} />
        
        <InfoField label="DATE TIME" value={formatDateTime()} />
        <InfoField
          label="APPROVED"
          value={progress >= 100 ? '✓' : '—'}
          valueColor={progress >= 100 ? '#4CAF50' : THEME.TEXT_MUTED}
        />
      </div>
    </div>
  )
}

// ===========================================
// Sub-components
// ===========================================

function ActionButton({ label, onClick, variant = 'default' }) {
  const variants = {
    default: {
      bg: 'transparent',
      border: THEME.BORDER,
      color: THEME.TEXT_SECONDARY,
      hoverBorder: THEME.TEXT_PRIMARY
    },
    primary: {
      bg: THEME.GRADIENT_BUTTON,
      border: THEME.AMBER,
      color: '#000',
      hoverBorder: THEME.AMBER
    },
    warning: {
      bg: 'transparent',
      border: '#FFC107',
      color: '#FFC107',
      hoverBorder: '#FFD54F'
    },
    danger: {
      bg: 'transparent',
      border: '#F44336',
      color: '#F44336',
      hoverBorder: '#EF5350'
    }
  }

  const v = variants[variant]

  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 24px',
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: '4px',
        color: v.color,
        fontSize: '11px',
        fontFamily: THEME.FONT_PRIMARY,
        letterSpacing: '2px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.borderColor = v.hoverBorder
        if (variant === 'primary') {
          e.target.style.boxShadow = '0 0 15px rgba(212, 115, 12, 0.3)'
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.borderColor = v.border
        e.target.style.boxShadow = 'none'
      }}
    >
      {label}
    </button>
  )
}

function InfoField({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          fontSize: '9px',
          color: THEME.TEXT_MUTED,
          letterSpacing: '1px',
          fontFamily: THEME.FONT_PRIMARY
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontSize: '10px',
          color: valueColor || THEME.TEXT_PRIMARY,
          letterSpacing: '1px',
          fontFamily: THEME.FONT_MONO
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default Footer
