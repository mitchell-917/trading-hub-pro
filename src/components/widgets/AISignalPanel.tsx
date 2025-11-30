// ============================================
// TradingHub Pro - AI Signal Panel Widget
// Display AI-generated trading signals
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Clock,
  Zap,
  BarChart2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { useAISignals } from '@/hooks/useAISignals'
import { formatCurrency, formatPercentage, cn } from '@/lib/utils'
import type { TradeSignal } from '@/types'

interface AISignalPanelProps {
  symbol?: string
  onSignalSelect?: (signal: TradeSignal) => void
  className?: string
}

export function AISignalPanel({
  symbol = 'BTCUSD',
  onSignalSelect,
  className,
}: AISignalPanelProps) {
  const { signals, isLoading, marketSentiment, confidenceLevel } = useAISignals(symbol)
  const [selectedSignal, setSelectedSignal] = useState<TradeSignal | null>(null)

  // Get the primary signal (highest confidence)
  const primarySignal = useMemo(() => {
    if (signals.length === 0) return null
    return [...signals].sort((a, b) => b.confidence - a.confidence)[0]
  }, [signals])

  const handleSignalClick = (signal: TradeSignal) => {
    setSelectedSignal(selectedSignal?.id === signal.id ? null : signal)
    onSignalSelect?.(signal)
  }

  const sentimentConfig = {
    bullish: { color: 'text-green-400', bg: 'bg-green-500/20', icon: TrendingUp },
    bearish: { color: 'text-red-400', bg: 'bg-red-500/20', icon: TrendingDown },
    neutral: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: BarChart2 },
  }

  const sentiment = sentimentConfig[marketSentiment]

  return (
    <Card className={cn('p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="w-5 h-5 text-indigo-400" />
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Signals</h3>
            <p className="text-xs text-gray-400">{symbol}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="AI Confidence Level">
            <div className={cn(
              'px-2 py-1 rounded text-xs font-medium flex items-center gap-1',
              confidenceLevel >= 70 ? 'bg-green-500/20 text-green-400' :
              confidenceLevel >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            )}>
              <Zap className="w-3 h-3" />
              {confidenceLevel}%
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Market Sentiment */}
      <div className={cn(
        'p-3 rounded-lg mb-4 flex items-center justify-between',
        sentiment.bg
      )}>
        <div className="flex items-center gap-2">
          <sentiment.icon className={cn('w-5 h-5', sentiment.color)} />
          <div>
            <p className={cn('font-medium', sentiment.color)}>
              {marketSentiment.charAt(0).toUpperCase() + marketSentiment.slice(1)} Market
            </p>
            <p className="text-xs text-gray-400">Current market sentiment</p>
          </div>
        </div>
        <Sparkles className={cn('w-5 h-5', sentiment.color)} />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Brain className="w-8 h-8 text-indigo-400" />
          </motion.div>
        </div>
      )}

      {/* Primary Signal */}
      {primarySignal && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-4 rounded-lg mb-4 border-2',
            primarySignal.direction === 'long' 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge 
                color={primarySignal.direction === 'long' ? 'green' : 'red'}
                className="flex items-center gap-1"
              >
                {primarySignal.direction === 'long' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {primarySignal.direction.toUpperCase()}
              </Badge>
              <Badge color="purple" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Primary Signal
              </Badge>
            </div>
            <span className="text-xs text-gray-400">
              {Math.round(primarySignal.confidence)}% confidence
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Entry</p>
              <p className="font-medium number-mono text-sm">
                {formatCurrency(primarySignal.entryPrice)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                <Target className="w-3 h-3 text-green-400" />
                Target
              </p>
              <p className="font-medium number-mono text-sm text-green-400">
                {formatCurrency(primarySignal.targetPrice)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                Stop
              </p>
              <p className="font-medium number-mono text-sm text-red-400">
                {formatCurrency(primarySignal.stopLoss)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(primarySignal.timestamp), { addSuffix: true })}
            </span>
            <span className="text-indigo-400">
              R:R {primarySignal.riskRewardRatio?.toFixed(1) || 'N/A'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Signal List */}
      {signals.length > 0 && !isLoading && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400 mb-2">All Signals</h4>
          <AnimatePresence>
            {signals.map((signal, index) => (
              <SignalRow
                key={signal.id}
                signal={signal}
                index={index}
                isSelected={selectedSignal?.id === signal.id}
                onClick={() => handleSignalClick(signal)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* No Signals */}
      {signals.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Brain className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No signals available</p>
          <p className="text-gray-500 text-xs mt-1">
            AI is analyzing market conditions
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 p-2 bg-yellow-500/10 rounded-lg flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-400/80">
          AI signals are for informational purposes only. 
          Always conduct your own research before trading.
        </p>
      </div>
    </Card>
  )
}

// ============================================
// Signal Row Component
// ============================================

interface SignalRowProps {
  signal: TradeSignal
  index: number
  isSelected: boolean
  onClick: () => void
}

function SignalRow({ signal, index, isSelected, onClick }: SignalRowProps) {
  const isLong = signal.direction === 'long'
  const potentialGain = ((signal.targetPrice - signal.entryPrice) / signal.entryPrice) * 100
  const potentialLoss = ((signal.stopLoss - signal.entryPrice) / signal.entryPrice) * 100

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={onClick}
        className={cn(
          'w-full p-3 rounded-lg transition-all text-left',
          isSelected
            ? 'bg-indigo-500/20 ring-1 ring-indigo-500/50'
            : 'bg-gray-800/30 hover:bg-gray-800/50'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-6 h-6 rounded flex items-center justify-center',
              isLong ? 'bg-green-500/20' : 'bg-red-500/20'
            )}>
              {isLong ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              )}
            </div>
            <span className="font-medium text-sm">{signal.symbol}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              signal.confidence >= 70 ? 'bg-green-500/20 text-green-400' :
              signal.confidence >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            )}>
              {Math.round(signal.confidence)}%
            </div>
            <ChevronRight className={cn(
              'w-4 h-4 text-gray-400 transition-transform',
              isSelected && 'rotate-90'
            )} />
          </div>
        </div>

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 border-t border-gray-700/50 mt-2 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Entry</p>
                    <p className="number-mono">{formatCurrency(signal.entryPrice)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Target</p>
                    <p className="number-mono text-green-400">
                      {formatCurrency(signal.targetPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Stop</p>
                    <p className="number-mono text-red-400">
                      {formatCurrency(signal.stopLoss)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-400">
                    +{Math.abs(potentialGain).toFixed(1)}% potential
                  </span>
                  <span className="text-red-400">
                    {potentialLoss.toFixed(1)}% risk
                  </span>
                </div>

                {signal.reasoning && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                    {signal.reasoning}
                  </p>
                )}

                <Button
                  variant={isLong ? 'success' : 'danger'}
                  size="sm"
                  fullWidth
                  className="mt-2"
                >
                  Apply Signal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}
