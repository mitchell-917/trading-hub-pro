// ============================================
// Store Tests - Testing Zustand stores
// ============================================

import { describe, it, expect, beforeEach } from 'vitest'
import { useTradingStore, usePortfolioStore, useChartStore, useUIStore, useOrdersStore, useWatchlistStore } from '../store'
import { act } from '@testing-library/react'
import type { Position, Order, Ticker } from '@/types'

// Helper to create a valid Position
const createPosition = (overrides: Partial<Position> = {}): Position => ({
  id: 'pos-1',
  symbol: 'BTC',
  name: 'Bitcoin',
  quantity: 1,
  averagePrice: 40000,
  currentPrice: 45000,
  pnl: 5000,
  pnlPercent: 12.5,
  allocation: 50,
  lastUpdated: Date.now(),
  side: 'long',
  entryPrice: 40000,
  unrealizedPnL: 5000,
  unrealizedPnLPercent: 12.5,
  leverage: 1,
  ...overrides,
})

// Helper to create a valid Order
const createOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'order-1',
  symbol: 'BTC',
  side: 'buy',
  type: 'limit',
  status: 'pending',
  quantity: 1,
  filledQuantity: 0,
  price: 45000,
  timeInForce: 'gtc',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

// Helper to create a valid Ticker
const createTicker = (overrides: Partial<Ticker> = {}): Ticker => ({
  symbol: 'BTC',
  name: 'Bitcoin',
  price: 45000,
  change: 100,
  changePercent: 0.22,
  volume: 1000000,
  high24h: 46000,
  low24h: 44000,
  marketCap: 1000000000,
  lastUpdated: Date.now(),
  ...overrides,
})

