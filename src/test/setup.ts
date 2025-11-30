import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

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
