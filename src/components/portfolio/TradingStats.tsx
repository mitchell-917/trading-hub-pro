// ============================================
// TradingHub Pro - Trading Stats Component
// Grid of trading performance statistics
// ============================================

import {
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { RiskMetrics } from './types'

interface TradingStatsProps {
  /** Risk metrics containing trading stats */
  metrics: RiskMetrics
  /** Price formatting function */
  formatPrice: (value: number) => string
}

/**
 * Grid of trading performance statistics
 */
export function TradingStats({ metrics, formatPrice }: TradingStatsProps) {
  const stats = [
    {
      title: 'Profit Factor',
      value: metrics.profitFactor.toFixed(2),
      icon: Award,
      bgColor: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Avg. Win',
      value: formatPrice(metrics.avgWin),
      icon: ArrowUpRight,
      bgColor: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
    {
      title: 'Avg. Loss',
      value: formatPrice(metrics.avgLoss),
      icon: ArrowDownRight,
      bgColor: 'bg-red-500/20',
      iconColor: 'text-red-400',
    },
    {
      title: 'Exposure',
      value: `${metrics.exposurePercent.toFixed(1)}%`,
      icon: Percent,
      bgColor: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">{stat.title}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