describe('useTradingStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTradingStore.setState({
      activeSymbol: 'BTC',
      selectedSymbol: 'BTC',
      positions: [],
      orders: [],
      watchlist: [],
      settings: {
        theme: 'dark',
        notifications: true,
        sound: true,
      },
    })
  })

  describe('Initial State', () => {
    it('has initial tickers', () => {
      const { tickers } = useTradingStore.getState()
      expect(Array.isArray(tickers)).toBe(true)
    })

    it('has initial active symbol', () => {
      const { activeSymbol } = useTradingStore.getState()
      expect(activeSymbol).toBe('BTC')
    })

    it('has settings with default values', () => {
      const { settings } = useTradingStore.getState()
      expect(settings).toEqual({
        theme: 'dark',
        notifications: true,
        sound: true,
      })
    })
  })

  describe('setActiveSymbol', () => {
    it('updates active symbol', () => {
      act(() => {
        useTradingStore.getState().setActiveSymbol('ETH')
      })
      
      const { activeSymbol } = useTradingStore.getState()
      expect(activeSymbol).toBe('ETH')
    })
  })

  describe('setSelectedSymbol', () => {
    it('updates selected symbol', () => {
      act(() => {
        useTradingStore.getState().setSelectedSymbol('SOL')
      })
      
      const { selectedSymbol } = useTradingStore.getState()
      expect(selectedSymbol).toBe('SOL')
    })
  })

  describe('updateTickers', () => {
    it('replaces all tickers', () => {
      const newTickers = [createTicker({ symbol: 'TEST', name: 'Test Token', price: 100 })]
      
      act(() => {
        useTradingStore.getState().updateTickers(newTickers)
      })
      
      const { tickers } = useTradingStore.getState()
      expect(tickers).toEqual(newTickers)
    })
  })

  describe('updateTicker', () => {
    it('updates a specific ticker', () => {
      const initial = useTradingStore.getState().tickers
      if (initial.length > 0) {
        const firstTicker = { ...initial[0], price: 99999 }
        
        act(() => {
          useTradingStore.getState().updateTicker(firstTicker)
        })
        
        const { tickers } = useTradingStore.getState()
        const updated = tickers.find(t => t.symbol === firstTicker.symbol)
        expect(updated?.price).toBe(99999)
      }
    })
  })

  describe('closePosition', () => {
    it('removes a position by id', () => {
      const testPosition = createPosition({ id: 'test-1' })
      
      useTradingStore.setState({ positions: [testPosition] })
      
      act(() => {
        useTradingStore.getState().closePosition('test-1')
      })
      
      const { positions } = useTradingStore.getState()
      expect(positions).toHaveLength(0)
    })

    it('does not affect other positions', () => {
      const positions = [
        createPosition({ id: 'pos-1', symbol: 'BTC' }),
        createPosition({ id: 'pos-2', symbol: 'ETH', name: 'Ethereum' }),
      ]
      
      useTradingStore.setState({ positions })
      
      act(() => {
        useTradingStore.getState().closePosition('pos-1')
      })
      
      const state = useTradingStore.getState()
      expect(state.positions).toHaveLength(1)
      expect(state.positions[0].id).toBe('pos-2')
    })
  })

  describe('addOrder', () => {
    it('adds order to the beginning of orders array', () => {
      const testOrder = createOrder()
      
      act(() => {
        useTradingStore.getState().addOrder(testOrder)
      })
      
      const { orders } = useTradingStore.getState()
      expect(orders[0]).toEqual(testOrder)
    })
  })

  describe('addToWatchlist', () => {
    it('adds item to watchlist', () => {
      const watchlistItem = { symbol: 'DOGE', name: 'Dogecoin', addedAt: Date.now() }
      
      act(() => {
        useTradingStore.getState().addToWatchlist(watchlistItem)
      })
      
      const { watchlist } = useTradingStore.getState()
      expect(watchlist).toContainEqual(watchlistItem)
    })
  })

  describe('removeFromWatchlist', () => {
    it('removes item from watchlist by symbol', () => {
      const watchlistItem = { symbol: 'DOGE', name: 'Dogecoin', addedAt: Date.now() }
      useTradingStore.setState({ watchlist: [watchlistItem] })
      
      act(() => {
        useTradingStore.getState().removeFromWatchlist('DOGE')
      })
      
      const { watchlist } = useTradingStore.getState()
      expect(watchlist).toHaveLength(0)
    })
  })

  describe('updateSettings', () => {
    it('updates theme setting', () => {
      act(() => {
        useTradingStore.getState().updateSettings({ theme: 'light' })
      })
      
      const { settings } = useTradingStore.getState()
      expect(settings.theme).toBe('light')
    })

    it('updates notifications setting', () => {
      act(() => {
        useTradingStore.getState().updateSettings({ notifications: false })
      })
      
      const { settings } = useTradingStore.getState()
      expect(settings.notifications).toBe(false)
    })

    it('updates sound setting', () => {
      act(() => {
        useTradingStore.getState().updateSettings({ sound: false })
      })
      
      const { settings } = useTradingStore.getState()
      expect(settings.sound).toBe(false)
    })

    it('preserves other settings when updating one', () => {
      act(() => {
        useTradingStore.getState().updateSettings({ theme: 'light' })
      })
      
      const { settings } = useTradingStore.getState()
      expect(settings.theme).toBe('light')
      expect(settings.notifications).toBe(true)
      expect(settings.sound).toBe(true)
    })
  })

  describe('getActiveTicker', () => {
    it('returns the active ticker', () => {
      // First ensure there are tickers in the store
      const tickers = [createTicker({ symbol: 'BTC', name: 'Bitcoin', price: 45000 })]
      useTradingStore.setState({ tickers, activeSymbol: 'BTC' })
      
      const ticker = useTradingStore.getState().getActiveTicker()
      expect(ticker?.symbol).toBe('BTC')
    })

    it('returns undefined if no matching ticker', () => {
      useTradingStore.setState({ activeSymbol: 'NONEXISTENT', tickers: [] })
      const ticker = useTradingStore.getState().getActiveTicker()
      expect(ticker).toBeUndefined()
    })
  })

  describe('getPortfolioValue', () => {
    it('calculates total value from positions', () => {
      const positions = [
        createPosition({ id: '1', quantity: 2, currentPrice: 45000 }),
      ]
      
      useTradingStore.setState({ positions })
      const portfolio = useTradingStore.getState().getPortfolioValue()
      
      expect(portfolio.totalValue).toBe(90000) // 2 * 45000
    })

    it('calculates unrealized PnL', () => {
      const positions = [
        createPosition({ id: '1', unrealizedPnL: 10000 }),
        createPosition({ id: '2', symbol: 'ETH', name: 'Ethereum', unrealizedPnL: 5000 }),
      ]
      
      useTradingStore.setState({ positions })
      const portfolio = useTradingStore.getState().getPortfolioValue()
      
      expect(portfolio.unrealizedPnL).toBe(15000) // 10000 + 5000
    })

    it('returns positions count', () => {
      const positions = [
        createPosition({ id: '1' }),
        createPosition({ id: '2', symbol: 'ETH', name: 'Ethereum' }),
      ]
      
      useTradingStore.setState({ positions })
      const portfolio = useTradingStore.getState().getPortfolioValue()
      
      expect(portfolio.positionsCount).toBe(2)
    })

    it('returns zero values for empty positions', () => {
      useTradingStore.setState({ positions: [] })
      const portfolio = useTradingStore.getState().getPortfolioValue()
      
      expect(portfolio.totalValue).toBe(0)
      expect(portfolio.unrealizedPnL).toBe(0)
      expect(portfolio.positionsCount).toBe(0)
    })

    it('calculates buying power', () => {
      useTradingStore.setState({ positions: [] })
      const portfolio = useTradingStore.getState().getPortfolioValue()
      
      expect(portfolio.buyingPower).toBe(100000) // Full buying power with no positions
    })
  })
})

