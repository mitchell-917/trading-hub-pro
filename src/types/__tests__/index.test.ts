// ============================================
// Types Tests - Comprehensive Type Validation Testing
// ============================================

import { describe, it, expect } from 'vitest'
import type {
  OHLCV,
  Ticker,
  OrderBookEntry,
  OrderBook,
  Trade,
  Position,
  PortfolioSummary,
  Order,
  OrderType,
  OrderSide,
  OrderStatus,
  TimeInForce,
  RSIData,
  MACDData,
  BollingerBandsData,
  SMAData,
  EMAData,
  TechnicalIndicators,
  AISignal,
  AIAnalysis,
  SignalStrength,
  SignalDirection,
  WatchlistItem,
  Watchlist,
  Alert,
  AlertType,
  AlertStatus,
  NewsItem,
  ChartType,
  TimeFrame,
  ChartConfig,
  UserPreferences,
  AppState,
  LoadingState,
  AsyncState,
} from '@/types'

// Type guard functions for testing
const isOHLCV = (obj: unknown): obj is OHLCV => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'timestamp' in obj &&
    'open' in obj &&
    'high' in obj &&
    'low' in obj &&
    'close' in obj &&
    'volume' in obj
  )
}

const isTicker = (obj: unknown): obj is Ticker => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'symbol' in obj &&
    'name' in obj &&
    'price' in obj &&
    'change' in obj &&
    'changePercent' in obj &&
    'volume' in obj &&
    'high24h' in obj &&
    'low24h' in obj &&
    'lastUpdated' in obj
  )
}

const isOrderBookEntry = (obj: unknown): obj is OrderBookEntry => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'price' in obj &&
    'quantity' in obj &&
    'total' in obj
  )
}

const isOrderBook = (obj: unknown): obj is OrderBook => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'bids' in obj &&
    'asks' in obj &&
    'spread' in obj &&
    'spreadPercent' in obj &&
    Array.isArray((obj as OrderBook).bids) &&
    Array.isArray((obj as OrderBook).asks)
  )
}

const isTrade = (obj: unknown): obj is Trade => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'symbol' in obj &&
    'side' in obj &&
    'price' in obj &&
    'quantity' in obj &&
    'timestamp' in obj &&
    'maker' in obj
  )
}

const isPosition = (obj: unknown): obj is Position => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'symbol' in obj &&
    'name' in obj &&
    'quantity' in obj &&
    'averagePrice' in obj &&
    'currentPrice' in obj &&
    'pnl' in obj &&
    'pnlPercent' in obj &&
    'allocation' in obj
  )
}

const isOrder = (obj: unknown): obj is Order => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'symbol' in obj &&
    'side' in obj &&
    'type' in obj &&
    'status' in obj &&
    'quantity' in obj &&
    'filledQuantity' in obj &&
    'timeInForce' in obj &&
    'createdAt' in obj &&
    'updatedAt' in obj
  )
}

const isRSIData = (obj: unknown): obj is RSIData => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'timestamp' in obj &&
    'value' in obj &&
    'overbought' in obj &&
    'oversold' in obj
  )
}

const isMACDData = (obj: unknown): obj is MACDData => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'timestamp' in obj &&
    'macd' in obj &&
    'signal' in obj &&
    'histogram' in obj
  )
}

const isBollingerBandsData = (obj: unknown): obj is BollingerBandsData => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'timestamp' in obj &&
    'upper' in obj &&
    'middle' in obj &&
    'lower' in obj &&
    'bandwidth' in obj
  )
}

const isAISignal = (obj: unknown): obj is AISignal => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'symbol' in obj &&
    'direction' in obj &&
    'strength' in obj &&
    'confidence' in obj &&
    'entryPrice' in obj &&
    'targetPrice' in obj &&
    'stopLoss' in obj &&
    'riskRewardRatio' in obj &&
    'reasoning' in obj &&
    'indicators' in obj &&
    'timestamp' in obj &&
    'expiresAt' in obj
  )
}

const isAIAnalysis = (obj: unknown): obj is AIAnalysis => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'symbol' in obj &&
    'summary' in obj &&
    'sentiment' in obj &&
    'sentimentScore' in obj &&
    'keyFactors' in obj &&
    'signals' in obj &&
    'lastUpdated' in obj
  )
}

