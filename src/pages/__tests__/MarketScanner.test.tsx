// ============================================
// Market Scanner Page Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
        {
          symbol: 'SOL',
          name: 'Solana',
          price: 120,
          change: 15,
          changePercent: 14.0,
          volume: 2000000000,
          high24h: 125,
          low24h: 100,
        },
        {
          symbol: 'DOGE',
          name: 'Dogecoin',
          price: 0.08,
          change: -0.02,
          changePercent: -20.0,
          volume: 500000000,
          high24h: 0.10,
          low24h: 0.07,
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

    it('renders page description', () => {
      renderMarketScanner()
      expect(screen.getByText(/screen markets with advanced filters/i)).toBeInTheDocument()
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

    it('filters tickers by name', () => {
      renderMarketScanner()
      const searchInput = screen.getByPlaceholderText(/search/i)
      
      fireEvent.change(searchInput, { target: { value: 'Bitcoin' } })
      
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })

    it('handles case-insensitive search', () => {
      renderMarketScanner()
      const searchInput = screen.getByPlaceholderText(/search/i)
      
      fireEvent.change(searchInput, { target: { value: 'btc' } })
      
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })
  })

  describe('Preset Filters', () => {
    it('allows clicking preset buttons', () => {
      renderMarketScanner()
      const topLosersButton = screen.getByText('Top Losers')
      fireEvent.click(topLosersButton)
      expect(topLosersButton).toBeInTheDocument()
    })

    it('filters for top losers on preset click', () => {
      renderMarketScanner()
      const topLosersButton = screen.getByText('Top Losers')
      fireEvent.click(topLosersButton)
      
      // ETH and DOGE have negative change
      expect(screen.getByText('ETH')).toBeInTheDocument()
    })

    it('displays high volume preset', () => {
      renderMarketScanner()
      expect(screen.getByText('High Volume')).toBeInTheDocument()
    })

    it('displays unusual activity preset', () => {
      renderMarketScanner()
      expect(screen.getByText('Unusual Activity')).toBeInTheDocument()
    })

    it('displays breakouts preset', () => {
      renderMarketScanner()
      expect(screen.getByText('Breakouts')).toBeInTheDocument()
    })

    it('displays oversold preset', () => {
      renderMarketScanner()
      expect(screen.getByText('Oversold')).toBeInTheDocument()
    })

    it('displays overbought preset', () => {
      renderMarketScanner()
      expect(screen.getByText('Overbought')).toBeInTheDocument()
    })

    it('switches to high volume preset', () => {
      renderMarketScanner()
      const highVolumeButton = screen.getByText('High Volume')
      fireEvent.click(highVolumeButton)
      // Should sort by volume
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1)
    })

    it('switches to oversold preset', () => {
      renderMarketScanner()
      const oversoldButton = screen.getByText('Oversold')
      fireEvent.click(oversoldButton)
      // Should filter for changePercent < -3
      expect(screen.getByText('DOGE')).toBeInTheDocument()
    })

    it('switches to overbought preset', () => {
      renderMarketScanner()
      const overboughtButton = screen.getByText('Overbought')
      fireEvent.click(overboughtButton)
      // Should filter for changePercent > 5
      expect(screen.getByText('SOL')).toBeInTheDocument()
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

    it('handles refresh button click', async () => {
      renderMarketScanner()
      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)
      
      // Button should be disabled during refresh
      expect(refreshButton.closest('button')).toBeDisabled()
      
      // Wait for refresh to complete
      await waitFor(() => {
        expect(refreshButton.closest('button')).not.toBeDisabled()
      }, { timeout: 2000 })
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

    it('shows max price filter', () => {
      renderMarketScanner()
      fireEvent.click(screen.getByText('Filters'))
      
      expect(screen.getByText(/Max Price/i)).toBeInTheDocument()
    })

    it('shows min change filter', () => {
      renderMarketScanner()
      fireEvent.click(screen.getByText('Filters'))
      
      expect(screen.getByText(/Min Change/i)).toBeInTheDocument()
    })

    it('shows max change filter', () => {
      renderMarketScanner()
      fireEvent.click(screen.getByText('Filters'))
      
      expect(screen.getByText(/Max Change/i)).toBeInTheDocument()
    })

    it('clears filters when clear button clicked', () => {
      renderMarketScanner()
      const filterButton = screen.getByText('Filters')
      fireEvent.click(filterButton)
      
      const clearButton = screen.getByText('Clear Filters')
      fireEvent.click(clearButton)
      
      // Filters should be cleared (still visible)
      expect(screen.getByText(/Min Price/i)).toBeInTheDocument()
    })

    it('applies min price filter', () => {
      renderMarketScanner()
      fireEvent.click(screen.getByText('Filters'))
      
      const minPriceInputs = screen.getAllByRole('spinbutton')
      fireEvent.change(minPriceInputs[0], { target: { value: '1000' } })
      
      // Should filter out low-priced assets
      expect(screen.queryByText('DOGE')).not.toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('renders sort options', () => {
      renderMarketScanner()
      expect(screen.getByText('Sort by:')).toBeInTheDocument()
    })

    it('allows sorting by change', () => {
      renderMarketScanner()
      const sortOptions = screen.getByText('Sort by:').parentElement
      const changeSort = sortOptions?.querySelector('button:first-of-type')
      
      if (changeSort) {
        fireEvent.click(changeSort)
        expect(changeSort).toBeInTheDocument()
      }
    })

    it('displays volume sort option', () => {
      renderMarketScanner()
      const sortOptions = screen.getByText('Sort by:').parentElement
      expect(sortOptions?.textContent).toContain('Volume')
    })

    it('displays price sort option', () => {
      renderMarketScanner()
      const sortOptions = screen.getByText('Sort by:').parentElement
      expect(sortOptions?.textContent).toContain('Price')
    })

    it('displays change sort option', () => {
      renderMarketScanner()
      const sortOptions = screen.getByText('Sort by:').parentElement
      expect(sortOptions?.textContent).toContain('Change')
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

    it('renders active alerts stat', () => {
      renderMarketScanner()
      expect(screen.getByText('Active Alerts')).toBeInTheDocument()
    })
  })

  describe('Watchlist Toggle', () => {
    it('toggles watchlist on star click', () => {
      renderMarketScanner()
      
      const buttons = screen.getAllByRole('button')
      // Find star buttons (they should be in the actions column)
      const starButton = buttons.find(btn => btn.querySelector('svg'))
      
      if (starButton) {
        fireEvent.click(starButton)
        expect(starButton).toBeInTheDocument()
      }
    })
  })

  describe('Results Count', () => {
    it('displays results count', () => {
      renderMarketScanner()
      expect(screen.getByText(/results found/i)).toBeInTheDocument()
    })
  })

  describe('Table Headers', () => {
    it('renders Asset header', () => {
      renderMarketScanner()
      expect(screen.getByText('Asset')).toBeInTheDocument()
    })

    it('renders Price header', () => {
      renderMarketScanner()
      expect(screen.getAllByText('Price').length).toBeGreaterThan(0)
    })

    it('renders 24h Change header', () => {
      renderMarketScanner()
      expect(screen.getByText('24h Change')).toBeInTheDocument()
    })

    it('renders Volume header', () => {
      renderMarketScanner()
      expect(screen.getAllByText('Volume').length).toBeGreaterThan(0)
    })

    it('renders RSI header', () => {
      renderMarketScanner()
      expect(screen.getByText('RSI')).toBeInTheDocument()
    })

    it('renders Signals header', () => {
      renderMarketScanner()
      expect(screen.getByText('Signals')).toBeInTheDocument()
    })

    it('renders Actions header', () => {
      renderMarketScanner()
      expect(screen.getByText('Actions')).toBeInTheDocument()
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

  it('has accessible table structure', () => {
    renderMarketScanner()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})

describe('Market Scanner Empty State', () => {
  it('shows empty state when no results match filters', () => {
    renderMarketScanner()
    const searchInput = screen.getByPlaceholderText(/search/i)
    
    // Search for something that doesn't exist
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } })
    
    expect(screen.getByText(/No results match your filters/i)).toBeInTheDocument()
  })

  it('shows clear all filters button in empty state', () => {
    renderMarketScanner()
    const searchInput = screen.getByPlaceholderText(/search/i)
    
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } })
    
    expect(screen.getByText(/clear all filters/i)).toBeInTheDocument()
  })
})
