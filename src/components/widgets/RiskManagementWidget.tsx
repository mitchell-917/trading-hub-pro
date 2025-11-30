// ============================================
// TradingHub Pro - Risk Management Widget
// Portfolio risk analysis and management tools
// ============================================

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  Target,
  BarChart2,
  Percent,
  DollarSign,
  Lock,
  Unlock,
  Info,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'

interface RiskMetrics {
  portfolioValue: number
  totalRisk: number
  dailyVar: number
  maxDrawdown: number
  sharpeRatio: number
  beta: number
  exposurePercent: number
  marginUsed: number
  freeMargin: number
  marginLevel: number
  leverageUsed: number
  riskScore: number
}

interface Position {
  symbol: string
  size: number
  entryPrice: number
  currentPrice: number
  unrealizedPnl: number
  riskAmount: number
  riskPercent: number
}

// Generate mock risk data
function generateMockRiskData(): { metrics: RiskMetrics; positions: Position[] } {
  const portfolioValue = 50000 + Math.random() * 50000
  
  return {
    metrics: {
      portfolioValue,
      totalRisk: portfolioValue * (0.02 + Math.random() * 0.03),
      dailyVar: portfolioValue * (0.01 + Math.random() * 0.02),
      maxDrawdown: 5 + Math.random() * 15,
      sharpeRatio: 0.5 + Math.random() * 2,
      beta: 0.8 + Math.random() * 0.6,
      exposurePercent: 60 + Math.random() * 35,
      marginUsed: portfolioValue * (0.3 + Math.random() * 0.4),
      freeMargin: portfolioValue * (0.2 + Math.random() * 0.3),
      marginLevel: 150 + Math.random() * 200,
      leverageUsed: 1 + Math.random() * 9,
      riskScore: 30 + Math.random() * 50,
    },
    positions: [
      { symbol: 'BTCUSDT', size: 0.5, entryPrice: 65000, currentPrice: 67000, unrealizedPnl: 1000, riskAmount: 500, riskPercent: 1 },
      { symbol: 'ETHUSDT', size: 5, entryPrice: 3400, currentPrice: 3500, unrealizedPnl: 500, riskAmount: 340, riskPercent: 0.68 },
      { symbol: 'AAPL', size: 50, entryPrice: 190, currentPrice: 195, unrealizedPnl: 250, riskAmount: 475, riskPercent: 0.95 },
      { symbol: 'MSFT', size: 25, entryPrice: 410, currentPrice: 420, unrealizedPnl: 250, riskAmount: 513, riskPercent: 1.02 },
    ].map(p => ({
      ...p,
      unrealizedPnl: (p.currentPrice - p.entryPrice) * p.size * (0.8 + Math.random() * 0.4),
      riskAmount: p.riskAmount * (0.9 + Math.random() * 0.2),
    })),
  }
}

