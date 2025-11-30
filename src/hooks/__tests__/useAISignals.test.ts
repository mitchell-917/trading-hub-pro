// ============================================
// TradingHub Pro - AI Signals Tests
// ============================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useAISignals,
  calculateSignalScore,
  getSignalRecommendation,
  calculateRiskReward,
} from '../useAISignals'
import type { OHLCV, AIAnalysis } from '@/types'

// Generate test OHLCV data
function generateTestOHLCV(count: number, trend: 'up' | 'down' | 'flat' = 'flat'): OHLCV[] {
  const data: OHLCV[] = []
  let price = 100
  const now = Date.now()
  const trendMultiplier = trend === 'up' ? 1.002 : trend === 'down' ? 0.998 : 1

  for (let i = 0; i < count; i++) {
    price = price * trendMultiplier * (1 + (Math.random() - 0.5) * 0.01)
    const open = price
    const close = price * (1 + (Math.random() - 0.5) * 0.005)
    const high = Math.max(open, close) * 1.002
    const low = Math.min(open, close) * 0.998

    data.push({
      timestamp: now - (count - i) * 3600000,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
    })
  }

  return data
}

describe('useAISignals', () => {
  it('fetches signals for a symbol', async () => {
    const { result } = renderHook(() =>
      useAISignals({ symbol: 'BTC', enabled: true })
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 2000 })

    expect(result.current.signals.length).toBeGreaterThan(0)
    expect(result.current.analysis).not.toBeNull()
    expect(result.current.lastUpdated).not.toBeNull()
  })

  it('does not fetch when disabled', async () => {
    const { result } = renderHook(() =>
      useAISignals({ symbol: 'BTC', enabled: false })
    )

    // Wait a bit to ensure no fetch happens
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.signals).toHaveLength(0)
    expect(result.current.analysis).toBeNull()
  })

  it('signals have required properties', async () => {
    const { result } = renderHook(() =>
      useAISignals({ symbol: 'ETH', enabled: true })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 2000 })

    result.current.signals.forEach((signal) => {
      expect(signal.id).toBeDefined()
      expect(signal.symbol).toBe('ETH')
      expect(['bullish', 'bearish', 'neutral']).toContain(signal.direction)
      expect(['strong', 'moderate', 'weak']).toContain(signal.strength)
      expect(signal.confidence).toBeGreaterThanOrEqual(0)
      expect(signal.confidence).toBeLessThanOrEqual(100)
      expect(signal.entryPrice).toBeGreaterThan(0)
      expect(signal.targetPrice).toBeGreaterThan(0)
      expect(signal.stopLoss).toBeGreaterThan(0)
      expect(signal.reasoning).toBeInstanceOf(Array)
      expect(signal.indicators).toBeInstanceOf(Array)
    })
  })

  it('analysis has required properties', async () => {
    const { result } = renderHook(() =>
      useAISignals({ symbol: 'SOL', enabled: true })
    )

    await waitFor(() => {
      expect(result.current.analysis).not.toBeNull()
    }, { timeout: 2000 })

    const analysis = result.current.analysis!
    expect(analysis.symbol).toBe('SOL')
    expect(analysis.summary).toBeDefined()
    expect(['bullish', 'bearish', 'neutral']).toContain(analysis.sentiment)
    expect(analysis.sentimentScore).toBeGreaterThanOrEqual(0)
    expect(analysis.sentimentScore).toBeLessThanOrEqual(100)
    expect(analysis.keyFactors).toBeInstanceOf(Array)
    expect(analysis.signals).toBeInstanceOf(Array)
  })
})

