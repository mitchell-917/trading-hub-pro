// ============================================
// TradingHub Pro - Candlestick Chart Component
// Interactive candlestick chart with volume bars
// ============================================

import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Area,
} from 'recharts'
import { format } from 'date-fns'
import type { OHLCV } from '@/types'
import { cn, formatCurrency, formatCompact } from '@/lib/utils'

interface CandlestickChartProps {
  data: OHLCV[]
  height?: number
  showVolume?: boolean
  showGrid?: boolean
  className?: string
}

interface CandleData extends OHLCV {
  color: string
  wickHigh: [number, number]
  wickLow: [number, number]
  body: [number, number]
}

export function CandlestickChart({
  data,
  height = 400,
  showVolume = true,
  showGrid = true,
  className,
}: CandlestickChartProps) {
  const chartData = useMemo(() => {
    return data.map((candle) => {
      const isBullish = candle.close >= candle.open
      const color = isBullish ? '#00d26a' : '#ff4757'

      return {
        ...candle,
        color,
        wickHigh: [Math.max(candle.open, candle.close), candle.high] as [number, number],
        wickLow: [candle.low, Math.min(candle.open, candle.close)] as [number, number],
        body: [candle.open, candle.close] as [number, number],
        formattedTime: format(new Date(candle.timestamp), 'HH:mm'),
        formattedDate: format(new Date(candle.timestamp), 'MMM d'),
      }
    })
  }, [data])

  const { minPrice, maxPrice, avgPrice } = useMemo(() => {
    if (data.length === 0) return { minPrice: 0, maxPrice: 0, avgPrice: 0 }
    const lows = data.map((d) => d.low)
    const highs = data.map((d) => d.high)
    const min = Math.min(...lows)
    const max = Math.max(...highs)
    const padding = (max - min) * 0.1
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      avgPrice: (min + max) / 2,
    }
  }, [data])

  const maxVolume = useMemo(() => {
    if (data.length === 0) return 0
    return Math.max(...data.map((d) => d.volume))
  }, [data])

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CandleData }> }) => {
    if (!active || !payload || !payload.length) return null

    const candle = payload[0].payload

    return (
      <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-xl backdrop-blur-sm">
        <div className="text-xs text-gray-400 mb-2">
          {format(new Date(candle.timestamp), 'MMM d, yyyy HH:mm')}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="text-gray-400">Open:</div>
          <div className="text-right number-mono">{formatCurrency(candle.open)}</div>
          <div className="text-gray-400">High:</div>
          <div className="text-right number-mono text-emerald-400">{formatCurrency(candle.high)}</div>
          <div className="text-gray-400">Low:</div>
          <div className="text-right number-mono text-red-400">{formatCurrency(candle.low)}</div>
          <div className="text-gray-400">Close:</div>
          <div className={cn(
            'text-right number-mono font-medium',
            candle.close >= candle.open ? 'text-emerald-400' : 'text-red-400'
          )}>
            {formatCurrency(candle.close)}
          </div>
          <div className="text-gray-400">Volume:</div>
          <div className="text-right number-mono">{formatCompact(candle.volume)}</div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
        >
          {showGrid && (
            <>
              <ReferenceLine
                y={avgPrice}
                stroke="#374151"
                strokeDasharray="3 3"
              />
            </>
          )}

          <XAxis
            dataKey="formattedTime"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[minPrice, maxPrice]}
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickFormatter={(value) => formatCurrency(value)}
            width={80}
          />

          {showVolume && (
            <YAxis
              yAxisId="volume"
              domain={[0, maxVolume * 4]}
              orientation="left"
              hide
            />
          )}

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />

          {/* Volume bars */}
          {showVolume && (
            <Bar
              yAxisId="volume"
              dataKey="volume"
              opacity={0.3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`volume-${index}`} fill={entry.color} />
              ))}
            </Bar>
          )}

          {/* Candle wicks (high) */}
          <Bar
            dataKey="wickHigh"
            barSize={1}
          >
            {chartData.map((entry, index) => (
              <Cell key={`wick-high-${index}`} fill={entry.color} />
            ))}
          </Bar>

          {/* Candle bodies */}
          <Bar
            dataKey="body"
            barSize={8}
          >
            {chartData.map((entry, index) => (
              <Cell key={`body-${index}`} fill={entry.color} />
            ))}
          </Bar>

          {/* Candle wicks (low) */}
          <Bar
            dataKey="wickLow"
            barSize={1}
          >
            {chartData.map((entry, index) => (
              <Cell key={`wick-low-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
