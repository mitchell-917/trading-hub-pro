// ============================================
// TradingHub Pro - Market Overview Widget
// Real-time market indices and highlights
// ============================================

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Globe,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Sparkline } from '@/components/charts/Sparkline'
import { useCurrency } from '@/context/CurrencyContext'
import { cn } from '@/lib/utils'

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparklineData?: number[]
}

interface MarketOverviewProps {
  indices?: MarketIndex[]
  isConnected?: boolean
  marketSession?: 'pre-market' | 'regular' | 'after-hours' | 'closed'
  className?: string
}

// Default mock indices for demo
const DEFAULT_INDICES: MarketIndex[] = [
  {
    symbol: 'SPY',
    name: 'S&P 500',
    price: 4892.35,
    change: 28.45,
    changePercent: 0.58,
    sparklineData: [4850, 4860, 4855, 4870, 4868, 4875, 4880, 4878, 4885, 4890, 4892],
  },
  {
    symbol: 'QQQ',
    name: 'Nasdaq 100',
    price: 17823.50,
    change: 156.20,
    changePercent: 0.88,
    sparklineData: [17600, 17650, 17680, 17720, 17690, 17750, 17780, 17800, 17790, 17810, 17823],
  },
  {
    symbol: 'DIA',
    name: 'Dow Jones',
    price: 38654.20,
    change: -45.30,
    changePercent: -0.12,
    sparklineData: [38700, 38680, 38690, 38670, 38660, 38650, 38655, 38640, 38645, 38650, 38654],
  },
  {
    symbol: 'BTCUSD',
    name: 'Bitcoin',
    price: 67245.80,
    change: 1234.50,
    changePercent: 1.87,
    sparklineData: [66000, 66200, 66400, 66800, 66600, 66900, 67000, 67100, 67050, 67200, 67245],
  },
]

const sessionConfig = {
  'pre-market': { label: 'Pre-Market', color: 'text-amber-400', icon: Sun },
  regular: { label: 'Market Open', color: 'text-green-400', icon: Activity },
  'after-hours': { label: 'After Hours', color: 'text-purple-400', icon: Moon },
  closed: { label: 'Market Closed', color: 'text-gray-400', icon: Clock },
}

export function MarketOverview({
  indices = DEFAULT_INDICES,
  isConnected = true,
  marketSession = 'regular',
  className,
}: MarketOverviewProps) {
  const { formatPrice, currency } = useCurrency()
  const session = sessionConfig[marketSession]
  const SessionIcon = session.icon

  const overallSentiment = useMemo(() => {
    const gainers = indices.filter(i => i.changePercent > 0).length
    const total = indices.length
    return gainers / total > 0.5 ? 'bullish' : gainers / total < 0.5 ? 'bearish' : 'neutral'
  }, [indices])

  return (
    <Card className={cn('p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold">Market Overview</h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Market Session Badge */}
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
            marketSession === 'regular' ? 'bg-green-500/20' : 'bg-gray-800'
          )}>
            <SessionIcon className={cn('w-3 h-3', session.color)} />
            <span className={session.color}>{session.label}</span>
          </div>

          {/* Connection Status */}
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}>
            {isConnected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Currency Display */}
      <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
        <span>Displaying in:</span>
        <Badge color="blue" size="sm">
          {currency.symbol} {currency.code}
        </Badge>
      </div>

      {/* Market Sentiment */}
      <div className={cn(
        'p-3 rounded-lg mb-4 flex items-center justify-between',
        overallSentiment === 'bullish' ? 'bg-green-500/10' :
        overallSentiment === 'bearish' ? 'bg-red-500/10' :
        'bg-gray-800/50'
      )}>
        <div className="flex items-center gap-2">
          {overallSentiment === 'bullish' ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : overallSentiment === 'bearish' ? (
            <TrendingDown className="w-5 h-5 text-red-400" />
          ) : (
            <Activity className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <p className={cn(
              'font-medium',
              overallSentiment === 'bullish' ? 'text-green-400' :
              overallSentiment === 'bearish' ? 'text-red-400' :
              'text-gray-300'
            )}>
              Market {overallSentiment.charAt(0).toUpperCase() + overallSentiment.slice(1)}
            </p>
            <p className="text-xs text-gray-400">Based on major indices</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">
          <span className="text-green-400">{indices.filter(i => i.changePercent > 0).length}</span>
          {' / '}
          <span className="text-red-400">{indices.filter(i => i.changePercent < 0).length}</span>
          {' / '}
          <span className="text-gray-400">{indices.filter(i => i.changePercent === 0).length}</span>
        </div>
      </div>

      {/* Indices Grid */}
      <div className="space-y-2">
        {indices.map((index, i) => {
          const isPositive = index.changePercent >= 0
          
          return (
            <motion.div
              key={index.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                    isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  )}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium">{index.name}</p>
                    <p className="text-xs text-gray-400">{index.symbol}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sparkline */}
                  {index.sparklineData && (
                    <div className="w-16 hidden sm:block">
                      <Sparkline 
                        data={index.sparklineData} 
                        height={24}
                        color={isPositive ? 'green' : 'red'}
                      />
                    </div>
                  )}

                  {/* Price & Change */}
                  <div className="text-right min-w-[100px]">
                    <p className="font-mono font-medium">
                      {formatPrice(index.price)}
                    </p>
                    <p className={cn(
                      'text-xs font-mono',
                      isPositive ? 'text-green-400' : 'text-red-400'
                    )}>
                      {isPositive ? '+' : ''}{formatPrice(index.change)} ({isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span>Last updated: Just now</span>
        <span>Data delayed by 15 min</span>
      </div>
    </Card>
  )
}

export default MarketOverview
