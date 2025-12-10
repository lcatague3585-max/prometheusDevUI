/**
 * PKEInterface - PKE Interaction Window Component
 * 
 * B5: 100% size increase from previous dimensions
 * - Previous: 454px × 38px
 * - New: 908px × 76px
 * 
 * B11: Glow effect on activation:
 * - 3px burnt orange (#FF6600) glow/shadow around border
 * - Subtle pulse animation (~3s cycle) when active
 * 
 * Deactivation triggers (handled by parent):
 * - Second press of PKE button (toggle)
 * - Navigation button press
 * - SAVE, LOAD, CLEAR, DELETE button press
 */

import { LAYOUT } from '../constants/layout'

function PKEInterface({ isActive = false, onClose }) {
  // A7: New gradient style - lightest at center, darker toward ends
  const defaultGradient = 'linear-gradient(to right, #3b3838, #767171 25%, #ffffff 50%, #767171 75%, #3b3838)'
  
  return (
    <div 
      className={`flex items-center justify-center transition-all duration-300 ${isActive ? 'pke-glow-pulse' : ''}`}
      style={{
        width: `${LAYOUT.PKE_WIDTH}px`,   // B5: 908px (100% increase)
        height: `${LAYOUT.PKE_HEIGHT}px`, // B5: 76px (100% increase)
        borderRadius: `${LAYOUT.PKE_BORDER_RADIUS}px`, // Half of height for lozenge
        padding: '1px',
        background: isActive 
          ? '#FF6600' // Burnt orange when active
          : defaultGradient, // A7: New gradient when inactive
        boxShadow: isActive 
          ? '0 0 12px 4px rgba(255, 102, 0, 0.6)' // B11: Scaled glow for larger size
          : 'none',
        marginLeft: '35px' // Horizontal shift right 35px (all pages)
      }}
    >
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          background: '#0d0d0d',
          borderRadius: `${LAYOUT.PKE_BORDER_RADIUS - 1}px` // Slightly smaller for inner content
        }}
      >
        {isActive ? (
          <span className="text-[#BF9000] text-[14px] font-prometheus tracking-wide text-center px-4">
            PKE Activated. Functionality coming soon.
          </span>
        ) : (
          <span className="text-[#767171] text-[14px] font-prometheus tracking-wide">
            PKE Interface
          </span>
        )}
      </div>
      
      {/* B11: CSS for pulse animation */}
      <style>{`
        @keyframes pke-glow-pulse {
          0%, 100% {
            box-shadow: 0 0 12px 4px rgba(255, 102, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 18px 6px rgba(255, 102, 0, 0.8);
          }
        }
        .pke-glow-pulse {
          animation: pke-glow-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default PKEInterface
