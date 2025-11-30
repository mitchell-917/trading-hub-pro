// ============================================
// Watchlist Widget Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Watchlist } from '../Watchlist'

// Mock the useMarketData hook
vi.mock('@/hooks/useMarketData', () => ({
  useMarketData: () => ({
    ticker: {
      price: 50000,
      change: 1000,
      changePercent: 2.04,
      volume: 1000000000,
    },
    isLoading: false,
  }),
}))

// Mock the store with setSelectedSymbol function
vi.mock('@/lib/store', () => ({
  useTradingStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      watchlist: [
        { symbol: 'BTC', name: 'Bitcoin', addedAt: Date.now() },
        { symbol: 'ETH', name: 'Ethereum', addedAt: Date.now() - 1000 },
        { symbol: 'SOL', name: 'Solana', addedAt: Date.now() - 2000 },
      ],
      selectedSymbol: 'BTC',
      tickers: [
        { symbol: 'BTC', price: 50000, change: 1000, changePercent: 2.04 },
        { symbol: 'ETH', price: 2500, change: -50, changePercent: -1.96 },
        { symbol: 'SOL', price: 100, change: 5, changePercent: 5.26 },
      ],
      removeFromWatchlist: vi.fn(),
      addToWatchlist: vi.fn(),
      setSelectedSymbol: vi.fn(),
    }
    if (selector) {
      return selector(state)
    }
    return state
  },
}))

// Mock the Sparkline component
vi.mock('@/components/charts/Sparkline', () => ({
  Sparkline: () => <div data-testid="sparkline" />,
}))

describe('Watchlist', () => {
  const mockOnSelectSymbol = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the watchlist panel', () => {
      render(<Watchlist onSelectSymbol={mockOnSelectSymbol} />)
      expect(screen.getByText(/Watchlist/i)).toBeInTheDocument()
    })

    it('renders all watched symbols', () => {
      render(<Watchlist onSelectSymbol={mockOnSelectSymbol} />)
      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('ETH')).toBeInTheDocument()
      expect(screen.getByText('SOL')).toBeInTheDocument()
    })

    it('shows add button', () => {
      render(<Watchlist onSelectSymbol={mockOnSelectSymbol} />)
      expect(screen.getByText('Add')).toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Watchlist onSelectSymbol={mockOnSelectSymbol} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})

describe('Watchlist Empty State', () => {
  beforeEach(() => {
    vi.doMock('@/lib/store', () => ({
      useTradingStore: () => ({
        watchlist: [],
        selectedSymbol: '',
        tickers: [],
        removeFromWatchlist: vi.fn(),
        addToWatchlist: vi.fn(),
        setSelectedSymbol: vi.fn(),
      }),
    }))
  })

  it('handles empty watchlist gracefully', () => {
    render(<Watchlist onSelectSymbol={vi.fn()} />)
    expect(screen.getByText(/Watchlist/i)).toBeInTheDocument()
  })
})