describe('usePortfolioStore', () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      positions: [],
      totalValue: 0,
      totalPnl: 0,
      cashBalance: 25000,
    })
  })

  describe('Initial State', () => {
    it('has default cash balance', () => {
      const { cashBalance } = usePortfolioStore.getState()
      expect(cashBalance).toBe(25000)
    })

    it('has empty positions initially', () => {
      const { positions } = usePortfolioStore.getState()
      expect(positions).toHaveLength(0)
    })
  })

  describe('setPositions', () => {
    it('sets positions and recalculates totals', () => {
      const positions = [createPosition({ id: '1' })]
      
      act(() => {
        usePortfolioStore.getState().setPositions(positions)
      })
      
      const state = usePortfolioStore.getState()
      expect(state.positions).toEqual(positions)
    })
  })

  describe('updatePosition', () => {
    it('updates an existing position', () => {
      const initialPositions = [createPosition({ id: '1' })]
      
      usePortfolioStore.setState({ positions: initialPositions })
      
      const updatedPosition = createPosition({ id: '1', currentPrice: 50000, pnl: 10000 })
      
      act(() => {
        usePortfolioStore.getState().updatePosition(updatedPosition)
      })
      
      const { positions } = usePortfolioStore.getState()
      expect(positions[0].currentPrice).toBe(50000)
      expect(positions[0].pnl).toBe(10000)
    })
  })

  describe('calculateTotals', () => {
    it('calculates total value including cash balance', () => {
      const positions = [createPosition({ id: '1', quantity: 1, currentPrice: 50000 })]
      
      usePortfolioStore.setState({ positions, cashBalance: 25000 })
      
      act(() => {
        usePortfolioStore.getState().calculateTotals()
      })
      
      const { totalValue } = usePortfolioStore.getState()
      expect(totalValue).toBe(75000) // 50000 position value + 25000 cash
    })

    it('calculates total PnL from all positions', () => {
      const positions = [
        createPosition({ id: '1', pnl: 10000 }),
        createPosition({ id: '2', symbol: 'ETH', name: 'Ethereum', pnl: 5000 }),
      ]
      
      usePortfolioStore.setState({ positions })
      
      act(() => {
        usePortfolioStore.getState().calculateTotals()
      })
      
      const { totalPnl } = usePortfolioStore.getState()
      expect(totalPnl).toBe(15000) // 10000 + 5000
    })
  })
})

