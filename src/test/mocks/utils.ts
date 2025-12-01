// ============================================
// TradingHub Pro - Mock Data Utilities
// Environment detection and flag helpers
// ============================================

/**
 * Feature flags for data sources
 */
export interface DataSourceFlags {
  /** Use mock data for market prices */
  useMockMarketData: boolean
  /** Use mock data for portfolio */
  useMockPortfolio: boolean
  /** Use mock data for orders */
  useMockOrders: boolean
  /** Use mock data for AI signals */
  useMockAISignals: boolean
  /** Use mock data for news */
  useMockNews: boolean
  /** Simulate network latency */
  simulateLatency: boolean
  /** Latency range in milliseconds [min, max] */
  latencyRange: [number, number]
}

/**
 * Default feature flags (all mock in development)
 */
export const DEFAULT_FLAGS: DataSourceFlags = {
  useMockMarketData: true,
  useMockPortfolio: true,
  useMockOrders: true,
  useMockAISignals: true,
  useMockNews: true,
  simulateLatency: true,
  latencyRange: [100, 500],
}

/**
 * Production flags (all real data)
 */
export const PRODUCTION_FLAGS: DataSourceFlags = {
  useMockMarketData: false,
  useMockPortfolio: false,
  useMockOrders: false,
  useMockAISignals: false,
  useMockNews: false,
  simulateLatency: false,
  latencyRange: [0, 0],
}

/**
 * Helper to determine if running in test environment
 */
export function isTestEnvironment(): boolean {
  return import.meta.env.MODE === 'test' || 
         typeof (globalThis as { vi?: unknown }).vi !== 'undefined'
}

/**
 * Helper to determine if running in development
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV
}

/**
 * Helper to determine if running in production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD
}

/**
 * Get recommended flags based on environment
 */
export function getEnvironmentFlags(): DataSourceFlags {
  if (isProduction()) {
    return PRODUCTION_FLAGS
  }
  
  // In development and test, use mocks
  return DEFAULT_FLAGS
}
