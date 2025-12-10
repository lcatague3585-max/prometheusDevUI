/**
 * useViewportScale - Hook for proportional viewport scaling
 * 
 * Prometheus UI is designed for 1920×1080 minimum resolution.
 * On smaller viewports, the UI scales proportionally to fit.
 * 
 * @returns {number} Scale factor (1.0 = 100% at 1920px, 0.8 = 80% at 1536px, etc.)
 */
import { useState, useEffect } from 'react'

const TARGET_WIDTH = 1920 // Design target viewport width

export function useViewportScale() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth
      
      if (viewportWidth >= TARGET_WIDTH) {
        // At or above target width, no scaling
        setScale(1)
      } else {
        // Below target width, scale proportionally
        const calculatedScale = viewportWidth / TARGET_WIDTH
        setScale(calculatedScale)
      }
    }

    // Calculate initial scale
    calculateScale()

    // Update on resize
    window.addEventListener('resize', calculateScale)
    return () => window.removeEventListener('resize', calculateScale)
  }, [])

  return scale
}

export default useViewportScale


