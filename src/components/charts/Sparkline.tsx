// ============================================
// TradingHub Pro - Mini Sparkline Chart
// Compact inline chart for watchlists/tables
// ============================================

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number | string
  height?: number
  color?: 'auto' | 'green' | 'red' | 'blue' | 'purple'
  strokeWidth?: number
  showArea?: boolean
  className?: string
}

export function Sparkline({
  data,
  width = '100%',
  height = 32,
  color = 'auto',
  strokeWidth = 1.5,
  showArea = false,
  className,
}: SparklineProps) {
  const chartData = useMemo(() => {
    return data.map((value, index) => ({ index, value }))
  }, [data])

  const { strokeColor, _fillColor, _trend } = useMemo(() => {
    if (data.length < 2) {
      return { strokeColor: '#6366f1', _fillColor: 'rgba(99, 102, 241, 0.2)', _trend: 0 }
    }

    const firstValue = data[0]
    const lastValue = data[data.length - 1]
    const calculatedTrend = ((lastValue - firstValue) / firstValue) * 100

    if (color === 'auto') {
      if (calculatedTrend > 0) {
        return {
          strokeColor: '#00d26a',
          _fillColor: 'rgba(0, 210, 106, 0.2)',
          _trend: calculatedTrend,
        }
      } else if (calculatedTrend < 0) {
        return {
          strokeColor: '#ff4757',
          _fillColor: 'rgba(255, 71, 87, 0.2)',
          _trend: calculatedTrend,
        }
      }
    }

    const colorMap = {
      green: { stroke: '#00d26a', fill: 'rgba(0, 210, 106, 0.2)' },
      red: { stroke: '#ff4757', fill: 'rgba(255, 71, 87, 0.2)' },
      blue: { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)' },
      purple: { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.2)' },
      auto: { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.2)' },
    }

    return {
      strokeColor: colorMap[color].stroke,
      _fillColor: colorMap[color].fill,
      _trend: calculatedTrend,
    }
  }, [data, color])
  
  // Suppress unused variable warnings
  void _fillColor
  void _trend

  if (data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ width: typeof width === 'number' ? width : undefined, height }}
      >
        <div className="w-full h-0.5 bg-gray-700 rounded" />
      </div>
    )
  }

  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className={cn('inline-block', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <YAxis domain={['dataMin', 'dataMax']} hide />

          {showArea && (
            <Line
              type="monotone"
              dataKey="value"
              stroke="transparent"
              fill={`url(#${gradientId})`}
              strokeWidth={0}
              dot={false}
              animationDuration={300}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================
// Mini Candlestick for compact displays
// ============================================

interface MiniCandleProps {
  open: number
  high: number
  low: number
  close: number
  width?: number
  height?: number
  className?: string
}

export function MiniCandle({
  open,
  high,
  low,
  close,
  width = 12,
  height = 32,
  className,
}: MiniCandleProps) {
  const isGreen = close >= open

  const range = high - low
  if (range === 0) {
    return (
      <div
        className={cn('relative flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <div
          className="w-full h-0.5 rounded"
          style={{ backgroundColor: isGreen ? '#00d26a' : '#ff4757' }}
        />
      </div>
    )
  }

  // Calculate positions as percentages
  const wickTop = ((high - Math.max(open, close)) / range) * 100
  const bodyTop = wickTop
  const bodyHeight = (Math.abs(close - open) / range) * 100
  const wickBottom = ((Math.min(open, close) - low) / range) * 100

  return (
    <div
      className={cn('relative', className)}
      style={{ width, height }}
    >
      {/* Upper wick */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2"
        style={{
          top: 0,
          height: `${wickTop}%`,
          width: 1,
          backgroundColor: isGreen ? '#00d26a' : '#ff4757',
        }}
      />

      {/* Body */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 rounded-sm"
        style={{
          top: `${bodyTop}%`,
          height: `${Math.max(bodyHeight, 2)}%`,
          width: width * 0.6,
          backgroundColor: isGreen ? '#00d26a' : '#ff4757',
        }}
      />

      {/* Lower wick */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2"
        style={{
          bottom: 0,
          height: `${wickBottom}%`,
          width: 1,
          backgroundColor: isGreen ? '#00d26a' : '#ff4757',
        }}
      />
    </div>
  )
}

// ============================================
// Price Change Indicator
// ============================================

interface PriceChangeProps {
  current: number
  previous: number
  showPercentage?: boolean
  className?: string
}

export function PriceChange({
  current,
  previous,
  showPercentage = true,
  className,
}: PriceChangeProps) {
  const change = current - previous
  const percentChange = previous !== 0 ? (change / previous) * 100 : 0
  const isPositive = change >= 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium number-mono',
        isPositive ? 'text-green-400' : 'text-red-400',
        className
      )}
    >
      <span className="text-xs">{isPositive ? '▲' : '▼'}</span>
      <span>{Math.abs(change).toFixed(2)}</span>
      {showPercentage && (
        <span className="text-xs opacity-80">
          ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
        </span>
      )}
    </span>
  )
}
