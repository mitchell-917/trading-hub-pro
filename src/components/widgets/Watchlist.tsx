// ============================================
// TradingHub Pro - Watchlist Widget
// Track favorite trading pairs
// ============================================

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  Plus, 
  Search, 
  X,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Sparkline } from '@/components/charts/Sparkline'
import { useTradingStore } from '@/lib/store'
import { useMarketData } from '@/hooks/useMarketData'
import { formatCurrency, formatPercentage, cn } from '@/lib/utils'
import type { WatchlistItem } from '@/types'

interface WatchlistProps {
  onSelectSymbol?: (symbol: string) => void
  className?: string
}

// Available symbols for adding to watchlist
const AVAILABLE_SYMBOLS = [
  'BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD',
  'BNBUSD', 'DOGEUSD', 'DOTUSD', 'AVAXUSD', 'LINKUSD',
  'MATICUSD', 'LTCUSD', 'UNIUSD', 'ATOMUSD', 'XLMUSD',
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
  'NVDA', 'META', 'AMD', 'NFLX', 'DIS',
]

export function Watchlist({ onSelectSymbol, className }: WatchlistProps) {
  const watchlist = useTradingStore((s) => s.watchlist)
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol)
  const setSelectedSymbol = useTradingStore((s) => s.setSelectedSymbol)
  const addToWatchlist = useTradingStore((s) => s.addToWatchlist)
  const removeFromWatchlist = useTradingStore((s) => s.removeFromWatchlist)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSelectSymbol = useCallback((symbol: string) => {
    setSelectedSymbol(symbol)
    onSelectSymbol?.(symbol)
  }, [setSelectedSymbol, onSelectSymbol])

  const filteredSymbols = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const watchlistSymbols = watchlist.map((item: WatchlistItem) => item.symbol)
    return AVAILABLE_SYMBOLS
      .filter((s) => !watchlistSymbols.includes(s))
      .filter((s) => s.toLowerCase().includes(query))
  }, [searchQuery, watchlist])

  return (
    <>
      <Card className={cn('p-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold">Watchlist</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add
          </Button>
        </div>

        {/* Watchlist Items */}
        {watchlist.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No symbols in watchlist</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Symbol
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {watchlist.map((item: WatchlistItem, index: number) => (
                <WatchlistItemRow
                  key={item.symbol}
                  symbol={item.symbol}
                  isSelected={item.symbol === selectedSymbol}
                  index={index}
                  onSelect={() => handleSelectSymbol(item.symbol)}
                  onRemove={() => removeFromWatchlist(item.symbol)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Add Symbol Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setSearchQuery('')
        }}
        title="Add to Watchlist"
      >
        <div className="space-y-4">
          <Input
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            autoFocus
          />

          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredSymbols.length === 0 ? (
              <p className="text-center text-gray-400 py-4">
                No symbols found
              </p>
            ) : (
              filteredSymbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => {
                    addToWatchlist({ symbol, name: symbol, addedAt: Date.now() })
                    setIsAddModalOpen(false)
                    setSearchQuery('')
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium">{symbol}</span>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}

// ============================================
// Watchlist Item Row Component
// ============================================

interface WatchlistItemRowProps {
  symbol: string
  isSelected: boolean
  index: number
  onSelect: () => void
  onRemove: () => void
}

function WatchlistItemRow({ 
  symbol, 
  isSelected, 
  index, 
  onSelect, 
  onRemove 
}: WatchlistItemRowProps) {
  const { ticker } = useMarketData(symbol)
  const [isHovered, setIsHovered] = useState(false)

  const isPositive = (ticker?.change ?? 0) >= 0

  // Generate sparkline data - seeded based on symbol for deterministic values
  const sparklineData = useMemo(() => {
    if (!ticker) return []
    const data: number[] = []
    let price = ticker.price * 0.98
    // Use symbol hash as seed for deterministic random values
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    for (let i = 0; i < 24; i++) {
      // Deterministic pseudo-random based on seed and index
      const pseudoRandom = Math.sin(seed * (i + 1)) * 0.5 + 0.5
      const change = (pseudoRandom - 0.48) * price * 0.01
      price += change
      data.push(price)
    }
    data.push(ticker.price)
    return data
  }, [ticker, symbol])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onSelect}
        className={cn(
          'w-full p-3 rounded-lg transition-all flex items-center justify-between group',
          isSelected
            ? 'bg-indigo-500/20 ring-1 ring-indigo-500/50'
            : 'hover:bg-gray-800'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
          </div>

          <div className="text-left">
            <p className="font-medium">{symbol}</p>
            <p className="text-xs text-gray-400">
              Vol: {ticker?.volume 
                ? `${(ticker.volume / 1e6).toFixed(1)}M` 
                : '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sparklineData.length > 0 && (
            <div className="w-16 hidden sm:block">
              <Sparkline 
                data={sparklineData} 
                height={24}
                color={isPositive ? 'green' : 'red'}
              />
            </div>
          )}

          <div className="text-right min-w-[80px]">
            <p className="font-medium number-mono">
              {ticker ? formatCurrency(ticker.price) : '-'}
            </p>
            <p className={cn(
              'text-xs number-mono',
              isPositive ? 'text-green-400' : 'text-red-400'
            )}>
              {ticker ? formatPercentage(ticker.changePercent ?? 0) : '-'}
            </p>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  )
}
