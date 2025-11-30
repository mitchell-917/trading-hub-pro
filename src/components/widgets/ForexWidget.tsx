// ============================================
// TradingHub Pro - Forex Widget Component
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  RefreshCw,
  ArrowRight,
  DollarSign,
  Euro,
  PoundSterling,
  Coins,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'
import { useMajorForexPairs, useForexMarketMovers } from '../../hooks/useForexData'
import { cn } from '../../lib/utils'

// ============================================
// Currency Icon Helper
// ============================================
const getCurrencyIcon = (currency: string) => {
  const icons: Record<string, React.ReactNode> = {
    USD: <DollarSign className="w-4 h-4" />,
    EUR: <Euro className="w-4 h-4" />,
    GBP: <PoundSterling className="w-4 h-4" />,
  }
  return icons[currency] || <Coins className="w-4 h-4" />
}

// ============================================
// Forex Pair Card
// ============================================
interface ForexPairCardProps {
  pair: string
  rate: number
  change: number
  changePercent: number
  bid?: number
  ask?: number
}

function ForexPairCard({ pair, rate, change, changePercent, bid, ask }: ForexPairCardProps) {
  const isPositive = change >= 0
  const [base, quote] = pair.split('/')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-lg border transition-all duration-200',
        'bg-slate-800/50 border-slate-700/50',
        'hover:bg-slate-800/80 hover:border-slate-600'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getCurrencyIcon(base)}
          <span className="font-bold text-white">{pair}</span>
        </div>
        <Badge 
          variant={isPositive ? 'success' : 'destructive'}
          className="text-xs"
        >
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">
            {rate.toFixed(4)}
          </span>
          <div className={cn(
            'flex items-center gap-1 text-sm',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{isPositive ? '+' : ''}{change.toFixed(4)}</span>
          </div>
        </div>

        {bid && ask && (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bid: {bid.toFixed(4)}</span>
            <span>Ask: {ask.toFixed(4)}</span>
            <span>Spread: {((ask - bid) * 10000).toFixed(1)} pips</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// Currency Converter Mini
// ============================================
function CurrencyConverterMini() {
  const [amount, setAmount] = useState<number>(100)
  const [fromCurrency] = useState('USD')
  const [toCurrency] = useState('EUR')
  const rate = 0.9234 // Mock rate

  const converted = useMemo(() => amount * rate, [amount, rate])

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-blue-400" />
        <h4 className="font-semibold text-white">Quick Convert</h4>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-center text-xs text-slate-400 mt-1">{fromCurrency}</div>
        </div>

        <ArrowRight className="w-5 h-5 text-slate-500" />

        <div className="flex-1">
          <div className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-center font-bold">
            {converted.toFixed(2)}
          </div>
          <div className="text-center text-xs text-slate-400 mt-1">{toCurrency}</div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 mt-2">
        1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
      </div>
    </Card>
  )
}

// ============================================
// Market Movers Section
// ============================================
function MarketMovers() {
  const { data, isLoading } = useForexMarketMovers()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 bg-slate-700/50 rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h5 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Top Gainers
        </h5>
        <div className="space-y-1">
          {data?.gainers.slice(0, 3).map((pair, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{pair.from}/{pair.to}</span>
              <span className="text-emerald-400">+{pair.changePercent.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h5 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Top Losers
        </h5>
        <div className="space-y-1">
          {data?.losers.slice(0, 3).map((pair, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{pair.from}/{pair.to}</span>
              <span className="text-red-400">{pair.changePercent.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Forex Widget Component
// ============================================
interface ForexWidgetProps {
  compact?: boolean
  className?: string
}

export function ForexWidget({ compact = false, className }: ForexWidgetProps) {
  const { data: majorPairs, isLoading, refetch, isFetching } = useMajorForexPairs()
  const [showConverter, setShowConverter] = useState(false)

  if (compact) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Forex</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-slate-700/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {majorPairs?.slice(0, 4).map((pair, i) => (
              <div 
                key={i}
                className="flex items-center justify-between text-sm p-2 rounded bg-slate-800/30"
              >
                <span className="font-medium text-white">{pair.from}/{pair.to}</span>
                <span className="text-slate-300">{pair.rate.toFixed(4)}</span>
                <span className={cn(
                  'text-xs',
                  pair.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {pair.changePercent >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Forex Markets</h3>
            <p className="text-sm text-slate-400">Major currency pairs</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showConverter ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowConverter(!showConverter)}
          >
            Convert
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Currency Converter */}
      <AnimatePresence>
        {showConverter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <CurrencyConverterMini />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forex Pairs Grid */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i}
                  className="h-32 bg-slate-700/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {majorPairs?.map((pair, i) => (
                <ForexPairCard
                  key={i}
                  pair={`${pair.from}/${pair.to}`}
                  rate={pair.rate}
                  change={pair.change}
                  changePercent={pair.changePercent}
                  bid={pair.bid}
                  ask={pair.ask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Market Movers Sidebar */}
        <div className="space-y-4">
          <Card className="p-4 bg-slate-800/30">
            <h4 className="font-semibold text-white mb-4">Market Movers</h4>
            <MarketMovers />
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <span>Real-time forex data • Updated every 30 seconds</span>
        <span>Rates provided by major forex data providers</span>
      </div>
    </Card>
  )
}

export default ForexWidget
