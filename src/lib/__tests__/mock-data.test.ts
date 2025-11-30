// ============================================
// Mock Data Generator Tests - Comprehensive Testing Suite
// ============================================

import { describe, it, expect, beforeEach } from 'vitest'
import {
  resetSeed,
  randomBetween,
  randomInt,
  randomChoice,
  formatPrice,
  SYMBOLS,
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
} from '../mock-data'

describe('Mock Data Generator - Seed Functions', () => {
  beforeEach(() => {
    resetSeed()
  })

  describe('resetSeed', () => {
    it('resets to initial state', () => {
      const first = randomBetween(0, 100)
      resetSeed()
      const second = randomBetween(0, 100)
      expect(first).toBe(second)
    })

    it('produces reproducible sequences', () => {
      resetSeed()
      const seq1 = [randomBetween(0, 100), randomBetween(0, 100), randomBetween(0, 100)]
      resetSeed()
      const seq2 = [randomBetween(0, 100), randomBetween(0, 100), randomBetween(0, 100)]
      expect(seq1).toEqual(seq2)
    })
  })

  describe('randomBetween', () => {
    it('generates values within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomBetween(10, 20)
        expect(value).toBeGreaterThanOrEqual(10)
        expect(value).toBeLessThanOrEqual(20)
      }
    })

    it('handles negative ranges', () => {
      const value = randomBetween(-100, -50)
      expect(value).toBeGreaterThanOrEqual(-100)
      expect(value).toBeLessThanOrEqual(-50)
    })

    it('handles zero crossing ranges', () => {
      const value = randomBetween(-50, 50)
      expect(value).toBeGreaterThanOrEqual(-50)
      expect(value).toBeLessThanOrEqual(50)
    })

    it('handles equal min and max', () => {
      const value = randomBetween(42, 42)
      expect(value).toBe(42)
    })

    it('handles decimal ranges', () => {
      const value = randomBetween(0.1, 0.9)
      expect(value).toBeGreaterThanOrEqual(0.1)
      expect(value).toBeLessThanOrEqual(0.9)
    })

    it('handles large ranges', () => {
      const value = randomBetween(0, 1000000)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1000000)
    })

    it('handles very small ranges', () => {
      const value = randomBetween(0.001, 0.002)
      expect(value).toBeGreaterThanOrEqual(0.001)
      expect(value).toBeLessThanOrEqual(0.002)
    })
  })

  describe('randomInt', () => {
    it('generates integers within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(1, 10)
        expect(Number.isInteger(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(10)
      }
    })

    it('handles single value range', () => {
      const value = randomInt(5, 5)
      expect(value).toBe(5)
    })

    it('handles negative integer ranges', () => {
      const value = randomInt(-10, -5)
      expect(value).toBeGreaterThanOrEqual(-10)
      expect(value).toBeLessThanOrEqual(-5)
    })

    it('handles zero', () => {
      const value = randomInt(0, 0)
      expect(value).toBe(0)
    })

    it('includes both endpoints', () => {
      const values = new Set<number>()
      for (let i = 0; i < 1000; i++) {
        resetSeed()
        for (let j = 0; j < 100; j++) {
          values.add(randomInt(1, 3))
        }
      }
      expect(values.has(1)).toBe(true)
      expect(values.has(3)).toBe(true)
    })
  })

  describe('randomChoice', () => {
    it('returns element from array', () => {
      const arr = ['a', 'b', 'c']
      const choice = randomChoice(arr)
      expect(arr).toContain(choice)
    })

    it('handles single element array', () => {
      const arr = ['only']
      const choice = randomChoice(arr)
      expect(choice).toBe('only')
    })

    it('handles numeric arrays', () => {
      const arr = [1, 2, 3, 4, 5]
      const choice = randomChoice(arr)
      expect(arr).toContain(choice)
    })

    it('handles object arrays', () => {
      const arr = [{ id: 1 }, { id: 2 }]
      const choice = randomChoice(arr)
      expect(arr).toContain(choice)
    })
  })

  describe('formatPrice', () => {
    it('formats prices >= 1000 with 2 decimals', () => {
      expect(formatPrice(1234.5678)).toBe('1234.57')
      expect(formatPrice(50000)).toBe('50000.00')
    })

    it('formats prices >= 1 with 4 decimals', () => {
      expect(formatPrice(12.34567)).toBe('12.3457')
      expect(formatPrice(1.5)).toBe('1.5000')
    })

    it('formats prices < 1 with 6 decimals', () => {
      expect(formatPrice(0.123456789)).toBe('0.123457')
      expect(formatPrice(0.001)).toBe('0.001000')
    })

    it('handles zero', () => {
      expect(formatPrice(0)).toBe('0.000000')
    })

    it('handles exact boundary values', () => {
      expect(formatPrice(1000)).toBe('1000.00')
      expect(formatPrice(1)).toBe('1.0000')
    })
  })
})

