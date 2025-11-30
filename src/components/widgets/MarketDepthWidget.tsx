// ============================================
// TradingHub Pro - Market Depth Widget
// Order book visualization with depth chart
// ============================================

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2,
  Activity,
  Layers,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'

interface OrderBookLevel {
  price: number
  quantity: number
  total: number
  percent: number
}

interface MarketDepthData {
  symbol: string
  lastPrice: number
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  spread: number
  spreadPercent: number
  bidTotal: number
  askTotal: number
  imbalance: number
}

// Generate mock order book data
function generateOrderBook(basePrice: number): MarketDepthData {
  const levels = 15
  const bids: OrderBookLevel[] = []
  const asks: OrderBookLevel[] = []
  
  let bidTotal = 0
  let askTotal = 0
  
  for (let i = 0; i < levels; i++) {
    const bidPrice = basePrice * (1 - (i + 1) * 0.0005)
    const askPrice = basePrice * (1 + (i + 1) * 0.0005)
    const bidQty = Math.random() * 10 + (levels - i) * 0.5
    const askQty = Math.random() * 10 + (levels - i) * 0.5
    
    bidTotal += bidQty
    askTotal += askQty
    
    bids.push({ price: bidPrice, quantity: bidQty, total: bidTotal, percent: 0 })
    asks.push({ price: askPrice, quantity: askQty, total: askTotal, percent: 0 })
  }
  
  // Calculate percentages
  const maxTotal = Math.max(bidTotal, askTotal)
  bids.forEach(b => b.percent = (b.total / maxTotal) * 100)
  asks.forEach(a => a.percent = (a.total / maxTotal) * 100)
  
  const spread = asks[0].price - bids[0].price
  const spreadPercent = (spread / basePrice) * 100
  const imbalance = ((bidTotal - askTotal) / (bidTotal + askTotal)) * 100

  return {
    symbol: 'BTC/USDT',
    lastPrice: basePrice,
    bids,
    asks,
    spread,
    spreadPercent,
    bidTotal,
    askTotal,
    imbalance,
  }
}

type ViewMode = 'book' | 'depth'

export function MarketDepthWidget() {
  const { formatPrice } = useCurrency()
  const [viewMode, setViewMode] = useState<ViewMode>('book')
  const [precision, setPrecision] = useState(2)
  
  const data = useMemo(() => generateOrderBook(67500), [])

  const imbalanceColor = data.imbalance > 10 ? 'text-emerald-400' : 
                          data.imbalance < -10 ? 'text-red-400' : 
                          'text-gray-400'

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Market Depth</h3>
              <p className="text-xs text-gray-400">{data.symbol}</p>
            </div>
          </div>
          
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('book')}
              className={cn(
                'px-2 py-1 text-xs rounded',
                viewMode === 'book' ? 'bg-gray-700' : 'hover:bg-gray-700/50'
              )}
            >
              Book
            </button>
            <button
              onClick={() => setViewMode('depth')}
              className={cn(
                'px-2 py-1 text-xs rounded',
                viewMode === 'depth' ? 'bg-gray-700' : 'hover:bg-gray-700/50'
              )}
            >
              Depth
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-400">Spread</span>
            <div className="font-mono">
              {formatPrice(data.spread)} 
              <span className="text-gray-500 ml-1">({data.spreadPercent.toFixed(3)}%)</span>
            </div>
          </div>
          <div>
            <span className="text-gray-400">Buy/Sell Ratio</span>
            <div className="font-mono">
              {(data.bidTotal / data.askTotal).toFixed(2)}
            </div>
          </div>
          <div>
            <span className="text-gray-400">Imbalance</span>
            <div className={cn('font-mono', imbalanceColor)}>
              {data.imbalance > 0 ? '+' : ''}{data.imbalance.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Order Book View */}
      {viewMode === 'book' && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Headers */}
          <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
            <span>Price (USDT)</span>
            <span className="text-center">Amount</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (reversed to show lowest at bottom) */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col-reverse">
              {data.asks.slice().reverse().map((ask, i) => (
                <motion.div
                  key={`ask-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-gray-800/50"
                >
                  <div 
                    className="absolute inset-0 bg-red-500/10"
                    style={{ width: `${ask.percent}%`, right: 0, left: 'auto' }}
                  />
                  <span className="relative text-red-400 font-mono">
                    {ask.price.toFixed(precision)}
                  </span>
                  <span className="relative text-center font-mono">
                    {ask.quantity.toFixed(4)}
                  </span>
                  <span className="relative text-right font-mono text-gray-400">
                    {ask.total.toFixed(4)}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Spread Indicator */}
            <div className="flex items-center justify-center py-2 bg-gray-800/50 border-y border-gray-700">
              <span className="text-lg font-bold font-mono">
                {formatPrice(data.lastPrice)}
              </span>
              <Activity className="w-4 h-4 ml-2 text-gray-400" />
            </div>

            {/* Bids */}
            <div>
              {data.bids.map((bid, i) => (
                <motion.div
                  key={`bid-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-gray-800/50"
                >
                  <div 
                    className="absolute inset-0 bg-emerald-500/10"
                    style={{ width: `${bid.percent}%` }}
                  />
                  <span className="relative text-emerald-400 font-mono">
                    {bid.price.toFixed(precision)}
                  </span>
                  <span className="relative text-center font-mono">
                    {bid.quantity.toFixed(4)}
                  </span>
                  <span className="relative text-right font-mono text-gray-400">
                    {bid.total.toFixed(4)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Depth Chart View */}
      {viewMode === 'depth' && (
        <div className="flex-1 p-4">
          <div className="h-full relative">
            {/* Simplified depth chart visualization */}
            <div className="absolute inset-0 flex">
              {/* Bid side */}
              <div className="flex-1 flex items-end justify-end">
                {data.bids.slice().reverse().map((bid, i) => (
                  <div
                    key={`bid-bar-${i}`}
                    className="flex-1 bg-emerald-500/30 border-t border-emerald-500/50"
                    style={{ height: `${bid.percent}%` }}
                  />
                ))}
              </div>
              
              {/* Center divider */}
              <div className="w-px bg-gray-600 mx-1" />
              
              {/* Ask side */}
              <div className="flex-1 flex items-end">
                {data.asks.map((ask, i) => (
                  <div
                    key={`ask-bar-${i}`}
                    className="flex-1 bg-red-500/30 border-t border-red-500/50"
                    style={{ height: `${ask.percent}%` }}
                  />
                ))}
              </div>
            </div>
            
            {/* Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3 text-emerald-400" />
                <span>Bids: {formatPrice(data.bidTotal)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Asks: {formatPrice(data.askTotal)}</span>
                <ArrowDown className="w-3 h-3 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 flex justify-between items-center">
        <div className="flex gap-1">
          {[1, 2, 4].map(p => (
            <Button
              key={p}
              variant={precision === p ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPrecision(p)}
            >
              {p}dp
            </Button>
          ))}
        </div>
        <Badge variant="info" size="sm">
          <BarChart2 className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>
    </Card>
  )
}
