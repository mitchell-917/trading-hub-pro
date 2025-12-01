// ============================================
// TradingHub Pro - Application Configuration
// Centralized constants and configuration values
// ============================================

/**
 * Trading configuration constants
 */
export const TRADING_CONFIG = {
  /** Initial account balance for new users */
  INITIAL_BALANCE: 100_000,
  
  /** Trading fee rate (0.1%) */
  FEE_RATE: 0.001,
  
  /** Maximum number of symbols in watchlist */
  MAX_WATCHLIST_SYMBOLS: 50,
  
  /** Order execution simulation delay (ms) */
  ORDER_EXECUTION_DELAY: 200,
  
  /** Order cancellation simulation delay (ms) */
  ORDER_CANCEL_DELAY: 300,
  
  /** Order modification simulation delay (ms) */
  ORDER_MODIFY_DELAY: 300,
} as const

/**
 * Default watchlist symbols for new users
 */
export const DEFAULT_WATCHLIST_SYMBOLS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
] as const

/**
 * WebSocket configuration
 */
export const WEBSOCKET_CONFIG = {
  /** Reconnection delay in milliseconds */
  RECONNECT_DELAY: 1000,
  
  /** Maximum reconnection delay in milliseconds */
  MAX_RECONNECT_DELAY: 30_000,
  
  /** Reconnection delay multiplier */
  RECONNECT_MULTIPLIER: 1.5,
  
  /** Maximum reconnection attempts */
  MAX_RECONNECT_ATTEMPTS: 10,
} as const

/**
 * React Query configuration
 */
export const QUERY_CONFIG = {
  /** Default stale time in milliseconds */
  STALE_TIME: 30_000,
  
  /** Cache time in milliseconds */
  CACHE_TIME: 5 * 60 * 1000,
  
  /** Retry attempts (set to 1 for faster error feedback) */
  RETRY_ATTEMPTS: 1,
  
  /** Refetch interval for real-time data */
  REALTIME_REFETCH_INTERVAL: 5_000,
} as const

/**
 * UI configuration
 */
export const UI_CONFIG = {
  /** Toast notification auto-dismiss delay (ms) */
  TOAST_DURATION: 5_000,
  
  /** Animation duration in milliseconds */
  ANIMATION_DURATION: 200,
  
  /** Debounce delay for search inputs (ms) */
  SEARCH_DEBOUNCE: 300,
  
  /** Items per page for pagination */
  ITEMS_PER_PAGE: 20,
} as const

/**
 * Chart configuration defaults
 */
export const CHART_CONFIG = {
  /** Default chart type */
  DEFAULT_TYPE: 'candlestick' as const,
  
  /** Default timeframe */
  DEFAULT_TIMEFRAME: '1h' as const,
  
  /** Default SMA periods */
  DEFAULT_SMA_PERIODS: [20, 50] as const,
  
  /** Default EMA periods */
  DEFAULT_EMA_PERIODS: [12, 26] as const,
} as const

/**
 * API endpoints (can be overridden by environment variables)
 */
export const API_CONFIG = {
  /** Binance WebSocket base URL */
  BINANCE_WS_URL: 'wss://stream.binance.com:9443/ws',
  
  /** Binance REST API base URL */
  BINANCE_API_URL: 'https://api.binance.com/api/v3',
  
  /** CoinGecko API base URL */
  COINGECKO_API_URL: 'https://api.coingecko.com/api/v3',
} as const

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  /** Trading store persistence key */
  TRADING_STORE: 'trading-hub-storage',
  
  /** Theme preference key */
  THEME: 'trading-hub-theme',
  
  /** User preferences key */
  PREFERENCES: 'trading-hub-preferences',
} as const

/**
 * Feature flags for development/production mode
 * Override via environment variables or MockDataProvider
 */
export const FEATURE_FLAGS = {
  /** Use mock data generators instead of real API */
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA !== 'false',
  
  /** Enable developer tools and debugging */
  DEV_TOOLS: import.meta.env.DEV,
  
  /** Enable performance monitoring */
  PERF_MONITORING: import.meta.env.VITE_PERF_MONITORING === 'true',
  
  /** Enable AI features */
  AI_ENABLED: import.meta.env.VITE_AI_ENABLED !== 'false',
  
  /** Enable WebSocket real-time updates */
  REALTIME_ENABLED: import.meta.env.VITE_REALTIME_ENABLED !== 'false',
} as const

export type TradingConfig = typeof TRADING_CONFIG
export type WebSocketConfig = typeof WEBSOCKET_CONFIG
export type QueryConfig = typeof QUERY_CONFIG
export type UIConfig = typeof UI_CONFIG
export type ChartConfigDefaults = typeof CHART_CONFIG
export type APIConfig = typeof API_CONFIG
export type StorageKeys = typeof STORAGE_KEYS
export type FeatureFlags = typeof FEATURE_FLAGS
