// ============================================
// TradingHub Pro - Mock Data Factories
// Factory functions for creating test fixtures
// ============================================

import type { Ticker, Position, Order, Trade, OHLCV, NewsItem } from '@/types'

/**
 * Create a mock ticker with optional overrides
 */
export function createMockTicker(overrides: Partial<Ticker> = {}): Ticker {
  const defaults: Ticker = {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67500,
    change: 1250.50,
    changePercent: 1.89,
    volume: 25000000,
    high24h: 68500,
    low24h: 66000,
    marketCap: 1320000000000,
    lastUpdated: Date.now(),
  }
  
  return { ...defaults, ...overrides }
}

/**
 * Create a mock position with optional overrides
 */
export function createMockPosition(overrides: Partial<Position> = {}): Position {
  const defaults: Position = {
    id: 'pos-1',
    symbol: 'BTC',
    name: 'Bitcoin',
    quantity: 1.5,
    averagePrice: 65000,
    currentPrice: 67500,
    pnl: 3750,
    pnlPercent: 3.85,
    allocation: 40,
    lastUpdated: Date.now(),
    side: 'long',
    entryPrice: 65000,
    unrealizedPnL: 3750,
    unrealizedPnLPercent: 3.85,
    leverage: 1,
    stopLoss: 62000,
    takeProfit: 75000,
  }
  
  return { ...defaults, ...overrides }
}

/**
 * Create a mock order with optional overrides
 */
export function createMockOrder(overrides: Partial<Order> = {}): Order {
  const now = Date.now()
  const defaults: Order = {
    id: 'order-1',
    symbol: 'BTC',
    side: 'buy',
    type: 'limit',
    status: 'open',
    quantity: 0.5,
    filledQuantity: 0,
    price: 65000,
    timeInForce: 'gtc',
    createdAt: now - 3600000,
    updatedAt: now,
  }
  
  return { ...defaults, ...overrides }
}

/**
 * Create a mock trade with optional overrides
 */
export function createMockTrade(overrides: Partial<Trade> = {}): Trade {
  const defaults: Trade = {
    id: 'trade-1',
    symbol: 'BTC',
    side: 'buy',
    price: 67500,
    quantity: 0.25,
    timestamp: Date.now(),
    maker: false,
  }
  
  return { ...defaults, ...overrides }
}

/**
 * Create a mock OHLCV candle with optional overrides
 */
export function createMockOHLCV(overrides: Partial<OHLCV> = {}): OHLCV {
  const defaults: OHLCV = {
    timestamp: Date.now(),
    open: 67000,
    high: 68000,
    low: 66500,
    close: 67500,
    volume: 1500000,
  }
  
  return { ...defaults, ...overrides }
}

/**
 * Create multiple mock OHLCV candles
 */
export function createMockOHLCVSeries(
  count: number,
  basePrice: number = 67500,
  intervalMs: number = 3600000
): OHLCV[] {
  const candles: OHLCV[] = []
  const now = Date.now()
  let currentPrice = basePrice
  
  for (let i = count - 1; i >= 0; i--) {
    const volatility = basePrice * 0.01
    const open = currentPrice
    const change = (Math.random() - 0.5) * volatility * 2
    const close = open + change
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    
    candles.push({
      timestamp: now - i * intervalMs,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(Math.random() * 2000000 + 500000),
    })
    
    currentPrice = close
  }
  
  return candles
}

/**
 * Create a mock news item with optional overrides
 */
export function createMockNewsItem(overrides: Partial<NewsItem> = {}): NewsItem {
  const defaults: NewsItem = {
    id: 'news-1',
    title: 'Bitcoin Surges Past Key Resistance Level',
    summary: 'Market analysis shows significant developments in the cryptocurrency space.',
    source: 'Bloomberg',
    url: '#',
    sentiment: 'positive',
    symbols: ['BTC'],
    publishedAt: Date.now() - 3600000,
  }
  
  return { ...defaults, ...overrides }
}

/**
 * Create multiple mock positions for portfolio testing
 */
export function createMockPortfolio(count: number = 5): Position[] {
  const symbols = [
    { symbol: 'BTC', name: 'Bitcoin', basePrice: 67500 },
    { symbol: 'ETH', name: 'Ethereum', basePrice: 3650 },
    { symbol: 'SOL', name: 'Solana', basePrice: 178 },
    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 189 },
    { symbol: 'MSFT', name: 'Microsoft', basePrice: 415 },
  ]
  
  const positions: Position[] = []
  let totalValue = 0
  
  for (let i = 0; i < Math.min(count, symbols.length); i++) {
    const s = symbols[i]
    const quantity = Math.random() * 10 + 1
    const avgPrice = s.basePrice * (0.9 + Math.random() * 0.2)
    const currentPrice = s.basePrice * (0.95 + Math.random() * 0.1)
    const pnl = (currentPrice - avgPrice) * quantity
    
    positions.push(createMockPosition({
      id: `pos-${i}`,
      symbol: s.symbol,
      name: s.name,
      quantity: Number(quantity.toFixed(4)),
      averagePrice: Number(avgPrice.toFixed(2)),
      currentPrice: Number(currentPrice.toFixed(2)),
      entryPrice: Number(avgPrice.toFixed(2)),
      pnl: Number(pnl.toFixed(2)),
      pnlPercent: Number(((pnl / (avgPrice * quantity)) * 100).toFixed(2)),
      unrealizedPnL: Number(pnl.toFixed(2)),
      unrealizedPnLPercent: Number(((pnl / (avgPrice * quantity)) * 100).toFixed(2)),
    }))
    
    totalValue += currentPrice * quantity
  }
  
  // Calculate allocations
  positions.forEach(p => {
    p.allocation = Number(((p.currentPrice * p.quantity / totalValue) * 100).toFixed(2))
  })
  
  return positions
}