describe('useChartStore', () => {
  describe('Initial State', () => {
    it('has default config', () => {
      const { config } = useChartStore.getState()
      expect(config).toBeDefined()
      expect(config.type).toBe('candlestick')
      expect(config.timeFrame).toBe('1h')
    })
  })

  describe('setTimeFrame', () => {
    it('updates timeframe', () => {
      act(() => {
        useChartStore.getState().setTimeFrame('4h')
      })
      
      const { config } = useChartStore.getState()
      expect(config.timeFrame).toBe('4h')
    })
  })

  describe('setChartType', () => {
    it('updates chart type', () => {
      act(() => {
        useChartStore.getState().setChartType('line')
      })
      
      const { config } = useChartStore.getState()
      expect(config.type).toBe('line')
    })
  })

  describe('toggleIndicator', () => {
    it('toggles indicator state', () => {
      const initial = useChartStore.getState().config.indicators.rsi
      
      act(() => {
        useChartStore.getState().toggleIndicator('rsi')
      })
      
      const { config } = useChartStore.getState()
      expect(config.indicators.rsi).toBe(!initial)
    })
  })

  describe('toggleOverlay', () => {
    it('toggles overlay state', () => {
      const initial = useChartStore.getState().config.overlays.positions
      
      act(() => {
        useChartStore.getState().toggleOverlay('positions')
      })
      
      const { config } = useChartStore.getState()
      expect(config.overlays.positions).toBe(!initial)
    })
  })

  describe('addSMA', () => {
    it('adds SMA period', () => {
      act(() => {
        useChartStore.getState().addSMA(100)
      })
      
      const { config } = useChartStore.getState()
      expect(config.indicators.sma).toContain(100)
    })
  })

  describe('removeSMA', () => {
    it('removes SMA period', () => {
      act(() => {
        useChartStore.getState().removeSMA(20)
      })
      
      const { config } = useChartStore.getState()
      expect(config.indicators.sma).not.toContain(20)
    })
  })

  describe('addEMA', () => {
    it('adds EMA period', () => {
      act(() => {
        useChartStore.getState().addEMA(100)
      })
      
      const { config } = useChartStore.getState()
      expect(config.indicators.ema).toContain(100)
    })
  })

  describe('removeEMA', () => {
    it('removes EMA period', () => {
      act(() => {
        useChartStore.getState().removeEMA(12)
      })
      
      const { config } = useChartStore.getState()
      expect(config.indicators.ema).not.toContain(12)
    })
  })
})

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      activeTab: 'dashboard',
      notifications: [],
    })
  })

  describe('Initial State', () => {
    it('has sidebar not collapsed by default', () => {
      const { sidebarCollapsed } = useUIStore.getState()
      expect(sidebarCollapsed).toBe(false)
    })

    it('has dashboard as active tab', () => {
      const { activeTab } = useUIStore.getState()
      expect(activeTab).toBe('dashboard')
    })
  })

  describe('toggleSidebar', () => {
    it('toggles sidebar collapsed state', () => {
      act(() => {
        useUIStore.getState().toggleSidebar()
      })
      
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)
      
      act(() => {
        useUIStore.getState().toggleSidebar()
      })
      
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })
  })

  describe('setActiveTab', () => {
    it('sets the active tab', () => {
      act(() => {
        useUIStore.getState().setActiveTab('portfolio')
      })
      
      const { activeTab } = useUIStore.getState()
      expect(activeTab).toBe('portfolio')
    })
  })

  describe('updatePreferences', () => {
    it('updates preferences', () => {
      act(() => {
        useUIStore.getState().updatePreferences({ theme: 'light' })
      })
      
      const { preferences } = useUIStore.getState()
      expect(preferences.theme).toBe('light')
    })
  })

  describe('notifications', () => {
    it('adds notification', () => {
      act(() => {
        useUIStore.getState().addNotification({ type: 'success', message: 'Test' })
      })
      
      const { notifications } = useUIStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].message).toBe('Test')
    })

    it('removes notification', () => {
      act(() => {
        useUIStore.getState().addNotification({ type: 'info', message: 'Test' })
      })
      
      const { notifications } = useUIStore.getState()
      const notifId = notifications[0].id
      
      act(() => {
        useUIStore.getState().removeNotification(notifId)
      })
      
      expect(useUIStore.getState().notifications).toHaveLength(0)
    })
  })
})

