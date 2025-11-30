// ============================================
// Error Boundary Component Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Component that throws an error
function ThrowError(): React.ReactElement {
  throw new Error('Test error message')
}

// Silence console.error during tests
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalError
})

describe('ErrorBoundary Component', () => {
  describe('Without Errors', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })
  })

  describe('With Errors', () => {
    it('catches errors and shows fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('shows try again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('shows go home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
    })
  })

  describe('Custom Fallback', () => {
    it('uses custom fallback when provided', () => {
      const CustomFallback = () => <div>Custom error UI</div>
      
      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Custom error UI')).toBeInTheDocument()
    })
  })

  describe('Error Callback', () => {
    it('calls onError callback if provided', () => {
      const onError = vi.fn()
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(onError).toHaveBeenCalled()
    })
  })
})

describe('ErrorBoundary Edge Cases', () => {
  it('handles null children', () => {
    render(
      <ErrorBoundary>
        {null}
      </ErrorBoundary>
    )
    
    expect(document.body).toBeInTheDocument()
  })

  it('handles undefined children', () => {
    render(
      <ErrorBoundary>
        {undefined}
      </ErrorBoundary>
    )
    
    expect(document.body).toBeInTheDocument()
  })
})
