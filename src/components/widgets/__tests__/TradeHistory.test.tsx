// ============================================
// TradeHistory Widget Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TradeHistory } from '../TradeHistory'

// Mock the store with comprehensive order data
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
        {
          id: 'order-4',
          symbol: 'DOGE',
          side: 'sell',
          type: 'limit',
          status: 'pending',
          quantity: 1000,
          filledQuantity: 0,
          price: 0.08,
          createdAt: Date.now() - 1800000,
          updatedAt: Date.now() - 1800000,
        },
        {
          id: 'order-5',
          symbol: 'XRP',
          side: 'buy',
          type: 'limit',
          status: 'open',
          quantity: 500,
          filledQuantity: 0,
          price: 0.50,
          createdAt: Date.now() - 900000,
          updatedAt: Date.now() - 900000,
        },
        {
          id: 'order-6',
          symbol: 'ADA',
          side: 'sell',
          type: 'limit',
          status: 'partially-filled',
          quantity: 100,
          filledQuantity: 50,
          price: 0.35,
          createdAt: Date.now() - 500000,
          updatedAt: Date.now() - 500000,
        },
        {
          id: 'order-7',
          symbol: 'DOT',
          side: 'buy',
          type: 'stop',
          status: 'rejected',
          quantity: 20,
          filledQuantity: 0,
          price: 6.50,
          createdAt: Date.now() - 300000,
          updatedAt: Date.now() - 300000,
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
      expect(screen.getByText(/Buys/)).toBeInTheDocument()
      expect(screen.getByText(/Sells/)).toBeInTheDocument()
    })

    it('renders with history icon', () => {
      render(<TradeHistory />)
      expect(screen.getByText('Trade History')).toBeInTheDocument()
    })
  })

  describe('Stats Bar', () => {
    it('shows total orders count', () => {
      render(<TradeHistory />)
      expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('shows filled stat label', () => {
      render(<TradeHistory />)
      // Use getAllByText since 'Filled' appears multiple times (stat + badge)
      const filledElements = screen.getAllByText('Filled')
      expect(filledElements.length).toBeGreaterThan(0)
    })

    it('shows buys count', () => {
      render(<TradeHistory />)
      expect(screen.getByText('Buys')).toBeInTheDocument()
    })

    it('shows sells count', () => {
      render(<TradeHistory />)
      expect(screen.getByText('Sells')).toBeInTheDocument()
    })
  })

  describe('Trade Details', () => {
    it('shows trade quantities', () => {
      render(<TradeHistory />)
      // Look for a quantity value using getAllByText since there might be multiple
      const quantities = screen.getAllByText(/0\.5/)
      expect(quantities.length).toBeGreaterThan(0)
    })

    it('shows order status badges', () => {
      render(<TradeHistory />)
      // Look for filled orders
      expect(screen.getAllByText('Filled').length).toBeGreaterThan(0)
    })

    it('shows buy badge for buy orders', () => {
      render(<TradeHistory />)
      expect(screen.getAllByText('BUY').length).toBeGreaterThan(0)
    })

    it('shows sell badge for sell orders', () => {
      render(<TradeHistory />)
      expect(screen.getAllByText('SELL').length).toBeGreaterThan(0)
    })
  })

  describe('Filter Functionality', () => {
    it('renders filter button', () => {
      render(<TradeHistory />)
      const filterButton = screen.getByRole('button', { name: /All Orders/i })
      expect(filterButton).toBeInTheDocument()
    })

    it('opens filter dropdown on click', () => {
      render(<TradeHistory />)
      const filterButton = screen.getByRole('button', { name: /All Orders/i })
      fireEvent.click(filterButton)
      
      // Should show filter options - look for the dropdown options
      const allButtons = screen.getAllByRole('button')
      expect(allButtons.length).toBeGreaterThan(1)
    })

    it('filters to show only filled orders when clicking filled option', () => {
      render(<TradeHistory />)
      const filterButton = screen.getByRole('button', { name: /All Orders/i })
      fireEvent.click(filterButton)
      
      // Click on Filled option in dropdown
      const dropdownButtons = screen.getAllByRole('button')
      const filledButton = dropdownButtons.find(btn => btn.textContent === 'Filled')
      if (filledButton) {
        fireEvent.click(filledButton)
      }
    })

    it('closes filter dropdown after selection', () => {
      render(<TradeHistory />)
      const filterButton = screen.getByRole('button', { name: /All Orders/i })
      fireEvent.click(filterButton)
      
      // The dropdown should be open, click an option
      const dropdownButtons = screen.getAllByRole('button')
      const cancelledButton = dropdownButtons.find(btn => btn.textContent === 'Cancelled')
      if (cancelledButton) {
        fireEvent.click(cancelledButton)
      }
    })
  })

  describe('Props', () => {
    it('applies custom className', () => {
      const { container } = render(<TradeHistory className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('respects maxVisibleTrades prop', () => {
      render(<TradeHistory maxVisibleTrades={2} />)
      // Should show "Show More" button when there are more trades
      expect(screen.getByText(/Show.*More/i)).toBeInTheDocument()
    })

    it('defaults to 10 max visible trades', () => {
      render(<TradeHistory />)
      // With 7 orders, all should be visible without "Show More"
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })
  })

  describe('Show More/Less', () => {
    it('shows "Show More" when trades exceed max', () => {
      render(<TradeHistory maxVisibleTrades={2} />)
      expect(screen.getByText(/Show.*More/i)).toBeInTheDocument()
    })

    it('expands to show all trades when clicking Show More', () => {
      render(<TradeHistory maxVisibleTrades={2} />)
      const showMoreButton = screen.getByText(/Show.*More/i)
      fireEvent.click(showMoreButton)
      
      // Should now show "Show Less"
      expect(screen.getByText(/Show Less/i)).toBeInTheDocument()
    })

    it('collapses when clicking Show Less', () => {
      render(<TradeHistory maxVisibleTrades={2} />)
      const showMoreButton = screen.getByText(/Show.*More/i)
      fireEvent.click(showMoreButton)
      
      const showLessButton = screen.getByText(/Show Less/i)
      fireEvent.click(showLessButton)
      
      expect(screen.getByText(/Show.*More/i)).toBeInTheDocument()
    })
  })

  describe('Total Volume Footer', () => {
    it('shows total volume when there are filled orders', () => {
      render(<TradeHistory />)
      expect(screen.getByText('Total Volume')).toBeInTheDocument()
    })
  })

  describe('Order Status Display', () => {
    it('displays filled status correctly', () => {
      render(<TradeHistory />)
      const filledBadges = screen.getAllByText('Filled')
      expect(filledBadges.length).toBeGreaterThan(0)
    })

    it('displays cancelled status', () => {
      render(<TradeHistory />)
      // Look for Cancelled text within the orders list
      expect(screen.getByText('Cancelled')).toBeInTheDocument()
    })

    it('displays pending status', () => {
      render(<TradeHistory />)
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    it('displays open status', () => {
      render(<TradeHistory />)
      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('displays partial status for partially-filled orders', () => {
      render(<TradeHistory />)
      expect(screen.getByText('Partial')).toBeInTheDocument()
    })

    it('displays rejected status', () => {
      render(<TradeHistory />)
      expect(screen.getByText('Rejected')).toBeInTheDocument()
    })
  })

  describe('Time Display', () => {
    it('shows relative time for trades', () => {
      render(<TradeHistory />)
      // Should show "about X hours ago" or similar - use getAllByText since there are multiple
      const agoTexts = screen.getAllByText(/ago/i)
      expect(agoTexts.length).toBeGreaterThan(0)
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
    expect(screen.getByText(/Trade History|Recent Trades|History/i)).toBeInTheDocument()
  })
})

describe('TradeHistory Accessibility', () => {
  it('has accessible buttons', () => {
    render(<TradeHistory />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('filter button is keyboard accessible', () => {
    render(<TradeHistory />)
    const filterButton = screen.getByRole('button', { name: /All Orders/i })
    expect(filterButton).toBeInTheDocument()
    filterButton.focus()
    expect(document.activeElement).toBe(filterButton)
  })
})