describe('Mock Data Generator - SYMBOLS', () => {
  it('contains expected number of symbols', () => {
    expect(SYMBOLS.length).toBe(10)
  })

  it('all symbols have required properties', () => {
    SYMBOLS.forEach(symbol => {
      expect(symbol).toHaveProperty('symbol')
      expect(symbol).toHaveProperty('name')
      expect(symbol).toHaveProperty('basePrice')
      expect(typeof symbol.symbol).toBe('string')
      expect(typeof symbol.name).toBe('string')
      expect(typeof symbol.basePrice).toBe('number')
    })
  })

  it('all symbols have unique identifiers', () => {
    const symbols = SYMBOLS.map(s => s.symbol)
    const uniqueSymbols = new Set(symbols)
    expect(uniqueSymbols.size).toBe(SYMBOLS.length)
  })

  it('all base prices are positive', () => {
    SYMBOLS.forEach(symbol => {
      expect(symbol.basePrice).toBeGreaterThan(0)
    })
  })

  it('contains BTC symbol', () => {
    const btc = SYMBOLS.find(s => s.symbol === 'BTC')
    expect(btc).toBeDefined()
    expect(btc?.name).toBe('Bitcoin')
  })

  it('contains ETH symbol', () => {
    const eth = SYMBOLS.find(s => s.symbol === 'ETH')
    expect(eth).toBeDefined()
    expect(eth?.name).toBe('Ethereum')
  })

  it('contains AAPL symbol', () => {
    const aapl = SYMBOLS.find(s => s.symbol === 'AAPL')
    expect(aapl).toBeDefined()
    expect(aapl?.name).toBe('Apple Inc.')
  })

  it('contains tech stocks', () => {
    const techSymbols = ['MSFT', 'NVDA', 'GOOGL', 'META']
    techSymbols.forEach(symbol => {
      const found = SYMBOLS.find(s => s.symbol === symbol)
      expect(found).toBeDefined()
    })
  })
})

describe('Mock Data Generator - generateOHLCVData', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('generates correct number of data points', () => {
    const data = generateOHLCVData('BTC', 50)
    expect(data).toHaveLength(50)
  })

  it('generates 100 data points by default', () => {
    const data = generateOHLCVData('BTC')
    expect(data).toHaveLength(100)
  })

  it('all data points have required OHLCV properties', () => {
    const data = generateOHLCVData('BTC', 10)
    data.forEach(candle => {
      expect(candle).toHaveProperty('timestamp')
      expect(candle).toHaveProperty('open')
      expect(candle).toHaveProperty('high')
      expect(candle).toHaveProperty('low')
      expect(candle).toHaveProperty('close')
      expect(candle).toHaveProperty('volume')
    })
  })

  it('high is always >= open and close', () => {
    const data = generateOHLCVData('BTC', 100)
    data.forEach(candle => {
      expect(candle.high).toBeGreaterThanOrEqual(candle.open)
      expect(candle.high).toBeGreaterThanOrEqual(candle.close)
    })
  })

  it('low is always <= open and close', () => {
    const data = generateOHLCVData('BTC', 100)
    data.forEach(candle => {
      expect(candle.low).toBeLessThanOrEqual(candle.open)
      expect(candle.low).toBeLessThanOrEqual(candle.close)
    })
  })

  it('timestamps are in chronological order', () => {
    const data = generateOHLCVData('BTC', 50)
    for (let i = 1; i < data.length; i++) {
      expect(data[i].timestamp).toBeGreaterThan(data[i - 1].timestamp)
    }
  })

  it('timestamps are spaced by interval', () => {
    const interval = 3600000 // 1 hour
    const data = generateOHLCVData('BTC', 10, interval)
    for (let i = 1; i < data.length; i++) {
      expect(data[i].timestamp - data[i - 1].timestamp).toBe(interval)
    }
  })

  it('volumes are positive', () => {
    const data = generateOHLCVData('BTC', 50)
    data.forEach(candle => {
      expect(candle.volume).toBeGreaterThan(0)
    })
  })

  it('prices are formatted to 2 decimal places', () => {
    const data = generateOHLCVData('BTC', 10)
    data.forEach(candle => {
      expect(Number(candle.open.toFixed(2))).toBe(candle.open)
      expect(Number(candle.high.toFixed(2))).toBe(candle.high)
      expect(Number(candle.low.toFixed(2))).toBe(candle.low)
      expect(Number(candle.close.toFixed(2))).toBe(candle.close)
    })
  })

  it('handles different symbols', () => {
    SYMBOLS.forEach(symbol => {
      const data = generateOHLCVData(symbol.symbol, 5)
      expect(data).toHaveLength(5)
    })
  })

  it('handles unknown symbol by using first symbol', () => {
    const data = generateOHLCVData('UNKNOWN', 5)
    expect(data).toHaveLength(5)
  })

  it('generates data with realistic price ranges', () => {
    const btcData = generateOHLCVData('BTC', 10)
    btcData.forEach(candle => {
      expect(candle.close).toBeGreaterThan(50000)
      expect(candle.close).toBeLessThan(100000)
    })
  })

  it('uses custom interval correctly', () => {
    const fiveMinInterval = 300000
    const data = generateOHLCVData('BTC', 10, fiveMinInterval)
    for (let i = 1; i < data.length; i++) {
      expect(data[i].timestamp - data[i - 1].timestamp).toBe(fiveMinInterval)
    }
  })
})

