// ============================================
// Zustand Store Tests - Comprehensive State Management Testing
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import {
  useTradingStore,
  usePortfolioStore,
  useOrdersStore,
  useWatchlistStore,
  useChartStore,
  useUIStore,
} from '../store'

// Reset stores between tests
const resetAllStores = () => {
  useTradingStore.setState(useTradingStore.getInitialState?.() || useTradingStore.getState())
  usePortfolioStore.setState(usePortfolioStore.getInitialState?.() || usePortfolioStore.getState())
  useOrdersStore.setState(useOrdersStore.getInitialState?.() || useOrdersStore.getState())
  useWatchlistStore.setState(useWatchlistStore.getInitialState?.() || useWatchlistStore.getState())
  useChartStore.setState(useChartStore.getInitialState?.() || useChartStore.getState())
  useUIStore.setState(useUIStore.getInitialState?.() || useUIStore.getState())
}

describe('Trading Store', () => {
  beforeEach(() => {
    resetAllStores()
  })

  describe('Initial State', () => {
    it('has initial tickers', () => {
      const state = useTradingStore.getState()
      expect(state.tickers).toBeDefined()
      expect(Array.isArray(state.tickers)).toBe(true)
    })

    it('has initial active symbol', () => {
      const state = useTradingStore.getState()
      expect(state.activeSymbol).toBeDefined()
      expect(typeof state.activeSymbol).toBe('string')
    })

    it('has initial positions', () => {
      const state = useTradingStore.getState()
      expect(state.positions).toBeDefined()
      expect(Array.isArray(state.positions)).toBe(true)
    })

    it('has initial orders', () => {
      const state = useTradingStore.getState()
      expect(state.orders).toBeDefined()
      expect(Array.isArray(state.orders)).toBe(true)
    })

    it('has initial watchlist', () => {
      const state = useTradingStore.getState()
      expect(state.watchlist).toBeDefined()
      expect(Array.isArray(state.watchlist)).toBe(true)
    })

    it('has initial settings', () => {
      const state = useTradingStore.getState()
      expect(state.settings).toBeDefined()
      expect(state.settings.theme).toBeDefined()
    })
  })

  describe('setActiveSymbol', () => {
    it('updates active symbol', () => {
      act(() => {
        useTradingStore.getState().setActiveSymbol('ETH')
      })
      expect(useTradingStore.getState().activeSymbol).toBe('ETH')
    })

    it('handles different symbols', () => {
      const symbols = ['BTC', 'ETH', 'SOL', 'AAPL', 'MSFT']
      symbols.forEach(symbol => {
        act(() => {
          useTradingStore.getState().setActiveSymbol(symbol)
        })
        expect(useTradingStore.getState().activeSymbol).toBe(symbol)
      })
    })
  })

  describe('setSelectedSymbol', () => {
    it('updates selected symbol', () => {
      act(() => {
        useTradingStore.getState().setSelectedSymbol('SOL')
      })
      expect(useTradingStore.getState().selectedSymbol).toBe('SOL')
    })
  })

  describe('updateTickers', () => {
    it('updates all tickers', () => {
      const newTickers = [
        {
          symbol: 'TEST',
          name: 'Test Coin',
          price: 100,
          change: 5,
          changePercent: 5.26,
          volume: 1000000,
          high24h: 105,
          low24h: 95,
          lastUpdated: Date.now(),
        },
      ]
      act(() => {
        useTradingStore.getState().updateTickers(newTickers)
      })
      expect(useTradingStore.getState().tickers).toEqual(newTickers)
    })

    it('handles empty tickers array', () => {
      act(() => {
        useTradingStore.getState().updateTickers([])
      })
      expect(useTradingStore.getState().tickers).toEqual([])
    })
  })

  describe('updateTicker', () => {
    it('updates single ticker', () => {
      const state = useTradingStore.getState()
      const existingTicker = state.tickers[0]
      if (existingTicker) {
        const updatedTicker = { ...existingTicker, price: 999999 }
        act(() => {
          useTradingStore.getState().updateTicker(updatedTicker)
        })
        const newState = useTradingStore.getState()
        const found = newState.tickers.find(t => t.symbol === existingTicker.symbol)
        expect(found?.price).toBe(999999)
      }
    })
  })

  describe('closePosition', () => {
    it('removes position by id', () => {
      const state = useTradingStore.getState()
      const initialLength = state.positions.length
      if (initialLength > 0) {
        const positionToClose = state.positions[0]
        act(() => {
          useTradingStore.getState().closePosition(positionToClose.id, positionToClose.currentPrice)
        })
        expect(useTradingStore.getState().positions.length).toBe(initialLength - 1)
      }
    })

    it('handles non-existent position id', () => {
      const state = useTradingStore.getState()
      const initialLength = state.positions.length
      act(() => {
        useTradingStore.getState().closePosition('non-existent-id', 50000)
      })
      expect(useTradingStore.getState().positions.length).toBe(initialLength)
    })
  })

  describe('addOrder', () => {
    it('adds order to beginning of list', () => {
      const newOrder = {
        id: 'new-order-1',
        symbol: 'BTC',
        side: 'buy' as const,
        type: 'limit' as const,
        status: 'open' as const,
        quantity: 1,
        filledQuantity: 0,
        price: 50000,
        timeInForce: 'gtc' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      act(() => {
        useTradingStore.getState().addOrder(newOrder)
      })
      expect(useTradingStore.getState().orders[0]).toEqual(newOrder)
    })
  })

  describe('addToWatchlist', () => {
    it('adds item to watchlist', () => {
      const newItem = {
        symbol: 'NEWCOIN',
        name: 'New Coin',
        addedAt: Date.now(),
      }
      const initialLength = useTradingStore.getState().watchlist.length
      act(() => {
        useTradingStore.getState().addToWatchlist(newItem)
      })
      expect(useTradingStore.getState().watchlist.length).toBe(initialLength + 1)
    })
  })

  describe('removeFromWatchlist', () => {
    it('removes item from watchlist', () => {
      const state = useTradingStore.getState()
      const initialLength = state.watchlist.length
      if (initialLength > 0) {
        const itemToRemove = state.watchlist[0]
        act(() => {
          useTradingStore.getState().removeFromWatchlist(itemToRemove.symbol)
        })
        expect(useTradingStore.getState().watchlist.length).toBe(initialLength - 1)
      }
    })
  })

  describe('updateSettings', () => {
    it('updates theme setting', () => {
      act(() => {
        useTradingStore.getState().updateSettings({ theme: 'light' })
      })
      expect(useTradingStore.getState().settings.theme).toBe('light')
    })

    it('updates notifications setting', () => {
      act(() => {
        useTradingStore.getState().updateSettings({ notifications: false })
      })
      expect(useTradingStore.getState().settings.notifications).toBe(false)
    })

    it('updates sound setting', () => {
      act(() => {
        useTradingStore.getState().updateSettings({ sound: false })
      })
      expect(useTradingStore.getState().settings.sound).toBe(false)
    })

    it('updates multiple settings at once', () => {
      act(() => {
        useTradingStore.getState().updateSettings({
          theme: 'light',
          notifications: false,
          sound: false,
        })
      })
      const settings = useTradingStore.getState().settings
      expect(settings.theme).toBe('light')
      expect(settings.notifications).toBe(false)
      expect(settings.sound).toBe(false)
    })
  })

  describe('getActiveTicker', () => {
    it('returns ticker for active symbol when tickers exist', () => {
      // First populate tickers (simulating real data fetch)
      const activeSymbol = useTradingStore.getState().activeSymbol
      const mockTicker = {
        symbol: activeSymbol, // Use the active symbol (BTC)
        name: 'Bitcoin',
        price: 50000,
        change: 1250,
        changePercent: 2.5,
        volume: 1000000,
        high24h: 51000,
        low24h: 49000,
        lastUpdated: Date.now(),
      }
      act(() => {
        useTradingStore.getState().updateTickers([mockTicker])
      })
      const ticker = useTradingStore.getState().getActiveTicker()
      expect(ticker?.symbol).toBe(activeSymbol)
    })

    it('returns undefined when no tickers loaded', () => {
      // Store starts with empty tickers array (real data not yet loaded)
      const ticker = useTradingStore.getState().getActiveTicker()
      expect(ticker).toBeUndefined()
    })

    it('returns undefined for non-existent symbol', () => {
      act(() => {
        useTradingStore.getState().setActiveSymbol('NONEXISTENT')
      })
      const ticker = useTradingStore.getState().getActiveTicker()
      expect(ticker).toBeUndefined()
    })
  })

  describe('getPortfolioValue', () => {
    it('returns portfolio summary', () => {
      const portfolio = useTradingStore.getState().getPortfolioValue()
      expect(portfolio).toHaveProperty('totalValue')
      expect(portfolio).toHaveProperty('dailyPnL')
      expect(portfolio).toHaveProperty('dailyPnLPercent')
      expect(portfolio).toHaveProperty('unrealizedPnL')
      expect(portfolio).toHaveProperty('positionsCount')
      expect(portfolio).toHaveProperty('buyingPower')
    })

    it('calculates total value correctly', () => {
      const portfolio = useTradingStore.getState().getPortfolioValue()
      expect(typeof portfolio.totalValue).toBe('number')
      expect(portfolio.totalValue).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('Portfolio Store', () => {
  beforeEach(() => {
    resetAllStores()
  })

  describe('Initial State', () => {
    it('has initial positions', () => {
      const state = usePortfolioStore.getState()
      expect(state.positions).toBeDefined()
      expect(Array.isArray(state.positions)).toBe(true)
    })

    it('has cash balance', () => {
      const state = usePortfolioStore.getState()
      expect(state.cashBalance).toBeDefined()
      expect(typeof state.cashBalance).toBe('number')
    })
  })

  describe('setPositions', () => {
    it('sets new positions', () => {
      const newPositions = [
        {
          id: 'test-pos-1',
          symbol: 'TEST',
          name: 'Test',
          quantity: 10,
          averagePrice: 100,
          currentPrice: 110,
          pnl: 100,
          pnlPercent: 10,
          allocation: 100,
          lastUpdated: Date.now(),
          side: 'long' as const,
          entryPrice: 100,
          unrealizedPnL: 100,
          unrealizedPnLPercent: 10,
          leverage: 1,
        },
      ]
      act(() => {
        usePortfolioStore.getState().setPositions(newPositions)
      })
      expect(usePortfolioStore.getState().positions).toEqual(newPositions)
    })
  })

  describe('updatePosition', () => {
    it('updates existing position', () => {
      const state = usePortfolioStore.getState()
      if (state.positions.length > 0) {
        const positionToUpdate = state.positions[0]
        const updatedPosition = { ...positionToUpdate, currentPrice: 999 }
        act(() => {
          usePortfolioStore.getState().updatePosition(updatedPosition)
        })
        const found = usePortfolioStore.getState().positions.find(
          p => p.id === positionToUpdate.id
        )
        expect(found?.currentPrice).toBe(999)
      }
    })
  })

  describe('calculateTotals', () => {
    it('calculates total value', () => {
      act(() => {
        usePortfolioStore.getState().calculateTotals()
      })
      const state = usePortfolioStore.getState()
      expect(state.totalValue).toBeGreaterThanOrEqual(0)
    })

    it('calculates total pnl', () => {
      act(() => {
        usePortfolioStore.getState().calculateTotals()
      })
      const state = usePortfolioStore.getState()
      expect(typeof state.totalPnl).toBe('number')
    })
  })
})

describe('Orders Store', () => {
  beforeEach(() => {
    resetAllStores()
  })

  describe('Initial State', () => {
    it('has initial orders', () => {
      const state = useOrdersStore.getState()
      expect(state.orders).toBeDefined()
      expect(Array.isArray(state.orders)).toBe(true)
    })
  })

  describe('addOrder', () => {
    it('adds new order to beginning', () => {
      const newOrder = {
        id: 'new-test-order',
        symbol: 'ETH',
        side: 'sell' as const,
        type: 'market' as const,
        status: 'pending' as const,
        quantity: 5,
        filledQuantity: 0,
        timeInForce: 'ioc' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      act(() => {
        useOrdersStore.getState().addOrder(newOrder)
      })
      expect(useOrdersStore.getState().orders[0]).toEqual(newOrder)
    })
  })

  describe('updateOrder', () => {
    it('updates order status', () => {
      const state = useOrdersStore.getState()
      if (state.orders.length > 0) {
        const orderToUpdate = state.orders[0]
        act(() => {
          useOrdersStore.getState().updateOrder(orderToUpdate.id, {
            status: 'filled',
            filledQuantity: orderToUpdate.quantity,
          })
        })
        const updated = useOrdersStore.getState().orders.find(
          o => o.id === orderToUpdate.id
        )
        expect(updated?.status).toBe('filled')
      }
    })
  })

  describe('cancelOrder', () => {
    it('cancels order', () => {
      const state = useOrdersStore.getState()
      const openOrders = state.orders.filter(o => o.status === 'open' || o.status === 'pending')
      if (openOrders.length > 0) {
        const orderToCancel = openOrders[0]
        act(() => {
          useOrdersStore.getState().cancelOrder(orderToCancel.id)
        })
        const cancelled = useOrdersStore.getState().orders.find(
          o => o.id === orderToCancel.id
        )
        expect(cancelled?.status).toBe('cancelled')
      }
    })
  })

  describe('getOpenOrders', () => {
    it('returns only open or pending orders', () => {
      const openOrders = useOrdersStore.getState().getOpenOrders()
      openOrders.forEach(order => {
        expect(['open', 'pending']).toContain(order.status)
      })
    })
  })

  describe('getOrderHistory', () => {
    it('returns only completed orders', () => {
      const history = useOrdersStore.getState().getOrderHistory()
      history.forEach(order => {
        expect(['filled', 'cancelled', 'rejected']).toContain(order.status)
      })
    })
  })
})

describe('Watchlist Store', () => {
  beforeEach(() => {
    resetAllStores()
  })

  describe('Initial State', () => {
    it('has initial items', () => {
      const state = useWatchlistStore.getState()
      expect(state.items).toBeDefined()
      expect(Array.isArray(state.items)).toBe(true)
    })
  })

  describe('addItem', () => {
    it('adds new item', () => {
      const newItem = {
        symbol: 'NEWITEM',
        name: 'New Item',
        addedAt: Date.now(),
      }
      const initialLength = useWatchlistStore.getState().items.length
      act(() => {
        useWatchlistStore.getState().addItem(newItem)
      })
      expect(useWatchlistStore.getState().items.length).toBe(initialLength + 1)
    })

    it('does not add duplicate', () => {
      const state = useWatchlistStore.getState()
      if (state.items.length > 0) {
        const existingItem = state.items[0]
        const initialLength = state.items.length
        act(() => {
          useWatchlistStore.getState().addItem(existingItem)
        })
        expect(useWatchlistStore.getState().items.length).toBe(initialLength)
      }
    })
  })

  describe('removeItem', () => {
    it('removes item by symbol', () => {
      const state = useWatchlistStore.getState()
      if (state.items.length > 0) {
        const itemToRemove = state.items[0]
        const initialLength = state.items.length
        act(() => {
          useWatchlistStore.getState().removeItem(itemToRemove.symbol)
        })
        expect(useWatchlistStore.getState().items.length).toBe(initialLength - 1)
      }
    })
  })

  describe('updateItem', () => {
    it('updates item notes', () => {
      const state = useWatchlistStore.getState()
      if (state.items.length > 0) {
        const itemToUpdate = state.items[0]
        act(() => {
          useWatchlistStore.getState().updateItem(itemToUpdate.symbol, {
            notes: 'Updated notes',
          })
        })
        const updated = useWatchlistStore.getState().items.find(
          i => i.symbol === itemToUpdate.symbol
        )
        expect(updated?.notes).toBe('Updated notes')
      }
    })

    it('updates item alertPrice', () => {
      const state = useWatchlistStore.getState()
      if (state.items.length > 0) {
        const itemToUpdate = state.items[0]
        act(() => {
          useWatchlistStore.getState().updateItem(itemToUpdate.symbol, {
            alertPrice: 55000,
          })
        })
        const updated = useWatchlistStore.getState().items.find(
          i => i.symbol === itemToUpdate.symbol
        )
        expect(updated?.alertPrice).toBe(55000)
      }
    })
  })

  describe('isWatching', () => {
    it('returns true for watched item', () => {
      const state = useWatchlistStore.getState()
      if (state.items.length > 0) {
        const watchedSymbol = state.items[0].symbol
        expect(useWatchlistStore.getState().isWatching(watchedSymbol)).toBe(true)
      }
    })

    it('returns false for unwatched item', () => {
      expect(useWatchlistStore.getState().isWatching('NOTINLIST')).toBe(false)
    })
  })
})

describe('Chart Store', () => {
  beforeEach(() => {
    resetAllStores()
  })

  describe('Initial State', () => {
    it('has initial config', () => {
      const state = useChartStore.getState()
      expect(state.config).toBeDefined()
      expect(state.config.type).toBeDefined()
      expect(state.config.timeFrame).toBeDefined()
    })

    it('has default chart type', () => {
      const state = useChartStore.getState()
      expect(state.config.type).toBe('candlestick')
    })

    it('has default timeframe', () => {
      const state = useChartStore.getState()
      expect(state.config.timeFrame).toBe('1h')
    })
  })

  describe('setTimeFrame', () => {
    it('updates timeframe', () => {
      act(() => {
        useChartStore.getState().setTimeFrame('4h')
      })
      expect(useChartStore.getState().config.timeFrame).toBe('4h')
    })

    it('handles all timeframes', () => {
      const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M'] as const
      timeframes.forEach(tf => {
        act(() => {
          useChartStore.getState().setTimeFrame(tf)
        })
        expect(useChartStore.getState().config.timeFrame).toBe(tf)
      })
    })
  })

  describe('setChartType', () => {
    it('updates chart type', () => {
      act(() => {
        useChartStore.getState().setChartType('line')
      })
      expect(useChartStore.getState().config.type).toBe('line')
    })

    it('handles all chart types', () => {
      const types = ['candlestick', 'line', 'area', 'bar'] as const
      types.forEach(type => {
        act(() => {
          useChartStore.getState().setChartType(type)
        })
        expect(useChartStore.getState().config.type).toBe(type)
      })
    })
  })

  describe('toggleIndicator', () => {
    it('toggles RSI indicator', () => {
      const initial = useChartStore.getState().config.indicators.rsi
      act(() => {
        useChartStore.getState().toggleIndicator('rsi')
      })
      expect(useChartStore.getState().config.indicators.rsi).toBe(!initial)
    })

    it('toggles MACD indicator', () => {
      const initial = useChartStore.getState().config.indicators.macd
      act(() => {
        useChartStore.getState().toggleIndicator('macd')
      })
      expect(useChartStore.getState().config.indicators.macd).toBe(!initial)
    })

    it('toggles Bollinger Bands indicator', () => {
      const initial = useChartStore.getState().config.indicators.bollingerBands
      act(() => {
        useChartStore.getState().toggleIndicator('bollingerBands')
      })
      expect(useChartStore.getState().config.indicators.bollingerBands).toBe(!initial)
    })

    it('toggles volume indicator', () => {
      const initial = useChartStore.getState().config.indicators.volume
      act(() => {
        useChartStore.getState().toggleIndicator('volume')
      })
      expect(useChartStore.getState().config.indicators.volume).toBe(!initial)
    })
  })

  describe('toggleOverlay', () => {
    it('toggles positions overlay', () => {
      const initial = useChartStore.getState().config.overlays.positions
      act(() => {
        useChartStore.getState().toggleOverlay('positions')
      })
      expect(useChartStore.getState().config.overlays.positions).toBe(!initial)
    })

    it('toggles orders overlay', () => {
      const initial = useChartStore.getState().config.overlays.orders
      act(() => {
        useChartStore.getState().toggleOverlay('orders')
      })
      expect(useChartStore.getState().config.overlays.orders).toBe(!initial)
    })

    it('toggles signals overlay', () => {
      const initial = useChartStore.getState().config.overlays.signals
      act(() => {
        useChartStore.getState().toggleOverlay('signals')
      })
      expect(useChartStore.getState().config.overlays.signals).toBe(!initial)
    })
  })

  describe('addSMA', () => {
    it('adds SMA period', () => {
      act(() => {
        useChartStore.getState().addSMA(100)
      })
      expect(useChartStore.getState().config.indicators.sma).toContain(100)
    })

    it('maintains sorted order', () => {
      act(() => {
        useChartStore.getState().addSMA(100)
      })
      const sma = useChartStore.getState().config.indicators.sma
      for (let i = 1; i < sma.length; i++) {
        expect(sma[i]).toBeGreaterThan(sma[i - 1])
      }
    })
  })

  describe('removeSMA', () => {
    it('removes SMA period', () => {
      const initial = useChartStore.getState().config.indicators.sma
      if (initial.length > 0) {
        const toRemove = initial[0]
        act(() => {
          useChartStore.getState().removeSMA(toRemove)
        })
        expect(useChartStore.getState().config.indicators.sma).not.toContain(toRemove)
      }
    })
  })

  describe('addEMA', () => {
    it('adds EMA period', () => {
      act(() => {
        useChartStore.getState().addEMA(50)
      })
      expect(useChartStore.getState().config.indicators.ema).toContain(50)
    })
  })

  describe('removeEMA', () => {
    it('removes EMA period', () => {
      const initial = useChartStore.getState().config.indicators.ema
      if (initial.length > 0) {
        const toRemove = initial[0]
        act(() => {
          useChartStore.getState().removeEMA(toRemove)
        })
        expect(useChartStore.getState().config.indicators.ema).not.toContain(toRemove)
      }
    })
  })
})

describe('UI Store', () => {
  beforeEach(() => {
    resetAllStores()
  })

  describe('Initial State', () => {
    it('has sidebar collapsed state', () => {
      const state = useUIStore.getState()
      expect(typeof state.sidebarCollapsed).toBe('boolean')
    })

    it('has active tab', () => {
      const state = useUIStore.getState()
      expect(state.activeTab).toBeDefined()
    })

    it('has preferences', () => {
      const state = useUIStore.getState()
      expect(state.preferences).toBeDefined()
    })

    it('has notifications array', () => {
      const state = useUIStore.getState()
      expect(Array.isArray(state.notifications)).toBe(true)
    })
  })

  describe('toggleSidebar', () => {
    it('toggles sidebar state', () => {
      const initial = useUIStore.getState().sidebarCollapsed
      act(() => {
        useUIStore.getState().toggleSidebar()
      })
      expect(useUIStore.getState().sidebarCollapsed).toBe(!initial)
    })

    it('toggles back', () => {
      const initial = useUIStore.getState().sidebarCollapsed
      act(() => {
        useUIStore.getState().toggleSidebar()
        useUIStore.getState().toggleSidebar()
      })
      expect(useUIStore.getState().sidebarCollapsed).toBe(initial)
    })
  })

  describe('setActiveTab', () => {
    it('sets active tab', () => {
      act(() => {
        useUIStore.getState().setActiveTab('portfolio')
      })
      expect(useUIStore.getState().activeTab).toBe('portfolio')
    })

    it('handles different tabs', () => {
      const tabs = ['dashboard', 'trade', 'portfolio', 'signals', 'settings']
      tabs.forEach(tab => {
        act(() => {
          useUIStore.getState().setActiveTab(tab)
        })
        expect(useUIStore.getState().activeTab).toBe(tab)
      })
    })
  })

  describe('updatePreferences', () => {
    it('updates theme preference', () => {
      act(() => {
        useUIStore.getState().updatePreferences({ theme: 'light' })
      })
      expect(useUIStore.getState().preferences.theme).toBe('light')
    })

    it('updates sound alerts preference', () => {
      act(() => {
        useUIStore.getState().updatePreferences({ soundAlerts: false })
      })
      expect(useUIStore.getState().preferences.soundAlerts).toBe(false)
    })

    it('updates compact mode preference', () => {
      act(() => {
        useUIStore.getState().updatePreferences({ compactMode: true })
      })
      expect(useUIStore.getState().preferences.compactMode).toBe(true)
    })

    it('updates multiple preferences', () => {
      act(() => {
        useUIStore.getState().updatePreferences({
          theme: 'light',
          compactMode: true,
          soundAlerts: false,
        })
      })
      const prefs = useUIStore.getState().preferences
      expect(prefs.theme).toBe('light')
      expect(prefs.compactMode).toBe(true)
      expect(prefs.soundAlerts).toBe(false)
    })
  })

  describe('addNotification', () => {
    it('adds notification', () => {
      vi.useFakeTimers()
      const initialLength = useUIStore.getState().notifications.length
      act(() => {
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Test notification',
        })
      })
      expect(useUIStore.getState().notifications.length).toBe(initialLength + 1)
      vi.useRealTimers()
    })

    it('adds notification with correct type', () => {
      vi.useFakeTimers()
      act(() => {
        useUIStore.getState().addNotification({
          type: 'error',
          message: 'Error message',
        })
      })
      const notifications = useUIStore.getState().notifications
      const lastNotification = notifications[notifications.length - 1]
      expect(lastNotification.type).toBe('error')
      vi.useRealTimers()
    })

    it('adds notification with correct message', () => {
      vi.useFakeTimers()
      act(() => {
        useUIStore.getState().addNotification({
          type: 'info',
          message: 'Info message here',
        })
      })
      const notifications = useUIStore.getState().notifications
      const lastNotification = notifications[notifications.length - 1]
      expect(lastNotification.message).toBe('Info message here')
      vi.useRealTimers()
    })

    it('auto-removes notification after timeout', () => {
      vi.useFakeTimers()
      act(() => {
        useUIStore.getState().addNotification({
          type: 'warning',
          message: 'Warning message',
        })
      })
      const initialLength = useUIStore.getState().notifications.length
      act(() => {
        vi.advanceTimersByTime(6000)
      })
      expect(useUIStore.getState().notifications.length).toBeLessThan(initialLength)
      vi.useRealTimers()
    })
  })

  describe('removeNotification', () => {
    it('removes notification by id', () => {
      vi.useFakeTimers()
      act(() => {
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'To be removed',
        })
      })
      const notifications = useUIStore.getState().notifications
      if (notifications.length > 0) {
        const toRemove = notifications[0]
        const initialLength = notifications.length
        act(() => {
          useUIStore.getState().removeNotification(toRemove.id)
        })
        expect(useUIStore.getState().notifications.length).toBe(initialLength - 1)
      }
      vi.useRealTimers()
    })
  })
})

describe('Store Integration', () => {
  beforeEach(() => {
    resetAllStores()
  })

  it('stores are independent', () => {
    act(() => {
      useTradingStore.getState().setActiveSymbol('ETH')
    })
    // Other stores should not be affected
    expect(useChartStore.getState().config.type).toBe('candlestick')
    expect(useUIStore.getState().activeTab).toBeDefined()
  })

  it('multiple stores can be updated simultaneously', () => {
    act(() => {
      useTradingStore.getState().setActiveSymbol('SOL')
      useChartStore.getState().setTimeFrame('4h')
      useUIStore.getState().setActiveTab('trade')
    })
    expect(useTradingStore.getState().activeSymbol).toBe('SOL')
    expect(useChartStore.getState().config.timeFrame).toBe('4h')
    expect(useUIStore.getState().activeTab).toBe('trade')
  })
})
