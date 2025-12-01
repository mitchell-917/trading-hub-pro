// ============================================
// TradingHub Pro - Performance Chart Component
// Portfolio performance over time visualization
// ============================================

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import type { PerformanceDataPoint, TimeRange, MetricType } from './types'

interface PerformanceChartProps {
  /** Performance data points */
  data: PerformanceDataPoint[]
  /** Currently selected metric type */
  selectedMetric: MetricType
  /** Currently selected time range */
  timeRange: TimeRange
  /** Callback when metric type changes */
  onMetricChange: (metric: MetricType) => void
  /** Callback when time range changes */
  onTimeRangeChange: (range: TimeRange) => void
  /** Price formatting function */
  formatPrice: (value: number) => string
}

/**
 * Interactive area chart showing portfolio performance over time
 */
export function PerformanceChart({
  data,
  selectedMetric,
  timeRange,
  onMetricChange,
  onTimeRangeChange,
  formatPrice,
}: PerformanceChartProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Portfolio Performance</h2>
          <p className="text-sm text-gray-400">
            {selectedMetric === 'value' ? 'Total portfolio value over time' : 'Daily profit & loss'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs defaultValue={selectedMetric} onChange={(v) => onMetricChange(v as MetricType)}>
            <TabsList>
              <TabsTrigger value="value">Value</TabsTrigger>
              <TabsTrigger value="pnl">P&L</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue={timeRange} onChange={(v) => onTimeRangeChange(v as TimeRange)}>
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
          <AreaChart data={data}>
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
              formatter={(value: number) => [formatPrice(value), selectedMetric === 'value' ? 'Value' : 'P&L']}
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
  )
}
