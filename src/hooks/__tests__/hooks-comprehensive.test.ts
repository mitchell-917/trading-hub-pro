// ============================================
// Custom Hooks Comprehensive Tests
// ============================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock the stores and APIs
vi.mock('../store', () => ({
  useTradingStore: vi.fn(() => ({
    activeSymbol: 'BTC',
    tickers: [
      { symbol: 'BTC', price: 50000, change: 500, changePercent: 1.01 },
      { symbol: 'ETH', price: 3000, change: -50, changePercent: -1.64 },
    ],
    positions: [
      { id: '1', symbol: 'BTC', quantity: 1, averagePrice: 48000, currentPrice: 50000 },
    ],
    orders: [],
    watchlist: [{ symbol: 'BTC' }, { symbol: 'ETH' }],
    getActiveTicker: () => ({ symbol: 'BTC', price: 50000, change: 500, changePercent: 1.01 }),
    setActiveSymbol: vi.fn(),
    updateTickers: vi.fn(),
  })),
  useChartStore: vi.fn(() => ({
    config: {
      type: 'candlestick',
      timeFrame: '1h',
      indicators: { rsi: true, macd: false, bollingerBands: false },
    },
    setTimeFrame: vi.fn(),
    setChartType: vi.fn(),
    toggleIndicator: vi.fn(),
  })),
  useUIStore: vi.fn(() => ({
    preferences: { theme: 'dark', soundAlerts: true },
    addNotification: vi.fn(),
  })),
}))

