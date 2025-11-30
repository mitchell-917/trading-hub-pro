// ============================================
// TradingHub Pro - Button Component Tests
// ============================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'
import { ArrowRight, Plus } from 'lucide-react'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('renders with different variants', () => {
      const variants = ['primary', 'secondary', 'success', 'danger', 'ghost', 'outline'] as const

      variants.forEach((variant) => {
        const { unmount } = render(<Button variant={variant}>{variant}</Button>)
        expect(screen.getByRole('button', { name: variant })).toBeInTheDocument()
        unmount()
      })
    })

    it('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      sizes.forEach((size) => {
        const { unmount } = render(<Button size={size}>{size}</Button>)
        expect(screen.getByRole('button', { name: size })).toBeInTheDocument()
        unmount()
      })
    })

    it('renders with left icon', () => {
      render(<Button leftIcon={<Plus data-testid="left-icon" />}>Add Item</Button>)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('renders with right icon', () => {
      render(<Button rightIcon={<ArrowRight data-testid="right-icon" />}>Next</Button>)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('renders full width when specified', () => {
      render(<Button fullWidth>Full Width</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('shows loading state', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      // Loading spinner should be present
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('hides left icon when loading', () => {
      render(
        <Button isLoading leftIcon={<Plus data-testid="left-icon" />}>
          Loading
        </Button>
      )
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      )
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Button isLoading onClick={handleClick}>
          Loading
        </Button>
      )
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has correct role', () => {
      render(<Button>Accessible</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('can be focused', async () => {
      const user = userEvent.setup()
      render(<Button>Focus me</Button>)

      await user.tab()
      expect(screen.getByRole('button')).toHaveFocus()
    })

    it('can be activated with keyboard', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Press Enter</Button>)

      await user.tab()
      await user.keyboard('{Enter}')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
