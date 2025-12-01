// ============================================
// TradingHub Pro - Mock Data Index
// Central exports for all mock data generators
// ============================================

// Re-export all mock generators from the main mock-data module
// This allows tests to import from @/test/mocks while
// keeping the generators in lib for production use

export {
  // Seed management
  resetSeed,
  
  // Utility functions
  randomBetween,
  randomInt,
  randomChoice,
  formatPrice,
  
  // Symbol data
  SYMBOLS,
  
  // Data generators
  generateOHLCVData,
  generateTicker,
  generateAllTickers,
  generateOrderBook,
  generateTrades,
  generatePositions,
  generatePortfolioSummary,
  generateOrders,
  generateRSI,
  generateMACD,
  generateBollingerBands,
  generateAISignals,
  generateAIAnalysis,
  generateNews,
  generateWatchlist,
} from '@/lib/mock-data'

// Export mock factory functions for testing
export { createMockTicker, createMockPosition, createMockOrder } from './factories'

// Export mock data provider hooks
export { MockDataProvider, type DataSourceFlags } from './providers'
export { useMockData } from './useMockData'

// Export utility functions
export {
  DEFAULT_FLAGS,
  PRODUCTION_FLAGS,
  isTestEnvironment,
  isDevelopment,
  isProduction,
  getEnvironmentFlags,
} from './utils'