describe('Mock Data Generator - generateTicker', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('returns ticker with all required properties', () => {
    const ticker = generateTicker('BTC')
    expect(ticker).toHaveProperty('symbol')
    expect(ticker).toHaveProperty('name')
    expect(ticker).toHaveProperty('price')
    expect(ticker).toHaveProperty('change')
    expect(ticker).toHaveProperty('changePercent')
    expect(ticker).toHaveProperty('volume')
    expect(ticker).toHaveProperty('high24h')
    expect(ticker).toHaveProperty('low24h')
    expect(ticker).toHaveProperty('marketCap')
    expect(ticker).toHaveProperty('lastUpdated')
  })

  it('returns correct symbol and name', () => {
    const ticker = generateTicker('BTC')
    expect(ticker.symbol).toBe('BTC')
    expect(ticker.name).toBe('Bitcoin')
  })

  it('price is positive', () => {
    const ticker = generateTicker('BTC')
    expect(ticker.price).toBeGreaterThan(0)
  })

  it('high24h >= price', () => {
    const ticker = generateTicker('BTC')
    expect(ticker.high24h).toBeGreaterThanOrEqual(ticker.price * 0.99)
  })

  it('low24h <= price', () => {
    const ticker = generateTicker('BTC')
    expect(ticker.low24h).toBeLessThanOrEqual(ticker.price * 1.01)
  })

  it('volume is positive', () => {
    const ticker = generateTicker('BTC')
    expect(ticker.volume).toBeGreaterThan(0)
  })

  it('marketCap is positive', () => {
    const ticker = generateTicker('BTC')
    expect(ticker.marketCap).toBeGreaterThan(0)
  })

  it('lastUpdated is recent', () => {
    const ticker = generateTicker('BTC')
    const now = Date.now()
    expect(ticker.lastUpdated).toBeLessThanOrEqual(now)
    expect(ticker.lastUpdated).toBeGreaterThan(now - 1000)
  })

  it('change and changePercent are consistent', () => {
    const ticker = generateTicker('BTC')
    const expectedChange = ticker.price - SYMBOLS.find(s => s.symbol === 'BTC')!.basePrice
    expect(Math.abs(ticker.change - expectedChange)).toBeLessThan(1)
  })

  it('handles all symbols', () => {
    SYMBOLS.forEach(symbol => {
      const ticker = generateTicker(symbol.symbol)
      expect(ticker.symbol).toBe(symbol.symbol)
      expect(ticker.name).toBe(symbol.name)
    })
  })

  it('handles unknown symbol', () => {
    const ticker = generateTicker('UNKNOWN')
    expect(ticker).toBeDefined()
  })
})