const isWatchlistItem = (obj: unknown): obj is WatchlistItem => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'symbol' in obj &&
    'name' in obj &&
    'addedAt' in obj
  )
}

const isNewsItem = (obj: unknown): obj is NewsItem => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'summary' in obj &&
    'source' in obj &&
    'url' in obj &&
    'sentiment' in obj &&
    'symbols' in obj &&
    'publishedAt' in obj
  )
}

describe('Type Definitions - OHLCV', () => {
  it('validates OHLCV structure', () => {
    const ohlcv: OHLCV = {
      timestamp: Date.now(),
      open: 100,
      high: 110,
      low: 90,
      close: 105,
      volume: 1000000,
    }
    expect(isOHLCV(ohlcv)).toBe(true)
  })

  it('rejects invalid OHLCV structure', () => {
    expect(isOHLCV({})).toBe(false)
    expect(isOHLCV(null)).toBe(false)
    expect(isOHLCV({ timestamp: 1 })).toBe(false)
  })

  it('allows numeric values for all price fields', () => {
    const ohlcv: OHLCV = {
      timestamp: 1234567890,
      open: 0.001,
      high: 0.002,
      low: 0.0005,
      close: 0.0015,
      volume: 1,
    }
    expect(isOHLCV(ohlcv)).toBe(true)
  })
})

describe('Type Definitions - Ticker', () => {
  it('validates Ticker structure', () => {
    const ticker: Ticker = {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 50000,
      change: 1000,
      changePercent: 2.04,
      volume: 1000000000,
      high24h: 51000,
      low24h: 49000,
      lastUpdated: Date.now(),
    }
    expect(isTicker(ticker)).toBe(true)
  })

  it('allows optional marketCap', () => {
    const tickerWithMarketCap: Ticker = {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3000,
      change: 50,
      changePercent: 1.69,
      volume: 500000000,
      high24h: 3100,
      low24h: 2900,
      marketCap: 360000000000,
      lastUpdated: Date.now(),
    }
    expect(isTicker(tickerWithMarketCap)).toBe(true)
    expect(tickerWithMarketCap.marketCap).toBe(360000000000)
  })
})

describe('Type Definitions - OrderBook', () => {
  it('validates OrderBookEntry structure', () => {
    const entry: OrderBookEntry = {
      price: 50000,
      quantity: 1.5,
      total: 75000,
    }
    expect(isOrderBookEntry(entry)).toBe(true)
  })

  it('validates OrderBook structure', () => {
    const orderBook: OrderBook = {
      bids: [{ price: 49900, quantity: 1, total: 49900 }],
      asks: [{ price: 50100, quantity: 1, total: 50100 }],
      spread: 200,
      spreadPercent: 0.4,
    }
    expect(isOrderBook(orderBook)).toBe(true)
  })

  it('validates empty order book', () => {
    const emptyBook: OrderBook = {
      bids: [],
      asks: [],
      spread: 0,
      spreadPercent: 0,
    }
    expect(isOrderBook(emptyBook)).toBe(true)
  })
})

describe('Type Definitions - Trade', () => {
  it('validates Trade structure', () => {
    const trade: Trade = {
      id: 'trade-123',
      symbol: 'BTC',
      side: 'buy',
      price: 50000,
      quantity: 0.5,
      timestamp: Date.now(),
      maker: true,
    }
    expect(isTrade(trade)).toBe(true)
  })

  it('validates buy side', () => {
    const buyTrade: Trade = {
      id: 'trade-buy',
      symbol: 'ETH',
      side: 'buy',
      price: 3000,
      quantity: 2,
      timestamp: Date.now(),
      maker: false,
    }
    expect(buyTrade.side).toBe('buy')
  })

  it('validates sell side', () => {
    const sellTrade: Trade = {
      id: 'trade-sell',
      symbol: 'SOL',
      side: 'sell',
      price: 150,
      quantity: 10,
      timestamp: Date.now(),
      maker: true,
    }
    expect(sellTrade.side).toBe('sell')
  })
})

