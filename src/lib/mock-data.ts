// ============================================
// TradingHub Pro - Mock Data Generator
// Advanced simulated market data with realistic patterns
// ============================================

import type {
  OHLCV,
  Ticker,
  OrderBook,
  OrderBookEntry,
  Trade,
  Position,
  PortfolioSummary,
  Order,
  AISignal,
  AIAnalysis,
  RSIData,
  MACDData,
  BollingerBandsData,
  NewsItem,
  WatchlistItem,
} from '@/types'

// Seed for reproducible "random" data
let seed = 12345
const seededRandom = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

// Reset seed for consistent test data
export const resetSeed = () => {
  seed = 12345
}

// Helper functions
export const randomBetween = (min: number, max: number): number => {
  return min + seededRandom() * (max - min)
}

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomBetween(min, max + 1))
}

export const randomChoice = <T>(arr: readonly T[]): T => {
  return arr[randomInt(0, arr.length - 1)]
}

export const formatPrice = (price: number): string => {
  if (price >= 1000) return price.toFixed(2)
  if (price >= 1) return price.toFixed(4)
  return price.toFixed(6)
}

// Stock/Crypto data
export const SYMBOLS = [
  { symbol: 'BTC', name: 'Bitcoin', basePrice: 67500 },
  { symbol: 'ETH', name: 'Ethereum', basePrice: 3650 },
  { symbol: 'SOL', name: 'Solana', basePrice: 178 },
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 189 },
  { symbol: 'MSFT', name: 'Microsoft', basePrice: 415 },
  { symbol: 'NVDA', name: 'NVIDIA', basePrice: 875 },
  { symbol: 'TSLA', name: 'Tesla', basePrice: 245 },
  { symbol: 'GOOGL', name: 'Alphabet', basePrice: 172 },
  { symbol: 'AMZN', name: 'Amazon', basePrice: 201 },
  { symbol: 'META', name: 'Meta Platforms', basePrice: 542 },
] as const

// Generate realistic OHLCV data with trends and patterns
export const generateOHLCVData = (
  symbol: string,
  count: number = 100,
  intervalMs: number = 3600000 // 1 hour
): OHLCV[] => {
  resetSeed()
  const symbolData = SYMBOLS.find((s) => s.symbol === symbol) || SYMBOLS[0]
  let currentPrice: number = symbolData.basePrice

  const data: OHLCV[] = []
  const now = Date.now()

  // Add trend component
  const trendStrength = randomBetween(-0.002, 0.002)
  
  for (let i = count - 1; i >= 0; i--) {
    const volatility = symbolData.basePrice * 0.015 // 1.5% volatility
    
    // Add some trend
    currentPrice *= 1 + trendStrength
    
    // Generate candle
    const open = currentPrice + randomBetween(-volatility * 0.3, volatility * 0.3)
    const close = open + randomBetween(-volatility, volatility)
    const high = Math.max(open, close) + randomBetween(0, volatility * 0.5)
    const low = Math.min(open, close) - randomBetween(0, volatility * 0.5)
    const volume = randomBetween(100000, 5000000)

    currentPrice = close

    data.push({
      timestamp: now - i * intervalMs,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(volume),
    })
  }

  return data
}

// Generate ticker data
export const generateTicker = (symbol: string): Ticker => {
  const symbolData = SYMBOLS.find((s) => s.symbol === symbol) || SYMBOLS[0]
  const changePercent = randomBetween(-5, 5)
  const price = symbolData.basePrice * (1 + changePercent / 100)
  const change = price - symbolData.basePrice

  return {
    symbol: symbolData.symbol,
    name: symbolData.name,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: randomInt(1000000, 50000000),
    high24h: Number((price * 1.03).toFixed(2)),
    low24h: Number((price * 0.97).toFixed(2)),
    marketCap: Math.round(price * randomInt(1000000, 100000000)),
    lastUpdated: Date.now(),
  }
}

// Generate all tickers
export const generateAllTickers = (): Ticker[] => {
  return SYMBOLS.map((s) => generateTicker(s.symbol))
}

