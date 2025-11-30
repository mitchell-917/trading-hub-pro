// ============================================
// TradingHub Pro - Technical Indicators Hook
// Calculate technical indicators from OHLCV data
// ============================================

import { useMemo } from 'react'
import type { OHLCV, RSIData, MACDData, BollingerBandsData } from '@/types'
import {
  generateRSI,
  generateMACD,
  generateBollingerBands,
} from '@/lib/mock-data'

interface TechnicalIndicatorsConfig {
  rsi?: {
    enabled: boolean
    period?: number
  }
  macd?: {
    enabled: boolean
    fastPeriod?: number
    slowPeriod?: number
    signalPeriod?: number
  }
  bollingerBands?: {
    enabled: boolean
    period?: number
    standardDeviations?: number
  }
  sma?: {
    enabled: boolean
    periods?: number[]
  }
  ema?: {
    enabled: boolean
    periods?: number[]
  }
}

interface SMAData {
  timestamp: number
  value: number
}

interface UseTechnicalIndicatorsReturn {
  rsi: RSIData[]
  macd: MACDData[]
  bollingerBands: BollingerBandsData[]
  sma: Record<number, SMAData[]>
  ema: Record<number, SMAData[]>
  isCalculating: boolean
}

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(data: OHLCV[], period: number): SMAData[] {
  if (data.length < period) return []

  const result: SMAData[] = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const sum = slice.reduce((acc, d) => acc + d.close, 0)
    result.push({
      timestamp: data[i].timestamp,
      value: Number((sum / period).toFixed(2)),
    })
  }

  return result
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(data: OHLCV[], period: number): SMAData[] {
  if (data.length < period) return []

  const multiplier = 2 / (period + 1)
  const result: SMAData[] = []

  // Start with SMA for first value
  const initialSlice = data.slice(0, period)
  let ema = initialSlice.reduce((acc, d) => acc + d.close, 0) / period

  result.push({
    timestamp: data[period - 1].timestamp,
    value: Number(ema.toFixed(2)),
  })

  // Calculate EMA for remaining values
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema
    result.push({
      timestamp: data[i].timestamp,
      value: Number(ema.toFixed(2)),
    })
  }

  return result
}

/**
 * Hook for calculating technical indicators from OHLCV data
 */
export function useTechnicalIndicators(
  ohlcvData: OHLCV[],
  config: TechnicalIndicatorsConfig = {}
): UseTechnicalIndicatorsReturn {
  const {
    rsi: rsiConfig = { enabled: true, period: 14 },
    macd: macdConfig = {
      enabled: true,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
    },
    bollingerBands: bbConfig = {
      enabled: true,
      period: 20,
      standardDeviations: 2,
    },
    sma: smaConfig = { enabled: true, periods: [20, 50, 200] },
    ema: emaConfig = { enabled: true, periods: [12, 26] },
  } = config

  const rsi = useMemo(() => {
    if (!rsiConfig.enabled || ohlcvData.length === 0) return []
    return generateRSI(ohlcvData, rsiConfig.period || 14)
  }, [ohlcvData, rsiConfig.enabled, rsiConfig.period])

  const macd = useMemo(() => {
    if (!macdConfig.enabled || ohlcvData.length === 0) return []
    return generateMACD(
      ohlcvData,
      macdConfig.fastPeriod || 12,
      macdConfig.slowPeriod || 26,
      macdConfig.signalPeriod || 9
    )
  }, [
    ohlcvData,
    macdConfig.enabled,
    macdConfig.fastPeriod,
    macdConfig.slowPeriod,
    macdConfig.signalPeriod,
  ])

  const bollingerBands = useMemo(() => {
    if (!bbConfig.enabled || ohlcvData.length === 0) return []
    return generateBollingerBands(
      ohlcvData,
      bbConfig.period || 20,
      bbConfig.standardDeviations || 2
    )
  }, [ohlcvData, bbConfig.enabled, bbConfig.period, bbConfig.standardDeviations])

  const sma = useMemo(() => {
    if (!smaConfig.enabled || ohlcvData.length === 0) return {}
    const result: Record<number, SMAData[]> = {}
    ;(smaConfig.periods || [20, 50, 200]).forEach((period) => {
      result[period] = calculateSMA(ohlcvData, period)
    })
    return result
  }, [ohlcvData, smaConfig.enabled, smaConfig.periods])

  const ema = useMemo(() => {
    if (!emaConfig.enabled || ohlcvData.length === 0) return {}
    const result: Record<number, SMAData[]> = {}
    ;(emaConfig.periods || [12, 26]).forEach((period) => {
      result[period] = calculateEMA(ohlcvData, period)
    })
    return result
  }, [ohlcvData, emaConfig.enabled, emaConfig.periods])

  return {
    rsi,
    macd,
    bollingerBands,
    sma,
    ema,
    isCalculating: false,
  }
}

/**
 * Determine RSI signal
 */
export function getRSISignal(rsi: number): {
  signal: 'overbought' | 'oversold' | 'neutral'
  strength: number
} {
  if (rsi >= 70) {
    return { signal: 'overbought', strength: Math.min((rsi - 70) / 30, 1) }
  } else if (rsi <= 30) {
    return { signal: 'oversold', strength: Math.min((30 - rsi) / 30, 1) }
  }
  return { signal: 'neutral', strength: 0 }
}

/**
 * Determine MACD signal
 */
export function getMACDSignal(
  macd: number,
  signal: number,
  previousMacd?: number,
  previousSignal?: number
): {
  signal: 'bullish' | 'bearish' | 'neutral'
  crossover: 'bullish' | 'bearish' | null
} {
  const histogram = macd - signal
  const previousHistogram =
    previousMacd !== undefined && previousSignal !== undefined
      ? previousMacd - previousSignal
      : null

  let crossover: 'bullish' | 'bearish' | null = null
  if (previousHistogram !== null) {
    if (previousHistogram < 0 && histogram > 0) {
      crossover = 'bullish'
    } else if (previousHistogram > 0 && histogram < 0) {
      crossover = 'bearish'
    }
  }

  return {
    signal: histogram > 0 ? 'bullish' : histogram < 0 ? 'bearish' : 'neutral',
    crossover,
  }
}

/**
 * Determine Bollinger Bands signal
 */
export function getBollingerBandsSignal(
  price: number,
  upper: number,
  _middle: number,
  lower: number
): {
  signal: 'overbought' | 'oversold' | 'neutral'
  percentB: number
} {
  const percentB = (price - lower) / (upper - lower)

  if (price > upper) {
    return { signal: 'overbought', percentB }
  } else if (price < lower) {
    return { signal: 'oversold', percentB }
  }
  return { signal: 'neutral', percentB }
}
