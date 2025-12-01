// ============================================
// TradingHub Pro - Global State Management
// Using Zustand for efficient state management
// ============================================

import { create } from 'zustand'
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware'
import type {
  Ticker,
  Position,
  Order,
  WatchlistItem,
  ChartConfig,
  TimeFrame,
  ChartType,
  UserPreferences,
} from '@/types'
import { generateId } from './utils'
import {
  TRADING_CONFIG,
  DEFAULT_WATCHLIST_SYMBOLS,
  STORAGE_KEYS,
  UI_CONFIG,
  CHART_CONFIG,
} from './config'

// Default watchlist items (no mock prices - will be updated by real data)
const DEFAULT_WATCHLIST: WatchlistItem[] = DEFAULT_WATCHLIST_SYMBOLS.map((item) => ({
  symbol: item.symbol,
  name: item.name,
  addedAt: Date.now(),
}))

// ============================================
// Trading Store
// ============================================

interface UserSettings {
  theme: 'dark' | 'light'
  notifications: boolean
  sound: boolean
}

interface TradingState {
  // Market Data
  tickers: Ticker[]
  activeSymbol: string
  selectedSymbol: string
  positions: Position[]
  orders: Order[]
  watchlist: WatchlistItem[]
  settings: UserSettings
  cashBalance: number
  
  // Actions
  setActiveSymbol: (symbol: string) => void
  setSelectedSymbol: (symbol: string) => void
  updateTickers: (tickers: Ticker[]) => void
  updateTicker: (ticker: Ticker) => void
  openPosition: (position: Omit<Position, 'id' | 'unrealizedPnL' | 'unrealizedPnLPercent' | 'pnl' | 'pnlPercent'>) => void
  closePosition: (positionId: string, exitPrice: number) => void
  updatePositionPrices: (prices: Record<string, number>) => void
  addOrder: (order: Order) => void
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (symbol: string) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  resetAccount: () => void
  
  // Selectors
  getActiveTicker: () => Ticker | undefined
  getPortfolioValue: () => {
    totalValue: number
    dailyPnL: number
    dailyPnLPercent: number
    unrealizedPnL: number
    positionsCount: number
    buyingPower: number
  }
}