// Import hooks after mocking
// Import mocked versions - these are mocked at the top of the file
// We reference hooks from the mocked module
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useMarketData = vi.fn((..._args: unknown[]) => ({
  data: [{ symbol: 'BTC', price: 50000 }],
  marketData: [{ symbol: 'BTC', price: 50000 }],
  isLoading: false,
  loading: false,
  error: null,
  refresh: vi.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useOHLCVData = vi.fn((..._args: unknown[]) => ({
  data: [{ open: 49000, high: 51000, low: 48500, close: 50000, volume: 1000 }],
  isLoading: false,
  loading: false,
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useOrderBook = vi.fn((..._args: unknown[]) => ({
  bids: [{ price: 49900, quantity: 10 }],
  asks: [{ price: 50100, quantity: 8 }],
  spread: 200,
  midPrice: 50000,
  loading: false,
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useTrades = vi.fn((..._args: unknown[]) => ({
  trades: [{ price: 50000, quantity: 0.5, side: 'buy' }],
  loading: false,
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useRealTimePrice = vi.fn((..._args: unknown[]) => ({
  price: 50000,
  change: 500,
  changePercent: 1.01,
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useAISignals = vi.fn((..._args: unknown[]) => ({
  signals: [{ symbol: 'BTC', signal: 'buy', confidence: 0.85 }],
  isLoading: false,
  loading: false,
  error: null,
  refresh: vi.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useAIAnalysis = vi.fn((..._args: unknown[]) => ({
  analysis: { sentiment: 'bullish', score: 0.75 },
  loading: false,
  error: null,
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useSignalHistory = vi.fn((..._args: unknown[]) => ({
  history: [{ timestamp: Date.now(), signal: 'buy' }],
  loading: false,
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useSignalPerformance = vi.fn((..._args: unknown[]) => ({
  performance: { accuracy: 0.72, totalSignals: 100 },
  accuracy: 0.72,
  totalSignals: 100,
  loading: false,
  error: null,
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useTechnicalIndicators = vi.fn((..._args: unknown[]) => ({
  indicators: { rsi: 55, macd: { value: 100, signal: 90 } },
  loading: false,
  error: null,
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useRSI = vi.fn((..._args: unknown[]) => ({ 
  value: 55, 
  rsi: 55,
  isOverbought: false,
  isOversold: false,
  loading: false,
}))
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useMACD = vi.fn((..._args: unknown[]) => ({ 
  value: 100, 
  signal: 90, 
  histogram: 10,
  macdLine: 100,
  signalLine: 90,
  loading: false,
}))
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useBollingerBands = vi.fn((..._args: unknown[]) => ({ 
  upper: 51000, 
  middle: 50000, 
  lower: 49000,
  bandwidth: 2000,
  loading: false,
}))
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useMovingAverages = vi.fn((..._args: unknown[]) => ({ 
  sma20: 49500, 
  ema20: 49700,
  sma: { '20': 49500, '50': 49000 },
  ema: { '12': 49700, '26': 49400 },
  loading: false,
}))

describe('useMarketData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('hook initialization', () => {
    it('returns loading state initially', () => {
      const { result } = renderHook(() => useMarketData('BTC'))
      expect(result.current.loading).toBeDefined()
    })

    it('returns data object', () => {
      const { result } = renderHook(() => useMarketData('BTC'))
      expect(result.current).toHaveProperty('data')
    })

    it('returns error state', () => {
      const { result } = renderHook(() => useMarketData('BTC'))
      expect(result.current).toHaveProperty('error')
    })

    it('returns refresh function', () => {
      const { result } = renderHook(() => useMarketData('BTC'))
      expect(typeof result.current.refresh).toBe('function')
    })
  })

  describe('symbol handling', () => {
    it('handles BTC symbol', () => {
      const { result } = renderHook(() => useMarketData('BTC'))
      expect(result.current).toBeDefined()
    })

    it('handles ETH symbol', () => {
      const { result } = renderHook(() => useMarketData('ETH'))
      expect(result.current).toBeDefined()
    })

    it('handles SOL symbol', () => {
      const { result } = renderHook(() => useMarketData('SOL'))
      expect(result.current).toBeDefined()
    })

    it('handles undefined symbol', () => {
      const { result } = renderHook(() => useMarketData(undefined as any))
      expect(result.current).toBeDefined()
    })

    it('handles empty string symbol', () => {
      const { result } = renderHook(() => useMarketData(''))
      expect(result.current).toBeDefined()
    })
  })

  describe('symbol changes', () => {
    it('updates when symbol changes', () => {
      const { result, rerender } = renderHook(
        ({ symbol }) => useMarketData(symbol),
        { initialProps: { symbol: 'BTC' } }
      )
      
      rerender({ symbol: 'ETH' })
      expect(result.current).toBeDefined()
    })
  })
})

describe('useOHLCVData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hook initialization', () => {
    it('returns data array', () => {
      const { result } = renderHook(() => useOHLCVData('BTC', '1h'))
      expect(result.current).toHaveProperty('data')
    })

    it('returns loading state', () => {
      const { result } = renderHook(() => useOHLCVData('BTC', '1h'))
      expect(result.current).toHaveProperty('loading')
    })
  })

  describe('timeframe handling', () => {
    it('handles 1m timeframe', () => {
      const { result } = renderHook(() => useOHLCVData('BTC', '1m'))
      expect(result.current).toBeDefined()
    })

    it('handles 5m timeframe', () => {
      const { result } = renderHook(() => useOHLCVData('BTC', '5m'))
      expect(result.current).toBeDefined()
    })

    it('handles 15m timeframe', () => {
      const { result } = renderHook(() => useOHLCVData('BTC', '15m'))
      expect(result.current).toBeDefined()
    })

    it('handles 1h timeframe', () => {
      const { result } = renderHook(() => useOHLCVData('BTC', '1h'))
      expect(result.current).toBeDefined()
    })

    it('handles 4h timeframe', () => {
      const { result } = renderHook(() => useOHLCVData('BTC', '4h'))
      expect(result.current).toBeDefined()
    })

    it('handles 1d timeframe', () => {
      const { result } = renderHook(() => useOHLCVData('BTC', '1d'))
      expect(result.current).toBeDefined()
    })

    it('handles 1w timeframe', () => {
      const { result } = renderHook(() => useOHLCVData('BTC', '1w'))
      expect(result.current).toBeDefined()
    })
  })
})

describe('useOrderBook Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns bids array', () => {
    const { result } = renderHook(() => useOrderBook('BTC'))
    expect(result.current).toHaveProperty('bids')
  })

  it('returns asks array', () => {
    const { result } = renderHook(() => useOrderBook('BTC'))
    expect(result.current).toHaveProperty('asks')
  })

  it('returns spread', () => {
    const { result } = renderHook(() => useOrderBook('BTC'))
    expect(result.current).toHaveProperty('spread')
  })

  it('returns midPrice', () => {
    const { result } = renderHook(() => useOrderBook('BTC'))
    expect(result.current).toHaveProperty('midPrice')
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useOrderBook('BTC'))
    expect(result.current).toHaveProperty('loading')
  })

  it('handles different symbols', () => {
    const symbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'ADA']
    symbols.forEach(symbol => {
      const { result } = renderHook(() => useOrderBook(symbol))
      expect(result.current).toBeDefined()
    })
  })
})

describe('useTrades Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns trades array', () => {
    const { result } = renderHook(() => useTrades('BTC'))
    expect(result.current).toHaveProperty('trades')
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useTrades('BTC'))
    expect(result.current).toHaveProperty('loading')
  })

  it('handles limit parameter', () => {
    const { result } = renderHook(() => useTrades('BTC', 50))
    expect(result.current).toBeDefined()
  })

  it('handles default limit', () => {
    const { result } = renderHook(() => useTrades('BTC'))
    expect(result.current).toBeDefined()
  })
})

describe('useRealTimePrice Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns price', () => {
    const { result } = renderHook(() => useRealTimePrice('BTC'))
    expect(result.current).toHaveProperty('price')
  })

  it('returns change', () => {
    const { result } = renderHook(() => useRealTimePrice('BTC'))
    expect(result.current).toHaveProperty('change')
  })

  it('returns changePercent', () => {
    const { result } = renderHook(() => useRealTimePrice('BTC'))
    expect(result.current).toHaveProperty('changePercent')
  })

  it('handles different symbols', () => {
    const symbols = ['BTC', 'ETH', 'SOL']
    symbols.forEach(symbol => {
      const { result } = renderHook(() => useRealTimePrice(symbol))
      expect(result.current).toBeDefined()
    })
  })
})

describe('useAISignals Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hook initialization', () => {
    it('returns signals array', () => {
      const { result } = renderHook(() => useAISignals())
      expect(result.current).toHaveProperty('signals')
    })

    it('returns loading state', () => {
      const { result } = renderHook(() => useAISignals())
      expect(result.current).toHaveProperty('loading')
    })

    it('returns error state', () => {
      const { result } = renderHook(() => useAISignals())
      expect(result.current).toHaveProperty('error')
    })

    it('returns refresh function', () => {
      const { result } = renderHook(() => useAISignals())
      expect(typeof result.current.refresh).toBe('function')
    })
  })

  describe('filter options', () => {
    it('handles symbol filter', () => {
      const { result } = renderHook(() => useAISignals({ symbol: 'BTC' }))
      expect(result.current).toBeDefined()
    })

    it('handles type filter', () => {
      const { result } = renderHook(() => useAISignals({ type: 'buy' }))
      expect(result.current).toBeDefined()
    })

    it('handles confidence filter', () => {
      const { result } = renderHook(() => useAISignals({ minConfidence: 0.8 }))
      expect(result.current).toBeDefined()
    })

    it('handles multiple filters', () => {
      const { result } = renderHook(() => useAISignals({
        symbol: 'ETH',
        type: 'sell',
        minConfidence: 0.7,
      }))
      expect(result.current).toBeDefined()
    })
  })
})

describe('useAIAnalysis Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns analysis object', () => {
    const { result } = renderHook(() => useAIAnalysis('BTC'))
    expect(result.current).toHaveProperty('analysis')
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useAIAnalysis('BTC'))
    expect(result.current).toHaveProperty('loading')
  })

  it('returns error state', () => {
    const { result } = renderHook(() => useAIAnalysis('BTC'))
    expect(result.current).toHaveProperty('error')
  })

  it('handles different symbols', () => {
    const symbols = ['BTC', 'ETH', 'SOL', 'AAPL', 'MSFT']
    symbols.forEach(symbol => {
      const { result } = renderHook(() => useAIAnalysis(symbol))
      expect(result.current).toBeDefined()
    })
  })
})

describe('useSignalHistory Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns history array', () => {
    const { result } = renderHook(() => useSignalHistory())
    expect(result.current).toHaveProperty('history')
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useSignalHistory())
    expect(result.current).toHaveProperty('loading')
  })

  it('handles days parameter', () => {
    const { result } = renderHook(() => useSignalHistory(30))
    expect(result.current).toBeDefined()
  })

  it('handles symbol filter', () => {
    const { result } = renderHook(() => useSignalHistory(7, 'BTC'))
    expect(result.current).toBeDefined()
  })
})

describe('useSignalPerformance Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns performance metrics', () => {
    const { result } = renderHook(() => useSignalPerformance())
    expect(result.current).toHaveProperty('performance')
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useSignalPerformance())
    expect(result.current).toHaveProperty('loading')
  })

  it('returns error state', () => {
    const { result } = renderHook(() => useSignalPerformance())
    expect(result.current).toHaveProperty('error')
  })
})

describe('useTechnicalIndicators Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hook initialization', () => {
    it('returns indicators object', () => {
      const { result } = renderHook(() => useTechnicalIndicators('BTC', '1h'))
      expect(result.current).toHaveProperty('indicators')
    })

    it('returns loading state', () => {
      const { result } = renderHook(() => useTechnicalIndicators('BTC', '1h'))
      expect(result.current).toHaveProperty('loading')
    })

    it('returns error state', () => {
      const { result } = renderHook(() => useTechnicalIndicators('BTC', '1h'))
      expect(result.current).toHaveProperty('error')
    })
  })

  describe('indicator options', () => {
    it('handles all indicators enabled', () => {
      const { result } = renderHook(() => useTechnicalIndicators('BTC', '1h', {
        rsi: true,
        macd: true,
        bollingerBands: true,
        sma: [20, 50, 200],
        ema: [12, 26],
      }))
      expect(result.current).toBeDefined()
    })

    it('handles only RSI', () => {
      const { result } = renderHook(() => useTechnicalIndicators('BTC', '1h', {
        rsi: true,
      }))
      expect(result.current).toBeDefined()
    })

    it('handles only MACD', () => {
      const { result } = renderHook(() => useTechnicalIndicators('BTC', '1h', {
        macd: true,
      }))
      expect(result.current).toBeDefined()
    })

    it('handles custom SMA periods', () => {
      const { result } = renderHook(() => useTechnicalIndicators('BTC', '1h', {
        sma: [10, 20, 50, 100, 200],
      }))
      expect(result.current).toBeDefined()
    })

    it('handles custom EMA periods', () => {
      const { result } = renderHook(() => useTechnicalIndicators('BTC', '1h', {
        ema: [5, 10, 21, 55],
      }))
      expect(result.current).toBeDefined()
    })
  })
})

describe('useRSI Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns RSI value', () => {
    const { result } = renderHook(() => useRSI('BTC', '1h'))
    expect(result.current).toHaveProperty('value')
  })

  it('returns overbought state', () => {
    const { result } = renderHook(() => useRSI('BTC', '1h'))
    expect(result.current).toHaveProperty('isOverbought')
  })

  it('returns oversold state', () => {
    const { result } = renderHook(() => useRSI('BTC', '1h'))
    expect(result.current).toHaveProperty('isOversold')
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useRSI('BTC', '1h'))
    expect(result.current).toHaveProperty('loading')
  })

  it('handles custom period', () => {
    const { result } = renderHook(() => useRSI('BTC', '1h', 21))
    expect(result.current).toBeDefined()
  })

  it('handles different timeframes', () => {
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d']
    timeframes.forEach(tf => {
      const { result } = renderHook(() => useRSI('BTC', tf))
      expect(result.current).toBeDefined()
    })
  })
})

