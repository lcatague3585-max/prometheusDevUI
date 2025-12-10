/**
 * DebugGrid - Visual coordinate overlay for precise UI positioning
 *
 * Toggle with Ctrl+G
 * Only renders in development mode
 *
 * Features:
 * - Vertical centerline at 50% (cyan, prominent)
 * - Vertical gridlines every 95px (≈25mm) from center
 * - Horizontal gridlines every 95px from top
 * - Coordinate labels at key positions
 * - Viewport scale factor display
 * - D6: Real-time mouse coordinate display (X relative to centerline, Y from top)
 * - pointer-events: none (doesn't interfere with UI)
 */

import { useState, useEffect } from 'react'

function DebugGrid({ isVisible, scale = 1 }) {
  // D6: Track mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!isVisible) return

    const handleMouseMove = (e) => {
      // Calculate X relative to centerline (viewport center)
      const centerX = window.innerWidth / 2
      const relativeX = Math.round(e.clientX - centerX)
      const y = Math.round(e.clientY)
      setMousePos({ x: relativeX, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isVisible])

  if (!isVisible) return null

  // Grid spacing in pixels (≈25mm at 96 DPI)
  const GRID_SPACING = 95

  // Generate vertical gridlines from center
  const generateVerticalLines = () => {
    const lines = []
    const maxLines = 10 // Lines on each side of center

    // Centerline (prominent)
    lines.push(
      <div
        key="centerline"
        className="absolute top-0 bottom-0 w-[2px]"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 255, 255, 0.6)'
        }}
      >
        <span 
          className="absolute top-2 text-[10px] font-mono"
          style={{ 
            color: 'rgba(0, 255, 255, 0.9)',
            transform: 'translateX(-50%)',
            left: '50%'
          }}
        >
          0
        </span>
      </div>
    )

    // Lines to the left of center (negative X)
    for (let i = 1; i <= maxLines; i++) {
      const offset = i * GRID_SPACING
      lines.push(
        <div
          key={`left-${i}`}
          className="absolute top-0 bottom-0 w-[1px]"
          style={{
            left: `calc(50% - ${offset}px)`,
            backgroundColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <span 
            className="absolute top-2 text-[10px] font-mono"
            style={{ 
              color: 'rgba(0, 255, 255, 0.7)',
              transform: 'translateX(-50%)',
              left: '50%'
            }}
          >
            -{offset}
          </span>
        </div>
      )
    }

    // Lines to the right of center (positive X)
    for (let i = 1; i <= maxLines; i++) {
      const offset = i * GRID_SPACING
      lines.push(
        <div
          key={`right-${i}`}
          className="absolute top-0 bottom-0 w-[1px]"
          style={{
            left: `calc(50% + ${offset}px)`,
            backgroundColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <span 
            className="absolute top-2 text-[10px] font-mono"
            style={{ 
              color: 'rgba(0, 255, 255, 0.7)',
              transform: 'translateX(-50%)',
              left: '50%'
            }}
          >
            +{offset}
          </span>
        </div>
      )
    }

    return lines
  }

  // Generate horizontal gridlines
  const generateHorizontalLines = () => {
    const lines = []
    const maxLines = 15

    for (let i = 1; i <= maxLines; i++) {
      const offset = i * GRID_SPACING
      lines.push(
        <div
          key={`horizontal-${i}`}
          className="absolute left-0 right-0 h-[1px]"
          style={{
            top: `${offset}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <span 
            className="absolute left-2 text-[9px] font-mono"
            style={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              transform: 'translateY(-50%)'
            }}
          >
            Y:{offset}
          </span>
        </div>
      )
    }

    return lines
  }

  return (
    <div 
      className="fixed inset-0 z-[9999]"
      style={{ pointerEvents: 'none' }}
    >
      {/* Gridlines */}
      {generateVerticalLines()}
      {generateHorizontalLines()}

      {/* Grid indicator with scale factor */}
      <div 
        className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-mono"
        style={{
          backgroundColor: 'rgba(0, 255, 255, 0.2)',
          color: 'rgba(0, 255, 255, 0.9)',
          border: '1px solid rgba(0, 255, 255, 0.4)'
        }}
      >
        GRID: ON (Ctrl+G) | Scale: {(scale * 100).toFixed(0)}%
      </div>

      {/* Reference info */}
      <div
        className="absolute bottom-2 left-2 px-2 py-1 rounded text-[9px] font-mono"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'rgba(0, 255, 255, 0.8)'
        }}
      >
        Grid: 95px (≈25mm) | Centerline: 0 | Left: -X | Right: +X
      </div>

      {/* D6: Mouse coordinate display */}
      <div
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded text-[11px] font-mono"
        style={{
          backgroundColor: 'rgba(255, 102, 0, 0.2)',
          color: 'rgba(255, 200, 100, 1)',
          border: '1px solid rgba(255, 102, 0, 0.5)'
        }}
      >
        Mouse: X: {mousePos.x >= 0 ? '+' : ''}{mousePos.x} | Y: {mousePos.y}
      </div>
    </div>
  )
}

export default DebugGrid

