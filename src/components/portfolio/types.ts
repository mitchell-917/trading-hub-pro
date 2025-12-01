// ============================================
// TradingHub Pro - Portfolio Types
// Type definitions for portfolio components
// ============================================

import type { Position } from '@/types'

export interface PortfolioData {
  totalValue: number
  dailyPnL: number
  dailyPnLPercent: number
  unrealizedPnL: number
  positionsCount: number
  buyingPower: number
}

export interface RiskMetrics {
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  beta: number
  alpha: number
  winRate: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  riskRewardRatio: number
  var95: number
  exposurePercent: number
}

export interface AllocationItem {
  name: string
  value: number
  percent: number
  color: string
}

export interface PerformanceDataPoint {
  date: number
  value: number
  pnl: number
}

export interface SectorData {
  sector: string
  value: number
  fullMark: number
}

export interface MonthlyReturn {
  month: string
  return: string
}

export type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'ALL'
export type MetricType = 'value' | 'pnl'

export interface MetricCardData {
  title: string
  value: string
  change?: number
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

export type { Position }
