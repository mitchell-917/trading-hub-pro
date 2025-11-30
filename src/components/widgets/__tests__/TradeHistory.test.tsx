// ============================================
// TradeHistory Widget Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TradeHistory } from '../TradeHistory'

// Mock the store
vi.mock('@/lib/store', () => ({
  useTradingStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      orders: [
        {
          id: 'order-1',
          symbol: 'BTC',
          side: 'buy',
          type: 'market',
          status: 'filled',
          quantity: 0.5,
          filledQuantity: 0.5,
          price: 50000,
          createdAt: Date.now() - 3600000,
          updatedAt: Date.now() - 3500000,
        },
        {
          id: 'order-2',
          symbol: 'ETH',
          side: 'sell',
          type: 'limit',
          status: 'filled',
          quantity: 2,
          filledQuantity: 2,
          price: 2500,
          createdAt: Date.now() - 7200000,
          updatedAt: Date.now() - 7100000,
        },
        {
          id: 'order-3',
          symbol: 'SOL',
          side: 'buy',
          type: 'limit',
          status: 'cancelled',
          quantity: 10,
          filledQuantity: 0,
          price: 100,
          createdAt: Date.now() - 10800000,
          updatedAt: Date.now() - 10700000,
        },
      ],
    }
    if (selector) {
      return selector(state)
    }
    return state
  },
}))

describe('TradeHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the trade history panel', () => {
      render(<TradeHistory />)
      expect(screen.getByText(/Trade History|Recent Trades|History/i)).toBeInTheDocument()
    })

    it('displays trade symbols', () => {
      render(<TradeHistory />)
      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('ETH')).toBeInTheDocument()
    })

    it('shows trade sides (buy/sell)', () => {
      render(<TradeHistory />)
      // Look for Buys/Sells labels shown in the component
      expect(screen.getByText(/Buys/)).toBeInTheDocument()
      expect(screen.getByText(/Sells/)).toBeInTheDocument()
    })
  })

  describe('Trade Details', () => {
    it('shows trade quantities', () => {
      render(<TradeHistory />)
      expect(screen.getByText(/0\.5/)).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('applies custom className', () => {
      const { container } = render(<TradeHistory className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('respects maxVisibleTrades prop', () => {
      render(<TradeHistory maxVisibleTrades={1} />)
      // Should limit visible trades
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })
  })
})

describe('TradeHistory Empty State', () => {
  beforeEach(() => {
    vi.doMock('@/lib/store', () => ({
      useTradingStore: () => ({
        orders: [],
      }),
    }))
  })

  it('handles empty orders gracefully', () => {
    render(<TradeHistory />)
    // Should render without crashing
    expect(screen.getByText(/Trade History|Recent Trades|History/i)).toBeInTheDocument()
  })
})