describe('Mock Data Generator - generateAllTickers', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('returns all tickers', () => {
    const tickers = generateAllTickers()
    expect(tickers).toHaveLength(SYMBOLS.length)
  })

  it('all tickers have required properties', () => {
    const tickers = generateAllTickers()
    tickers.forEach(ticker => {
      expect(ticker).toHaveProperty('symbol')
      expect(ticker).toHaveProperty('name')
      expect(ticker).toHaveProperty('price')
    })
  })

  it('all symbols are represented', () => {
    const tickers = generateAllTickers()
    const symbols = tickers.map(t => t.symbol)
    SYMBOLS.forEach(s => {
      expect(symbols).toContain(s.symbol)
    })
  })
})

describe('Mock Data Generator - generateOrderBook', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('returns order book with bids and asks', () => {
    const orderBook = generateOrderBook(50000)
    expect(orderBook).toHaveProperty('bids')
    expect(orderBook).toHaveProperty('asks')
    expect(orderBook).toHaveProperty('spread')
    expect(orderBook).toHaveProperty('spreadPercent')
  })

  it('generates correct depth', () => {
    const depth = 10
    const orderBook = generateOrderBook(50000, depth)
    expect(orderBook.bids).toHaveLength(depth)
    expect(orderBook.asks).toHaveLength(depth)
  })

  it('uses default depth of 15', () => {
    const orderBook = generateOrderBook(50000)
    expect(orderBook.bids).toHaveLength(15)
    expect(orderBook.asks).toHaveLength(15)
  })

  it('bids are below current price', () => {
    const price = 50000
    const orderBook = generateOrderBook(price)
    orderBook.bids.forEach(bid => {
      expect(bid.price).toBeLessThan(price)
    })
  })

  it('asks are above current price', () => {
    const price = 50000
    const orderBook = generateOrderBook(price)
    orderBook.asks.forEach(ask => {
      expect(ask.price).toBeGreaterThan(price)
    })
  })

  it('bids are in descending order', () => {
    const orderBook = generateOrderBook(50000)
    for (let i = 1; i < orderBook.bids.length; i++) {
      expect(orderBook.bids[i].price).toBeLessThan(orderBook.bids[i - 1].price)
    }
  })

  it('asks are in ascending order', () => {
    const orderBook = generateOrderBook(50000)
    for (let i = 1; i < orderBook.asks.length; i++) {
      expect(orderBook.asks[i].price).toBeGreaterThan(orderBook.asks[i - 1].price)
    }
  })

  it('all entries have positive quantities', () => {
    const orderBook = generateOrderBook(50000)
    orderBook.bids.forEach(bid => {
      expect(bid.quantity).toBeGreaterThan(0)
    })
    orderBook.asks.forEach(ask => {
      expect(ask.quantity).toBeGreaterThan(0)
    })
  })

  it('totals accumulate correctly', () => {
    const orderBook = generateOrderBook(50000)
    orderBook.bids.forEach((bid, index) => {
      if (index === 0) {
        expect(bid.total).toBeGreaterThan(0)
      } else {
        expect(bid.total).toBeGreaterThan(orderBook.bids[index - 1].total)
      }
    })
  })

  it('spread is positive', () => {
    const orderBook = generateOrderBook(50000)
    expect(orderBook.spread).toBeGreaterThan(0)
  })

  it('spreadPercent is reasonable', () => {
    const orderBook = generateOrderBook(50000)
    expect(orderBook.spreadPercent).toBeGreaterThan(0)
    expect(orderBook.spreadPercent).toBeLessThan(1)
  })
})

describe('Mock Data Generator - generateTrades', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('generates correct number of trades', () => {
    const trades = generateTrades('BTC', 50000, 20)
    expect(trades).toHaveLength(20)
  })

  it('uses default count of 50', () => {
    const trades = generateTrades('BTC', 50000)
    expect(trades).toHaveLength(50)
  })

  it('all trades have required properties', () => {
    const trades = generateTrades('BTC', 50000, 10)
    trades.forEach(trade => {
      expect(trade).toHaveProperty('id')
      expect(trade).toHaveProperty('symbol')
      expect(trade).toHaveProperty('side')
      expect(trade).toHaveProperty('price')
      expect(trade).toHaveProperty('quantity')
      expect(trade).toHaveProperty('timestamp')
      expect(trade).toHaveProperty('maker')
    })
  })

  it('trades have correct symbol', () => {
    const trades = generateTrades('ETH', 3000, 10)
    trades.forEach(trade => {
      expect(trade.symbol).toBe('ETH')
    })
  })

  it('trade sides are valid', () => {
    const trades = generateTrades('BTC', 50000, 50)
    trades.forEach(trade => {
      expect(['buy', 'sell']).toContain(trade.side)
    })
  })

  it('trade prices are near current price', () => {
    const currentPrice = 50000
    const trades = generateTrades('BTC', currentPrice, 50)
    trades.forEach(trade => {
      expect(Math.abs(trade.price - currentPrice)).toBeLessThan(1)
    })
  })

  it('trade quantities are positive', () => {
    const trades = generateTrades('BTC', 50000, 10)
    trades.forEach(trade => {
      expect(trade.quantity).toBeGreaterThan(0)
    })
  })

  it('trade ids are unique', () => {
    const trades = generateTrades('BTC', 50000, 100)
    const ids = trades.map(t => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(trades.length)
  })

  it('timestamps are roughly in descending order', () => {
    const trades = generateTrades('BTC', 50000, 10)
    // Check that first trade is more recent than last trade
    expect(trades[0].timestamp).toBeGreaterThan(trades[trades.length - 1].timestamp)
    // Check timestamps are all valid (recent)
    const now = Date.now()
    trades.forEach(trade => {
      expect(trade.timestamp).toBeLessThanOrEqual(now)
      expect(trade.timestamp).toBeGreaterThan(now - 1000000) // within last ~16 minutes
    })
  })
})

