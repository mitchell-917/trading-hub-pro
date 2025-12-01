// ============================================
// TradingHub Pro - Accessibility Components
// React components for accessibility
// ============================================

// NOTE: Hooks and utilities are in a11y-utils.ts
// Import from there directly for useFocusTrap, useAnnounce, etc.

/**
 * Screen reader only text (visually hidden but accessible)
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </span>
  )
}

/**
 * Skip to main content link for keyboard navigation
 */
export function SkipLink({ href = '#main-content' }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      Skip to main content
    </a>
  )
}
