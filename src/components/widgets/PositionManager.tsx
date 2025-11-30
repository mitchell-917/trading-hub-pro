// ============================================
// TradingHub Pro - Position Manager Widget
// View and manage open positions
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  X, 
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Target,
  ShieldAlert,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Tooltip } from '@/components/ui/Tooltip'
import { Sparkline } from '@/components/charts/Sparkline'
import { useTradingStore } from '@/lib/store'
import { formatNumber, formatPercentage, cn } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'
import type { Position } from '@/types'

interface PositionManagerProps {
  maxVisiblePositions?: number
  className?: string
}

export function PositionManager({
  maxVisiblePositions = 5,
  className,
}: PositionManagerProps) {
  const positions = useTradingStore((s) => s.positions)
  const closePosition = useTradingStore((s) => s.closePosition)
  const { formatPrice } = useCurrency()
  
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [closingPosition, setClosingPosition] = useState<Position | null>(null)
  const [showAll, setShowAll] = useState(false)

  // Calculate total P&L
  const totalPnL = useMemo(() => {
    return positions.reduce((sum, p) => sum + p.unrealizedPnL, 0)
  }, [positions])

  const totalValue = useMemo(() => {
    return positions.reduce((sum, p) => sum + (p.quantity * p.currentPrice), 0)
  }, [positions])

  const displayPositions = showAll 
    ? positions 
    : positions.slice(0, maxVisiblePositions)

  const handleClosePosition = () => {
    if (closingPosition) {
      closePosition(closingPosition.id)
      setClosingPosition(null)
    }
  }

  if (positions.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <h3 className="text-lg font-semibold mb-4">Positions</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
            <Target className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm">No open positions</p>
          <p className="text-gray-500 text-xs mt-1">
            Place an order to open a position
          </p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className={cn('p-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Positions</h3>
            <p className="text-xs text-gray-400">
              {positions.length} open position{positions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total P&L</p>
            <p className={cn(
              'text-lg font-semibold number-mono',
              totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {totalPnL >= 0 ? '+' : ''}{formatPrice(totalPnL)}
            </p>
          </div>
        </div>

        {/* Position List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {displayPositions.map((position) => (
              <PositionRow
                key={position.id}
                position={position}
                isExpanded={expandedId === position.id}
                onToggle={() => setExpandedId(
                  expandedId === position.id ? null : position.id
                )}
                onClose={() => setClosingPosition(position)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Show More Button */}
        {positions.length > maxVisiblePositions && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show {positions.length - maxVisiblePositions} More <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {/* Total Value Footer */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Position Value</span>
            <span className="font-medium number-mono">
              {formatPrice(totalValue)}
            </span>
          </div>
        </div>
      </Card>

      {/* Close Position Confirmation Modal */}
      <Modal
        isOpen={!!closingPosition}
        onClose={() => setClosingPosition(null)}
        title="Close Position"
      >
        {closingPosition && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    color={closingPosition.side === 'long' ? 'green' : 'red'}
                    size="sm"
                  >
                    {closingPosition.side.toUpperCase()}
                  </Badge>
                  <span className="font-semibold">{closingPosition.symbol}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {formatNumber(closingPosition.quantity, 4)} units
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Entry Price</p>
                  <p className="number-mono">{formatPrice(closingPosition.entryPrice)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Price</p>
                  <p className="number-mono">{formatPrice(closingPosition.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Unrealized P&L</p>
                  <p className={cn(
                    'number-mono font-medium',
                    closingPosition.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {closingPosition.unrealizedPnL >= 0 ? '+' : ''}
                    {formatPrice(closingPosition.unrealizedPnL)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Return</p>
                  <p className={cn(
                    'number-mono font-medium',
                    closingPosition.unrealizedPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {formatPercentage(closingPosition.unrealizedPnLPercent)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setClosingPosition(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleClosePosition}
              >
                Close Position
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

// ============================================
// Position Row Component
// ============================================

interface PositionRowProps {
  position: Position
  isExpanded: boolean
  onToggle: () => void
  onClose: () => void
}

function PositionRow({ position, isExpanded, onToggle, onClose }: PositionRowProps) {
  const { formatPrice } = useCurrency()
  const isProfit = position.unrealizedPnL >= 0
  const isLong = position.side === 'long'

  // Generate mock sparkline data for the position - seeded based on position id
  const sparklineData = useMemo(() => {
    const data: number[] = []
    let price = position.entryPrice
    // Use position id hash as seed for deterministic random values
    const seed = position.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    for (let i = 0; i < 20; i++) {
      // Deterministic pseudo-random based on seed and index
      const pseudoRandom = Math.sin(seed * (i + 1)) * 0.5 + 0.5
      price += (pseudoRandom - 0.5) * price * 0.01
      data.push(price)
    }
    data.push(position.currentPrice)
    return data
  }, [position.entryPrice, position.currentPrice, position.id])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gray-800/50 rounded-lg overflow-hidden"
    >
      {/* Main Row */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            isLong ? 'bg-green-500/20' : 'bg-red-500/20'
          )}>
            {isLong ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>

          <div className="text-left">
            <p className="font-medium flex items-center gap-2">
              {position.symbol}
              <Badge color={isLong ? 'green' : 'red'} size="sm">
                {isLong ? 'LONG' : 'SHORT'}
              </Badge>
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(position.quantity, 4)} @ {formatPrice(position.entryPrice)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16">
            <Sparkline data={sparklineData} height={24} />
          </div>

          <div className="text-right">
            <p className={cn(
              'font-medium number-mono',
              isProfit ? 'text-green-400' : 'text-red-400'
            )}>
              {isProfit ? '+' : ''}{formatPrice(position.unrealizedPnL)}
            </p>
            <p className={cn(
              'text-xs number-mono',
              isProfit ? 'text-green-400/70' : 'text-red-400/70'
            )}>
              {formatPercentage(position.unrealizedPnLPercent)}
            </p>
          </div>

          <ChevronDown className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-gray-700/50">
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <p className="text-gray-400 text-xs">Current Price</p>
                  <p className="number-mono">{formatPrice(position.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Position Value</p>
                  <p className="number-mono">
                    {formatPrice(position.quantity * position.currentPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Leverage</p>
                  <p className="number-mono">{position.leverage}x</p>
                </div>
              </div>

              {/* Stop Loss / Take Profit indicators */}
              <div className="flex items-center gap-2 mb-3">
                {position.stopLoss && (
                  <Tooltip content={`Stop Loss: ${formatPrice(position.stopLoss)}`}>
                    <div className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded">
                      <ShieldAlert className="w-3 h-3" />
                      SL: {formatPrice(position.stopLoss)}
                    </div>
                  </Tooltip>
                )}
                {position.takeProfit && (
                  <Tooltip content={`Take Profit: ${formatPrice(position.takeProfit)}`}>
                    <div className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">
                      <Target className="w-3 h-3" />
                      TP: {formatPrice(position.takeProfit)}
                    </div>
                  </Tooltip>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  leftIcon={<MoreHorizontal className="w-4 h-4" />}
                >
                  Modify
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