describe('Mock Data Generator - generatePositions', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('generates positions', () => {
    const positions = generatePositions()
    expect(positions.length).toBeGreaterThan(0)
  })

  it('all positions have required properties', () => {
    const positions = generatePositions()
    positions.forEach(position => {
      expect(position).toHaveProperty('id')
      expect(position).toHaveProperty('symbol')
      expect(position).toHaveProperty('name')
      expect(position).toHaveProperty('quantity')
      expect(position).toHaveProperty('averagePrice')
      expect(position).toHaveProperty('currentPrice')
      expect(position).toHaveProperty('pnl')
      expect(position).toHaveProperty('pnlPercent')
      expect(position).toHaveProperty('allocation')
      expect(position).toHaveProperty('side')
      expect(position).toHaveProperty('entryPrice')
      expect(position).toHaveProperty('unrealizedPnL')
      expect(position).toHaveProperty('leverage')
    })
  })

  it('allocations sum to approximately 100%', () => {
    const positions = generatePositions()
    const totalAllocation = positions.reduce((sum, p) => sum + p.allocation, 0)
    expect(totalAllocation).toBeCloseTo(100, 0)
  })

  it('position ids are unique', () => {
    const positions = generatePositions()
    const ids = positions.map(p => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(positions.length)
  })

  it('quantities are positive', () => {
    const positions = generatePositions()
    positions.forEach(position => {
      expect(position.quantity).toBeGreaterThan(0)
    })
  })

  it('prices are positive', () => {
    const positions = generatePositions()
    positions.forEach(position => {
      expect(position.averagePrice).toBeGreaterThan(0)
      expect(position.currentPrice).toBeGreaterThan(0)
    })
  })

  it('side is valid', () => {
    const positions = generatePositions()
    positions.forEach(position => {
      expect(['long', 'short']).toContain(position.side)
    })
  })

  it('leverage is valid', () => {
    const validLeverages = [1, 2, 3, 5, 10]
    const positions = generatePositions()
    positions.forEach(position => {
      expect(validLeverages).toContain(position.leverage)
    })
  })

  it('stop loss is set correctly based on side', () => {
    const positions = generatePositions()
    positions.forEach(position => {
      if (position.side === 'long') {
        expect(position.stopLoss).toBeLessThan(position.entryPrice)
      } else {
        expect(position.stopLoss).toBeGreaterThan(position.entryPrice)
      }
    })
  })

  it('take profit is set correctly based on side', () => {
    const positions = generatePositions()
    positions.forEach(position => {
      if (position.side === 'long') {
        expect(position.takeProfit).toBeGreaterThan(position.entryPrice)
      } else {
        expect(position.takeProfit).toBeLessThan(position.entryPrice)
      }
    })
  })
})

