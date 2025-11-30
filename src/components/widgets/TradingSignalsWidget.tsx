// ============================================
// TradingHub Pro - Trading Signals Widget
// AI-powered trading signals with confidence scores
// ============================================

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Activity,
  Target,
  Clock,
  Zap,
  BarChart2,
  DollarSign,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'

interface TradingSignal {
  id: string
  symbol: string
  name: string
  direction: 'long' | 'short' | 'neutral'
  confidence: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  riskReward: number
  timeframe: string
  strategy: string
  indicators: string[]
  timestamp: number
  expiresIn: number
  status: 'active' | 'triggered' | 'expired'
}

// Generate mock trading signals
function generateMockSignals(): TradingSignal[] {
  const symbols = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'EURUSD', name: 'EUR/USD' },
    { symbol: 'GOOGL', name: 'Alphabet' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'XAUUSD', name: 'Gold' },
  ]

  const strategies = [
    'Breakout',
    'Mean Reversion',
    'Momentum',
    'Trend Following',
    'Support/Resistance',
    'MACD Cross',
    'RSI Divergence',
    'Bollinger Squeeze',
  ]

  const indicators = [
    'RSI',
    'MACD',
    'BB',
    'EMA',
    'SMA',
    'Volume',
    'Stochastic',
    'ATR',
    'Ichimoku',
    'Fibonacci',
  ]

  const timeframes = ['1H', '4H', '1D', '1W']

  return symbols.map((sym, i) => {
    const direction = ['long', 'short', 'neutral'][Math.floor(Math.random() * 3)] as TradingSignal['direction']
    const confidence = 60 + Math.random() * 35
    const basePrice = sym.symbol.includes('BTC') ? 67000 + Math.random() * 2000 :
                      sym.symbol.includes('ETH') ? 3500 + Math.random() * 200 :
                      sym.symbol.includes('XAU') ? 2350 + Math.random() * 50 :
                      sym.symbol.includes('EUR') ? 1.08 + Math.random() * 0.02 :
                      150 + Math.random() * 100
    
    const multiplier = direction === 'long' ? 1 : -1
    const targetPercent = 2 + Math.random() * 5
    const stopPercent = 1 + Math.random() * 2

    return {
      id: `signal-${i}`,
      symbol: sym.symbol,
      name: sym.name,
      direction,
      confidence,
      entryPrice: basePrice,
      targetPrice: basePrice * (1 + (multiplier * targetPercent / 100)),
      stopLoss: basePrice * (1 - (multiplier * stopPercent / 100)),
      riskReward: targetPercent / stopPercent,
      timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      indicators: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => 
        indicators[Math.floor(Math.random() * indicators.length)]
      ).filter((v, i, a) => a.indexOf(v) === i),
      timestamp: Date.now() - Math.random() * 3600000,
      expiresIn: 15 + Math.floor(Math.random() * 240),
      status: ['active', 'active', 'active', 'triggered'][Math.floor(Math.random() * 4)] as TradingSignal['status'],
    }
  }).sort((a, b) => b.confidence - a.confidence)
}

interface SignalCardProps {
  signal: TradingSignal
  onTrade: (signal: TradingSignal) => void
  formatPrice: (value: number) => string
}

