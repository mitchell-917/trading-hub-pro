// ============================================
// TradingHub Pro - Market Scanner Page
// Advanced market screening with filters and alerts
// ============================================

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Activity,
  Volume2,
  Zap,
  Bell,
  Star,
  StarOff,
  ChevronDown,
  RefreshCw,
  Eye,
  BarChart2,
  Flame,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Sparkline } from '@/components/charts/Sparkline'
import { useTradingStore } from '@/lib/store'
import { formatCompact, cn } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'

// Scanner preset types
type ScannerPreset = 'top-gainers' | 'top-losers' | 'high-volume' | 'unusual-activity' | 'breakouts' | 'oversold' | 'overbought'

interface ScannerFilter {
  minPrice?: number
  maxPrice?: number
  minChange?: number
  maxChange?: number
  minVolume?: number
  sector?: string
}

// Mock sparkline data generator - deterministic based on seed
const generateSparklineData = (positive: boolean, seed: number): number[] => {
  const data: number[] = []
  let value = 50
  for (let i = 0; i < 20; i++) {
    // Deterministic pseudo-random based on seed and index
    const pseudoRandom = Math.sin(seed * (i + 1)) * 0.5 + 0.5
    const change = (pseudoRandom - (positive ? 0.4 : 0.6)) * 5
    value = Math.max(10, Math.min(90, value + change))
    data.push(value)
  }
  return data
}

// Mock additional scanner metrics - deterministic based on seed
const generateScannerMetrics = (seed: number) => {
  // Use deterministic pseudo-random values
  const pr1 = Math.sin(seed * 1) * 0.5 + 0.5
  const pr2 = Math.sin(seed * 2) * 0.5 + 0.5
  const pr3 = Math.sin(seed * 3) * 0.5 + 0.5
  const pr4 = Math.sin(seed * 4) * 0.5 + 0.5
  const pr5 = Math.sin(seed * 5) * 0.5 + 0.5
  const pr6 = Math.sin(seed * 6) * 0.5 + 0.5
  
  return {
    rsi: 30 + pr1 * 40,
    momentum: (pr2 - 0.5) * 20,
    volumeRatio: 0.5 + pr3 * 2,
    volatility: 5 + pr4 * 25,
    strength: pr5 * 100,
    signals: Math.floor(pr6 * 5),
  }
}