// Generate order book
export const generateOrderBook = (
  currentPrice: number,
  depth: number = 15
): OrderBook => {
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []
  const spread = currentPrice * 0.0005 // 0.05% spread

  let bidTotal = 0
  let askTotal = 0

  for (let i = 0; i < depth; i++) {
    const bidPrice = currentPrice - spread / 2 - i * (currentPrice * 0.0002)
    const askPrice = currentPrice + spread / 2 + i * (currentPrice * 0.0002)
    
    const bidQty = randomBetween(0.1, 10) * (1 + i * 0.1)
    const askQty = randomBetween(0.1, 10) * (1 + i * 0.1)

    bidTotal += bidQty * bidPrice
    askTotal += askQty * askPrice

    bids.push({
      price: Number(bidPrice.toFixed(2)),
      quantity: Number(bidQty.toFixed(4)),
      total: Number(bidTotal.toFixed(2)),
    })

    asks.push({
      price: Number(askPrice.toFixed(2)),
      quantity: Number(askQty.toFixed(4)),
      total: Number(askTotal.toFixed(2)),
    })
  }

  return {
    bids,
    asks,
    spread: Number(spread.toFixed(2)),
    spreadPercent: Number(((spread / currentPrice) * 100).toFixed(4)),
  }
}

// Generate recent trades
export const generateTrades = (
  symbol: string,
  currentPrice: number,
  count: number = 50
): Trade[] => {
  const trades: Trade[] = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const side: 'buy' | 'sell' = seededRandom() > 0.5 ? 'buy' : 'sell'
    const priceOffset = randomBetween(-0.5, 0.5)
    
    trades.push({
      id: `trade-${now}-${i}`,
      symbol,
      side,
      price: Number((currentPrice + priceOffset).toFixed(2)),
      quantity: Number(randomBetween(0.01, 5).toFixed(4)),
      timestamp: now - i * randomInt(1000, 10000),
      maker: seededRandom() > 0.5,
    })
  }

  return trades
}

// Generate portfolio positions
export const generatePositions = (): Position[] => {
  const positions: Position[] = []
  const selectedSymbols = SYMBOLS.slice(0, 5)

  selectedSymbols.forEach((symbolData, index) => {
    const quantity = randomBetween(1, 100)
    const avgPrice = symbolData.basePrice * randomBetween(0.85, 1.15)
    const currentPrice = symbolData.basePrice * randomBetween(0.9, 1.1)
    const pnl = (currentPrice - avgPrice) * quantity
    const pnlPercent = ((currentPrice - avgPrice) / avgPrice) * 100
    const side = seededRandom() > 0.5 ? 'long' : 'short' as const
    const leverage = [1, 2, 3, 5, 10][Math.floor(seededRandom() * 5)]

    positions.push({
      id: `pos-${index}`,
      symbol: symbolData.symbol,
      name: symbolData.name,
      quantity: Number(quantity.toFixed(4)),
      averagePrice: Number(avgPrice.toFixed(2)),
      currentPrice: Number(currentPrice.toFixed(2)),
      pnl: Number(pnl.toFixed(2)),
      pnlPercent: Number(pnlPercent.toFixed(2)),
      allocation: 0, // Will be calculated
      lastUpdated: Date.now(),
      // Extended position fields
      side,
      entryPrice: Number(avgPrice.toFixed(2)),
      unrealizedPnL: Number(pnl.toFixed(2)),
      unrealizedPnLPercent: Number(pnlPercent.toFixed(2)),
      leverage,
      stopLoss: side === 'long' 
        ? Number((avgPrice * 0.95).toFixed(2)) 
        : Number((avgPrice * 1.05).toFixed(2)),
      takeProfit: side === 'long'
        ? Number((avgPrice * 1.10).toFixed(2))
        : Number((avgPrice * 0.90).toFixed(2)),
    })
  })

  // Calculate allocations
  const totalValue = positions.reduce(
    (sum, p) => sum + p.currentPrice * p.quantity,
    0
  )
  positions.forEach((p) => {
    p.allocation = Number(
      (((p.currentPrice * p.quantity) / totalValue) * 100).toFixed(2)
    )
  })

  return positions
}

