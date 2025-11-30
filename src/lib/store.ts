// ============================================
// TradingHub Pro - Global State Management
// Using Zustand for efficient state management
// ============================================

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
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
import {
  generateAllTickers,
  generatePositions,
  generateOrders,
  generateWatchlist,
} from './mock-data'

// ============================================
// Trading Store
// ============================================

interface TradingState {
  // Market Data
  tickers: Ticker[]
  activeSymbol: string
  
  // Actions
  setActiveSymbol: (symbol: string) => void
  updateTickers: (tickers: Ticker[]) => void
  updateTicker: (ticker: Ticker) => void
  
  // Selectors
  getActiveTicker: () => Ticker | undefined
}

export const useTradingStore = create<TradingState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      tickers: generateAllTickers(),
      activeSymbol: 'BTC',

      setActiveSymbol: (symbol: string) => {
        set({ activeSymbol: symbol }, false, 'setActiveSymbol')
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

      getActiveTicker: () => {
        const { tickers, activeSymbol } = get()
        return tickers.find((t) => t.symbol === activeSymbol)
      },
    })),
    { name: 'trading-store' }
  )
)

// ============================================
// Portfolio Store
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

export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    (set, get) => ({
      positions: generatePositions(),
      totalValue: 0,
      totalPnl: 0,
      cashBalance: 25000,

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

export const useOrdersStore = create<OrdersState>()(
  devtools(
    (set, get) => ({
      orders: generateOrders(15),

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
// ============================================

interface WatchlistState {
  items: WatchlistItem[]
  
  // Actions
  addItem: (item: WatchlistItem) => void
  removeItem: (symbol: string) => void
  updateItem: (symbol: string, updates: Partial<WatchlistItem>) => void
  isWatching: (symbol: string) => boolean
}

export const useWatchlistStore = create<WatchlistState>()(
  devtools(
    (set, get) => ({
      items: generateWatchlist(),

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
        type: 'candlestick',
        timeFrame: '1h',
        indicators: {
          rsi: true,
          macd: false,
          bollingerBands: true,
          sma: [20, 50],
          ema: [12, 26],
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
                sma: [...state.config.indicators.sma, period].sort((a, b) => a - b),
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
                sma: state.config.indicators.sma.filter((p) => p !== period),
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
                ema: [...state.config.indicators.ema, period].sort((a, b) => a - b),
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
                ema: state.config.indicators.ema.filter((p) => p !== period),
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

        // Auto-remove after 5 seconds
        setTimeout(() => {
          set(
            (state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }),
            false,
            'removeNotification'
          )
        }, 5000)
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
