// ============================================
// TradingHub Pro - AI Signals Hook
// AI-powered trading signals with explanations
// ============================================

import { useState, useEffect, useCallback } from 'react'
import type { AISignal, AIAnalysis, OHLCV } from '@/types'
import { generateAISignals, generateAIAnalysis } from '@/lib/mock-data'

interface UseAISignalsOptions {
  symbol: string
  enabled?: boolean
  refreshInterval?: number
}

interface UseAISignalsReturn {
  signals: AISignal[]
  analysis: AIAnalysis | null
  isLoading: boolean
  error: string | null
  refresh: () => void
  lastUpdated: number | null
}

/**
 * Hook for AI-powered trading signals
 */
export function useAISignals({
  symbol,
  enabled = true,
  refreshInterval = 60000, // 1 minute
}: UseAISignalsOptions): UseAISignalsReturn {
  const [signals, setSignals] = useState<AISignal[]>([])
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const fetchSignals = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    try {
      const newSignals = generateAISignals(symbol, 5)
      const newAnalysis = generateAIAnalysis(symbol)

      setSignals(newSignals)
      setAnalysis(newAnalysis)
      setLastUpdated(Date.now())
      setIsLoading(false)
    } catch (err) {
      setError('Failed to fetch AI signals')
      setIsLoading(false)
    }
  }, [symbol, enabled])

  useEffect(() => {
    fetchSignals()

    const interval = setInterval(fetchSignals, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchSignals, refreshInterval])

  const refresh = useCallback(() => {
    fetchSignals()
  }, [fetchSignals])

  return {
    signals,
    analysis,
    isLoading,
    error,
    refresh,
    lastUpdated,
  }
}

interface SignalScore {
  overall: number
  technical: number
  momentum: number
  trend: number
  volatility: number
}

/**
 * Calculate composite signal score from OHLCV data
 */
export function calculateSignalScore(
  ohlcvData: OHLCV[],
  rsiValue?: number,
  macdHistogram?: number
): SignalScore {
  if (ohlcvData.length < 20) {
    return {
      overall: 50,
      technical: 50,
      momentum: 50,
      trend: 50,
      volatility: 50,
    }
  }

  // Calculate trend score
  const recentCloses = ohlcvData.slice(-20).map((d) => d.close)
  const avgPrice = recentCloses.reduce((a, b) => a + b, 0) / recentCloses.length
  const currentPrice = recentCloses[recentCloses.length - 1]
  const trendScore = 50 + ((currentPrice - avgPrice) / avgPrice) * 500
  const clampedTrendScore = Math.max(0, Math.min(100, trendScore))

  // Calculate momentum score from RSI
  let momentumScore = 50
  if (rsiValue !== undefined) {
    if (rsiValue > 70) {
      momentumScore = 30 - (rsiValue - 70)
    } else if (rsiValue < 30) {
      momentumScore = 70 + (30 - rsiValue)
    } else {
      momentumScore = 50 + (rsiValue - 50) * 0.5
    }
  }

  // Calculate technical score from MACD
  let technicalScore = 50
  if (macdHistogram !== undefined) {
    technicalScore = 50 + macdHistogram * 10
  }
  technicalScore = Math.max(0, Math.min(100, technicalScore))

  // Calculate volatility score
  const returns = recentCloses.slice(1).map((price, i) =>
    Math.log(price / recentCloses[i])
  )
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100 // Annualized
  const volatilityScore = Math.max(0, Math.min(100, 100 - volatility * 2))

  // Calculate overall score
  const overall =
    clampedTrendScore * 0.3 +
    momentumScore * 0.25 +
    technicalScore * 0.25 +
    volatilityScore * 0.2

  return {
    overall: Number(overall.toFixed(1)),
    technical: Number(technicalScore.toFixed(1)),
    momentum: Number(momentumScore.toFixed(1)),
    trend: Number(clampedTrendScore.toFixed(1)),
    volatility: Number(volatilityScore.toFixed(1)),
  }
}

/**
 * Get signal recommendation based on analysis
 */
export function getSignalRecommendation(analysis: AIAnalysis): {
  action: 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell'
  confidence: number
  reasons: string[]
} {
  const { sentiment, sentimentScore, signals } = analysis

  // Calculate average signal confidence
  const avgConfidence =
    signals.length > 0
      ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
      : 50

  // Count bullish vs bearish signals
  const bullishCount = signals.filter((s) => s.direction === 'bullish').length
  const bearishCount = signals.filter((s) => s.direction === 'bearish').length

  let action: 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell'
  const reasons: string[] = []

  if (sentiment === 'bullish' && sentimentScore >= 80) {
    action = 'strong-buy'
    reasons.push('Strong bullish sentiment detected')
  } else if (sentiment === 'bullish' && bullishCount > bearishCount) {
    action = 'buy'
    reasons.push('Majority of signals indicate buying opportunity')
  } else if (sentiment === 'bearish' && sentimentScore <= 20) {
    action = 'strong-sell'
    reasons.push('Strong bearish sentiment detected')
  } else if (sentiment === 'bearish' && bearishCount > bullishCount) {
    action = 'sell'
    reasons.push('Majority of signals indicate selling pressure')
  } else {
    action = 'hold'
    reasons.push('Mixed signals suggest holding position')
  }

  // Add supporting reasons
  if (bullishCount > 0) {
    reasons.push(`${bullishCount} bullish signal(s) detected`)
  }
  if (bearishCount > 0) {
    reasons.push(`${bearishCount} bearish signal(s) detected`)
  }

  return {
    action,
    confidence: avgConfidence,
    reasons,
  }
}

/**
 * Calculate risk/reward ratio
 */
export function calculateRiskReward(
  entryPrice: number,
  targetPrice: number,
  stopLoss: number
): {
  ratio: number
  potentialProfit: number
  potentialLoss: number
  potentialProfitPercent: number
  potentialLossPercent: number
} {
  const potentialProfit = Math.abs(targetPrice - entryPrice)
  const potentialLoss = Math.abs(entryPrice - stopLoss)
  const ratio = potentialLoss > 0 ? potentialProfit / potentialLoss : 0

  return {
    ratio: Number(ratio.toFixed(2)),
    potentialProfit: Number(potentialProfit.toFixed(2)),
    potentialLoss: Number(potentialLoss.toFixed(2)),
    potentialProfitPercent: Number(
      ((potentialProfit / entryPrice) * 100).toFixed(2)
    ),
    potentialLossPercent: Number(
      ((potentialLoss / entryPrice) * 100).toFixed(2)
    ),
  }
}