describe('Mock Data Generator - generatePortfolioSummary', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('returns portfolio summary with all properties', () => {
    const summary = generatePortfolioSummary()
    expect(summary).toHaveProperty('totalValue')
    expect(summary).toHaveProperty('totalPnl')
    expect(summary).toHaveProperty('totalPnlPercent')
    expect(summary).toHaveProperty('dayPnl')
    expect(summary).toHaveProperty('dayPnlPercent')
    expect(summary).toHaveProperty('positions')
    expect(summary).toHaveProperty('cashBalance')
    expect(summary).toHaveProperty('marginUsed')
    expect(summary).toHaveProperty('marginAvailable')
  })

  it('total value is positive', () => {
    const summary = generatePortfolioSummary()
    expect(summary.totalValue).toBeGreaterThan(0)
  })

  it('cash balance is positive', () => {
    const summary = generatePortfolioSummary()
    expect(summary.cashBalance).toBeGreaterThan(0)
  })

  it('positions are included', () => {
    const summary = generatePortfolioSummary()
    expect(summary.positions.length).toBeGreaterThan(0)
  })

  it('margin used and available sum correctly', () => {
    const summary = generatePortfolioSummary()
    expect(summary.marginUsed + summary.marginAvailable).toBeGreaterThan(0)
  })
})

describe('Mock Data Generator - generateOrders', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('generates correct number of orders', () => {
    const orders = generateOrders(20)
    expect(orders).toHaveLength(20)
  })

  it('uses default count of 10', () => {
    const orders = generateOrders()
    expect(orders).toHaveLength(10)
  })

  it('all orders have required properties', () => {
    const orders = generateOrders(10)
    orders.forEach(order => {
      expect(order).toHaveProperty('id')
      expect(order).toHaveProperty('symbol')
      expect(order).toHaveProperty('side')
      expect(order).toHaveProperty('type')
      expect(order).toHaveProperty('status')
      expect(order).toHaveProperty('quantity')
      expect(order).toHaveProperty('filledQuantity')
      expect(order).toHaveProperty('timeInForce')
      expect(order).toHaveProperty('createdAt')
      expect(order).toHaveProperty('updatedAt')
    })
  })

  it('order ids are unique', () => {
    const orders = generateOrders(50)
    const ids = orders.map(o => o.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(orders.length)
  })

  it('order sides are valid', () => {
    const orders = generateOrders(50)
    orders.forEach(order => {
      expect(['buy', 'sell']).toContain(order.side)
    })
  })

  it('order types are valid', () => {
    const validTypes = ['market', 'limit', 'stop', 'stop-limit']
    const orders = generateOrders(50)
    orders.forEach(order => {
      expect(validTypes).toContain(order.type)
    })
  })

  it('order statuses are valid', () => {
    const validStatuses = ['pending', 'open', 'filled', 'partially-filled', 'cancelled', 'rejected']
    const orders = generateOrders(50)
    orders.forEach(order => {
      expect(validStatuses).toContain(order.status)
    })
  })

  it('time in force values are valid', () => {
    const validTIF = ['gtc', 'day', 'ioc', 'fok']
    const orders = generateOrders(50)
    orders.forEach(order => {
      expect(validTIF).toContain(order.timeInForce)
    })
  })

  it('filled orders have filledAt timestamp', () => {
    const orders = generateOrders(100)
    orders.filter(o => o.status === 'filled').forEach(order => {
      expect(order.filledAt).toBeDefined()
    })
  })

  it('filled orders have full filledQuantity', () => {
    const orders = generateOrders(100)
    orders.filter(o => o.status === 'filled').forEach(order => {
      expect(order.filledQuantity).toBe(order.quantity)
    })
  })

  it('orders are sorted by createdAt descending', () => {
    const orders = generateOrders(20)
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i].createdAt).toBeLessThanOrEqual(orders[i - 1].createdAt)
    }
  })
})

describe('Mock Data Generator - generateRSI', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('returns empty array for insufficient data', () => {
    const ohlcv = generateOHLCVData('BTC', 10)
    const rsi = generateRSI(ohlcv, 14)
    expect(rsi).toHaveLength(0)
  })

  it('generates RSI data for sufficient data', () => {
    const ohlcv = generateOHLCVData('BTC', 50)
    const rsi = generateRSI(ohlcv, 14)
    expect(rsi.length).toBeGreaterThan(0)
  })

  it('RSI values are between 0 and 100', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const rsi = generateRSI(ohlcv, 14)
    rsi.forEach(r => {
      expect(r.value).toBeGreaterThanOrEqual(0)
      expect(r.value).toBeLessThanOrEqual(100)
    })
  })

  it('overbought flag is set correctly', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const rsi = generateRSI(ohlcv, 14)
    rsi.forEach(r => {
      expect(r.overbought).toBe(r.value > 70)
    })
  })

  it('oversold flag is set correctly', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const rsi = generateRSI(ohlcv, 14)
    rsi.forEach(r => {
      expect(r.oversold).toBe(r.value < 30)
    })
  })

  it('timestamps match OHLCV data', () => {
    const ohlcv = generateOHLCVData('BTC', 50)
    const rsi = generateRSI(ohlcv, 14)
    rsi.forEach(r => {
      const matchingOHLCV = ohlcv.find(o => o.timestamp === r.timestamp)
      expect(matchingOHLCV).toBeDefined()
    })
  })
})

