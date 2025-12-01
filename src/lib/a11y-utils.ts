// ============================================
// TradingHub Pro - Accessibility Hooks & Utilities
// Pure functions and hooks for accessibility
// ============================================

import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Live region for screen reader announcements
 */
let liveRegion: HTMLDivElement | null = null

function createLiveRegion(): HTMLDivElement {
  if (liveRegion) return liveRegion
  
  const region = document.createElement('div')
  region.setAttribute('aria-live', 'polite')
  region.setAttribute('aria-atomic', 'true')
  region.setAttribute('role', 'status')
  region.style.position = 'absolute'
  region.style.width = '1px'
  region.style.height = '1px'
  region.style.padding = '0'
  region.style.margin = '-1px'
  region.style.overflow = 'hidden'
  region.style.clip = 'rect(0, 0, 0, 0)'
  region.style.whiteSpace = 'nowrap'
  region.style.border = '0'
  document.body.appendChild(region)
  liveRegion = region
  return region
}

/**
 * Announce a message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const region = createLiveRegion()
  region.setAttribute('aria-live', priority)
  
  // Clear and set after a tick to ensure announcement
  region.textContent = ''
  requestAnimationFrame(() => {
    region.textContent = message
  })
}

/**
 * Hook for announcing changes to screen readers
 */
export function useAnnounce() {
  return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority)
  }, [])
}

/**
 * Hook for announcing price changes
 */
export function usePriceChangeAnnouncement(
  symbol: string,
  price: number | undefined,
  changePercent: number | undefined,
  enabled: boolean = true
) {
  const previousPrice = useRef(price)
  const announceRef = useAnnounce()
  
  useEffect(() => {
    if (!enabled || price === undefined || previousPrice.current === price) return
    
    const direction = price > (previousPrice.current || 0) ? 'up' : 'down'
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
    
    const changeText = changePercent !== undefined
      ? `, ${changePercent >= 0 ? 'up' : 'down'} ${Math.abs(changePercent).toFixed(2)}%`
      : ''
    
    announceRef(
      `${symbol} price ${direction} to ${formattedPrice}${changeText}`,
      'polite'
    )
    
    previousPrice.current = price
  }, [price, symbol, changePercent, enabled, announceRef])
}

/**
 * Hook for focus trap within a container (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return
    
    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    // Focus first element
    firstElement.focus()
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isActive])
  
  return containerRef
}

/**
 * Hook to restore focus when a component unmounts
 */
export function useRestoreFocus() {
  const previousFocusRef = useRef<HTMLElement | null>(null)
  
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
    
    return () => {
      previousFocusRef.current?.focus()
    }
  }, [])
}

/**
 * Get ARIA labels for price change indicators
 */
export function getPriceChangeAriaLabel(
  symbol: string,
  price: number,
  change: number,
  changePercent: number
): string {
  const direction = change >= 0 ? 'up' : 'down'
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
  
  return `${symbol} at ${formattedPrice}, ${direction} ${Math.abs(changePercent).toFixed(2)}% today`
}

/**
 * Get ARIA labels for P&L displays
 */
export function getPnLAriaLabel(value: number, type: 'unrealized' | 'realized' | 'daily' = 'unrealized'): string {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(value))
  
  const direction = value >= 0 ? 'profit' : 'loss'
  
  return `${type} ${direction} of ${formattedValue}`
}

/**
 * Color-blind safe color pairs for charts
 * Uses colors distinguishable by most color-blind users
 */
export const colorBlindSafeColors = {
  positive: '#22c55e', // green-500
  negative: '#ef4444', // red-500
  positiveAlt: '#06b6d4', // cyan-500 (for deuteranopia)
  negativeAlt: '#f97316', // orange-500 (for deuteranopia)
  neutral: '#6b7280', // gray-500
} as const

/**
 * Hook for respecting reduced motion preferences
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  return prefersReducedMotion
}

/**
 * Generate unique IDs for form elements
 */
let idCounter = 0
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Hook for generating stable unique IDs
 */
export function useId(prefix: string = 'id'): string {
  const [id] = useState(() => generateId(prefix))
  return id
}
