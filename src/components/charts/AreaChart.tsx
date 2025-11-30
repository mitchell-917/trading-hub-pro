// ============================================
// TradingHub Pro - Area Chart Component
// Gradient area chart for price trends
// ============================================

import { useMemo } from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { format } from 'date-fns'
import type { OHLCV } from '@/types'
import { cn, formatCurrency } from '@/lib/utils'

interface AreaChartProps {
  data: OHLCV[]
  height?: number
  color?: 'green' | 'red' | 'blue' | 'purple'
  showGrid?: boolean
  showTooltip?: boolean
  showAxis?: boolean
  className?: string
  gradient?: boolean
}

const colorConfig = {
  green: {
    stroke: '#00d26a',
    fill: 'url(#gradient-green)',
    gradientStart: 'rgba(0, 210, 106, 0.3)',
    gradientEnd: 'rgba(0, 210, 106, 0)',
  },
  red: {
    stroke: '#ff4757',
    fill: 'url(#gradient-red)',
    gradientStart: 'rgba(255, 71, 87, 0.3)',
    gradientEnd: 'rgba(255, 71, 87, 0)',
  },
  blue: {
    stroke: '#6366f1',
    fill: 'url(#gradient-blue)',
    gradientStart: 'rgba(99, 102, 241, 0.3)',
    gradientEnd: 'rgba(99, 102, 241, 0)',
  },
  purple: {
    stroke: '#a855f7',
    fill: 'url(#gradient-purple)',
    gradientStart: 'rgba(168, 85, 247, 0.3)',
    gradientEnd: 'rgba(168, 85, 247, 0)',
  },
}

export function AreaChart({
  data,
  height = 200,
  color = 'green',
  showGrid = false,
  showTooltip = true,
  showAxis = true,
  className,
  gradient = true,
}: AreaChartProps) {
  const chartData = useMemo(() => {
    return data.map((candle) => ({
      ...candle,
      formattedTime: format(new Date(candle.timestamp), 'HH:mm'),
    }))
  }, [data])

  const { minPrice, maxPrice, avgPrice, trend } = useMemo(() => {
    if (data.length === 0) return { minPrice: 0, maxPrice: 0, avgPrice: 0, trend: 'neutral' }
    const closes = data.map((d) => d.close)
    const min = Math.min(...closes)
    const max = Math.max(...closes)
    const padding = (max - min) * 0.1
    const firstPrice = data[0].close
    const lastPrice = data[data.length - 1].close
    
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      avgPrice: (min + max) / 2,
      trend: lastPrice >= firstPrice ? 'up' : 'down',
    }
  }, [data])

  // Dynamic color based on trend if not specified
  const activeColor = color === 'green' && trend === 'down' ? 'red' : color
  const config = colorConfig[activeColor]

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: OHLCV & { formattedTime: string } }> }) => {
    if (!active || !payload || !payload.length || !showTooltip) return null

    const point = payload[0].payload

    return (
      <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
        <div className="text-xs text-gray-400">
          {format(new Date(point.timestamp), 'MMM d, HH:mm')}
        </div>
        <div className="text-sm font-medium number-mono" style={{ color: config.stroke }}>
          {formatCurrency(point.close)}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-gray-500 text-sm">No data</p>
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
            <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorConfig.green.gradientStart} />
              <stop offset="95%" stopColor={colorConfig.green.gradientEnd} />
            </linearGradient>
            <linearGradient id="gradient-red" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorConfig.red.gradientStart} />
              <stop offset="95%" stopColor={colorConfig.red.gradientEnd} />
            </linearGradient>
            <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorConfig.blue.gradientStart} />
              <stop offset="95%" stopColor={colorConfig.blue.gradientEnd} />
            </linearGradient>
            <linearGradient id="gradient-purple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorConfig.purple.gradientStart} />
              <stop offset="95%" stopColor={colorConfig.purple.gradientEnd} />
            </linearGradient>
          </defs>

          {showGrid && (
            <ReferenceLine
              y={avgPrice}
              stroke="#374151"
              strokeDasharray="3 3"
            />
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
                domain={[minPrice, maxPrice]}
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
              content={<CustomTooltip />}
              cursor={{ stroke: '#4b5563', strokeDasharray: '3 3' }}
            />
          )}

          <Area
            type="monotone"
            dataKey="close"
            stroke={config.stroke}
            strokeWidth={2}
            fill={gradient ? config.fill : 'none'}
            animationDuration={500}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Mini sparkline chart
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: 'green' | 'red' | 'blue' | 'auto'
  className?: string
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = 'auto',
  className,
}: SparklineProps) {
  const chartData = useMemo(() => {
    return data.map((value, index) => ({ value, index }))
  }, [data])

  const trend = data.length > 1 ? (data[data.length - 1] >= data[0] ? 'up' : 'down') : 'neutral'
  const strokeColor =
    color === 'auto'
      ? trend === 'up'
        ? '#00d26a'
        : '#ff4757'
      : colorConfig[color as keyof typeof colorConfig]?.stroke || '#6366f1'

  if (data.length < 2) return null

  return (
    <div className={cn('inline-flex', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill="none"
            animationDuration={300}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