export const useTradingStore = create<TradingState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          tickers: [],
          activeSymbol: 'BTC',
          selectedSymbol: 'BTC',
          positions: [], // Start with no positions
          orders: [], // Start with no orders
          watchlist: DEFAULT_WATCHLIST,
          cashBalance: TRADING_CONFIG.INITIAL_BALANCE,
          settings: {
            theme: 'dark',
            notifications: true,
            sound: true,
          },

          setActiveSymbol: (symbol: string) => {
            set({ activeSymbol: symbol }, false, 'setActiveSymbol')
          },

          setSelectedSymbol: (symbol: string) => {
            set({ selectedSymbol: symbol }, false, 'setSelectedSymbol')
          },

          updateTickers: (tickers: Ticker[]) => {
            set({ tickers }, false, 'updateTickers')
          },

          updateTicker: (ticker: Ticker) => {
            set(
              (state) => ({
                tickers: state.tickers.map((t) =>
                  t.symbol === ticker.symbol ? ticker : t
                ),
              }),
              false,
              'updateTicker'
            )
          },

          openPosition: (positionData) => {
            const { cashBalance } = get()
            const cost = positionData.quantity * positionData.averagePrice
            
            if (cost > cashBalance) {
              console.error('Insufficient funds')
              return
            }

            const newPosition: Position = {
              ...positionData,
              id: `pos-${Date.now()}`,
              pnl: 0,
              pnlPercent: 0,
              unrealizedPnL: 0,
              unrealizedPnLPercent: 0,
            }

            set(
              (state) => ({
                positions: [...state.positions, newPosition],
                cashBalance: state.cashBalance - cost,
              }),
              false,
              'openPosition'
            )
          },

          closePosition: (positionId: string, exitPrice: number) => {
            const position = get().positions.find((p) => p.id === positionId)
            if (!position) return

            const proceeds = position.quantity * exitPrice
            
            // Create a closed order record
            const closedOrder: Order = {
              id: generateId('order'),
              symbol: position.symbol,
              type: 'market',
              side: position.side === 'long' ? 'sell' : 'buy',
              quantity: position.quantity,
              price: exitPrice,
              status: 'filled',
              filledQuantity: position.quantity,
              timeInForce: 'gtc',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              filledAt: Date.now(),
            }

            set(
              (state) => ({
                positions: state.positions.filter((p) => p.id !== positionId),
                cashBalance: state.cashBalance + proceeds,
                orders: [closedOrder, ...state.orders],
              }),
              false,
              'closePosition'
            )
          },

          updatePositionPrices: (prices: Record<string, number>) => {
            set(
              (state) => ({
                positions: state.positions.map((position) => {
                  const currentPrice = prices[position.symbol]
                  if (currentPrice === undefined) return position
                  
                  const pnl = (currentPrice - position.averagePrice) * position.quantity * (position.side === 'long' ? 1 : -1)
                  const pnlPercent = ((currentPrice - position.averagePrice) / position.averagePrice) * 100 * (position.side === 'long' ? 1 : -1)
                  
                  return {
                    ...position,
                    currentPrice,
                    pnl,
                    pnlPercent,
                    unrealizedPnL: pnl,
                    unrealizedPnLPercent: pnlPercent,
                    lastUpdated: Date.now(),
                  }
                }),
              }),
              false,
              'updatePositionPrices'
            )
          },

          addOrder: (order: Order) => {
            set(
              (state) => ({
                orders: [order, ...state.orders],
              }),
              false,
              'addOrder'
            )
          },

          addToWatchlist: (item: WatchlistItem) => {
            set(
              (state) => ({
                watchlist: [...state.watchlist, item],
              }),
              false,
              'addToWatchlist'
            )
          },

          removeFromWatchlist: (symbol: string) => {
            set(
              (state) => ({
                watchlist: state.watchlist.filter((w) => w.symbol !== symbol),
              }),
              false,
              'removeFromWatchlist'
            )
          },

          updateSettings: (newSettings: Partial<UserSettings>) => {
            set(
              (state) => ({
                settings: { ...state.settings, ...newSettings },
              }),
              false,
              'updateSettings'
            )
          },

          resetAccount: () => {
            set({
              positions: [],
              orders: [],
              cashBalance: TRADING_CONFIG.INITIAL_BALANCE,
            }, false, 'resetAccount')
          },

          getActiveTicker: () => {
            const { tickers, activeSymbol } = get()
            return tickers.find((t) => t.symbol === activeSymbol)
          },

          getPortfolioValue: () => {
            const { positions, cashBalance } = get()
            const positionsValue = positions.reduce(
              (sum, p) => sum + p.quantity * p.currentPrice,
              0
            )
            const unrealizedPnL = positions.reduce(
              (sum, p) => sum + p.unrealizedPnL,
              0
            )
            const totalValue = positionsValue + cashBalance
            const dailyPnL = unrealizedPnL // For now, daily P&L is same as unrealized
            const dailyPnLPercent = totalValue > 0 ? (dailyPnL / totalValue) * 100 : 0

            return {
              totalValue,
              dailyPnL,
              dailyPnLPercent,
              unrealizedPnL,
              positionsCount: positions.length,
              buyingPower: cashBalance,
            }
          },
        }),
        {
          name: STORAGE_KEYS.TRADING_STORE,
          partialize: (state) => ({
            positions: state.positions,
            orders: state.orders,
            cashBalance: state.cashBalance,
            watchlist: state.watchlist,
            settings: state.settings,
          }),
        }
      )
    ),
    { name: 'trading-store' }
  )
)

// ============================================
// Portfolio Store
// @deprecated Use useTradingStore instead - this store will be removed in v2.0
// This store duplicates functionality from useTradingStore.
// Migrate to useTradingStore.positions, useTradingStore.getPortfolioValue()
// ============================================

interface PortfolioState {
  positions: Position[]
  totalValue: number
  totalPnl: number
  cashBalance: number
  
  // Actions
  setPositions: (positions: Position[]) => void
  updatePosition: (position: Position) => void
  calculateTotals: () => void
}

/**
 * @deprecated Use useTradingStore instead. This store will be removed in v2.0.
 * Migrate to:
 * - useTradingStore.positions
 * - useTradingStore.cashBalance
 * - useTradingStore.getPortfolioValue()
 */
export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    (set, get) => ({
      positions: [], // Start with no positions
      totalValue: TRADING_CONFIG.INITIAL_BALANCE,
      totalPnl: 0,
      cashBalance: TRADING_CONFIG.INITIAL_BALANCE,

      setPositions: (positions: Position[]) => {
        set({ positions }, false, 'setPositions')
        get().calculateTotals()
      },

      updatePosition: (position: Position) => {
        set(
          (state) => ({
            positions: state.positions.map((p) =>
              p.id === position.id ? position : p
            ),
          }),
          false,
          'updatePosition'
        )
        get().calculateTotals()
      },

      calculateTotals: () => {
        const { positions, cashBalance } = get()
        const positionsValue = positions.reduce(
          (sum, p) => sum + p.currentPrice * p.quantity,
          0
        )
        const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)

        set({
          totalValue: positionsValue + cashBalance,
          totalPnl,
        })
      },
    }),
    { name: 'portfolio-store' }
  )
)

