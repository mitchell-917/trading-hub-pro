// ============================================
// TradingHub Pro - Portfolio Analytics Page
// Comprehensive portfolio analysis and performance tracking
// ============================================

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  Shield,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  PieChartIcon,
  Award,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTradingStore } from '@/lib/store'
import { formatCurrency, formatPercentage, cn } from '@/lib/utils'
import type { Position } from '@/types'

// Helper to compute portfolio values
function computePortfolio(positions: Position[]) {
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
  const buyingPower = 100000 - totalValue

  return {
    totalValue,
    dailyPnL,
    dailyPnLPercent,
    unrealizedPnL,
    positionsCount: positions.length,
    buyingPower,
  }
}

// Performance data generation - deterministic based on seed
const generatePerformanceData = (days: number, seed: number) => {
  const data = []
  let value = 100000
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

// Risk metrics calculation - deterministic based on seed
const calculateRiskMetrics = (positions: Position[], seed: number) => {
  const totalValue = positions.reduce((sum, p) => sum + p.quantity * p.currentPrice, 0)
  
  // Deterministic pseudo-random values
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

// Color palette for charts
const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

// MetricCard component - defined outside Portfolio to avoid creating during render
interface MetricCardProps {
  title: string
  value: string
  change?: number
  icon: typeof TrendingUp
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend,
  subtitle,
}: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            trend === 'up' ? 'bg-green-500/20' : 
            trend === 'down' ? 'bg-red-500/20' : 
            'bg-blue-500/20'
          )}>
            <Icon className={cn(
              'w-5 h-5',
              trend === 'up' ? 'text-green-400' :
              trend === 'down' ? 'text-red-400' :
              'text-blue-400'
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

export function Portfolio() {
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M')
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'pnl'>('value')
  const positions = useTradingStore((s) => s.positions)
  
  // Compute portfolio values with useMemo to avoid infinite loops
  const portfolio = useMemo(() => computePortfolio(positions), [positions])
  
  // Use a stable seed based on positions count for deterministic random
  const seed = useMemo(() => positions.length + 42, [positions.length])
  
  // Generate performance data based on time range
  const performanceData = useMemo(() => {
    const days = timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : timeRange === '1Y' ? 365 : 730
    return generatePerformanceData(days, seed)
  }, [timeRange, seed])
  
  // Calculate allocation data
  const allocationData = useMemo(() => {
    return positions.map((p, index) => ({
      name: p.symbol,
      value: p.quantity * p.currentPrice,
      percent: ((p.quantity * p.currentPrice) / portfolio.totalValue) * 100,
      color: COLORS[index % COLORS.length],
    }))
  }, [positions, portfolio.totalValue])
  
  // Risk metrics
  const riskMetrics = useMemo(() => calculateRiskMetrics(positions, seed), [positions, seed])
  
  // Sector allocation (mock data)
  const sectorData = useMemo(() => [
    { sector: 'Large Cap Crypto', value: 45, fullMark: 100 },
    { sector: 'DeFi', value: 20, fullMark: 100 },
    { sector: 'Layer 2', value: 15, fullMark: 100 },
    { sector: 'Stablecoins', value: 10, fullMark: 100 },
    { sector: 'NFT/Gaming', value: 10, fullMark: 100 },
  ], [])
  
  // Monthly returns (mock data) - deterministic
  const monthlyReturns = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, index) => {
      // Deterministic pseudo-random based on seed and index
      const pseudoRandom = Math.sin(seed * (index + 1)) * 0.5 + 0.5
      return {
        month,
        return: (pseudoRandom * 30 - 10).toFixed(2),
      }
    })
  }, [seed])

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
            <p className="text-gray-400 mt-1">Track your investment performance and risk metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Portfolio Value"
            value={formatCurrency(portfolio.totalValue)}
            change={portfolio.dailyPnLPercent}
            icon={Wallet}
            trend={portfolio.dailyPnL >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Unrealized P&L"
            value={formatCurrency(portfolio.unrealizedPnL)}
            change={(portfolio.unrealizedPnL / portfolio.totalValue) * 100}
            icon={portfolio.unrealizedPnL >= 0 ? TrendingUp : TrendingDown}
            trend={portfolio.unrealizedPnL >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Buying Power"
            value={formatCurrency(portfolio.buyingPower)}
            icon={DollarSign}
            trend="neutral"
            subtitle="Available for trading"
          />
          <MetricCard
            title="Win Rate"
            value={`${riskMetrics.winRate.toFixed(1)}%`}
            icon={Target}
            trend={riskMetrics.winRate >= 50 ? 'up' : 'down'}
            subtitle={`${positions.length} active positions`}
          />
        </div>

        {/* Performance Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Portfolio Performance</h2>
              <p className="text-sm text-gray-400">
                {selectedMetric === 'value' ? 'Total portfolio value over time' : 'Daily profit & loss'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Tabs defaultValue={selectedMetric} onChange={(v) => setSelectedMetric(v as 'value' | 'pnl')}>
                <TabsList>
                  <TabsTrigger value="value">Value</TabsTrigger>
                  <TabsTrigger value="pnl">P&L</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs defaultValue={timeRange} onChange={(v) => setTimeRange(v as typeof timeRange)}>
                <TabsList>
                  <TabsTrigger value="1W">1W</TabsTrigger>
                  <TabsTrigger value="1M">1M</TabsTrigger>
                  <TabsTrigger value="3M">3M</TabsTrigger>
                  <TabsTrigger value="1Y">1Y</TabsTrigger>
                  <TabsTrigger value="ALL">ALL</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                  formatter={(value: number) => [formatCurrency(value), selectedMetric === 'value' ? 'Value' : 'P&L']}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-indigo-400" />
                  Asset Allocation
                </h2>
                <p className="text-sm text-gray-400">Portfolio distribution by asset</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {allocationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-sm font-medium w-16 text-right">
                        {item.percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Risk Metrics Radar */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Risk Profile
                </h2>
                <p className="text-sm text-gray-400">Portfolio risk analysis</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={sectorData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="sector" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Radar
                    name="Allocation"
                    dataKey="value"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Risk Metrics Grid */}
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
            <div className="p-4 rounded-lg bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">Sharpe Ratio</p>
              <p className="text-xl font-bold text-emerald-400">{riskMetrics.sharpeRatio.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">Max Drawdown</p>
              <p className="text-xl font-bold text-red-400">{riskMetrics.maxDrawdown.toFixed(1)}%</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">Volatility</p>
              <p className="text-xl font-bold text-amber-400">{riskMetrics.volatility.toFixed(1)}%</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">Beta</p>
              <p className="text-xl font-bold text-blue-400">{riskMetrics.beta.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">Alpha</p>
              <p className="text-xl font-bold text-purple-400">{riskMetrics.alpha.toFixed(2)}%</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">VaR (95%)</p>
              <p className="text-xl font-bold text-orange-400">{formatCurrency(riskMetrics.var95)}</p>
            </div>
          </div>
        </Card>

        {/* Monthly Returns Heatmap */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Monthly Returns
              </h2>
              <p className="text-sm text-gray-400">Performance breakdown by month</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReturns}>
                <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  stroke="#6B7280" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value}%`, 'Return']}
                />
                <Bar 
                  dataKey="return" 
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Trading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Profit Factor</p>
                <p className="text-xl font-bold">{riskMetrics.profitFactor.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg. Win</p>
                <p className="text-xl font-bold">{formatCurrency(riskMetrics.avgWin)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <ArrowDownRight className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg. Loss</p>
                <p className="text-xl font-bold">{formatCurrency(riskMetrics.avgLoss)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Percent className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Exposure</p>
                <p className="text-xl font-bold">{riskMetrics.exposurePercent.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

export default Portfolio