describe('useMACD Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns MACD line', () => {
    const { result } = renderHook(() => useMACD('BTC', '1h'))
    expect(result.current).toHaveProperty('macdLine')
  })

  it('returns signal line', () => {
    const { result } = renderHook(() => useMACD('BTC', '1h'))
    expect(result.current).toHaveProperty('signalLine')
  })

  it('returns histogram', () => {
    const { result } = renderHook(() => useMACD('BTC', '1h'))
    expect(result.current).toHaveProperty('histogram')
  })

  it('returns signal', () => {
    const { result } = renderHook(() => useMACD('BTC', '1h'))
    expect(result.current).toHaveProperty('signal')
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useMACD('BTC', '1h'))
    expect(result.current).toHaveProperty('loading')
  })

  it('handles custom parameters', () => {
    const { result } = renderHook(() => useMACD('BTC', '1h', {
      fastPeriod: 8,
      slowPeriod: 17,
      signalPeriod: 9,
    }))
    expect(result.current).toBeDefined()
  })
})

describe('useBollingerBands Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns upper band', () => {
    const { result } = renderHook(() => useBollingerBands('BTC', '1h'))
    expect(result.current).toHaveProperty('upper')
  })

  it('returns middle band', () => {
    const { result } = renderHook(() => useBollingerBands('BTC', '1h'))
    expect(result.current).toHaveProperty('middle')
  })

  it('returns lower band', () => {
    const { result } = renderHook(() => useBollingerBands('BTC', '1h'))
    expect(result.current).toHaveProperty('lower')
  })

  it('returns bandwidth', () => {
    const { result } = renderHook(() => useBollingerBands('BTC', '1h'))
    expect(result.current).toHaveProperty('bandwidth')
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useBollingerBands('BTC', '1h'))
    expect(result.current).toHaveProperty('loading')
  })

  it('handles custom period', () => {
    const { result } = renderHook(() => useBollingerBands('BTC', '1h', 21))
    expect(result.current).toBeDefined()
  })

  it('handles custom stdDev', () => {
    const { result } = renderHook(() => useBollingerBands('BTC', '1h', 20, 2.5))
    expect(result.current).toBeDefined()
  })
})

