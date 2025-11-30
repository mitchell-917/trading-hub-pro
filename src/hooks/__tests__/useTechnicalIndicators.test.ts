// ============================================
// TradingHub Pro - Technical Indicators Tests
// ============================================

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useTechnicalIndicators,
  getRSISignal,
  getMACDSignal,
  getBollingerBandsSignal,
} from '../useTechnicalIndicators'
import type { OHLCV } from '@/types'

// Generate test OHLCV data
function generateTestOHLCV(count: number): OHLCV[] {
  const data: OHLCV[] = []
  let price = 100
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    price = price * (1 + (Math.random() - 0.5) * 0.02)
    const open = price
    const close = price * (1 + (Math.random() - 0.5) * 0.01)
    const high = Math.max(open, close) * (1 + Math.random() * 0.005)
    const low = Math.min(open, close) * (1 - Math.random() * 0.005)

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

describe('useTechnicalIndicators', () => {
  it('returns empty arrays for insufficient data', () => {
    const ohlcvData = generateTestOHLCV(5)
    const { result } = renderHook(() => useTechnicalIndicators(ohlcvData))

    expect(result.current.rsi).toHaveLength(0)
    expect(result.current.macd).toHaveLength(0)
    expect(result.current.bollingerBands).toHaveLength(0)
  })

  it('calculates RSI with sufficient data', () => {
    const ohlcvData = generateTestOHLCV(50)
    const { result } = renderHook(() =>
      useTechnicalIndicators(ohlcvData, {
        rsi: { enabled: true, period: 14 },
        macd: { enabled: false },
        bollingerBands: { enabled: false },
        sma: { enabled: false },
        ema: { enabled: false },
      })
    )

    expect(result.current.rsi.length).toBeGreaterThan(0)
    result.current.rsi.forEach((rsi) => {
      expect(rsi.value).toBeGreaterThanOrEqual(0)
      expect(rsi.value).toBeLessThanOrEqual(100)
      expect(rsi.timestamp).toBeGreaterThan(0)
    })
  })

  it('calculates MACD with sufficient data', () => {
    const ohlcvData = generateTestOHLCV(50)
    const { result } = renderHook(() =>
      useTechnicalIndicators(ohlcvData, {
        rsi: { enabled: false },
        macd: { enabled: true },
        bollingerBands: { enabled: false },
        sma: { enabled: false },
        ema: { enabled: false },
      })
    )

    expect(result.current.macd.length).toBeGreaterThan(0)
    result.current.macd.forEach((macd) => {
      expect(typeof macd.macd).toBe('number')
      expect(typeof macd.signal).toBe('number')
      expect(typeof macd.histogram).toBe('number')
    })
  })

  it('calculates Bollinger Bands with sufficient data', () => {
    const ohlcvData = generateTestOHLCV(50)
    const { result } = renderHook(() =>
      useTechnicalIndicators(ohlcvData, {
        rsi: { enabled: false },
        macd: { enabled: false },
        bollingerBands: { enabled: true },
        sma: { enabled: false },
        ema: { enabled: false },
      })
    )

    expect(result.current.bollingerBands.length).toBeGreaterThan(0)
    result.current.bollingerBands.forEach((bb) => {
      expect(bb.upper).toBeGreaterThan(bb.middle)
      expect(bb.middle).toBeGreaterThan(bb.lower)
      expect(bb.bandwidth).toBeGreaterThan(0)
    })
  })

  it('calculates SMA for multiple periods', () => {
    const ohlcvData = generateTestOHLCV(250)
    const { result } = renderHook(() =>
      useTechnicalIndicators(ohlcvData, {
        rsi: { enabled: false },
        macd: { enabled: false },
        bollingerBands: { enabled: false },
        sma: { enabled: true, periods: [20, 50, 200] },
        ema: { enabled: false },
      })
    )

    expect(result.current.sma[20]).toBeDefined()
    expect(result.current.sma[50]).toBeDefined()
    expect(result.current.sma[200]).toBeDefined()
    expect(result.current.sma[20].length).toBeGreaterThan(result.current.sma[200].length)
  })

  it('calculates EMA for multiple periods', () => {
    const ohlcvData = generateTestOHLCV(50)
    const { result } = renderHook(() =>
      useTechnicalIndicators(ohlcvData, {
        rsi: { enabled: false },
        macd: { enabled: false },
        bollingerBands: { enabled: false },
        sma: { enabled: false },
        ema: { enabled: true, periods: [12, 26] },
      })
    )

    expect(result.current.ema[12]).toBeDefined()
    expect(result.current.ema[26]).toBeDefined()
    expect(result.current.ema[12].length).toBeGreaterThanOrEqual(result.current.ema[26].length)
  })

  it('respects enabled flags', () => {
    const ohlcvData = generateTestOHLCV(50)
    const { result } = renderHook(() =>
      useTechnicalIndicators(ohlcvData, {
        rsi: { enabled: false },
        macd: { enabled: false },
        bollingerBands: { enabled: false },
        sma: { enabled: false },
        ema: { enabled: false },
      })
    )

    expect(result.current.rsi).toHaveLength(0)
    expect(result.current.macd).toHaveLength(0)
    expect(result.current.bollingerBands).toHaveLength(0)
    expect(Object.keys(result.current.sma)).toHaveLength(0)
    expect(Object.keys(result.current.ema)).toHaveLength(0)
  })
})

describe('getRSISignal', () => {
  it('detects overbought condition', () => {
    const result = getRSISignal(75)
    expect(result.signal).toBe('overbought')
    expect(result.strength).toBeGreaterThan(0)
  })

  it('detects oversold condition', () => {
    const result = getRSISignal(25)
    expect(result.signal).toBe('oversold')
    expect(result.strength).toBeGreaterThan(0)
  })

  it('detects neutral condition', () => {
    const result = getRSISignal(50)
    expect(result.signal).toBe('neutral')
    expect(result.strength).toBe(0)
  })

  it('calculates strength correctly for extreme overbought', () => {
    const result = getRSISignal(85)
    expect(result.signal).toBe('overbought')
    expect(result.strength).toBe(0.5) // (85-70)/30
  })

  it('calculates strength correctly for extreme oversold', () => {
    const result = getRSISignal(15)
    expect(result.signal).toBe('oversold')
    expect(result.strength).toBe(0.5) // (30-15)/30
  })

  it('caps strength at 1', () => {
    const result = getRSISignal(100)
    expect(result.strength).toBe(1)
  })
})

describe('getMACDSignal', () => {
  it('detects bullish signal', () => {
    const result = getMACDSignal(5, 3)
    expect(result.signal).toBe('bullish')
  })

  it('detects bearish signal', () => {
    const result = getMACDSignal(-5, -3)
    expect(result.signal).toBe('bearish')
  })

  it('detects neutral signal', () => {
    const result = getMACDSignal(0, 0)
    expect(result.signal).toBe('neutral')
  })

  it('detects bullish crossover', () => {
    const result = getMACDSignal(1, 0, -1, 0)
    expect(result.crossover).toBe('bullish')
  })

  it('detects bearish crossover', () => {
    const result = getMACDSignal(-1, 0, 1, 0)
    expect(result.crossover).toBe('bearish')
  })

  it('returns no crossover when no previous data', () => {
    const result = getMACDSignal(5, 3)
    expect(result.crossover).toBeNull()
  })
})

describe('getBollingerBandsSignal', () => {
  it('detects overbought when price above upper band', () => {
    const result = getBollingerBandsSignal(110, 105, 100, 95)
    expect(result.signal).toBe('overbought')
    expect(result.percentB).toBeGreaterThan(1)
  })

  it('detects oversold when price below lower band', () => {
    const result = getBollingerBandsSignal(90, 105, 100, 95)
    expect(result.signal).toBe('oversold')
    expect(result.percentB).toBeLessThan(0)
  })

  it('detects neutral when price within bands', () => {
    const result = getBollingerBandsSignal(100, 105, 100, 95)
    expect(result.signal).toBe('neutral')
    expect(result.percentB).toBeGreaterThanOrEqual(0)
    expect(result.percentB).toBeLessThanOrEqual(1)
  })

  it('calculates percentB correctly', () => {
    const result = getBollingerBandsSignal(100, 110, 100, 90)
    expect(result.percentB).toBe(0.5) // (100-90)/(110-90)
  })
})
