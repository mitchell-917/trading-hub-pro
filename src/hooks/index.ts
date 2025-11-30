// ============================================
// TradingHub Pro - Hooks Index
// ============================================

export { useMarketData, useMultipleTickers, useOHLCVData } from './useMarketData'
export {
  useRealTimeMarketData,
  useMultipleRealTimeTickers,
} from './useRealTimeMarketData'
export {
  useExchangeRates,
  usePriceConversion,
  useAsyncCurrencyConversion,
} from './useCurrencyConversion'
export {
  useTechnicalIndicators,
  getRSISignal,
  getMACDSignal,
  getBollingerBandsSignal,
} from './useTechnicalIndicators'
export {
  useOrderBook,
  getDepthPercentage,
  formatOrderBookEntry,
  calculateSpread,
} from './useOrderBook'
export {
  useTrading,
  calculateOrderValue,
  validateOrder,
  formatOrderDisplay,
} from './useTrading'
export {
  useAISignals,
  calculateSignalScore,
  getSignalRecommendation,
  calculateRiskReward,
} from './useAISignals'
export {
  useStockQuote,
  useStockHistory,
  useMultipleStockQuotes,
  useStockSearch,
  useMarketIndices,
  useStockDailyHistory,
} from './useStockData'
export {
  useForexPair,
  useMajorForexPairs,
  useForexHistory,
  useCommodityPrices,
  useGoldPrice,
  useOilPrices,
  useMetalPrices,
  useCurrencyConverter,
  useMultipleCurrencyRates,
  useForexWatchlist,
  useCryptoFiatRate,
  useForexMarketMovers,
} from './useForexData'
export {
  useNews,
  useBreakingNews,
  useNewsByCategory,
  useNewsBySymbols,
  useMarketSentiment,
  useNewsSearch,
  useCryptoNews,
  useTrendingTopics,
  useCoinNews,
  useMarketNews,
  usePortfolioNews,
} from './useNews'