describe('Type Definitions - Position', () => {
  it('validates Position structure', () => {
    const position: Position = {
      id: 'pos-1',
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1.5,
      averagePrice: 48000,
      currentPrice: 50000,
      pnl: 3000,
      pnlPercent: 6.25,
      allocation: 45,
      lastUpdated: Date.now(),
      side: 'long',
      entryPrice: 48000,
      unrealizedPnL: 3000,
      unrealizedPnLPercent: 6.25,
      leverage: 1,
    }
    expect(isPosition(position)).toBe(true)
  })

  it('validates long position', () => {
    const longPosition: Position = {
      id: 'long-1',
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 10,
      averagePrice: 2800,
      currentPrice: 3000,
      pnl: 2000,
      pnlPercent: 7.14,
      allocation: 30,
      lastUpdated: Date.now(),
      side: 'long',
      entryPrice: 2800,
      unrealizedPnL: 2000,
      unrealizedPnLPercent: 7.14,
      leverage: 2,
      stopLoss: 2600,
      takeProfit: 3500,
    }
    expect(longPosition.side).toBe('long')
  })

  it('validates short position', () => {
    const shortPosition: Position = {
      id: 'short-1',
      symbol: 'SOL',
      name: 'Solana',
      quantity: 50,
      averagePrice: 180,
      currentPrice: 160,
      pnl: 1000,
      pnlPercent: 11.11,
      allocation: 15,
      lastUpdated: Date.now(),
      side: 'short',
      entryPrice: 180,
      unrealizedPnL: 1000,
      unrealizedPnLPercent: 11.11,
      leverage: 5,
      stopLoss: 200,
      takeProfit: 140,
    }
    expect(shortPosition.side).toBe('short')
  })
})

describe('Type Definitions - Order Types', () => {
  it('validates OrderType values', () => {
    const types: OrderType[] = ['market', 'limit', 'stop', 'stop-limit', 'trailing-stop']
    types.forEach(type => {
      expect(['market', 'limit', 'stop', 'stop-limit', 'trailing-stop']).toContain(type)
    })
  })

  it('validates OrderSide values', () => {
    const sides: OrderSide[] = ['buy', 'sell']
    expect(sides).toContain('buy')
    expect(sides).toContain('sell')
  })

  it('validates OrderStatus values', () => {
    const statuses: OrderStatus[] = [
      'pending',
      'open',
      'filled',
      'partially-filled',
      'cancelled',
      'rejected',
    ]
    expect(statuses).toHaveLength(6)
  })

  it('validates TimeInForce values', () => {
    const tifs: TimeInForce[] = ['gtc', 'day', 'ioc', 'fok']
    expect(tifs).toHaveLength(4)
  })
})

