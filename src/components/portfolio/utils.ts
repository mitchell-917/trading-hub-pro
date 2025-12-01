// ============================================
// TradingHub Pro - Portfolio Utility Functions
// Helper functions for portfolio calculations
// ============================================

import type { Position, PortfolioData, RiskMetrics, PerformanceDataPoint, AllocationItem } from './types'
import { TRADING_CONFIG } from '@/lib/config'

/** Color palette for portfolio charts */
export const CHART_COLORS = [
  '#10B981', // emerald
  '#6366F1', // indigo
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
] as const

/**
 * Compute portfolio values from positions
 */
export function computePortfolio(positions: Position[]): PortfolioData {
  const totalValue = positions.reduce(
    (sum, p) => sum + p.quantity * p.currentPrice,
    0
  )
  const unrealizedPnL = positions.reduce(
    (sum, p) => sum + p.unrealizedPnL,
    0
  )
  const dailyPnL = unrealizedPnL * 0.3
  const dailyPnLPercent = totalValue > 0 ? (dailyPnL / totalValue) * 100 : 0
  const buyingPower = TRADING_CONFIG.INITIAL_BALANCE - totalValue

  return {
    totalValue,
    dailyPnL,
    dailyPnLPercent,
    unrealizedPnL,
    positionsCount: positions.length,
    buyingPower,
  }
}

/**
 * Generate deterministic performance data for charts
 * Uses a seed-based pseudo-random for consistent results
 */
export function generatePerformanceData(days: number, seed: number): PerformanceDataPoint[] {
  const data: PerformanceDataPoint[] = []
  let value = TRADING_CONFIG.INITIAL_BALANCE
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  
  for (let i = days; i >= 0; i--) {
    // Deterministic pseudo-random based on seed and index
    const pseudoRandom = Math.sin(seed * (days - i + 1)) * 0.5 + 0.5
    const change = value * (pseudoRandom * 0.04 - 0.015)
    value += change
    data.push({
      date: now - i * dayMs,
      value: Math.round(value * 100) / 100,
      pnl: Math.round(change * 100) / 100,
    })
  }
  return data
}

/**
 * Calculate risk metrics with deterministic pseudo-random values
 */
export function calculateRiskMetrics(positions: Position[], seed: number): RiskMetrics {
  const totalValue = positions.reduce((sum, p) => sum + p.quantity * p.currentPrice, 0)
  
  // Deterministic pseudo-random values for consistent rendering
  const pr1 = Math.sin(seed * 1) * 0.5 + 0.5
  const pr2 = Math.sin(seed * 2) * 0.5 + 0.5
  const pr3 = Math.sin(seed * 3) * 0.5 + 0.5
  const pr4 = Math.sin(seed * 4) * 0.5 + 0.5
  const pr5 = Math.sin(seed * 5) * 0.5 + 0.5
  const pr6 = Math.sin(seed * 6) * 0.5 + 0.5
  const pr7 = Math.sin(seed * 7) * 0.5 + 0.5
  const pr8 = Math.sin(seed * 8) * 0.5 + 0.5
  
  return {
    sharpeRatio: 1.45 + pr1 * 0.5,
    maxDrawdown: -12.5 + pr2 * 5,
    volatility: 18.5 + pr3 * 5,
    beta: 0.85 + pr4 * 0.3,
    alpha: 2.5 + pr5 * 2,
    winRate: 62 + pr6 * 10,
    profitFactor: 1.8 + pr7 * 0.5,
    avgWin: totalValue * 0.02,
    avgLoss: totalValue * 0.01,
    riskRewardRatio: 2.1 + pr8 * 0.5,
    var95: totalValue * 0.05,
    exposurePercent: 75 + pr1 * 15,
  }
}

/**
 * Calculate allocation data from positions
 */
export function calculateAllocationData(
  positions: Position[],
  totalValue: number
): AllocationItem[] {
  return positions.map((p, index) => ({
    name: p.symbol,
    value: p.quantity * p.currentPrice,
    percent: totalValue > 0 ? ((p.quantity * p.currentPrice) / totalValue) * 100 : 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }))
}

/**
 * Generate monthly returns data
 */
export function generateMonthlyReturns(seed: number): Array<{ month: string; return: string }> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((month, index) => {
    const pseudoRandom = Math.sin(seed * (index + 1)) * 0.5 + 0.5
    return {
      month,
      return: (pseudoRandom * 30 - 10).toFixed(2),
    }
  })
}

/**
 * Get days count for time range
 */
export function getTimeRangeDays(timeRange: '1W' | '1M' | '3M' | '1Y' | 'ALL'): number {
  switch (timeRange) {
    case '1W': return 7
    case '1M': return 30
    case '3M': return 90
    case '1Y': return 365
    case 'ALL': return 730
  }
}
