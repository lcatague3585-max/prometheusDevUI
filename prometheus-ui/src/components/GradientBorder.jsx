/**
 * GradientBorder - Shared gradient border wrapper component
 *
 * Provides consistent gradient border styling for input fields across the application.
 * Defined as a stable component to prevent re-renders that cause focus loss.
 *
 * A3 Fix: Gradient border with proper colors:
 * - 1px border thickness (flat, no bevel)
 * - Rounded corners (rounded-[4px])
 * - Gradient: darkest #767171 at ends, lightest #FFFFFF at center
 *
 * B10: Supports isActive prop for burnt orange (#FF6600) highlight on hover/focus.
 */
function GradientBorder({ children, className = '', isActive = false }) {
  // A3: Gradient - lightest (#FFFFFF) at center, darkest (#767171) at ends
  const defaultGradient = 'linear-gradient(to right, #767171, #ffffff 50%, #767171)'

  // B10: Burnt orange solid border when active (hover/focus)
  const activeColor = '#FF6600'

  return (
    <div
      className={`p-[1px] rounded-[4px] ${className}`}
      style={{
        background: isActive ? activeColor : defaultGradient
      }}
    >
      {children}
    </div>
  )
}

export default GradientBorder
