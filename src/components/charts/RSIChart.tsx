// ============================================
// TradingHub Pro - RSI Indicator Chart
// Relative Strength Index visualization
// ============================================

import { useMemo, useCallback } from 'react'
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'
import { format } from 'date-fns'
import type { RSIData } from '@/types'
import { cn } from '@/lib/utils'

interface RSIChartProps {
  data: RSIData[]
  height?: number
  overboughtLevel?: number
  oversoldLevel?: number
  className?: string
}

// Helper functions - defined outside component
function getRSIColor(value: number, overboughtLevel: number, oversoldLevel: number) {
  if (value >= overboughtLevel) return '#ff4757'
  if (value <= oversoldLevel) return '#00d26a'
  return '#6366f1'
}

function getRSILabel(value: number, overboughtLevel: number, oversoldLevel: number) {
  if (value >= overboughtLevel) return 'Overbought'
  if (value <= oversoldLevel) return 'Oversold'
  return 'Neutral'
}

// Custom Tooltip Component - defined outside to avoid creating during render
interface RSITooltipProps {
  active?: boolean
  payload?: Array<{ payload: RSIData & { formattedTime: string } }>
  overboughtLevel: number
  oversoldLevel: number
}

function RSIChartTooltip({ active, payload, overboughtLevel, oversoldLevel }: RSITooltipProps) {
  if (!active || !payload || !payload.length) return null

  const point = payload[0].payload
  const color = getRSIColor(point.value, overboughtLevel, oversoldLevel)
  const label = getRSILabel(point.value, overboughtLevel, oversoldLevel)

  return (
    <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <div className="text-xs text-gray-400">
        {format(new Date(point.timestamp), 'MMM d, HH:mm')}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm font-medium number-mono" style={{ color }}>
          RSI: {point.value.toFixed(2)}
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

export function RSIChart({
  data,
  height = 120,
  overboughtLevel = 70,
  oversoldLevel = 30,
  className,
}: RSIChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedTime: format(new Date(point.timestamp), 'HH:mm'),
    }))
  }, [data])

  const latestRSI = data.length > 0 ? data[data.length - 1] : null

  // Memoized tooltip renderer
  const renderTooltip = useCallback((props: { active?: boolean; payload?: Array<{ payload: RSIData & { formattedTime: string } }> }) => {
    return <RSIChartTooltip {...props} overboughtLevel={overboughtLevel} oversoldLevel={oversoldLevel} />
  }, [overboughtLevel, oversoldLevel])

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-gray-500 text-sm">No RSI data</p>
      </div>
    )
  }

  const latestColor = latestRSI ? getRSIColor(latestRSI.value, overboughtLevel, oversoldLevel) : '#6366f1'

  return (
    <div className={cn('relative', className)}>
      {/* Current RSI value */}
      {latestRSI && (
        <div className="absolute top-2 right-2 z-10">
          <div
            className="px-2 py-1 rounded text-xs font-medium number-mono"
            style={{
              backgroundColor: `${latestColor}20`,
              color: latestColor,
            }}
          >
            RSI: {latestRSI.value.toFixed(1)}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
        >
          {/* Overbought zone */}
          <ReferenceArea
            y1={overboughtLevel}
            y2={100}
            fill="#ff4757"
            fillOpacity={0.1}
          />

          {/* Oversold zone */}
          <ReferenceArea
            y1={0}
            y2={oversoldLevel}
            fill="#00d26a"
            fillOpacity={0.1}
          />

          {/* Reference lines */}
          <ReferenceLine
            y={50}
            stroke="#4b5563"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={overboughtLevel}
            stroke="#ff4757"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={oversoldLevel}
            stroke="#00d26a"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="formattedTime"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[0, 100]}
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            ticks={[0, 30, 50, 70, 100]}
            width={30}
          />

          <Tooltip
            content={renderTooltip as never}
            cursor={{ stroke: '#4b5563', strokeDasharray: '3 3' }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#rsi-gradient)"
            animationDuration={500}
          />

          <defs>
            <linearGradient id="rsi-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(99, 102, 241, 0.3)" />
              <stop offset="95%" stopColor="rgba(99, 102, 241, 0)" />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
