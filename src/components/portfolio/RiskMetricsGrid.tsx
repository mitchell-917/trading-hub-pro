// ============================================
// TradingHub Pro - Risk Metrics Grid Component
// Display grid of risk indicators
// ============================================

import { Activity } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { RiskMetrics } from './types'

interface RiskMetricsGridProps {
  /** Risk metrics data */
  metrics: RiskMetrics
  /** Price formatting function */
  formatPrice: (value: number) => string
}

/**
 * Grid display of key risk metrics
 */
export function RiskMetricsGrid({ metrics, formatPrice }: RiskMetricsGridProps) {
  const items = [
    { label: 'Sharpe Ratio', value: metrics.sharpeRatio.toFixed(2), color: 'text-emerald-400' },
    { label: 'Max Drawdown', value: `${metrics.maxDrawdown.toFixed(1)}%`, color: 'text-red-400' },
    { label: 'Volatility', value: `${metrics.volatility.toFixed(1)}%`, color: 'text-amber-400' },
    { label: 'Beta', value: metrics.beta.toFixed(2), color: 'text-blue-400' },
    { label: 'Alpha', value: `${metrics.alpha.toFixed(2)}%`, color: 'text-purple-400' },
    { label: 'VaR (95%)', value: formatPrice(metrics.var95), color: 'text-orange-400' },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Risk Metrics
          </h2>
          <p className="text-sm text-gray-400">Key performance and risk indicators</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.label} className="p-4 rounded-lg bg-gray-800/50">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
