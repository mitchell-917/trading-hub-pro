// ============================================
// TradingHub Pro - Area Chart Component
// Gradient area chart for price trends
// ============================================

import { useMemo, useCallback } from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { format } from 'date-fns'
import { cn, formatCurrency } from '@/lib/utils'

interface TradingAreaChartData {
  timestamp: number
  value: number
}

interface TradingAreaChartProps {
  data: TradingAreaChartData[]
  height?: number
  color?: { stroke: string; fill: string }
  showGrid?: boolean
  showTooltip?: boolean
  showAxis?: boolean
  className?: string
}

// Custom Tooltip Component - defined outside to avoid creating during render
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: TradingAreaChartData & { formattedTime: string } }>
  strokeColor: string
}

function AreaChartTooltip({ active, payload, strokeColor }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const point = payload[0].payload

  return (
    <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <div className="text-xs text-gray-400">
        {format(new Date(point.timestamp), 'MMM d, HH:mm')}
      </div>
      <div className="text-sm font-medium number-mono" style={{ color: strokeColor }}>
        {formatCurrency(point.value)}
      </div>
    </div>
  )
}

export function TradingAreaChart({
  data,
  height = 200,
  color = { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.2)' },
  showGrid = true,
  showTooltip = true,
  showAxis = true,
  className,
}: TradingAreaChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedTime: format(new Date(point.timestamp), 'HH:mm'),
    }))
  }, [data])

  const { minValue, maxValue, strokeColor } = useMemo(() => {
    if (data.length === 0) return { minValue: 0, maxValue: 0, strokeColor: color.stroke }
    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1
    const firstValue = data[0].value
    const lastValue = data[data.length - 1].value
    const currentTrend = lastValue >= firstValue ? 'up' : 'down'
    
    return {
      minValue: min - padding,
      maxValue: max + padding,
      strokeColor: currentTrend === 'down' ? '#ff4757' : color.stroke,
    }
  }, [data, color.stroke])

  // Memoized tooltip content renderer
  const renderTooltip = useCallback((props: { active?: boolean; payload?: Array<{ payload: TradingAreaChartData & { formattedTime: string } }> }) => {
    if (!showTooltip) return null
    return <AreaChartTooltip {...props} strokeColor={strokeColor} />
  }, [showTooltip, strokeColor])

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={chartData}
          margin={{ top: 5, right: showAxis ? 60 : 5, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          )}

          {showAxis && (
            <>
              <XAxis
                dataKey="formattedTime"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minValue, maxValue]}
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickFormatter={(value) => formatCurrency(value)}
                width={60}
              />
            </>
          )}

          {showTooltip && (
            <Tooltip
              content={renderTooltip as never}
              cursor={{ stroke: '#4b5563', strokeDasharray: '3 3' }}
            />
          )}

          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#area-gradient)"
            animationDuration={500}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
