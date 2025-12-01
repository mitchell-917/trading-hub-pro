// ============================================
// TradingHub Pro - Portfolio Page Components
// Re-export all portfolio page components
// ============================================

export { MetricCard } from './MetricCard'
export { PerformanceChart } from './PerformanceChart'
export { AssetAllocation } from './AssetAllocation'
export { RiskProfile } from './RiskProfile'
export { RiskMetricsGrid } from './RiskMetricsGrid'
export { MonthlyReturns } from './MonthlyReturns'
export { TradingStats } from './TradingStats'
export {
  computePortfolio,
  generatePerformanceData,
  calculateRiskMetrics,
  CHART_COLORS,
} from './utils'
export type { PortfolioData, RiskMetrics, AllocationItem, PerformanceDataPoint } from './types'