// ============================================
// Orders Store
// @deprecated Use useTradingStore instead - this store will be removed in v2.0
// This store duplicates functionality from useTradingStore.
// Migrate to useTradingStore.orders, useTradingStore.addOrder()
// ============================================

interface OrdersState {
  orders: Order[]
  
  // Actions
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  cancelOrder: (orderId: string) => void
  getOpenOrders: () => Order[]
  getOrderHistory: () => Order[]
}

/**
 * @deprecated Use useTradingStore instead. This store will be removed in v2.0.
 * Migrate to:
 * - useTradingStore.orders
 * - useTradingStore.addOrder()
 */
export const useOrdersStore = create<OrdersState>()(
  devtools(
    (set, get) => ({
      orders: [], // Start with no orders

      addOrder: (order: Order) => {
        set(
          (state) => ({
            orders: [order, ...state.orders],
          }),
          false,
          'addOrder'
        )
      },

      updateOrder: (orderId: string, updates: Partial<Order>) => {
        set(
          (state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, ...updates } : o
            ),
          }),
          false,
          'updateOrder'
        )
      },

      cancelOrder: (orderId: string) => {
        set(
          (state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId
                ? { ...o, status: 'cancelled' as const, updatedAt: Date.now() }
                : o
            ),
          }),
          false,
          'cancelOrder'
        )
      },

      getOpenOrders: () => {
        return get().orders.filter(
          (o) => o.status === 'open' || o.status === 'pending'
        )
      },

      getOrderHistory: () => {
        return get().orders.filter(
          (o) =>
            o.status === 'filled' ||
            o.status === 'cancelled' ||
            o.status === 'rejected'
        )
      },
    }),
    { name: 'orders-store' }
  )
)

// ============================================
// Watchlist Store
// @deprecated Use useTradingStore instead - this store will be removed in v2.0
// This store duplicates functionality from useTradingStore.
// Migrate to useTradingStore.watchlist, useTradingStore.addToWatchlist()
// ============================================

interface WatchlistState {
  items: WatchlistItem[]
  
  // Actions
  addItem: (item: WatchlistItem) => void
  removeItem: (symbol: string) => void
  updateItem: (symbol: string, updates: Partial<WatchlistItem>) => void
  isWatching: (symbol: string) => boolean
}

/**
 * @deprecated Use useTradingStore instead. This store will be removed in v2.0.
 * Migrate to:
 * - useTradingStore.watchlist
 * - useTradingStore.addToWatchlist()
 * - useTradingStore.removeFromWatchlist()
 */
export const useWatchlistStore = create<WatchlistState>()(
  devtools(
    (set, get) => ({
      items: DEFAULT_WATCHLIST,

      addItem: (item: WatchlistItem) => {
        if (!get().isWatching(item.symbol)) {
          set(
            (state) => ({
              items: [...state.items, item],
            }),
            false,
            'addItem'
          )
        }
      },

      removeItem: (symbol: string) => {
        set(
          (state) => ({
            items: state.items.filter((i) => i.symbol !== symbol),
          }),
          false,
          'removeItem'
        )
      },

      updateItem: (symbol: string, updates: Partial<WatchlistItem>) => {
        set(
          (state) => ({
            items: state.items.map((i) =>
              i.symbol === symbol ? { ...i, ...updates } : i
            ),
          }),
          false,
          'updateItem'
        )
      },

      isWatching: (symbol: string) => {
        return get().items.some((i) => i.symbol === symbol)
      },
    }),
    { name: 'watchlist-store' }
  )
)

// ============================================
// Chart Store
// ============================================

interface ChartState {
  config: ChartConfig
  
  // Actions
  setTimeFrame: (timeFrame: TimeFrame) => void
  setChartType: (type: ChartType) => void
  toggleIndicator: (indicator: keyof ChartConfig['indicators']) => void
  toggleOverlay: (overlay: keyof ChartConfig['overlays']) => void
  addSMA: (period: number) => void
  removeSMA: (period: number) => void
  addEMA: (period: number) => void
  removeEMA: (period: number) => void
}

