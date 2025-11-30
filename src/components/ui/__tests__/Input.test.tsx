// ============================================
// TradingHub Pro - Input Component Tests
// ============================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { Input, NumberInput } from '../Input'
import { Search } from 'lucide-react'

describe('Input', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<Input label="Email" placeholder="Enter email" />)
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
    })

    it('renders with left icon', () => {
      render(<Input leftIcon={<Search data-testid="left-icon" />} />)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('renders with right icon', () => {
      render(<Input rightIcon={<Search data-testid="right-icon" />} />)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('renders hint text', () => {
      render(<Input hint="This is a helpful hint" />)
      expect(screen.getByText('This is a helpful hint')).toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('shows error state', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('shows success state', () => {
      render(<Input success="Email is valid" />)
      expect(screen.getByText('Email is valid')).toBeInTheDocument()
    })

    it('handles disabled state', () => {
      render(<Input disabled placeholder="Disabled" />)
      expect(screen.getByPlaceholderText('Disabled')).toBeDisabled()
    })
  })

  describe('Password Input', () => {
    it('renders password toggle button', () => {
      render(<Input type="password" placeholder="Password" />)
      const input = screen.getByPlaceholderText('Password')
      expect(input).toHaveAttribute('type', 'password')
      
      // Toggle button should be present
      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeInTheDocument()
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      render(<Input type="password" placeholder="Password" />)

      const input = screen.getByPlaceholderText('Password')
      expect(input).toHaveAttribute('type', 'password')

      const toggleButton = screen.getByRole('button')
      await user.click(toggleButton)

      expect(input).toHaveAttribute('type', 'text')

      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  describe('Interactions', () => {
    it('handles text input', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<Input placeholder="Type here" onChange={handleChange} />)
      const input = screen.getByPlaceholderText('Type here')

      await user.type(input, 'Hello')
      expect(handleChange).toHaveBeenCalled()
      expect(input).toHaveValue('Hello')
    })

    it('can be focused', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Focus me" />)

      await user.tab()
      expect(screen.getByPlaceholderText('Focus me')).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(<Input label="Username" placeholder="Enter username" />)
      const input = screen.getByPlaceholderText('Enter username')
      expect(input).toBeInTheDocument()
    })
  })
})

describe('NumberInput', () => {
  describe('Rendering', () => {
    it('renders with initial value', () => {
      render(<NumberInput value={10} onChange={() => {}} />)
      expect(screen.getByRole('spinbutton')).toHaveValue(10)
    })

    it('renders increment and decrement buttons', () => {
      render(<NumberInput value={10} onChange={() => {}} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })
  })

  describe('Interactions', () => {
    it('increments value when clicking up button', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<NumberInput value={10} onChange={handleChange} step={1} />)
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[0]) // Up button
      expect(handleChange).toHaveBeenCalledWith(11)
    })

    it('decrements value when clicking down button', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<NumberInput value={10} onChange={handleChange} step={1} />)
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[1]) // Down button
      expect(handleChange).toHaveBeenCalledWith(9)
    })

    it('respects min value', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<NumberInput value={0} onChange={handleChange} min={0} step={1} />)
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[1]) // Down button
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('respects max value', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<NumberInput value={100} onChange={handleChange} max={100} step={1} />)
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[0]) // Up button
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('handles custom step values', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<NumberInput value={10} onChange={handleChange} step={0.5} />)
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[0]) // Up button
      expect(handleChange).toHaveBeenCalledWith(10.5)
    })
  })

  describe('States', () => {
    it('disables buttons when disabled', () => {
      render(<NumberInput value={10} onChange={() => {}} disabled />)
      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toBeDisabled()
      expect(buttons[1]).toBeDisabled()
    })
  })
})
