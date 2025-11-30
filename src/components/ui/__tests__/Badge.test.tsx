// ============================================
// TradingHub Pro - Badge Component Tests
// ============================================

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Badge, StatusBadge, SignalBadge } from '../Badge'

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Badge>Default</Badge>)
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('renders with different variants', () => {
      const variants = ['default', 'success', 'warning', 'danger', 'info', 'outline'] as const

      variants.forEach((variant) => {
        const { unmount } = render(<Badge variant={variant}>{variant}</Badge>)
        expect(screen.getByText(variant)).toBeInTheDocument()
        unmount()
      })
    })

    it('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      sizes.forEach((size) => {
        const { unmount } = render(<Badge size={size}>{size}</Badge>)
        expect(screen.getByText(size)).toBeInTheDocument()
        unmount()
      })
    })

    it('renders with dot indicator', () => {
      render(<Badge dot data-testid="badge">With Dot</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.querySelector('.w-2.h-2')).toBeInTheDocument()
    })

    it('renders with pulse animation', () => {
      render(<Badge dot pulse data-testid="badge">Pulsing</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.querySelector('.animate-ping')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Badge className="custom-class" data-testid="badge">Custom</Badge>)
      expect(screen.getByTestId('badge')).toHaveClass('custom-class')
    })
  })
})

describe('StatusBadge', () => {
  it('renders open status', () => {
    render(<StatusBadge status="open" />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders pending status', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders filled status', () => {
    render(<StatusBadge status="filled" />)
    expect(screen.getByText('Filled')).toBeInTheDocument()
  })

  it('renders cancelled status', () => {
    render(<StatusBadge status="cancelled" />)
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('renders rejected status', () => {
    render(<StatusBadge status="rejected" />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('renders partially-filled status', () => {
    render(<StatusBadge status="partially-filled" />)
    expect(screen.getByText('Partial')).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<StatusBadge status="open" size="sm" />)
    expect(screen.getByText('Open')).toBeInTheDocument()

    rerender(<StatusBadge status="open" size="lg" />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })
})

describe('SignalBadge', () => {
  it('renders bullish signal', () => {
    render(<SignalBadge direction="bullish" />)
    expect(screen.getByText(/bullish/i)).toBeInTheDocument()
  })

  it('renders bearish signal', () => {
    render(<SignalBadge direction="bearish" />)
    expect(screen.getByText(/bearish/i)).toBeInTheDocument()
  })

  it('renders neutral signal', () => {
    render(<SignalBadge direction="neutral" />)
    expect(screen.getByText(/neutral/i)).toBeInTheDocument()
  })

  it('renders with strength indicator', () => {
    render(<SignalBadge direction="bullish" strength="strong" />)
    expect(screen.getByText(/strong/i)).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<SignalBadge direction="bullish" size="sm" />)
    expect(screen.getByText(/bullish/i)).toBeInTheDocument()

    rerender(<SignalBadge direction="bullish" size="lg" />)
    expect(screen.getByText(/bullish/i)).toBeInTheDocument()
  })
})
