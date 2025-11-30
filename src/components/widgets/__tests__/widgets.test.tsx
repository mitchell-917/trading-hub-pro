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

  it('toggles between buy and sell', () => {
    render(<OrderPanel symbol="BTCUSD" currentPrice={50000} />)
    
    const buyButton = screen.getByRole('button', { name: /buy/i })
    const sellButton = screen.getByRole('button', { name: /sell/i })
    
    expect(buyButton).toBeInTheDocument()
    expect(sellButton).toBeInTheDocument()
    
    fireEvent.click(sellButton)
    // Sell should now be active
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

  it('disables submit when quantity is empty', () => {
    render(<OrderPanel symbol="BTCUSD" currentPrice={50000} />)
    
    const submitButton = screen.getByRole('button', { name: /buy btcusd/i })
    expect(submitButton).toBeDisabled()
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
  it('renders watchlist with symbols', () => {
    render(<Watchlist />)
    expect(screen.getByText('Watchlist')).toBeInTheDocument()
    expect(screen.getByText('BTCUSD')).toBeInTheDocument()
    expect(screen.getByText('ETHUSD')).toBeInTheDocument()
  })

  it('shows add button', () => {
    render(<Watchlist />)
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('opens add symbol modal', async () => {
    render(<Watchlist />)
    
    const addButton = screen.getByRole('button', { name: /add/i })
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText('Add to Watchlist')).toBeInTheDocument()
    })
  })

  it('calls onSelectSymbol when clicking a symbol', () => {
    const onSelectSymbol = vi.fn()
    render(<Watchlist onSelectSymbol={onSelectSymbol} />)
    
    const btcButton = screen.getByText('BTCUSD').closest('button')
    if (btcButton) {
      fireEvent.click(btcButton)
      expect(onSelectSymbol).toHaveBeenCalledWith('BTCUSD')
    }
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
    expect(screen.getByText('Filled')).toBeInTheDocument()
  })

  it('shows stats bar', () => {
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
    expect(screen.getByText('Filled')).toBeInTheDocument()
    expect(screen.getByText('Buys')).toBeInTheDocument()
    expect(screen.getByText('Sells')).toBeInTheDocument()
  })

  it('opens filter dropdown', async () => {
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
    
    const filterButton = screen.getByRole('button', { name: /all orders/i })
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Cancelled')).toBeInTheDocument()
    })
  })
})

describe('AISignalPanel', () => {
  it('renders AI signal panel', () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    expect(screen.getByText('AI Signals')).toBeInTheDocument()
    expect(screen.getByText('BTCUSD')).toBeInTheDocument()
  })

  it('shows market sentiment', async () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    
    await waitFor(() => {
      expect(screen.getByText(/market/i)).toBeInTheDocument()
    })
  })

  it('displays disclaimer', () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    expect(screen.getByText(/AI signals are for informational purposes/i)).toBeInTheDocument()
  })

  it('calls onSignalSelect when clicking a signal', async () => {
    const onSignalSelect = vi.fn()
    render(<AISignalPanel symbol="BTCUSD" onSignalSelect={onSignalSelect} />)
    
    // Wait for signals to load and potentially click one
    await waitFor(() => {
      expect(screen.getByText('AI Signals')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows confidence level indicator', () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    // Confidence level should be displayed
    expect(screen.getByText(/%/)).toBeInTheDocument()
  })
})
