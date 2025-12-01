// ============================================
// TradingHub Pro - Mock Factories Tests
// ============================================

import { describe, it, expect } from 'vitest'
import {
  createMockTicker,
  createMockPosition,
  createMockOrder,
  createMockTrade,
  createMockOHLCV,
  createMockOHLCVSeries,
  createMockNewsItem,
  createMockPortfolio,
} from '../factories'

describe('Mock Factories', () => {
  describe('createMockTicker', () => {
    it('should create a default ticker', () => {
      const ticker = createMockTicker()
      
      expect(ticker).toHaveProperty('symbol', 'BTC')
      expect(ticker).toHaveProperty('name', 'Bitcoin')
      expect(ticker).toHaveProperty('price')
      expect(ticker.price).toBeGreaterThan(0)
      expect(ticker).toHaveProperty('changePercent')
      expect(ticker).toHaveProperty('volume')
      expect(ticker).toHaveProperty('lastUpdated')
    })

    it('should apply overrides', () => {
      const ticker = createMockTicker({
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3500,
      })
      
      expect(ticker.symbol).toBe('ETH')
      expect(ticker.name).toBe('Ethereum')
      expect(ticker.price).toBe(3500)
    })
  })

  describe('createMockPosition', () => {
    it('should create a default position', () => {
      const position = createMockPosition()
      
      expect(position).toHaveProperty('id')
      expect(position).toHaveProperty('symbol')
      expect(position).toHaveProperty('quantity')
      expect(position.quantity).toBeGreaterThan(0)
      expect(position).toHaveProperty('pnl')
      expect(position).toHaveProperty('side')
      expect(['long', 'short']).toContain(position.side)
    })

    it('should apply overrides', () => {
      const position = createMockPosition({
        symbol: 'SOL',
        quantity: 100,
        side: 'short',
      })
      
      expect(position.symbol).toBe('SOL')
      expect(position.quantity).toBe(100)
      expect(position.side).toBe('short')
    })
  })

  describe('createMockOrder', () => {
    it('should create a default order', () => {
      const order = createMockOrder()
      
      expect(order).toHaveProperty('id')
      expect(order).toHaveProperty('symbol')
      expect(order).toHaveProperty('side')
      expect(order).toHaveProperty('type')
      expect(order).toHaveProperty('status')
      expect(['buy', 'sell']).toContain(order.side)
      expect(['market', 'limit', 'stop', 'stop-limit']).toContain(order.type)
    })

    it('should apply overrides', () => {
      const order = createMockOrder({
        symbol: 'ETH',
        side: 'sell',
        type: 'market',
        status: 'filled',
      })
      
      expect(order.symbol).toBe('ETH')
      expect(order.side).toBe('sell')
      expect(order.type).toBe('market')
      expect(order.status).toBe('filled')
    })
  })

  describe('createMockTrade', () => {
    it('should create a default trade', () => {
      const trade = createMockTrade()
      
      expect(trade).toHaveProperty('id')
      expect(trade).toHaveProperty('symbol')
      expect(trade).toHaveProperty('side')
      expect(trade).toHaveProperty('price')
      expect(trade).toHaveProperty('quantity')
      expect(trade).toHaveProperty('timestamp')
    })

    it('should apply overrides', () => {
      const trade = createMockTrade({
        symbol: 'SOL',
        price: 180,
        quantity: 10,
      })
      
      expect(trade.symbol).toBe('SOL')
      expect(trade.price).toBe(180)
      expect(trade.quantity).toBe(10)
    })
  })

  describe('createMockOHLCV', () => {
    it('should create a default OHLCV candle', () => {
      const candle = createMockOHLCV()
      
      expect(candle).toHaveProperty('timestamp')
      expect(candle).toHaveProperty('open')
      expect(candle).toHaveProperty('high')
      expect(candle).toHaveProperty('low')
      expect(candle).toHaveProperty('close')
      expect(candle).toHaveProperty('volume')
      
      // High should be highest
      expect(candle.high).toBeGreaterThanOrEqual(candle.open)
      expect(candle.high).toBeGreaterThanOrEqual(candle.close)
      
      // Low should be lowest
      expect(candle.low).toBeLessThanOrEqual(candle.open)
      expect(candle.low).toBeLessThanOrEqual(candle.close)
    })
  })

  describe('createMockOHLCVSeries', () => {
    it('should create a series of candles', () => {
      const series = createMockOHLCVSeries(10)
      
      expect(series).toHaveLength(10)
      
      // Check timestamps are in order (oldest first)
      for (let i = 1; i < series.length; i++) {
        expect(series[i].timestamp).toBeGreaterThan(series[i - 1].timestamp)
      }
    })

    it('should use custom base price', () => {
      const series = createMockOHLCVSeries(5, 100)
      
      // All prices should be around the base price
      series.forEach(candle => {
        expect(candle.close).toBeGreaterThan(90)
        expect(candle.close).toBeLessThan(110)
      })
    })

    it('should use custom interval', () => {
      const intervalMs = 60000 // 1 minute
      const series = createMockOHLCVSeries(5, 67500, intervalMs)
      
      for (let i = 1; i < series.length; i++) {
        const diff = series[i].timestamp - series[i - 1].timestamp
        expect(diff).toBe(intervalMs)
      }
    })
  })

  describe('createMockNewsItem', () => {
    it('should create a default news item', () => {
      const news = createMockNewsItem()
      
      expect(news).toHaveProperty('id')
      expect(news).toHaveProperty('title')
      expect(news).toHaveProperty('summary')
      expect(news).toHaveProperty('source')
      expect(news).toHaveProperty('sentiment')
      expect(['positive', 'negative', 'neutral']).toContain(news.sentiment)
    })

    it('should apply overrides', () => {
      const news = createMockNewsItem({
        title: 'Test News',
        sentiment: 'negative',
      })
      
      expect(news.title).toBe('Test News')
      expect(news.sentiment).toBe('negative')
    })
  })

  describe('createMockPortfolio', () => {
    it('should create a portfolio with multiple positions', () => {
      const portfolio = createMockPortfolio(3)
      
      expect(portfolio).toHaveLength(3)
      
      // All positions should have unique symbols
      const symbols = portfolio.map(p => p.symbol)
      expect(new Set(symbols).size).toBe(3)
    })

    it('should calculate allocations that sum to ~100%', () => {
      const portfolio = createMockPortfolio(5)
      
      const totalAllocation = portfolio.reduce((sum, p) => sum + p.allocation, 0)
      expect(totalAllocation).toBeCloseTo(100, 0)
    })

    it('should limit to available symbols', () => {
      const portfolio = createMockPortfolio(10)
      
      // Max 5 symbols available in factory
      expect(portfolio.length).toBeLessThanOrEqual(5)
    })
  })
})