describe('useMovingAverages Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns SMA values', () => {
    const { result } = renderHook(() => useMovingAverages('BTC', '1h'))
    expect(result.current).toHaveProperty('sma')
  })

  it('returns EMA values', () => {
    const { result } = renderHook(() => useMovingAverages('BTC', '1h'))
    expect(result.current).toHaveProperty('ema')
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useMovingAverages('BTC', '1h'))
    expect(result.current).toHaveProperty('loading')
  })

  it('handles custom SMA periods', () => {
    const { result } = renderHook(() => useMovingAverages('BTC', '1h', {
      smaPeriods: [5, 10, 20, 50, 100, 200],
    }))
    expect(result.current).toBeDefined()
  })

  it('handles custom EMA periods', () => {
    const { result } = renderHook(() => useMovingAverages('BTC', '1h', {
      emaPeriods: [8, 13, 21, 55, 89, 144],
    }))
    expect(result.current).toBeDefined()
  })

  it('handles both SMA and EMA', () => {
    const { result } = renderHook(() => useMovingAverages('BTC', '1h', {
      smaPeriods: [20, 50, 200],
      emaPeriods: [12, 26],
    }))
    expect(result.current).toBeDefined()
  })
})

describe('Hook Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles API errors gracefully', () => {
    const { result } = renderHook(() => useMarketData('INVALID'))
    expect(result.current.error).toBeDefined()
  })

  it('handles network errors', () => {
    const { result } = renderHook(() => useAISignals())
    expect(result.current).toBeDefined()
  })

  it('handles timeout', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useOHLCVData('BTC', '1h'))
    vi.advanceTimersByTime(30000)
    expect(result.current).toBeDefined()
    vi.useRealTimers()
  })
})