describe('Type Definitions - Order', () => {
  it('validates Order structure', () => {
    const order: Order = {
      id: 'order-1',
      symbol: 'BTC',
      side: 'buy',
      type: 'limit',
      status: 'open',
      quantity: 0.5,
      filledQuantity: 0,
      price: 49000,
      timeInForce: 'gtc',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(isOrder(order)).toBe(true)
  })

  it('validates filled order', () => {
    const filledOrder: Order = {
      id: 'order-filled',
      symbol: 'ETH',
      side: 'sell',
      type: 'market',
      status: 'filled',
      quantity: 2,
      filledQuantity: 2,
      timeInForce: 'ioc',
      createdAt: Date.now() - 10000,
      updatedAt: Date.now(),
      filledAt: Date.now(),
    }
    expect(filledOrder.status).toBe('filled')
    expect(filledOrder.filledQuantity).toBe(filledOrder.quantity)
  })

  it('validates stop order', () => {
    const stopOrder: Order = {
      id: 'order-stop',
      symbol: 'SOL',
      side: 'sell',
      type: 'stop',
      status: 'pending',
      quantity: 10,
      filledQuantity: 0,
      stopPrice: 150,
      timeInForce: 'gtc',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(stopOrder.stopPrice).toBe(150)
  })
})

describe('Type Definitions - Technical Indicators', () => {
  it('validates RSIData structure', () => {
    const rsi: RSIData = {
      timestamp: Date.now(),
      value: 65,
      overbought: false,
      oversold: false,
    }
    expect(isRSIData(rsi)).toBe(true)
  })

  it('validates overbought RSI', () => {
    const overboughtRSI: RSIData = {
      timestamp: Date.now(),
      value: 75,
      overbought: true,
      oversold: false,
    }
    expect(overboughtRSI.overbought).toBe(true)
  })

  it('validates oversold RSI', () => {
    const oversoldRSI: RSIData = {
      timestamp: Date.now(),
      value: 25,
      overbought: false,
      oversold: true,
    }
    expect(oversoldRSI.oversold).toBe(true)
  })

  it('validates MACDData structure', () => {
    const macd: MACDData = {
      timestamp: Date.now(),
      macd: 150,
      signal: 120,
      histogram: 30,
    }
    expect(isMACDData(macd)).toBe(true)
  })

  it('validates BollingerBandsData structure', () => {
    const bb: BollingerBandsData = {
      timestamp: Date.now(),
      upper: 52000,
      middle: 50000,
      lower: 48000,
      bandwidth: 8,
    }
    expect(isBollingerBandsData(bb)).toBe(true)
  })

  it('validates SMAData structure', () => {
    const sma: SMAData = {
      timestamp: Date.now(),
      value: 50500,
      period: 20,
    }
    expect(sma.period).toBe(20)
  })

  it('validates EMAData structure', () => {
    const ema: EMAData = {
      timestamp: Date.now(),
      value: 50200,
      period: 12,
    }
    expect(ema.period).toBe(12)
  })
})

describe('Type Definitions - AI Signals', () => {
  it('validates SignalStrength values', () => {
    const strengths: SignalStrength[] = ['strong', 'moderate', 'weak']
    expect(strengths).toHaveLength(3)
  })

  it('validates SignalDirection values', () => {
    const directions: SignalDirection[] = ['bullish', 'bearish', 'neutral']
    expect(directions).toHaveLength(3)
  })

  it('validates AISignal structure', () => {
    const signal: AISignal = {
      id: 'signal-1',
      symbol: 'BTC',
      direction: 'bullish',
      strength: 'strong',
      confidence: 85,
      entryPrice: 50000,
      targetPrice: 55000,
      stopLoss: 48000,
      riskRewardRatio: 2.5,
      reasoning: ['Strong support level', 'Bullish divergence'],
      indicators: ['RSI', 'MACD'],
      timestamp: Date.now(),
      expiresAt: Date.now() + 86400000,
    }
    expect(isAISignal(signal)).toBe(true)
  })

  it('validates AIAnalysis structure', () => {
    const analysis: AIAnalysis = {
      symbol: 'ETH',
      summary: 'Ethereum shows bullish momentum',
      sentiment: 'bullish',
      sentimentScore: 75,
      keyFactors: ['Strong fundamentals', 'Network growth'],
      signals: [],
      lastUpdated: Date.now(),
    }
    expect(isAIAnalysis(analysis)).toBe(true)
  })
})

describe('Type Definitions - Watchlist', () => {
  it('validates WatchlistItem structure', () => {
    const item: WatchlistItem = {
      symbol: 'BTC',
      name: 'Bitcoin',
      addedAt: Date.now(),
    }
    expect(isWatchlistItem(item)).toBe(true)
  })

  it('validates WatchlistItem with optional fields', () => {
    const itemWithOptionals: WatchlistItem = {
      symbol: 'ETH',
      name: 'Ethereum',
      addedAt: Date.now(),
      alertPrice: 3500,
      notes: 'Watching for breakout',
    }
    expect(itemWithOptionals.alertPrice).toBe(3500)
    expect(itemWithOptionals.notes).toBe('Watching for breakout')
  })

  it('validates Watchlist structure', () => {
    const watchlist: Watchlist = {
      id: 'watchlist-1',
      name: 'My Favorites',
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(watchlist.items).toEqual([])
  })
})

describe('Type Definitions - Alerts', () => {
  it('validates AlertType values', () => {
    const types: AlertType[] = [
      'price-above',
      'price-below',
      'percent-change',
      'volume-spike',
      'signal',
    ]
    expect(types).toHaveLength(5)
  })

  it('validates AlertStatus values', () => {
    const statuses: AlertStatus[] = ['active', 'triggered', 'expired', 'disabled']
    expect(statuses).toHaveLength(4)
  })

  it('validates Alert structure', () => {
    const alert: Alert = {
      id: 'alert-1',
      symbol: 'BTC',
      type: 'price-above',
      status: 'active',
      condition: 'Price > 55000',
      targetValue: 55000,
      currentValue: 50000,
      message: 'BTC has risen above $55,000',
      createdAt: Date.now(),
    }
    expect(alert.status).toBe('active')
  })

  it('validates triggered Alert', () => {
    const triggeredAlert: Alert = {
      id: 'alert-triggered',
      symbol: 'ETH',
      type: 'price-below',
      status: 'triggered',
      condition: 'Price < 2800',
      targetValue: 2800,
      currentValue: 2750,
      message: 'ETH dropped below $2,800',
      createdAt: Date.now() - 86400000,
      triggeredAt: Date.now(),
    }
    expect(triggeredAlert.triggeredAt).toBeDefined()
  })
})

describe('Type Definitions - News', () => {
  it('validates NewsItem structure', () => {
    const news: NewsItem = {
      id: 'news-1',
      title: 'Bitcoin Reaches New High',
      summary: 'Bitcoin has reached a new all-time high...',
      source: 'CoinDesk',
      url: 'https://example.com/news/btc-ath',
      sentiment: 'positive',
      symbols: ['BTC'],
      publishedAt: Date.now(),
    }
    expect(isNewsItem(news)).toBe(true)
  })

  it('validates positive sentiment', () => {
    const positiveNews: NewsItem = {
      id: 'positive-news',
      title: 'Good News',
      summary: 'Markets rally...',
      source: 'Reuters',
      url: '#',
      sentiment: 'positive',
      symbols: ['SPY'],
      publishedAt: Date.now(),
    }
    expect(positiveNews.sentiment).toBe('positive')
  })

  it('validates negative sentiment', () => {
    const negativeNews: NewsItem = {
      id: 'negative-news',
      title: 'Market Crash',
      summary: 'Markets decline...',
      source: 'Bloomberg',
      url: '#',
      sentiment: 'negative',
      symbols: ['QQQ'],
      publishedAt: Date.now(),
    }
    expect(negativeNews.sentiment).toBe('negative')
  })

  it('validates neutral sentiment', () => {
    const neutralNews: NewsItem = {
      id: 'neutral-news',
      title: 'Market Update',
      summary: 'Markets mixed...',
      source: 'CNBC',
      url: '#',
      sentiment: 'neutral',
      symbols: ['DIA'],
      publishedAt: Date.now(),
    }
    expect(neutralNews.sentiment).toBe('neutral')
  })
})

describe('Type Definitions - Chart Configuration', () => {
  it('validates ChartType values', () => {
    const types: ChartType[] = ['candlestick', 'line', 'area', 'bar']
    expect(types).toHaveLength(4)
  })

  it('validates TimeFrame values', () => {
    const timeframes: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M']
    expect(timeframes).toHaveLength(8)
  })

  it('validates ChartConfig structure', () => {
    const config: ChartConfig = {
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
        signals: false,
      },
    }
    expect(config.type).toBe('candlestick')
    expect(config.timeFrame).toBe('1h')
    expect(config.indicators.rsi).toBe(true)
  })
})

describe('Type Definitions - User Preferences', () => {
  it('validates UserPreferences structure', () => {
    const prefs: UserPreferences = {
      theme: 'dark',
      defaultTimeFrame: '1h',
      defaultChartType: 'candlestick',
      soundAlerts: true,
      pushNotifications: true,
      compactMode: false,
    }
    expect(prefs.theme).toBe('dark')
  })

  it('validates light theme', () => {
    const prefs: UserPreferences = {
      theme: 'light',
      defaultTimeFrame: '4h',
      defaultChartType: 'line',
      soundAlerts: false,
      pushNotifications: false,
      compactMode: true,
    }
    expect(prefs.theme).toBe('light')
  })

  it('validates system theme', () => {
    const prefs: UserPreferences = {
      theme: 'system',
      defaultTimeFrame: '1d',
      defaultChartType: 'area',
      soundAlerts: true,
      pushNotifications: true,
      compactMode: false,
    }
    expect(prefs.theme).toBe('system')
  })
})

describe('Type Definitions - App State', () => {
  it('validates AppState structure', () => {
    const state: AppState = {
      activeSymbol: 'BTC',
      activePage: 'dashboard',
      sidebarCollapsed: false,
      preferences: {
        theme: 'dark',
        defaultTimeFrame: '1h',
        defaultChartType: 'candlestick',
        soundAlerts: true,
        pushNotifications: true,
        compactMode: false,
      },
    }
    expect(state.activeSymbol).toBe('BTC')
    expect(state.activePage).toBe('dashboard')
  })

  it('validates all page types', () => {
    const pages: AppState['activePage'][] = [
      'dashboard',
      'trade',
      'portfolio',
      'signals',
      'settings',
    ]
    expect(pages).toHaveLength(5)
  })
})

describe('Type Definitions - Loading State', () => {
  it('validates LoadingState values', () => {
    const states: LoadingState[] = ['idle', 'loading', 'success', 'error']
    expect(states).toHaveLength(4)
  })

  it('validates AsyncState structure', () => {
    const asyncState: AsyncState<string> = {
      data: 'test data',
      status: 'success',
      error: null,
    }
    expect(asyncState.status).toBe('success')
    expect(asyncState.data).toBe('test data')
  })

  it('validates AsyncState with error', () => {
    const errorState: AsyncState<number> = {
      data: null,
      status: 'error',
      error: 'Failed to fetch',
    }
    expect(errorState.status).toBe('error')
    expect(errorState.error).toBe('Failed to fetch')
  })

  it('validates AsyncState loading', () => {
    const loadingState: AsyncState<object[]> = {
      data: null,
      status: 'loading',
      error: null,
    }
    expect(loadingState.status).toBe('loading')
  })

  it('validates AsyncState idle', () => {
    const idleState: AsyncState<boolean> = {
      data: null,
      status: 'idle',
      error: null,
    }
    expect(idleState.status).toBe('idle')
  })
})

describe('Type Definitions - PortfolioSummary', () => {
  it('validates PortfolioSummary structure', () => {
    const summary: PortfolioSummary = {
      totalValue: 100000,
      totalPnl: 5000,
      totalPnlPercent: 5,
      dayPnl: 1000,
      dayPnlPercent: 1,
      positions: [],
      cashBalance: 25000,
      marginUsed: 30000,
      marginAvailable: 70000,
    }
    expect(summary.totalValue).toBe(100000)
    expect(summary.positions).toEqual([])
  })

  it('validates PortfolioSummary with positions', () => {
    const position: Position = {
      id: 'pos-1',
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      averagePrice: 45000,
      currentPrice: 50000,
      pnl: 5000,
      pnlPercent: 11.11,
      allocation: 66.67,
      lastUpdated: Date.now(),
      side: 'long',
      entryPrice: 45000,
      unrealizedPnL: 5000,
      unrealizedPnLPercent: 11.11,
      leverage: 1,
    }
    const summary: PortfolioSummary = {
      totalValue: 75000,
      totalPnl: 5000,
      totalPnlPercent: 7.14,
      dayPnl: 1500,
      dayPnlPercent: 2.04,
      positions: [position],
      cashBalance: 25000,
      marginUsed: 50000,
      marginAvailable: 25000,
    }
    expect(summary.positions).toHaveLength(1)
    expect(summary.positions[0].symbol).toBe('BTC')
  })
})

describe('Type Definitions - TechnicalIndicators', () => {
  it('validates TechnicalIndicators structure', () => {
    const indicators: TechnicalIndicators = {
      rsi: [],
      macd: [],
      bollingerBands: [],
      sma: {},
      ema: {},
    }
    expect(indicators.rsi).toEqual([])
    expect(indicators.sma).toEqual({})
  })

  it('validates TechnicalIndicators with data', () => {
    const indicators: TechnicalIndicators = {
      rsi: [{ timestamp: Date.now(), value: 55, overbought: false, oversold: false }],
      macd: [{ timestamp: Date.now(), macd: 100, signal: 80, histogram: 20 }],
      bollingerBands: [
        { timestamp: Date.now(), upper: 52000, middle: 50000, lower: 48000, bandwidth: 8 },
      ],
      sma: {
        20: [{ timestamp: Date.now(), value: 50500, period: 20 }],
        50: [{ timestamp: Date.now(), value: 49000, period: 50 }],
      },
      ema: {
        12: [{ timestamp: Date.now(), value: 50200, period: 12 }],
        26: [{ timestamp: Date.now(), value: 49800, period: 26 }],
      },
    }
    expect(indicators.rsi).toHaveLength(1)
    expect(indicators.sma[20]).toHaveLength(1)
    expect(indicators.ema[12]).toHaveLength(1)
  })
})