function SignalCard({ signal, onTrade, formatPrice }: SignalCardProps) {
  const isLong = signal.direction === 'long'
  const isShort = signal.direction === 'short'
  const DirectionIcon = isLong ? TrendingUp : isShort ? TrendingDown : Minus
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        'p-4 border-l-4 transition-all hover:bg-gray-800/50',
        isLong && 'border-l-emerald-500',
        isShort && 'border-l-red-500',
        signal.direction === 'neutral' && 'border-l-yellow-500'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              isLong && 'bg-emerald-500/20',
              isShort && 'bg-red-500/20',
              signal.direction === 'neutral' && 'bg-yellow-500/20'
            )}>
              <DirectionIcon className={cn(
                'w-5 h-5',
                isLong && 'text-emerald-400',
                isShort && 'text-red-400',
                signal.direction === 'neutral' && 'text-yellow-400'
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{signal.symbol}</span>
                <Badge 
                  variant={isLong ? 'success' : isShort ? 'danger' : 'warning'} 
                  size="sm"
                >
                  {signal.direction.toUpperCase()}
                </Badge>
              </div>
              <span className="text-sm text-gray-400">{signal.name}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className={cn(
                'font-bold',
                signal.confidence >= 80 ? 'text-emerald-400' :
                signal.confidence >= 60 ? 'text-yellow-400' :
                'text-gray-400'
              )}>
                {signal.confidence.toFixed(0)}%
              </span>
            </div>
            <span className="text-xs text-gray-500">confidence</span>
          </div>
        </div>

        {/* Price Levels */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
          <div className="p-2 bg-gray-800/50 rounded">
            <div className="text-gray-400 text-xs">Entry</div>
            <div className="font-mono font-medium">{formatPrice(signal.entryPrice)}</div>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded">
            <div className="text-gray-400 text-xs flex items-center gap-1">
              <Target className="w-3 h-3" /> Target
            </div>
            <div className="font-mono font-medium text-emerald-400">
              {formatPrice(signal.targetPrice)}
            </div>
          </div>
          <div className="p-2 bg-red-500/10 rounded">
            <div className="text-gray-400 text-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Stop
            </div>
            <div className="font-mono font-medium text-red-400">
              {formatPrice(signal.stopLoss)}
            </div>
          </div>
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {signal.timeframe}
            </span>
            <span className="flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> R:R {signal.riskReward.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" /> {signal.strategy}
            </span>
          </div>
          <Badge variant="outline" size="sm">
            {signal.expiresIn}m left
          </Badge>
        </div>

        {/* Indicators */}
        <div className="flex flex-wrap gap-1 mb-3">
          {signal.indicators.map((indicator) => (
            <span 
              key={indicator}
              className="px-1.5 py-0.5 text-xs bg-gray-700/50 rounded text-gray-300"
            >
              {indicator}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <Button 
          variant={isLong ? 'success' : isShort ? 'danger' : 'secondary'}
          size="sm" 
          fullWidth
          onClick={() => onTrade(signal)}
          leftIcon={<DollarSign className="w-4 h-4" />}
        >
          Trade This Signal
        </Button>
      </Card>
    </motion.div>
  )
}

type FilterType = 'all' | 'long' | 'short' | 'high-confidence'

export function TradingSignalsWidget() {
  const { formatPrice } = useCurrency()
  const [filter, setFilter] = useState<FilterType>('all')
  const [signals] = useState<TradingSignal[]>(generateMockSignals)

  const filteredSignals = useMemo(() => {
    switch (filter) {
      case 'long':
        return signals.filter(s => s.direction === 'long')
      case 'short':
        return signals.filter(s => s.direction === 'short')
      case 'high-confidence':
        return signals.filter(s => s.confidence >= 75)
      default:
        return signals
    }
  }, [signals, filter])

  const handleTrade = (signal: TradingSignal) => {
    console.log('Trade signal:', signal)
    // In a real app, this would open an order form
  }

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All Signals', count: signals.length },
    { value: 'long', label: 'Long Only', count: signals.filter(s => s.direction === 'long').length },
    { value: 'short', label: 'Short Only', count: signals.filter(s => s.direction === 'short').length },
    { value: 'high-confidence', label: '75%+ Confidence', count: signals.filter(s => s.confidence >= 75).length },
  ]

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI Trading Signals</h3>
              <p className="text-xs text-gray-400">
                {signals.length} signals generated
              </p>
            </div>
          </div>
          <Badge variant="success" dot pulse>
            Live
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f.value)}
              className="whitespace-nowrap"
            >
              {f.label} ({f.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Signals List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Activity className="w-12 h-12 mb-4 opacity-50" />
            <p>No signals match your filter</p>
          </div>
        ) : (
          filteredSignals.map(signal => (
            <SignalCard 
              key={signal.id} 
              signal={signal} 
              onTrade={handleTrade}
              formatPrice={formatPrice}
            />
          ))
        )}
      </div>
    </Card>
  )
}