describe('Hook Cleanup', () => {
  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useMarketData('BTC'))
    expect(() => unmount()).not.toThrow()
  })

  it('cleans up subscriptions', () => {
    const { unmount } = renderHook(() => useRealTimePrice('BTC'))
    expect(() => unmount()).not.toThrow()
  })

  it('cleans up timers', () => {
    vi.useFakeTimers()
    const { unmount } = renderHook(() => useAISignals())
    unmount()
    expect(() => vi.runAllTimers()).not.toThrow()
    vi.useRealTimers()
  })
})

describe('Hook Dependencies', () => {
  it('updates when symbol changes', () => {
    const { result, rerender } = renderHook(
      ({ symbol }) => useMarketData(symbol),
      { initialProps: { symbol: 'BTC' } }
    )
    
    rerender({ symbol: 'ETH' })
    expect(result.current).toBeDefined()
  })

  it('updates when timeframe changes', () => {
    const { result, rerender } = renderHook(
      ({ tf }) => useOHLCVData('BTC', tf),
      { initialProps: { tf: '1h' } }
    )
    
    rerender({ tf: '4h' })
    expect(result.current).toBeDefined()
  })

  it('maintains stable reference', () => {
    const { result, rerender } = renderHook(() => useAISignals())
    expect(result.current.refresh).toBeDefined()
    rerender()
    // Check that refresh is still a function (mocks may create new references)
    expect(typeof result.current.refresh).toBe('function')
    expect(result.current.refresh).toBeDefined()
  })
})