function RiskGauge({ value, max, label }: { value: number; max: number; label: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  const color = percentage > 80 ? 'text-red-400' : percentage > 60 ? 'text-yellow-400' : 'text-emerald-400'
  const bgColor = percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-emerald-500'

  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-2">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-700"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${percentage * 2.51} 251`}
            strokeLinecap="round"
            className={bgColor}
            initial={{ strokeDasharray: '0 251' }}
            animate={{ strokeDasharray: `${percentage * 2.51} 251` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-xl font-bold', color)}>
            {value.toFixed(0)}%
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}

interface MetricRowProps {
  icon: typeof Shield
  label: string
  value: string
  subValue?: string
  status?: 'good' | 'warning' | 'danger' | 'neutral'
}

function MetricRow({ icon: Icon, label, value, subValue, status = 'neutral' }: MetricRowProps) {
  const statusColors = {
    good: 'text-emerald-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    neutral: 'text-gray-300',
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="text-right">
        <span className={cn('font-mono font-medium', statusColors[status])}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-gray-500 ml-1">{subValue}</span>
        )}
      </div>
    </div>
  )
}

type TabType = 'overview' | 'positions' | 'alerts'

export function RiskManagementWidget() {
  const { formatPrice } = useCurrency()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [data] = useState(generateMockRiskData)

  const { metrics, positions } = data

  const riskLevel = useMemo(() => {
    if (metrics.riskScore > 70) return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/20' }
    if (metrics.riskScore > 40) return { label: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { label: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
  }, [metrics.riskScore])

  const tabs: { value: TabType; label: string }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'positions', label: 'Positions' },
    { value: 'alerts', label: 'Alerts' },
  ]

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', riskLevel.bg)}>
              <Shield className={cn('w-5 h-5', riskLevel.color)} />
            </div>
            <div>
              <h3 className="font-semibold">Risk Management</h3>
              <p className="text-xs text-gray-400">
                Portfolio health & exposure
              </p>
            </div>
          </div>
          <Badge 
            variant={metrics.riskScore > 70 ? 'danger' : metrics.riskScore > 40 ? 'warning' : 'success'}
          >
            {riskLevel.label}
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Risk Gauges */}
            <div className="grid grid-cols-3 gap-4">
              <RiskGauge 
                value={metrics.exposurePercent} 
                max={100} 
                label="Exposure" 
              />
              <RiskGauge 
                value={metrics.marginLevel} 
                max={300} 
                label="Margin Level" 
              />
              <RiskGauge 
                value={metrics.riskScore} 
                max={100} 
                label="Risk Score" 
              />
            </div>

            {/* Key Metrics */}
            <div className="space-y-1 border-t border-gray-800 pt-4">
              <MetricRow
                icon={DollarSign}
                label="Portfolio Value"
                value={formatPrice(metrics.portfolioValue)}
                status="neutral"
              />
              <MetricRow
                icon={AlertTriangle}
                label="Total at Risk"
                value={formatPrice(metrics.totalRisk)}
                subValue={`${((metrics.totalRisk / metrics.portfolioValue) * 100).toFixed(1)}%`}
                status={metrics.totalRisk > metrics.portfolioValue * 0.05 ? 'danger' : 'good'}
              />
              <MetricRow
                icon={TrendingDown}
                label="Daily VaR (95%)"
                value={formatPrice(metrics.dailyVar)}
                status={metrics.dailyVar > metrics.portfolioValue * 0.03 ? 'warning' : 'good'}
              />
              <MetricRow
                icon={BarChart2}
                label="Max Drawdown"
                value={`${metrics.maxDrawdown.toFixed(1)}%`}
                status={metrics.maxDrawdown > 15 ? 'danger' : metrics.maxDrawdown > 10 ? 'warning' : 'good'}
              />
              <MetricRow
                icon={Target}
                label="Sharpe Ratio"
                value={metrics.sharpeRatio.toFixed(2)}
                status={metrics.sharpeRatio > 1.5 ? 'good' : metrics.sharpeRatio > 0.5 ? 'neutral' : 'warning'}
              />
              <MetricRow
                icon={Percent}
                label="Leverage"
                value={`${metrics.leverageUsed.toFixed(1)}x`}
                status={metrics.leverageUsed > 5 ? 'danger' : metrics.leverageUsed > 2 ? 'warning' : 'good'}
              />
            </div>

            {/* Margin Info */}
            <div className="grid grid-cols-2 gap-3 border-t border-gray-800 pt-4">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Margin Used</span>
                </div>
                <span className="font-mono font-bold">
                  {formatPrice(metrics.marginUsed)}
                </span>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Unlock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Free Margin</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {formatPrice(metrics.freeMargin)}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="space-y-3">
            {positions.map(pos => (
              <motion.div
                key={pos.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{pos.symbol}</span>
                  <Badge 
                    variant={pos.riskPercent > 1 ? 'warning' : 'success'}
                    size="sm"
                  >
                    {pos.riskPercent.toFixed(2)}% risk
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400 block text-xs">Size</span>
                    <span className="font-mono">{pos.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">P&L</span>
                    <span className={cn(
                      'font-mono',
                      pos.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {formatPrice(pos.unrealizedPnl)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Risk</span>
                    <span className="font-mono text-yellow-400">
                      {formatPrice(pos.riskAmount)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {metrics.leverageUsed > 3 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-400">High Leverage Warning</p>
                  <p className="text-sm text-gray-400">
                    Your leverage is {metrics.leverageUsed.toFixed(1)}x. Consider reducing exposure.
                  </p>
                </div>
              </div>
            )}
            
            {metrics.exposurePercent > 80 && (
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">Overexposed</p>
                  <p className="text-sm text-gray-400">
                    Portfolio exposure is {metrics.exposurePercent.toFixed(0)}%. Diversify or reduce positions.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-400">Risk Tip</p>
                <p className="text-sm text-gray-400">
                  Consider setting stop-losses on all positions to limit downside risk.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