// Generate portfolio summary
export const generatePortfolioSummary = (): PortfolioSummary => {
  const positions = generatePositions()
  const totalValue = positions.reduce(
    (sum, p) => sum + p.currentPrice * p.quantity,
    0
  )
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)
  const cashBalance = randomBetween(10000, 50000)

  return {
    totalValue: Number((totalValue + cashBalance).toFixed(2)),
    totalPnl: Number(totalPnl.toFixed(2)),
    totalPnlPercent: Number(((totalPnl / totalValue) * 100).toFixed(2)),
    dayPnl: Number((totalPnl * randomBetween(-0.3, 0.3)).toFixed(2)),
    dayPnlPercent: Number(randomBetween(-3, 3).toFixed(2)),
    positions,
    cashBalance: Number(cashBalance.toFixed(2)),
    marginUsed: Number((totalValue * 0.3).toFixed(2)),
    marginAvailable: Number((totalValue * 0.7).toFixed(2)),
  }
}

// Generate orders
export const generateOrders = (count: number = 10): Order[] => {
  const orders: Order[] = []
  const now = Date.now()
  const statuses: Order['status'][] = ['open', 'filled', 'cancelled', 'pending']
  const types: Order['type'][] = ['market', 'limit', 'stop', 'stop-limit']
  const sides: Order['side'][] = ['buy', 'sell']

  for (let i = 0; i < count; i++) {
    const symbolData = randomChoice([...SYMBOLS])
    const status = randomChoice(statuses)
    const quantity = randomBetween(0.1, 10)

    orders.push({
      id: `order-${now}-${i}`,
      symbol: symbolData.symbol,
      side: randomChoice(sides),
      type: randomChoice(types),
      status,
      quantity: Number(quantity.toFixed(4)),
      filledQuantity:
        status === 'filled'
          ? Number(quantity.toFixed(4))
          : status === 'partially-filled'
            ? Number((quantity * 0.5).toFixed(4))
            : 0,
      price: Number((symbolData.basePrice * randomBetween(0.95, 1.05)).toFixed(2)),
      stopPrice:
        seededRandom() > 0.5
          ? Number((symbolData.basePrice * 0.9).toFixed(2))
          : undefined,
      timeInForce: randomChoice(['gtc', 'day', 'ioc', 'fok'] as const),
      createdAt: now - randomInt(0, 86400000 * 7),
      updatedAt: now - randomInt(0, 3600000),
      filledAt: status === 'filled' ? now - randomInt(0, 3600000) : undefined,
    })
  }

  return orders.sort((a, b) => b.createdAt - a.createdAt)
}

// Generate RSI data
export const generateRSI = (ohlcvData: OHLCV[], period: number = 14): RSIData[] => {
  if (ohlcvData.length < period) return []

  const rsiData: RSIData[] = []
  let avgGain = 0
  let avgLoss = 0

  // Calculate initial averages
  for (let i = 1; i <= period; i++) {
    const change = ohlcvData[i].close - ohlcvData[i - 1].close
    if (change > 0) avgGain += change
    else avgLoss += Math.abs(change)
  }
  avgGain /= period
  avgLoss /= period

  // Calculate RSI for remaining periods
  for (let i = period; i < ohlcvData.length; i++) {
    const change = ohlcvData[i].close - ohlcvData[i - 1].close
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    const rsi = 100 - 100 / (1 + rs)

    rsiData.push({
      timestamp: ohlcvData[i].timestamp,
      value: Number(rsi.toFixed(2)),
      overbought: rsi > 70,
      oversold: rsi < 30,
    })
  }

  return rsiData
}

