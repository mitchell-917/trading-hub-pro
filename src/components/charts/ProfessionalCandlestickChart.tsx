// ============================================
// TradingHub Pro - Professional Candlestick Chart
// High-performance candlestick chart with advanced features
// ============================================

import { useMemo, useCallback, useState, useRef } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  CartesianGrid,
  Brush,
} from 'recharts'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize2, TrendingUp, TrendingDown } from 'lucide-react'
import type { OHLCV } from '@/types'
import { useCurrency } from '@/context/CurrencyContext'
import { cn, formatCompact } from '@/lib/utils'

interface ProfessionalCandlestickChartProps {
  data: OHLCV[]
  height?: number
  showVolume?: boolean
  showGrid?: boolean
  showBrush?: boolean
  showMA?: boolean
  maPeriods?: number[]
  className?: string
  onCandleClick?: (candle: OHLCV) => void
}

interface CandleData extends OHLCV {
  color: string
  wickHigh: [number, number]
  wickLow: [number, number]
  body: [number, number]
  formattedTime: string
  formattedDate: string
  ma20?: number
  ma50?: number
  isSelected?: boolean
}

// Calculate Simple Moving Average
function calculateSMA(data: OHLCV[], period: number): number[] {
  const sma: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN)
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0)
      sma.push(sum / period)
    }
  }
  return sma
}

// Custom Tooltip Component
interface CandleTooltipProps {
  active?: boolean
  payload?: Array<{ payload: CandleData }>
  formatPrice: (price: number) => string
}

