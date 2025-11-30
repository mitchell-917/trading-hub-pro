// ============================================
// TradingHub Pro - Order Book Depth Chart
// Visualizes buy/sell order book depth
// ============================================

import { useMemo, useCallback } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { OrderBookLevel } from '@/types'
import { cn, formatNumber } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'

interface DepthChartProps {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  height?: number
  midPrice?: number
  className?: string
}

interface DepthDataPoint {
  price: number
  bidDepth: number
  askDepth: number
  cumulativeBids: number
  cumulativeAsks: number
}

// Custom Tooltip Component - defined outside to avoid creating during render
interface DepthTooltipProps {
  active?: boolean
  payload?: Array<{ payload: DepthDataPoint }>
  formatPrice: (value: number, decimals?: number) => string
}

function DepthChartTooltip({ active, payload, formatPrice }: DepthTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const point = payload[0].payload
  const isBid = point.cumulativeBids > 0

  return (
    <div className="bg-gray-900/95 border border-gray-700 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <div className="text-xs text-gray-400 mb-1">
        Price: {formatPrice(point.price)}
      </div>
      {isBid ? (
        <div className="text-green-400 text-sm font-medium">
          Cumulative Bids: {formatNumber(point.cumulativeBids, 2)}
        </div>
      ) : (
        <div className="text-red-400 text-sm font-medium">
          Cumulative Asks: {formatNumber(point.cumulativeAsks, 2)}
        </div>
      )}
    </div>
  )
}

export function DepthChart({
  bids,
  asks,
  height = 200,
  midPrice,
  className,
}: DepthChartProps) {
  const { formatPrice } = useCurrency()

  const chartData = useMemo(() => {
    // Sort bids (descending) and asks (ascending)
    const sortedBids = [...bids].sort((a, b) => b.price - a.price)
    const sortedAsks = [...asks].sort((a, b) => a.price - b.price)

    // Calculate cumulative depth for bids (from highest to lowest)
    // Use reduce to avoid reassigning variable after render
    const bidPoints: DepthDataPoint[] = sortedBids.reduce<{ points: DepthDataPoint[], cumulative: number }>(
      (acc, level) => {
        const newCumulative = acc.cumulative + level.total
        acc.points.push({
          price: level.price,
          bidDepth: level.total,
          askDepth: 0,
          cumulativeBids: newCumulative,
          cumulativeAsks: 0,
        })
        acc.cumulative = newCumulative
        return acc
      },
      { points: [], cumulative: 0 }
    ).points.reverse()

    // Calculate cumulative depth for asks (from lowest to highest)
    // Use reduce to avoid reassigning variable after render
    const askPoints: DepthDataPoint[] = sortedAsks.reduce<{ points: DepthDataPoint[], cumulative: number }>(
      (acc, level) => {
        const newCumulative = acc.cumulative + level.total
        acc.points.push({
          price: level.price,
          bidDepth: 0,
          askDepth: level.total,
          cumulativeBids: 0,
          cumulativeAsks: newCumulative,
        })
        acc.cumulative = newCumulative
        return acc
      },
      { points: [], cumulative: 0 }
    ).points

    return [...bidPoints, ...askPoints]
  }, [bids, asks])

  const calculatedMidPrice = useMemo(() => {
    if (midPrice) return midPrice
    if (bids.length > 0 && asks.length > 0) {
      const highestBid = Math.max(...bids.map((b) => b.price))
      const lowestAsk = Math.min(...asks.map((a) => a.price))
      return (highestBid + lowestAsk) / 2
    }
    return 0
  }, [bids, asks, midPrice])

  const stats = useMemo(() => {
    const totalBidVolume = bids.reduce((sum, b) => sum + b.total, 0)
    const totalAskVolume = asks.reduce((sum, a) => sum + a.total, 0)
    const imbalance =
      totalBidVolume + totalAskVolume > 0
        ? ((totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume)) * 100
        : 0

    return {
      totalBidVolume,
      totalAskVolume,
      imbalance,
      bidPressure: totalBidVolume > totalAskVolume,
    }
  }, [bids, asks])

  // Memoized tooltip renderer
  const renderTooltip = useCallback((props: Omit<DepthTooltipProps, 'formatPrice'>) => {
    return <DepthChartTooltip {...props} formatPrice={formatPrice} />
  }, [formatPrice])

  if (chartData.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-gray-500 text-sm">No depth data</p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Stats header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-400">Bids:</span>
            <span className="text-green-400 number-mono">
              {formatNumber(stats.totalBidVolume, 2)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-400">Asks:</span>
            <span className="text-red-400 number-mono">
              {formatNumber(stats.totalAskVolume, 2)}
            </span>
          </div>
        </div>
        <div
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded',
            stats.bidPressure
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          )}
        >
          {stats.bidPressure ? '↑' : '↓'} {Math.abs(stats.imbalance).toFixed(1)}%
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, bottom: 0, left: 5 }}
        >
          <defs>
            <linearGradient id="depth-bids" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d26a" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#00d26a" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="depth-asks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4757" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#ff4757" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="price"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickFormatter={(value) => formatPrice(value, 0)}
            interval="preserveStartEnd"
          />

          <YAxis
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickFormatter={(value) => formatNumber(value, 0)}
            width={40}
          />

          <Tooltip content={renderTooltip as never} />

          {calculatedMidPrice > 0 && (
            <ReferenceLine
              x={calculatedMidPrice}
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: 'Mid',
                position: 'top',
                fill: '#6366f1',
                fontSize: 10,
              }}
            />
          )}

          <Area
            type="stepAfter"
            dataKey="cumulativeBids"
            stroke="#00d26a"
            strokeWidth={2}
            fill="url(#depth-bids)"
            animationDuration={500}
          />

          <Area
            type="stepAfter"
            dataKey="cumulativeAsks"
            stroke="#ff4757"
            strokeWidth={2}
            fill="url(#depth-asks)"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