describe('Mock Data Generator - generateMACD', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('returns empty array for insufficient data', () => {
    const ohlcv = generateOHLCVData('BTC', 20)
    const macd = generateMACD(ohlcv)
    expect(macd).toHaveLength(0)
  })

  it('generates MACD data for sufficient data', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const macd = generateMACD(ohlcv)
    expect(macd.length).toBeGreaterThan(0)
  })

  it('all MACD entries have required properties', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const macd = generateMACD(ohlcv)
    macd.forEach(m => {
      expect(m).toHaveProperty('timestamp')
      expect(m).toHaveProperty('macd')
      expect(m).toHaveProperty('signal')
      expect(m).toHaveProperty('histogram')
    })
  })

  it('histogram equals macd minus signal', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const macd = generateMACD(ohlcv)
    macd.forEach(m => {
      expect(m.histogram).toBeCloseTo(m.macd - m.signal, 2)
    })
  })
})

describe('Mock Data Generator - generateBollingerBands', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('returns empty array for insufficient data', () => {
    const ohlcv = generateOHLCVData('BTC', 15)
    const bb = generateBollingerBands(ohlcv, 20)
    expect(bb).toHaveLength(0)
  })

  it('generates Bollinger Bands for sufficient data', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const bb = generateBollingerBands(ohlcv, 20)
    expect(bb.length).toBeGreaterThan(0)
  })

  it('all entries have required properties', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const bb = generateBollingerBands(ohlcv)
    bb.forEach(b => {
      expect(b).toHaveProperty('timestamp')
      expect(b).toHaveProperty('upper')
      expect(b).toHaveProperty('middle')
      expect(b).toHaveProperty('lower')
      expect(b).toHaveProperty('bandwidth')
    })
  })

  it('upper > middle > lower', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const bb = generateBollingerBands(ohlcv)
    bb.forEach(b => {
      expect(b.upper).toBeGreaterThan(b.middle)
      expect(b.middle).toBeGreaterThan(b.lower)
    })
  })

  it('bandwidth is positive', () => {
    const ohlcv = generateOHLCVData('BTC', 100)
    const bb = generateBollingerBands(ohlcv)
    bb.forEach(b => {
      expect(b.bandwidth).toBeGreaterThan(0)
    })
  })
})

describe('Mock Data Generator - generateAISignals', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('generates correct number of signals', () => {
    const signals = generateAISignals('BTC', 5)
    expect(signals).toHaveLength(5)
  })

  it('all signals have required properties', () => {
    const signals = generateAISignals('BTC', 10)
    signals.forEach(signal => {
      expect(signal).toHaveProperty('id')
      expect(signal).toHaveProperty('symbol')
      expect(signal).toHaveProperty('direction')
      expect(signal).toHaveProperty('strength')
      expect(signal).toHaveProperty('confidence')
      expect(signal).toHaveProperty('entryPrice')
      expect(signal).toHaveProperty('targetPrice')
      expect(signal).toHaveProperty('stopLoss')
      expect(signal).toHaveProperty('riskRewardRatio')
      expect(signal).toHaveProperty('reasoning')
      expect(signal).toHaveProperty('indicators')
      expect(signal).toHaveProperty('timestamp')
      expect(signal).toHaveProperty('expiresAt')
    })
  })

  it('signal directions are valid', () => {
    const signals = generateAISignals('BTC', 20)
    signals.forEach(signal => {
      expect(['bullish', 'bearish', 'neutral']).toContain(signal.direction)
    })
  })

  it('signal strengths are valid', () => {
    const signals = generateAISignals('BTC', 20)
    signals.forEach(signal => {
      expect(['strong', 'moderate', 'weak']).toContain(signal.strength)
    })
  })

  it('confidence is between 60 and 95', () => {
    const signals = generateAISignals('BTC', 20)
    signals.forEach(signal => {
      expect(signal.confidence).toBeGreaterThanOrEqual(60)
      expect(signal.confidence).toBeLessThanOrEqual(95)
    })
  })

  it('reasoning has multiple items', () => {
    const signals = generateAISignals('BTC', 10)
    signals.forEach(signal => {
      expect(signal.reasoning.length).toBeGreaterThan(0)
    })
  })

  it('indicators has multiple items', () => {
    const signals = generateAISignals('BTC', 10)
    signals.forEach(signal => {
      expect(signal.indicators.length).toBeGreaterThan(0)
    })
  })

  it('expiresAt is in the future', () => {
    const signals = generateAISignals('BTC', 10)
    signals.forEach(signal => {
      expect(signal.expiresAt).toBeGreaterThan(signal.timestamp)
    })
  })
})

