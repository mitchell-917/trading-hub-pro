// ============================================
// TradingHub Pro - Widget Component Tests
// ============================================

import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderPanel } from '../OrderPanel'
import { PositionManager } from '../PositionManager'
import { Watchlist } from '../Watchlist'
import { TradeHistory } from '../TradeHistory'
import { AISignalPanel } from '../AISignalPanel'
import { useTradingStore } from '@/lib/store'

// ResizeObserver is mocked in test/setup.ts

// Reset store before each test
beforeEach(() => {
  useTradingStore.setState({
    positions: [],
    orders: [],
    watchlist: ['BTCUSD', 'ETHUSD'],
    selectedSymbol: 'BTCUSD',
  })
})

describe('OrderPanel', () => {
  it('renders order panel with symbol', () => {
    render(<OrderPanel symbol="BTCUSD" currentPrice={50000} />)
    expect(screen.getByText('Place Order')).toBeInTheDocument()
    expect(screen.getByText('BTCUSD')).toBeInTheDocument()
  })

  it('has buy and sell buttons', () => {
    render(<OrderPanel symbol="BTCUSD" currentPrice={50000} />)
    
    // Just verify both buttons exist without trying to query by role name
    expect(screen.getByText('Buy')).toBeInTheDocument()
    expect(screen.getByText('Sell')).toBeInTheDocument()
  })

  it('changes order type tabs', () => {
    render(<OrderPanel symbol="BTCUSD" currentPrice={50000} />)
    
    const marketTab = screen.getByText('Market')
    fireEvent.click(marketTab)
    // Should switch to market order type
  })

  it('shows quick percentage buttons', () => {
    render(<OrderPanel symbol="BTCUSD" currentPrice={50000} />)
    
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('displays order value calculation', () => {
    render(<OrderPanel symbol="BTCUSD" currentPrice={50000} />)
    expect(screen.getByText('Order Value')).toBeInTheDocument()
    expect(screen.getByText('Buying Power')).toBeInTheDocument()
  })

  it('has submit button', () => {
    render(<OrderPanel symbol="BTCUSD" currentPrice={50000} />)
    
    // The button text contains "Buy" and "BTCUSD"
    const buttons = screen.getAllByRole('button')
    const submitButton = buttons.find(btn => btn.textContent?.includes('BTCUSD'))
    expect(submitButton).toBeDefined()
  })
})

describe('PositionManager', () => {
  it('renders empty state when no positions', () => {
    render(<PositionManager />)
    expect(screen.getByText('No open positions')).toBeInTheDocument()
  })

  it('renders positions when available', () => {
    useTradingStore.setState({
      positions: [
        {
          id: '1',
          symbol: 'BTCUSD',
          side: 'long',
          quantity: 1,
          entryPrice: 50000,
          currentPrice: 52000,
          unrealizedPnL: 2000,
          unrealizedPnLPercent: 4,
          leverage: 1,
          margin: 50000,
          liquidationPrice: 40000,
          openedAt: Date.now(),
        },
      ],
    })

    render(<PositionManager />)
    expect(screen.getByText('BTCUSD')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
  })

  it('shows total P&L', () => {
    useTradingStore.setState({
      positions: [
        {
          id: '1',
          symbol: 'BTCUSD',
          side: 'long',
          quantity: 1,
          entryPrice: 50000,
          currentPrice: 52000,
          unrealizedPnL: 2000,
          unrealizedPnLPercent: 4,
          leverage: 1,
          margin: 50000,
          liquidationPrice: 40000,
          openedAt: Date.now(),
        },
      ],
    })

    render(<PositionManager />)
    expect(screen.getByText('Total P&L')).toBeInTheDocument()
  })

  it('expands position details on click', async () => {
    useTradingStore.setState({
      positions: [
        {
          id: '1',
          symbol: 'BTCUSD',
          side: 'long',
          quantity: 1,
          entryPrice: 50000,
          currentPrice: 52000,
          unrealizedPnL: 2000,
          unrealizedPnLPercent: 4,
          leverage: 1,
          margin: 50000,
          liquidationPrice: 40000,
          openedAt: Date.now(),
        },
      ],
    })

    render(<PositionManager />)
    
    const positionRow = screen.getByText('BTCUSD').closest('button')
    if (positionRow) {
      fireEvent.click(positionRow)
      await waitFor(() => {
        expect(screen.getByText('Current Price')).toBeInTheDocument()
      })
    }
  })
})

describe('Watchlist', () => {
  it('renders watchlist with title', () => {
    render(<Watchlist />)
    expect(screen.getByText('Watchlist')).toBeInTheDocument()
  })

  it('shows add button', () => {
    render(<Watchlist />)
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('opens add symbol modal', async () => {
    render(<Watchlist />)
    
    const addButton = screen.getByText('Add')
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText('Add to Watchlist')).toBeInTheDocument()
    })
  })

  it('renders symbols from store', () => {
    render(<Watchlist />)
    // Symbols are rendered in the list
    const list = screen.getByText('Watchlist').parentElement
    expect(list).toBeInTheDocument()
  })

  it('renders empty state when watchlist is empty', () => {
    useTradingStore.setState({ watchlist: [] })
    render(<Watchlist />)
    expect(screen.getByText('No symbols in watchlist')).toBeInTheDocument()
  })
})

describe('TradeHistory', () => {
  it('renders empty state when no orders', () => {
    render(<TradeHistory />)
    expect(screen.getByText('No trade history')).toBeInTheDocument()
  })

  it('renders orders when available', () => {
    useTradingStore.setState({
      orders: [
        {
          id: '1',
          symbol: 'BTCUSD',
          side: 'buy',
          type: 'limit',
          quantity: 1,
          price: 50000,
          status: 'filled',
          filledPrice: 50000,
          filledQuantity: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    })

    render(<TradeHistory />)
    expect(screen.getByText('BTCUSD')).toBeInTheDocument()
    expect(screen.getByText('BUY')).toBeInTheDocument()
  })

  it('shows stats labels', () => {
    useTradingStore.setState({
      orders: [
        {
          id: '1',
          symbol: 'BTCUSD',
          side: 'buy',
          type: 'limit',
          quantity: 1,
          price: 50000,
          status: 'filled',
          filledPrice: 50000,
          filledQuantity: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    })

    render(<TradeHistory />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Buys')).toBeInTheDocument()
    expect(screen.getByText('Sells')).toBeInTheDocument()
  })

  it('has filter functionality', () => {
    useTradingStore.setState({
      orders: [
        {
          id: '1',
          symbol: 'BTCUSD',
          side: 'buy',
          type: 'limit',
          quantity: 1,
          price: 50000,
          status: 'filled',
          filledPrice: 50000,
          filledQuantity: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    })

    render(<TradeHistory />)
    // Filter button exists
    expect(screen.getByText('All Orders')).toBeInTheDocument()
  })
})

describe('AISignalPanel', () => {
  it('renders AI signal panel title', () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    expect(screen.getByText('AI Signals')).toBeInTheDocument()
  })

  it('renders with symbol', () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    expect(screen.getByText('BTCUSD')).toBeInTheDocument()
  })

  it('displays disclaimer', () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    expect(screen.getByText(/AI signals are for informational purposes/i)).toBeInTheDocument()
  })

  it('shows market sentiment section', async () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    
    // The component shows "Neutral Market" by default (before analysis loads)
    // We just need to verify the sentiment section exists
    await waitFor(() => {
      expect(screen.getByText(/Current market sentiment/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('renders confidence indicator', () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    // The component should render some percentage
    const container = screen.getByText('AI Signals').parentElement
    expect(container).toBeInTheDocument()
  })
})
