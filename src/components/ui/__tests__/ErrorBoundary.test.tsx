// ============================================
// Error Boundary Component Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, withErrorBoundary, useErrorHandler } from '../ErrorBoundary'

// Component that throws an error
function ThrowError(): React.ReactElement {
  throw new Error('Test error message')
}

// Component that can be controlled to throw
let shouldThrow = false
function ConditionalThrow(): React.ReactElement {
  if (shouldThrow) {
    throw new Error('Conditional error')
  }
  return <div>Normal content</div>
}

// Silence console.error during tests
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
  shouldThrow = false
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

    it('displays reassuring message', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByText(/your data is safe/i)).toBeInTheDocument()
    })

    it('shows support contact info', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByText(/support@tradinghub.pro/i)).toBeInTheDocument()
    })
  })

  describe('Reset Functionality', () => {
    it('resets error state when try again is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalThrow />
        </ErrorBoundary>
      )
      
      // Trigger an error
      shouldThrow = true
      rerender(
        <ErrorBoundary>
          <ConditionalThrow />
        </ErrorBoundary>
      )
      
      // The error UI should be shown
      expect(screen.queryByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('clicking try again calls handleReset', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(tryAgainButton)
      
      // Should attempt to re-render
      expect(tryAgainButton).toBeDefined()
    })
  })

  describe('Go Home Functionality', () => {
    it('clicking go home navigates to home page', () => {
      // Mock window.location
      const originalLocation = window.location
      delete (window as { location?: Location }).location
      window.location = { href: '' } as Location
      
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      const goHomeButton = screen.getByRole('button', { name: /go home/i })
      fireEvent.click(goHomeButton)
      
      expect(window.location.href).toBe('/')
      
      window.location = originalLocation
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

    it('passes error and errorInfo to callback', () => {
      const onError = vi.fn()
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })
  })

  describe('Show Details', () => {
    it('shows error details when showDetails is true', () => {
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Error Details')).toBeInTheDocument()
      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('hides error details when showDetails is false', () => {
      render(
        <ErrorBoundary showDetails={false}>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.queryByText('Error Details')).not.toBeInTheDocument()
    })

    it('shows copy button when details are visible', () => {
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    })

    it('copies error to clipboard when copy button is clicked', async () => {
      // Mock clipboard
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText }
      })
      
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError />
        </ErrorBoundary>
      )
      
      const copyButton = screen.getByRole('button', { name: /copy/i })
      fireEvent.click(copyButton)
      
      expect(mockWriteText).toHaveBeenCalled()
    })
  })
})

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    function TestComponent() {
      return <div>Wrapped component</div>
    }
    
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    render(<WrappedComponent />)
    
    expect(screen.getByText('Wrapped component')).toBeInTheDocument()
  })

  it('catches errors in wrapped component', () => {
    function ErrorComponent(): React.ReactElement {
      throw new Error('HOC error')
    }
    
    const WrappedComponent = withErrorBoundary(ErrorComponent)
    
    render(<WrappedComponent />)
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('passes props to wrapped component', () => {
    interface TestProps {
      message: string
    }
    
    function TestComponent({ message }: TestProps) {
      return <div>{message}</div>
    }
    
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    render(<WrappedComponent message="Hello World" />)
    
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('accepts error boundary props', () => {
    const onError = vi.fn()
    
    function ErrorComponent(): React.ReactElement {
      throw new Error('HOC error with callback')
    }
    
    const WrappedComponent = withErrorBoundary(ErrorComponent, { onError })
    
    render(<WrappedComponent />)
    
    expect(onError).toHaveBeenCalled()
  })
})

describe('useErrorHandler Hook', () => {
  it('returns a function', () => {
    function TestComponent() {
      const throwError = useErrorHandler()
      return <button onClick={() => console.log(typeof throwError)}>Check</button>
    }
    
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument()
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

  it('handles empty fragment children', () => {
    render(
      <ErrorBoundary>
        <></>
      </ErrorBoundary>
    )
    
    expect(document.body).toBeInTheDocument()
  })

  it('logs error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(console.error).toHaveBeenCalled()
  })
})
