// ============================================
// Toast Component Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast, useToastActions } from '../Toast'
import { useRef, useEffect } from 'react'

// Simple test component
function TestComponent() {
  const { toasts, clearToasts } = useToast()
  const actions = useToastActions()
  
  return (
    <div>
      <button onClick={() => actions.success('Success!')}>Add Success</button>
      <button onClick={() => actions.error('Error!')}>Add Error</button>
      <button onClick={() => clearToasts()}>Clear All</button>
      <p data-testid="count">{toasts.length}</p>
    </div>
  )
}

const renderWithProvider = () => {
  return render(
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  )
}

describe('Toast Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ToastProvider', () => {
    it('renders children correctly', () => {
      renderWithProvider()
      expect(screen.getByText('Add Success')).toBeInTheDocument()
    })

    it('initializes with no toasts', () => {
      renderWithProvider()
      expect(screen.getByTestId('count')).toHaveTextContent('0')
    })
  })

  describe('useToast Hook', () => {
    it('provides toast state and methods', () => {
      const resultRef = { current: null as ReturnType<typeof useToast> | null }
      
      function HookTest() {
        const toastContext = useToast()
        const ref = useRef(resultRef)
        useEffect(() => {
          ref.current.current = toastContext
        }, [toastContext])
        return null
      }
      
      render(
        <ToastProvider>
          <HookTest />
        </ToastProvider>
      )
      
      expect(resultRef.current).toBeDefined()
      expect(Array.isArray(resultRef.current!.toasts)).toBe(true)
      expect(typeof resultRef.current!.addToast).toBe('function')
      expect(typeof resultRef.current!.removeToast).toBe('function')
      expect(typeof resultRef.current!.clearToasts).toBe('function')
    })
  })

  describe('useToastActions Hook', () => {
    it('provides convenience methods', () => {
      const resultRef = { current: null as ReturnType<typeof useToastActions> | null }
      
      function HookTest() {
        const actions = useToastActions()
        const ref = useRef(resultRef)
        useEffect(() => {
          ref.current.current = actions
        }, [actions])
        return null
      }
      
      render(
        <ToastProvider>
          <HookTest />
        </ToastProvider>
      )
      
      expect(resultRef.current).toBeDefined()
      expect(typeof resultRef.current!.success).toBe('function')
      expect(typeof resultRef.current!.error).toBe('function')
      expect(typeof resultRef.current!.warning).toBe('function')
      expect(typeof resultRef.current!.info).toBe('function')
    })
  })

  describe('Adding Toasts', () => {
    it('increments count when adding toast', () => {
      renderWithProvider()
      
      fireEvent.click(screen.getByText('Add Success'))
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })

    it('supports multiple toasts', () => {
      renderWithProvider()
      
      fireEvent.click(screen.getByText('Add Success'))
      fireEvent.click(screen.getByText('Add Error'))
      expect(screen.getByTestId('count')).toHaveTextContent('2')
    })
  })

  describe('Clearing Toasts', () => {
    it('clears all toasts', () => {
      renderWithProvider()
      
      fireEvent.click(screen.getByText('Add Success'))
      fireEvent.click(screen.getByText('Add Success'))
      expect(screen.getByTestId('count')).toHaveTextContent('2')
      
      fireEvent.click(screen.getByText('Clear All'))
      expect(screen.getByTestId('count')).toHaveTextContent('0')
    })
  })
})

describe('Toast Context Error Handling', () => {
  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    function BadComponent() {
      useToast()
      return null
    }
    
    expect(() => render(<BadComponent />)).toThrow()
    spy.mockRestore()
  })
})