describe('useOrdersStore', () => {
  beforeEach(() => {
    useOrdersStore.setState({
      orders: [],
    })
  })

  describe('addOrder', () => {
    it('adds order to beginning of list', () => {
      const order = createOrder()
      
      act(() => {
        useOrdersStore.getState().addOrder(order)
      })
      
      const { orders } = useOrdersStore.getState()
      expect(orders[0]).toEqual(order)
    })
  })

  describe('cancelOrder', () => {
    it('changes order status to cancelled', () => {
      const order = createOrder({ status: 'open' })
      
      useOrdersStore.setState({ orders: [order] })
      
      act(() => {
        useOrdersStore.getState().cancelOrder('order-1')
      })
      
      const { orders } = useOrdersStore.getState()
      expect(orders[0].status).toBe('cancelled')
    })
  })

  describe('getOpenOrders', () => {
    it('returns only open and pending orders', () => {
      const orders = [
        createOrder({ id: '1', status: 'open' }),
        createOrder({ id: '2', status: 'filled' }),
        createOrder({ id: '3', status: 'pending' }),
      ]
      
      useOrdersStore.setState({ orders })
      
      const openOrders = useOrdersStore.getState().getOpenOrders()
      expect(openOrders).toHaveLength(2)
    })
  })

  describe('getOrderHistory', () => {
    it('returns filled, cancelled, and rejected orders', () => {
      const orders = [
        createOrder({ id: '1', status: 'open' }),
        createOrder({ id: '2', status: 'filled' }),
        createOrder({ id: '3', status: 'cancelled' }),
      ]
      
      useOrdersStore.setState({ orders })
      
      const history = useOrdersStore.getState().getOrderHistory()
      expect(history).toHaveLength(2)
    })
  })
})

describe('useWatchlistStore', () => {
  beforeEach(() => {
    useWatchlistStore.setState({
      items: [],
    })
  })

  describe('addItem', () => {
    it('adds item to watchlist', () => {
      const item = { symbol: 'BTC', name: 'Bitcoin', addedAt: Date.now() }
      
      act(() => {
        useWatchlistStore.getState().addItem(item)
      })
      
      const { items } = useWatchlistStore.getState()
      expect(items).toContainEqual(item)
    })

    it('does not add duplicate items', () => {
      const item = { symbol: 'BTC', name: 'Bitcoin', addedAt: Date.now() }
      
      useWatchlistStore.setState({ items: [item] })
      
      act(() => {
        useWatchlistStore.getState().addItem({ ...item, addedAt: Date.now() + 1000 })
      })
      
      const { items } = useWatchlistStore.getState()
      expect(items).toHaveLength(1)
    })
  })

  describe('removeItem', () => {
    it('removes item from watchlist', () => {
      const item = { symbol: 'BTC', name: 'Bitcoin', addedAt: Date.now() }
      
      useWatchlistStore.setState({ items: [item] })
      
      act(() => {
        useWatchlistStore.getState().removeItem('BTC')
      })
      
      const { items } = useWatchlistStore.getState()
      expect(items).toHaveLength(0)
    })
  })

  describe('isWatching', () => {
    it('returns true if symbol is in watchlist', () => {
      const item = { symbol: 'BTC', name: 'Bitcoin', addedAt: Date.now() }
      
      useWatchlistStore.setState({ items: [item] })
      
      const isWatching = useWatchlistStore.getState().isWatching('BTC')
      expect(isWatching).toBe(true)
    })

    it('returns false if symbol is not in watchlist', () => {
      const isWatching = useWatchlistStore.getState().isWatching('ETH')
      expect(isWatching).toBe(false)
    })
  })
})
