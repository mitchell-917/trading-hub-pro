// ============================================
// TradingHub Pro - Metric Card Component
// Reusable metric display card for portfolio
// ============================================

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatPercentage, cn } from '@/lib/utils'

interface MetricCardProps {
  /** Card title */
  title: string
  /** Main value to display */
  value: string
  /** Optional percentage change */
  change?: number
  /** Lucide icon component */
  icon: React.ElementType
  /** Visual trend indicator */
  trend?: 'up' | 'down' | 'neutral'
  /** Optional subtitle text */
  subtitle?: string
}

/**
 * A metric card for displaying portfolio KPIs
 * 
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total Portfolio Value"
 *   value="$125,000"
 *   change={5.2}
 *   icon={Wallet}
 *   trend="up"
 * />
 * ```
 */
export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'neutral',
  subtitle,
}: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            trend === 'up' && 'bg-green-500/20',
            trend === 'down' && 'bg-red-500/20',
            trend === 'neutral' && 'bg-blue-500/20'
          )}>
            <Icon className={cn(
              'w-5 h-5',
              trend === 'up' && 'text-green-400',
              trend === 'down' && 'text-red-400',
              trend === 'neutral' && 'text-blue-400'
            )} />
          </div>
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {change !== undefined && (
          <Badge color={change >= 0 ? 'green' : 'red'} size="sm">
            {change >= 0 ? '+' : ''}{formatPercentage(change)}
          </Badge>
        )}
      </div>
    </Card>
  )
}