// Generate MACD data
export const generateMACD = (
  ohlcvData: OHLCV[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDData[] => {
  if (ohlcvData.length < slowPeriod + signalPeriod) return []

  const closes = ohlcvData.map((d) => d.close)
  const macdData: MACDData[] = []

  // Calculate EMAs
  const calculateEMA = (data: number[], period: number): number[] => {
    const ema: number[] = []
    const multiplier = 2 / (period + 1)

    ema[0] = data.slice(0, period).reduce((a, b) => a + b, 0) / period

    for (let i = 1; i < data.length - period + 1; i++) {
      ema[i] = (data[i + period - 1] - ema[i - 1]) * multiplier + ema[i - 1]
    }

    return ema
  }

  const fastEMA = calculateEMA(closes, fastPeriod)
  const slowEMA = calculateEMA(closes, slowPeriod)

  // Calculate MACD line
  const macdLine: number[] = []
  const offset = slowPeriod - fastPeriod

  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + offset] - slowEMA[i])
  }

  // Calculate signal line
  const signalLine = calculateEMA(macdLine, signalPeriod)

  // Generate final data
  for (let i = 0; i < signalLine.length; i++) {
    const macd = macdLine[i + signalPeriod - 1]
    const signal = signalLine[i]
    const histogram = macd - signal

    macdData.push({
      timestamp: ohlcvData[i + slowPeriod + signalPeriod - 2].timestamp,
      macd: Number(macd.toFixed(4)),
      signal: Number(signal.toFixed(4)),
      histogram: Number(histogram.toFixed(4)),
    })
  }

  return macdData
}

