import '@testing-library/jest-dom'
import { afterEach, vi, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Suppress console warnings for SVG elements and chart dimensions in tests
beforeAll(() => {
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  
  console.error = (...args: unknown[]) => {
    const message = String(args[0])
    
    // Suppress SVG element warnings from jsdom
    if (
      message.includes('is unrecognized in this browser') ||
      message.includes('is using incorrect casing') ||
      message.includes('<linearGradient') ||
      message.includes('<stop>') ||
      message.includes('<defs>') ||
      // Suppress chart dimension warnings from Recharts
      (message.includes('width') && message.includes('height') && message.includes('should be greater than 0')) ||
      // Suppress act() warnings for async state updates
      message.includes('was not wrapped in act')
    ) {
      return
    }
    
    originalConsoleError.apply(console, args)
  }
  
  console.warn = (...args: unknown[]) => {
    const message = String(args[0])
    
    // Suppress chart dimension warnings
    if (
      (message.includes('width') && message.includes('height') && message.includes('should be greater than 0'))
    ) {
      return
    }
    
    originalConsoleWarn.apply(console, args)
  }
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver as a proper class
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
;(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock IntersectionObserver as a proper class
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
;(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