export const useChartStore = create<ChartState>()(
  devtools(
    (set) => ({
      config: {
        type: CHART_CONFIG.DEFAULT_TYPE,
        timeFrame: CHART_CONFIG.DEFAULT_TIMEFRAME,
        indicators: {
          rsi: true,
          macd: false,
          bollingerBands: true,
          sma: [...CHART_CONFIG.DEFAULT_SMA_PERIODS],
          ema: [...CHART_CONFIG.DEFAULT_EMA_PERIODS],
          volume: true,
        },
        overlays: {
          positions: true,
          orders: true,
          signals: true,
        },
      },

      setTimeFrame: (timeFrame: TimeFrame) => {
        set(
          (state) => ({
            config: { ...state.config, timeFrame },
          }),
          false,
          'setTimeFrame'
        )
      },

      setChartType: (type: ChartType) => {
        set(
          (state) => ({
            config: { ...state.config, type },
          }),
          false,
          'setChartType'
        )
      },

      toggleIndicator: (indicator: keyof ChartConfig['indicators']) => {
        set(
          (state) => ({
            config: {
              ...state.config,
              indicators: {
                ...state.config.indicators,
                [indicator]: !state.config.indicators[indicator],
              },
            },
          }),
          false,
          'toggleIndicator'
        )
      },

      toggleOverlay: (overlay: keyof ChartConfig['overlays']) => {
        set(
          (state) => ({
            config: {
              ...state.config,
              overlays: {
                ...state.config.overlays,
                [overlay]: !state.config.overlays[overlay],
              },
            },
          }),
          false,
          'toggleOverlay'
        )
      },

      addSMA: (period: number) => {
        set(
          (state) => ({
            config: {
              ...state.config,
              indicators: {
                ...state.config.indicators,
                sma: [...state.config.indicators.sma, period].sort((a: number, b: number) => a - b),
              },
            },
          }),
          false,
          'addSMA'
        )
      },

      removeSMA: (period: number) => {
        set(
          (state) => ({
            config: {
              ...state.config,
              indicators: {
                ...state.config.indicators,
                sma: state.config.indicators.sma.filter((p: number) => p !== period),
              },
            },
          }),
          false,
          'removeSMA'
        )
      },

      addEMA: (period: number) => {
        set(
          (state) => ({
            config: {
              ...state.config,
              indicators: {
                ...state.config.indicators,
                ema: [...state.config.indicators.ema, period].sort((a: number, b: number) => a - b),
              },
            },
          }),
          false,
          'addEMA'
        )
      },

      removeEMA: (period: number) => {
        set(
          (state) => ({
            config: {
              ...state.config,
              indicators: {
                ...state.config.indicators,
                ema: state.config.indicators.ema.filter((p: number) => p !== period),
              },
            },
          }),
          false,
          'removeEMA'
        )
      },
    }),
    { name: 'chart-store' }
  )
)

// ============================================
// UI Store
// ============================================

interface UIState {
  sidebarCollapsed: boolean
  activeTab: string
  preferences: UserPreferences
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: number
  }>
  
  // Actions
  toggleSidebar: () => void
  setActiveTab: (tab: string) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarCollapsed: false,
      activeTab: 'dashboard',
      preferences: {
        theme: 'dark',
        defaultTimeFrame: '1h',
        defaultChartType: 'candlestick',
        soundAlerts: true,
        pushNotifications: true,
        compactMode: false,
      },
      notifications: [],

      toggleSidebar: () => {
        set(
          (state) => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          }),
          false,
          'toggleSidebar'
        )
      },

      setActiveTab: (tab: string) => {
        set({ activeTab: tab }, false, 'setActiveTab')
      },

      updatePreferences: (updates: Partial<UserPreferences>) => {
        set(
          (state) => ({
            preferences: { ...state.preferences, ...updates },
          }),
          false,
          'updatePreferences'
        )
      },

      addNotification: (notification) => {
        const id = `notification-${Date.now()}`
        set(
          (state) => ({
            notifications: [
              ...state.notifications,
              { ...notification, id, timestamp: Date.now() },
            ],
          }),
          false,
          'addNotification'
        )

        // Auto-remove after configured duration
        setTimeout(() => {
          set(
            (state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }),
            false,
            'removeNotification'
          )
        }, UI_CONFIG.TOAST_DURATION)
      },

      removeNotification: (id: string) => {
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'removeNotification'
        )
      },
    }),
    { name: 'ui-store' }
  )
)