// Generate Bollinger Bands
export const generateBollingerBands = (
  ohlcvData: OHLCV[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsData[] => {
  if (ohlcvData.length < period) return []

  const bbData: BollingerBandsData[] = []

  for (let i = period - 1; i < ohlcvData.length; i++) {
    const slice = ohlcvData.slice(i - period + 1, i + 1)
    const closes = slice.map((d) => d.close)

    const sma = closes.reduce((a, b) => a + b, 0) / period
    const variance =
      closes.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period
    const std = Math.sqrt(variance)

    const upper = sma + stdDev * std
    const lower = sma - stdDev * std
    const bandwidth = ((upper - lower) / sma) * 100

    bbData.push({
      timestamp: ohlcvData[i].timestamp,
      upper: Number(upper.toFixed(2)),
      middle: Number(sma.toFixed(2)),
      lower: Number(lower.toFixed(2)),
      bandwidth: Number(bandwidth.toFixed(4)),
    })
  }

  return bbData
}

// Generate AI signals
export const generateAISignals = (symbol: string, count: number = 5): AISignal[] => {
  const signals: AISignal[] = []
  const now = Date.now()
  const symbolData = SYMBOLS.find((s) => s.symbol === symbol) || SYMBOLS[0]
  const currentPrice = symbolData.basePrice

  const reasonings = [
    'Strong bullish divergence detected on RSI',
    'Price breaking above key resistance level',
    'Volume surge indicates institutional buying',
    'MACD crossover confirms momentum shift',
    'Support level holding with higher lows',
    'Bearish head and shoulders pattern forming',
    'Moving average death cross approaching',
    'Oversold conditions presenting buying opportunity',
    'Breakout from consolidation range',
    'Trend reversal signals on multiple timeframes',
  ]

  const indicators = [
    'RSI', 'MACD', 'Bollinger Bands', 'Volume Profile',
    'Moving Averages', 'Fibonacci Retracement', 'Support/Resistance',
    'Price Action', 'Momentum', 'Trend Analysis',
  ]

  for (let i = 0; i < count; i++) {
    const direction: 'bullish' | 'bearish' | 'neutral' = randomChoice([
      'bullish',
      'bearish',
      'neutral',
    ])
    const strength: 'strong' | 'moderate' | 'weak' = randomChoice([
      'strong',
      'moderate',
      'weak',
    ])
    const confidence = randomBetween(60, 95)

    const priceMultiplier = direction === 'bullish' ? 1.05 : 0.95
    const stopMultiplier = direction === 'bullish' ? 0.97 : 1.03

    signals.push({
      id: `signal-${now}-${i}`,
      symbol,
      direction,
      strength,
      confidence: Number(confidence.toFixed(1)),
      entryPrice: Number(currentPrice.toFixed(2)),
      targetPrice: Number((currentPrice * priceMultiplier).toFixed(2)),
      stopLoss: Number((currentPrice * stopMultiplier).toFixed(2)),
      riskRewardRatio: Number(randomBetween(1.5, 4).toFixed(2)),
      reasoning: [
        randomChoice(reasonings),
        randomChoice(reasonings),
        randomChoice(reasonings),
      ],
      indicators: [
        randomChoice(indicators),
        randomChoice(indicators),
        randomChoice(indicators),
      ],
      timestamp: now - randomInt(0, 3600000),
      expiresAt: now + randomInt(3600000, 86400000),
    })
  }

  return signals
}

// Generate AI analysis
export const generateAIAnalysis = (symbol: string): AIAnalysis => {
  const symbolData = SYMBOLS.find((s) => s.symbol === symbol) || SYMBOLS[0]
  const sentiment: 'bullish' | 'bearish' | 'neutral' = randomChoice([
    'bullish',
    'bearish',
    'neutral',
  ])

  const summaries = {
    bullish: `${symbolData.name} shows strong bullish momentum with multiple technical indicators confirming upward trend. Key support levels are holding firm while volume suggests accumulation by institutional investors.`,
    bearish: `${symbolData.name} displays concerning weakness with price action suggesting potential downside. Technical indicators point to overbought conditions and diminishing momentum.`,
    neutral: `${symbolData.name} is consolidating within a tight range. Mixed signals from technical indicators suggest waiting for a clear breakout direction before taking positions.`,
  }

  const keyFactors = [
    'Strong volume supporting price movement',
    'Key resistance level at previous high',
    'Institutional accumulation detected',
    'Positive momentum divergence forming',
    'Market sentiment shifting favorably',
    'Technical breakout imminent',
    'Support level being tested',
    'Correlation with market leaders',
  ]

  return {
    symbol,
    summary: summaries[sentiment],
    sentiment,
    sentimentScore: Number(randomBetween(sentiment === 'bullish' ? 60 : sentiment === 'bearish' ? 10 : 40, sentiment === 'bullish' ? 100 : sentiment === 'bearish' ? 40 : 60).toFixed(1)),
    keyFactors: [
      randomChoice(keyFactors),
      randomChoice(keyFactors),
      randomChoice(keyFactors),
      randomChoice(keyFactors),
    ],
    signals: generateAISignals(symbol, 3),
    lastUpdated: Date.now(),
  }
}

// Generate news items
export const generateNews = (count: number = 10): NewsItem[] => {
  const news: NewsItem[] = []
  const now = Date.now()

  const headlines = [
    { title: 'Bitcoin Surges Past Key Resistance Level', sentiment: 'positive' as const },
    { title: 'Fed Signals Potential Rate Cuts in Coming Months', sentiment: 'positive' as const },
    { title: 'Tech Giants Report Strong Q4 Earnings', sentiment: 'positive' as const },
    { title: 'Market Volatility Increases Amid Global Tensions', sentiment: 'negative' as const },
    { title: 'Cryptocurrency Adoption Accelerates Worldwide', sentiment: 'positive' as const },
    { title: 'New Regulatory Framework Proposed for Digital Assets', sentiment: 'neutral' as const },
    { title: 'Major Bank Announces Blockchain Integration', sentiment: 'positive' as const },
    { title: 'Economic Indicators Point to Cooling Inflation', sentiment: 'positive' as const },
    { title: 'Supply Chain Issues Continue to Impact Markets', sentiment: 'negative' as const },
    { title: 'AI Revolution Transforms Trading Strategies', sentiment: 'neutral' as const },
  ]

  const sources = ['Bloomberg', 'Reuters', 'CNBC', 'CoinDesk', 'Financial Times', 'WSJ']

  for (let i = 0; i < count; i++) {
    const headline = headlines[i % headlines.length]
    news.push({
      id: `news-${now}-${i}`,
      title: headline.title,
      summary: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Market analysis shows significant developments...`,
      source: randomChoice(sources),
      url: '#',
      sentiment: headline.sentiment,
      symbols: [randomChoice([...SYMBOLS]).symbol, randomChoice([...SYMBOLS]).symbol],
      publishedAt: now - randomInt(0, 86400000 * 3),
    })
  }

  return news.sort((a, b) => b.publishedAt - a.publishedAt)
}

// Generate watchlist
export const generateWatchlist = (): WatchlistItem[] => {
  return SYMBOLS.slice(0, 6).map((s) => ({
    symbol: s.symbol,
    name: s.name,
    addedAt: Date.now() - randomInt(0, 86400000 * 30),
    alertPrice: seededRandom() > 0.5 ? s.basePrice * randomBetween(0.9, 1.1) : undefined,
    notes: seededRandom() > 0.5 ? 'Watching for breakout' : undefined,
  }))
}