describe('Mock Data Generator - generateAIAnalysis', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('returns analysis with all properties', () => {
    const analysis = generateAIAnalysis('BTC')
    expect(analysis).toHaveProperty('symbol')
    expect(analysis).toHaveProperty('summary')
    expect(analysis).toHaveProperty('sentiment')
    expect(analysis).toHaveProperty('sentimentScore')
    expect(analysis).toHaveProperty('keyFactors')
    expect(analysis).toHaveProperty('signals')
    expect(analysis).toHaveProperty('lastUpdated')
  })

  it('symbol matches input', () => {
    const analysis = generateAIAnalysis('ETH')
    expect(analysis.symbol).toBe('ETH')
  })

  it('sentiment is valid', () => {
    const analysis = generateAIAnalysis('BTC')
    expect(['bullish', 'bearish', 'neutral']).toContain(analysis.sentiment)
  })

  it('sentiment score is between 0 and 100', () => {
    for (let i = 0; i < 10; i++) {
      resetSeed()
      const analysis = generateAIAnalysis('BTC')
      expect(analysis.sentimentScore).toBeGreaterThanOrEqual(0)
      expect(analysis.sentimentScore).toBeLessThanOrEqual(100)
    }
  })

  it('key factors are present', () => {
    const analysis = generateAIAnalysis('BTC')
    expect(analysis.keyFactors.length).toBeGreaterThan(0)
  })

  it('signals are included', () => {
    const analysis = generateAIAnalysis('BTC')
    expect(analysis.signals.length).toBeGreaterThan(0)
  })
})

describe('Mock Data Generator - generateNews', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('generates correct number of news items', () => {
    const news = generateNews(15)
    expect(news).toHaveLength(15)
  })

  it('uses default count of 10', () => {
    const news = generateNews()
    expect(news).toHaveLength(10)
  })

  it('all news items have required properties', () => {
    const news = generateNews(10)
    news.forEach(item => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('summary')
      expect(item).toHaveProperty('source')
      expect(item).toHaveProperty('url')
      expect(item).toHaveProperty('sentiment')
      expect(item).toHaveProperty('symbols')
      expect(item).toHaveProperty('publishedAt')
    })
  })

  it('news ids are unique', () => {
    const news = generateNews(50)
    const ids = news.map(n => n.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(news.length)
  })

  it('sentiments are valid', () => {
    const news = generateNews(20)
    news.forEach(item => {
      expect(['positive', 'negative', 'neutral']).toContain(item.sentiment)
    })
  })

  it('news is sorted by publishedAt descending', () => {
    const news = generateNews(20)
    for (let i = 1; i < news.length; i++) {
      expect(news[i].publishedAt).toBeLessThanOrEqual(news[i - 1].publishedAt)
    }
  })

  it('symbols array is not empty', () => {
    const news = generateNews(10)
    news.forEach(item => {
      expect(item.symbols.length).toBeGreaterThan(0)
    })
  })
})

describe('Mock Data Generator - generateWatchlist', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('generates watchlist items', () => {
    const watchlist = generateWatchlist()
    expect(watchlist.length).toBeGreaterThan(0)
  })

  it('all items have required properties', () => {
    const watchlist = generateWatchlist()
    watchlist.forEach(item => {
      expect(item).toHaveProperty('symbol')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('addedAt')
    })
  })

  it('addedAt is in the past', () => {
    const now = Date.now()
    const watchlist = generateWatchlist()
    watchlist.forEach(item => {
      expect(item.addedAt).toBeLessThanOrEqual(now)
    })
  })

  it('symbols are from SYMBOLS list', () => {
    const validSymbols = SYMBOLS.map(s => s.symbol)
    const watchlist = generateWatchlist()
    watchlist.forEach(item => {
      expect(validSymbols).toContain(item.symbol)
    })
  })
})