export function MarketScanner() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activePreset, setActivePreset] = useState<ScannerPreset>('top-gainers')
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<'change' | 'volume' | 'price'>('change')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [watchedSymbols, setWatchedSymbols] = useState<Set<string>>(new Set(['BTC', 'ETH']))
  const [filters, setFilters] = useState<ScannerFilter>({})
  
  const tickers = useTradingStore((s) => s.tickers)
  const addToWatchlist = useTradingStore((s) => s.addToWatchlist)
  const { formatPrice } = useCurrency()

  // Apply filters and sorting
  const filteredTickers = useMemo(() => {
    let result = [...tickers]
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t => 
        t.symbol.toLowerCase().includes(query) || 
        t.name.toLowerCase().includes(query)
      )
    }
    
    // Preset filters
    switch (activePreset) {
      case 'top-gainers':
        result = result.filter(t => t.changePercent > 0)
        break
      case 'top-losers':
        result = result.filter(t => t.changePercent < 0)
        break
      case 'high-volume':
        result = result.sort((a, b) => b.volume - a.volume)
        break
      case 'unusual-activity':
        // Mock: filter by volume anomaly
        result = result.filter(t => t.volume > 1000000)
        break
      case 'breakouts':
        // Mock: price near 24h high
        result = result.filter(t => t.price >= t.high24h * 0.98)
        break
      case 'oversold':
        // Mock: negative change
        result = result.filter(t => t.changePercent < -3)
        break
      case 'overbought':
        // Mock: positive change > 5%
        result = result.filter(t => t.changePercent > 5)
        break
    }
    
    // Custom filters
    if (filters.minPrice) result = result.filter(t => t.price >= filters.minPrice!)
    if (filters.maxPrice) result = result.filter(t => t.price <= filters.maxPrice!)
    if (filters.minChange) result = result.filter(t => t.changePercent >= filters.minChange!)
    if (filters.maxChange) result = result.filter(t => t.changePercent <= filters.maxChange!)
    if (filters.minVolume) result = result.filter(t => t.volume >= filters.minVolume!)
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'change':
          comparison = a.changePercent - b.changePercent
          break
        case 'volume':
          comparison = a.volume - b.volume
          break
        case 'price':
          comparison = a.price - b.price
          break
      }
      return sortDirection === 'desc' ? -comparison : comparison
    })
    
    return result
  }, [tickers, searchQuery, activePreset, filters, sortField, sortDirection])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const toggleWatch = useCallback((symbol: string) => {
    const newWatched = new Set(watchedSymbols)
    if (newWatched.has(symbol)) {
      newWatched.delete(symbol)
    } else {
      newWatched.add(symbol)
      // Use a stable timestamp for the item
      addToWatchlist({ symbol, name: symbol, addedAt: 0 })
    }
    setWatchedSymbols(newWatched)
  }, [watchedSymbols, addToWatchlist])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const presets = [
    { id: 'top-gainers', label: 'Top Gainers', icon: TrendingUp, color: 'text-green-400' },
    { id: 'top-losers', label: 'Top Losers', icon: TrendingDown, color: 'text-red-400' },
    { id: 'high-volume', label: 'High Volume', icon: Volume2, color: 'text-blue-400' },
    { id: 'unusual-activity', label: 'Unusual Activity', icon: Zap, color: 'text-amber-400' },
    { id: 'breakouts', label: 'Breakouts', icon: Flame, color: 'text-orange-400' },
    { id: 'oversold', label: 'Oversold', icon: Activity, color: 'text-purple-400' },
    { id: 'overbought', label: 'Overbought', icon: Sparkles, color: 'text-pink-400' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Market Scanner</h1>
            <p className="text-gray-400 mt-1">Screen markets with advanced filters and alerts</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<Bell className="w-4 h-4" />}
            >
              Set Alert
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                size="sm"
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-gray-800">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Min Price</label>
                    <Input
                      type="number"
                      placeholder="$0"
                      value={filters.minPrice || ''}
                      onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) || undefined })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Max Price</label>
                    <Input
                      type="number"
                      placeholder="$∞"
                      value={filters.maxPrice || ''}
                      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) || undefined })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Min Change %</label>
                    <Input
                      type="number"
                      placeholder="-∞"
                      value={filters.minChange || ''}
                      onChange={(e) => setFilters({ ...filters, minChange: Number(e.target.value) || undefined })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Max Change %</label>
                    <Input
                      type="number"
                      placeholder="+∞"
                      value={filters.maxChange || ''}
                      onChange={(e) => setFilters({ ...filters, maxChange: Number(e.target.value) || undefined })}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFilters({})}
                  >
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Preset Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {presets.map((preset) => {
            const Icon = preset.icon
            const isActive = activePreset === preset.id
            return (
              <Button
                key={preset.id}
                variant={isActive ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={<Icon className={cn("w-4 h-4", !isActive && preset.color)} />}
                onClick={() => setActivePreset(preset.id as ScannerPreset)}
                className={cn(
                  "whitespace-nowrap",
                  !isActive && "hover:bg-gray-800"
                )}
              >
                {preset.label}
              </Button>
            )
          })}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {filteredTickers.length} results found
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Sort by:</span>
            <button 
              onClick={() => handleSort('change')}
              className={cn(
                "flex items-center gap-1 hover:text-white transition-colors",
                sortField === 'change' && "text-indigo-400"
              )}
            >
              Change
              {sortField === 'change' && (
                <ChevronDown className={cn("w-3 h-3", sortDirection === 'asc' && "rotate-180")} />
              )}
            </button>
            <span>|</span>
            <button 
              onClick={() => handleSort('volume')}
              className={cn(
                "flex items-center gap-1 hover:text-white transition-colors",
                sortField === 'volume' && "text-indigo-400"
              )}
            >
              Volume
              {sortField === 'volume' && (
                <ChevronDown className={cn("w-3 h-3", sortDirection === 'asc' && "rotate-180")} />
              )}
            </button>
            <span>|</span>
            <button 
              onClick={() => handleSort('price')}
              className={cn(
                "flex items-center gap-1 hover:text-white transition-colors",
                sortField === 'price' && "text-indigo-400"
              )}
            >
              Price
              {sortField === 'price' && (
                <ChevronDown className={cn("w-3 h-3", sortDirection === 'asc' && "rotate-180")} />
              )}
            </button>
          </div>
        </div>

        {/* Scanner Results */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    24h Change
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-32">
                    24h Chart
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    RSI
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Signals
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <AnimatePresence mode="popLayout">
                  {filteredTickers.map((ticker, index) => {
                    // Use symbol hash as seed for deterministic values
                    const seed = ticker.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                    const metrics = generateScannerMetrics(seed)
                    const sparklineData = generateSparklineData(ticker.changePercent >= 0, seed)
                    const isWatched = watchedSymbols.has(ticker.symbol)
                    
                    return (
                      <motion.tr
                        key={ticker.symbol}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                              {ticker.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{ticker.symbol}</p>
                              <p className="text-xs text-gray-400">{ticker.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-mono font-medium">{formatPrice(ticker.price)}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {ticker.changePercent >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={cn(
                              "font-mono font-medium",
                              ticker.changePercent >= 0 ? "text-green-400" : "text-red-400"
                            )}>
                              {ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-mono text-gray-300">{formatCompact(ticker.volume)}</p>
                          <p className="text-xs text-gray-500">
                            {metrics.volumeRatio.toFixed(1)}x avg
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-24 h-8 mx-auto">
                            <Sparkline 
                              data={sparklineData}
                              height={32}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge 
                            color={
                              metrics.rsi > 70 ? 'red' : 
                              metrics.rsi < 30 ? 'green' : 
                              'gray'
                            }
                            size="sm"
                          >
                            {metrics.rsi.toFixed(0)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {metrics.signals > 0 ? (
                            <Badge color="blue" size="sm">
                              {metrics.signals} signals
                            </Badge>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWatch(ticker.symbol)}
                              className="p-2"
                            >
                              {isWatched ? (
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              ) : (
                                <StarOff className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2"
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2"
                            >
                              <BarChart2 className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredTickers.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No results match your filters</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('')
                  setFilters({})
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Gainers</p>
                <p className="text-xl font-bold">{tickers.filter(t => t.changePercent > 0).length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Losers</p>
                <p className="text-xl font-bold">{tickers.filter(t => t.changePercent < 0).length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Volume2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Volume</p>
                <p className="text-xl font-bold">{formatCompact(tickers.reduce((sum, t) => sum + t.volume, 0))}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Alerts</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

export default MarketScanner
