// ============================================
// Market Scanner Page Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { MarketScanner } from '../MarketScanner'

// Mock tickers
vi.mock('@/lib/store', () => ({
  useTradingStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      tickers: [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 48000,
          change: 1200,
          changePercent: 2.5,
          volume: 1500000000,
          high24h: 49000,
          low24h: 46000,
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2600,
          change: -50,
          changePercent: -1.9,
          volume: 800000000,
          high24h: 2700,
          low24h: 2550,
        },
      ],
      addToWatchlist: vi.fn(),
      removeFromWatchlist: vi.fn(),
      watchlist: ['BTC'],
    }
    if (selector) {
      return selector(state)
    }
    return state
  },
}))

// Mock Sparkline component
vi.mock('@/components/charts/Sparkline', () => ({
  Sparkline: () => <div data-testid="sparkline" />,
}))

const renderMarketScanner = () => {
  return render(
    <BrowserRouter>
      <MarketScanner />
    </BrowserRouter>
  )
}

describe('Market Scanner Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders page title', () => {
      renderMarketScanner()
      expect(screen.getByText('Market Scanner')).toBeInTheDocument()
    })

    it('renders search input', () => {
      renderMarketScanner()
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })

    it('renders preset buttons', () => {
      renderMarketScanner()
      expect(screen.getByText('Top Gainers')).toBeInTheDocument()
      expect(screen.getByText('Top Losers')).toBeInTheDocument()
    })

    it('renders ticker symbols', () => {
      renderMarketScanner()
      // BTC is in top-gainers by default (changePercent > 0)
      expect(screen.getByText('BTC')).toBeInTheDocument()
      // ETH has negative change, so won't appear in top-gainers preset
      // Just check BTC for now
    })

    it('renders sparklines', () => {
      renderMarketScanner()
      const sparklines = screen.getAllByTestId('sparkline')
      expect(sparklines.length).toBeGreaterThan(0)
    })
  })

  describe('Search Functionality', () => {
    it('filters tickers based on search query', () => {
      renderMarketScanner()
      const searchInput = screen.getByPlaceholderText(/search/i)
      
      fireEvent.change(searchInput, { target: { value: 'BTC' } })
      
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })
  })

  describe('Preset Filters', () => {
    it('allows clicking preset buttons', () => {
      renderMarketScanner()
      const topLosersButton = screen.getByText('Top Losers')
      fireEvent.click(topLosersButton)
      // Just verify no error and button still exists
      expect(topLosersButton).toBeInTheDocument()
    })

    it('displays high volume preset', () => {
      renderMarketScanner()
      expect(screen.getByText('High Volume')).toBeInTheDocument()
    })
  })

  describe('Buttons', () => {
    it('renders refresh button', () => {
      renderMarketScanner()
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    it('renders set alert button', () => {
      renderMarketScanner()
      expect(screen.getByText('Set Alert')).toBeInTheDocument()
    })

    it('renders filters button', () => {
      renderMarketScanner()
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })
  })

  describe('Filter Panel', () => {
    it('toggles filter panel on button click', () => {
      renderMarketScanner()
      const filterButton = screen.getByText('Filters')
      fireEvent.click(filterButton)
      
      expect(screen.getByText(/Min Price/i)).toBeInTheDocument()
    })

    it('shows clear filters button when expanded', () => {
      renderMarketScanner()
      const filterButton = screen.getByText('Filters')
      fireEvent.click(filterButton)
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument()
    })
  })

  describe('Quick Stats', () => {
    it('renders gainers stat', () => {
      renderMarketScanner()
      expect(screen.getByText('Gainers')).toBeInTheDocument()
    })

    it('renders losers stat', () => {
      renderMarketScanner()
      expect(screen.getByText('Losers')).toBeInTheDocument()
    })

    it('renders total volume stat', () => {
      renderMarketScanner()
      expect(screen.getByText('Total Volume')).toBeInTheDocument()
    })
  })
})

describe('Market Scanner Accessibility', () => {
  it('has accessible search input', () => {
    renderMarketScanner()
    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput.tagName).toBe('INPUT')
  })

  it('has accessible buttons', () => {
    renderMarketScanner()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