function ProfessionalTooltip({ active, payload, formatPrice }: CandleTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const candle = payload[0].payload
  const isBullish = candle.close >= candle.open
  const priceChange = candle.close - candle.open
  const priceChangePercent = (priceChange / candle.open) * 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/98 border border-gray-700 rounded-xl p-4 shadow-2xl backdrop-blur-md min-w-[200px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
        <div className="text-xs text-gray-400">
          {format(new Date(candle.timestamp), 'MMM d, yyyy HH:mm')}
        </div>
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
          isBullish ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        )}>
          {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
        </div>
      </div>

      {/* OHLC Data */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Open</span>
          <span className="text-sm number-mono font-medium">{formatPrice(candle.open)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">High</span>
          <span className="text-sm number-mono font-medium text-green-400">{formatPrice(candle.high)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Low</span>
          <span className="text-sm number-mono font-medium text-red-400">{formatPrice(candle.low)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Close</span>
          <span className={cn(
            'text-sm number-mono font-bold',
            isBullish ? 'text-green-400' : 'text-red-400'
          )}>
            {formatPrice(candle.close)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="mt-3 pt-2 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Volume</span>
          <span className="text-sm number-mono text-indigo-400">{formatCompact(candle.volume)}</span>
        </div>
      </div>

      {/* Moving Averages */}
      {(candle.ma20 || candle.ma50) && (
        <div className="mt-2 pt-2 border-t border-gray-800 space-y-1">
          {candle.ma20 && !isNaN(candle.ma20) && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-500">MA(20)</span>
              <span className="text-xs number-mono">{formatPrice(candle.ma20)}</span>
            </div>
          )}
          {candle.ma50 && !isNaN(candle.ma50) && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-400">MA(50)</span>
              <span className="text-xs number-mono">{formatPrice(candle.ma50)}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export function ProfessionalCandlestickChart({
  data,
  height = 400,
  showVolume = true,
  showGrid = true,
  showBrush = false,
  showMA = true,
  maPeriods = [20, 50],
  className,
  onCandleClick: _onCandleClick,
}: ProfessionalCandlestickChartProps) {
  // _onCandleClick is available for future use
  void _onCandleClick
  const { formatPrice } = useCurrency()
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedCandle, setSelectedCandle] = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Calculate moving averages
  const ma20 = useMemo(() => showMA && maPeriods.includes(20) ? calculateSMA(data, 20) : [], [data, showMA, maPeriods])
  const ma50 = useMemo(() => showMA && maPeriods.includes(50) ? calculateSMA(data, 50) : [], [data, showMA, maPeriods])

  const chartData = useMemo(() => {
    return data.map((candle, index) => {
      const isBullish = candle.close >= candle.open
      const color = isBullish ? '#10b981' : '#ef4444' // emerald-500 and red-500

      return {
        ...candle,
        color,
        wickHigh: [Math.max(candle.open, candle.close), candle.high] as [number, number],
        wickLow: [candle.low, Math.min(candle.open, candle.close)] as [number, number],
        body: [candle.open, candle.close] as [number, number],
        formattedTime: format(new Date(candle.timestamp), 'HH:mm'),
        formattedDate: format(new Date(candle.timestamp), 'MMM d'),
        ma20: ma20[index],
        ma50: ma50[index],
        isSelected: selectedCandle === index,
      }
    })
  }, [data, ma20, ma50, selectedCandle])

  const { minPrice, maxPrice, avgPrice } = useMemo(() => {
    if (data.length === 0) return { minPrice: 0, maxPrice: 0, avgPrice: 0 }
    const lows = data.map((d) => d.low)
    const highs = data.map((d) => d.high)
    const min = Math.min(...lows)
    const max = Math.max(...highs)
    const range = max - min
    const padding = range * 0.08

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

  // Price statistics
  const stats = useMemo(() => {
    if (data.length === 0) return null
    const firstPrice = data[0].open
    const lastPrice = data[data.length - 1].close
    const change = lastPrice - firstPrice
    const changePercent = (change / firstPrice) * 100
    const highestPrice = Math.max(...data.map(d => d.high))
    const lowestPrice = Math.min(...data.map(d => d.low))

    return { firstPrice, lastPrice, change, changePercent, highestPrice, lowestPrice }
  }, [data])

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5))
  }, [])

  const handleReset = useCallback(() => {
    setZoomLevel(1)
    setSelectedCandle(null)
  }, [])

  const renderTooltip = useCallback((props: Omit<CandleTooltipProps, 'formatPrice'>) => {
    return <ProfessionalTooltip {...props} formatPrice={formatPrice} />
  }, [formatPrice])

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-900/50 rounded-xl', className)} style={{ height }}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-gray-500">No chart data available</p>
          <p className="text-xs text-gray-600 mt-1">Data will appear when available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} ref={chartRef}>
      {/* Chart Controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Price Stats */}
      {stats && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-800/80">
            <span className="text-gray-500">H:</span>
            <span className="text-green-400 number-mono">{formatPrice(stats.highestPrice)}</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-800/80">
            <span className="text-gray-500">L:</span>
            <span className="text-red-400 number-mono">{formatPrice(stats.lowestPrice)}</span>
          </div>
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg',
            stats.change >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          )}>
            {stats.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="number-mono font-medium">
              {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 40, right: 60, bottom: showBrush ? 40 : 10, left: 10 }}
        >
          {/* Grid */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f2937"
              vertical={false}
            />
          )}

          {/* Reference line at average price */}
          <ReferenceLine
            y={avgPrice}
            stroke="#4b5563"
            strokeDasharray="4 4"
            strokeWidth={1}
          />

          {/* X Axis */}
          <XAxis
            dataKey="formattedTime"
            axisLine={{ stroke: '#374151' }}
            tickLine={{ stroke: '#374151' }}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            interval="preserveStartEnd"
            minTickGap={50}
          />

          {/* Y Axis - Price */}
          <YAxis
            domain={[minPrice, maxPrice]}
            orientation="right"
            axisLine={{ stroke: '#374151' }}
            tickLine={{ stroke: '#374151' }}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickFormatter={(value) => formatPrice(value)}
            width={70}
          />

          {/* Y Axis - Volume */}
          {showVolume && (
            <YAxis
              yAxisId="volume"
              domain={[0, maxVolume * 5]}
              orientation="left"
              hide
            />
          )}

          {/* Tooltip */}
          <Tooltip
            content={renderTooltip as never}
            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
            wrapperStyle={{ zIndex: 100 }}
          />

          {/* Volume bars */}
          {showVolume && (
            <Bar
              yAxisId="volume"
              dataKey="volume"
              opacity={0.25}
              radius={[2, 2, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`volume-${index}`} fill={entry.color} />
              ))}
            </Bar>
          )}

          {/* Moving Average Lines */}
          {showMA && maPeriods.includes(20) && (
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="#eab308"
              strokeWidth={1.5}
              dot={false}
              connectNulls
              opacity={0.8}
            />
          )}
          {showMA && maPeriods.includes(50) && (
            <Line
              type="monotone"
              dataKey="ma50"
              stroke="#a855f7"
              strokeWidth={1.5}
              dot={false}
              connectNulls
              opacity={0.8}
            />
          )}

          {/* Candle wicks (high) */}
          <Bar dataKey="wickHigh" barSize={1}>
            {chartData.map((entry, index) => (
              <Cell key={`wick-high-${index}`} fill={entry.color} />
            ))}
          </Bar>

          {/* Candle bodies */}
          <Bar dataKey="body" barSize={Math.max(4, 10 * zoomLevel)} radius={[1, 1, 1, 1]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`body-${index}`}
                fill={entry.color}
                stroke={entry.isSelected ? '#fff' : 'none'}
                strokeWidth={entry.isSelected ? 2 : 0}
              />
            ))}
          </Bar>

          {/* Candle wicks (low) */}
          <Bar dataKey="wickLow" barSize={1}>
            {chartData.map((entry, index) => (
              <Cell key={`wick-low-${index}`} fill={entry.color} />
            ))}
          </Bar>

          {/* Brush for zooming */}
          {showBrush && (
            <Brush
              dataKey="formattedTime"
              height={25}
              stroke="#4b5563"
              fill="#1f2937"
              travellerWidth={10}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* MA Legend */}
      {showMA && (
        <div className="absolute bottom-2 left-2 flex items-center gap-3 text-xs">
          {maPeriods.includes(20) && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-yellow-500 rounded" />
              <span className="text-gray-400">MA(20)</span>
            </div>
          )}
          {maPeriods.includes(50) && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-purple-500 rounded" />
              <span className="text-gray-400">MA(50)</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