describe('calculateSignalScore', () => {
  it('returns neutral score for insufficient data', () => {
    const ohlcvData = generateTestOHLCV(5)
    const result = calculateSignalScore(ohlcvData)

    expect(result.overall).toBe(50)
    expect(result.technical).toBe(50)
    expect(result.momentum).toBe(50)
    expect(result.trend).toBe(50)
    expect(result.volatility).toBe(50)
  })

  it('calculates higher trend score for uptrend', () => {
    const uptrendData = generateTestOHLCV(30, 'up')
    const flatData = generateTestOHLCV(30, 'flat')

    const uptrendScore = calculateSignalScore(uptrendData)
    const flatScore = calculateSignalScore(flatData)

    expect(uptrendScore.trend).toBeGreaterThanOrEqual(flatScore.trend - 20)
  })

  it('calculates momentum score from RSI', () => {
    const ohlcvData = generateTestOHLCV(30)

    const oversoldResult = calculateSignalScore(ohlcvData, 25)
    const overboughtResult = calculateSignalScore(ohlcvData, 75)
    const neutralResult = calculateSignalScore(ohlcvData, 50)

    expect(oversoldResult.momentum).toBeGreaterThan(50)
    expect(overboughtResult.momentum).toBeLessThan(50)
    expect(neutralResult.momentum).toBeCloseTo(50, 0)
  })

  it('calculates technical score from MACD', () => {
    const ohlcvData = generateTestOHLCV(30)

    const bullishResult = calculateSignalScore(ohlcvData, 50, 5)
    const bearishResult = calculateSignalScore(ohlcvData, 50, -5)

    expect(bullishResult.technical).toBeGreaterThan(50)
    expect(bearishResult.technical).toBeLessThan(50)
  })

  it('returns scores between 0 and 100', () => {
    const ohlcvData = generateTestOHLCV(50)
    const result = calculateSignalScore(ohlcvData, 50, 0)

    expect(result.overall).toBeGreaterThanOrEqual(0)
    expect(result.overall).toBeLessThanOrEqual(100)
    expect(result.technical).toBeGreaterThanOrEqual(0)
    expect(result.technical).toBeLessThanOrEqual(100)
    expect(result.momentum).toBeGreaterThanOrEqual(0)
    expect(result.momentum).toBeLessThanOrEqual(100)
    expect(result.trend).toBeGreaterThanOrEqual(0)
    expect(result.trend).toBeLessThanOrEqual(100)
    expect(result.volatility).toBeGreaterThanOrEqual(0)
    expect(result.volatility).toBeLessThanOrEqual(100)
  })
})

describe('getSignalRecommendation', () => {
  it('returns strong-buy for very bullish sentiment', () => {
    const analysis: AIAnalysis = {
      symbol: 'BTC',
      summary: 'Test',
      sentiment: 'bullish',
      sentimentScore: 85,
      keyFactors: [],
      signals: [
        {
          id: '1',
          symbol: 'BTC',
          direction: 'bullish',
          strength: 'strong',
          confidence: 90,
          entryPrice: 67000,
          targetPrice: 70000,
          stopLoss: 65000,
          riskRewardRatio: 1.5,
          reasoning: [],
          indicators: [],
          timestamp: Date.now(),
          expiresAt: Date.now() + 3600000,
        },
      ],
      lastUpdated: Date.now(),
    }

    const result = getSignalRecommendation(analysis)

    expect(result.action).toBe('strong-buy')
    expect(result.confidence).toBe(90)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('returns strong-sell for very bearish sentiment', () => {
    const analysis: AIAnalysis = {
      symbol: 'BTC',
      summary: 'Test',
      sentiment: 'bearish',
      sentimentScore: 15,
      keyFactors: [],
      signals: [
        {
          id: '1',
          symbol: 'BTC',
          direction: 'bearish',
          strength: 'strong',
          confidence: 85,
          entryPrice: 67000,
          targetPrice: 64000,
          stopLoss: 69000,
          riskRewardRatio: 1.5,
          reasoning: [],
          indicators: [],
          timestamp: Date.now(),
          expiresAt: Date.now() + 3600000,
        },
      ],
      lastUpdated: Date.now(),
    }

    const result = getSignalRecommendation(analysis)

    expect(result.action).toBe('strong-sell')
  })

  it('returns hold for neutral sentiment', () => {
    const analysis: AIAnalysis = {
      symbol: 'BTC',
      summary: 'Test',
      sentiment: 'neutral',
      sentimentScore: 50,
      keyFactors: [],
      signals: [],
      lastUpdated: Date.now(),
    }

    const result = getSignalRecommendation(analysis)

    expect(result.action).toBe('hold')
  })
})

describe('calculateRiskReward', () => {
  it('calculates risk/reward for long position', () => {
    const result = calculateRiskReward(100, 110, 95)

    expect(result.ratio).toBe(2) // (110-100)/(100-95)
    expect(result.potentialProfit).toBe(10)
    expect(result.potentialLoss).toBe(5)
    expect(result.potentialProfitPercent).toBe(10)
    expect(result.potentialLossPercent).toBe(5)
  })

  it('calculates risk/reward for short position', () => {
    const result = calculateRiskReward(100, 90, 105)

    expect(result.ratio).toBe(2) // (100-90)/(105-100)
    expect(result.potentialProfit).toBe(10)
    expect(result.potentialLoss).toBe(5)
  })

  it('handles zero stop loss distance', () => {
    const result = calculateRiskReward(100, 110, 100)

    expect(result.ratio).toBe(0)
    expect(result.potentialLoss).toBe(0)
  })

  it('returns correct percentages', () => {
    const result = calculateRiskReward(50000, 55000, 48000)

    expect(result.potentialProfitPercent).toBe(10)
    expect(result.potentialLossPercent).toBe(4)
    expect(result.ratio).toBe(2.5)
  })
})
