// ============================================
// TradingHub Pro - Market Heatmap Widget
// Visual heatmap of market performance
// ============================================

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Grid, List, Filter } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'

interface HeatmapItem {
  symbol: string
  name: string
  price: number
  change24h: number
  volume: number
  marketCap: number
  sector: string
}

// Generate mock heatmap data
function generateHeatmapData(): HeatmapItem[] {
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', sector: 'crypto', basePrice: 67000, baseCap: 1300e9 },
    { symbol: 'ETH', name: 'Ethereum', sector: 'crypto', basePrice: 3500, baseCap: 420e9 },
    { symbol: 'BNB', name: 'BNB', sector: 'crypto', basePrice: 600, baseCap: 90e9 },
    { symbol: 'SOL', name: 'Solana', sector: 'crypto', basePrice: 150, baseCap: 65e9 },
    { symbol: 'XRP', name: 'XRP', sector: 'crypto', basePrice: 0.52, baseCap: 28e9 },
    { symbol: 'ADA', name: 'Cardano', sector: 'crypto', basePrice: 0.45, baseCap: 16e9 },
    { symbol: 'DOGE', name: 'Dogecoin', sector: 'crypto', basePrice: 0.12, baseCap: 18e9 },
    { symbol: 'AVAX', name: 'Avalanche', sector: 'crypto', basePrice: 35, baseCap: 14e9 },
  ]

  const stocks = [
    { symbol: 'AAPL', name: 'Apple', sector: 'tech', basePrice: 195, baseCap: 3000e9 },
    { symbol: 'MSFT', name: 'Microsoft', sector: 'tech', basePrice: 420, baseCap: 3100e9 },
    { symbol: 'GOOGL', name: 'Alphabet', sector: 'tech', basePrice: 175, baseCap: 2100e9 },
    { symbol: 'AMZN', name: 'Amazon', sector: 'tech', basePrice: 185, baseCap: 1900e9 },
    { symbol: 'NVDA', name: 'NVIDIA', sector: 'tech', basePrice: 950, baseCap: 2300e9 },
    { symbol: 'TSLA', name: 'Tesla', sector: 'auto', basePrice: 250, baseCap: 800e9 },
    { symbol: 'META', name: 'Meta', sector: 'tech', basePrice: 505, baseCap: 1280e9 },
    { symbol: 'JPM', name: 'JPMorgan', sector: 'finance', basePrice: 200, baseCap: 580e9 },
    { symbol: 'V', name: 'Visa', sector: 'finance', basePrice: 280, baseCap: 520e9 },
    { symbol: 'JNJ', name: 'J&J', sector: 'health', basePrice: 155, baseCap: 375e9 },
    { symbol: 'UNH', name: 'UnitedHealth', sector: 'health', basePrice: 520, baseCap: 480e9 },
    { symbol: 'XOM', name: 'Exxon', sector: 'energy', basePrice: 115, baseCap: 470e9 },
  ]

  const allAssets = [...cryptos, ...stocks]

  return allAssets.map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    price: asset.basePrice * (0.97 + Math.random() * 0.06),
    change24h: (Math.random() - 0.5) * 20,
    volume: asset.baseCap * (0.01 + Math.random() * 0.05),
    marketCap: asset.baseCap * (0.95 + Math.random() * 0.1),
    sector: asset.sector,
  }))
}

function getHeatmapColor(change: number): string {
  if (change >= 10) return 'bg-emerald-500'
  if (change >= 5) return 'bg-emerald-600'
  if (change >= 2) return 'bg-emerald-700'
  if (change >= 0) return 'bg-emerald-900'
  if (change >= -2) return 'bg-red-900'
  if (change >= -5) return 'bg-red-700'
  if (change >= -10) return 'bg-red-600'
  return 'bg-red-500'
}

type ViewMode = 'grid' | 'tree'
type SectorFilter = 'all' | 'crypto' | 'tech' | 'finance' | 'health' | 'energy' | 'auto'

interface HeatmapCellProps {
  item: HeatmapItem
  size: 'sm' | 'md' | 'lg'
  formatPrice: (value: number) => string
}

function HeatmapCell({ item, size, formatPrice }: HeatmapCellProps) {
  const sizeClasses = {
    sm: 'min-w-[80px] p-2',
    md: 'min-w-[100px] p-3',
    lg: 'min-w-[120px] p-4',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      className={cn(
        'rounded-lg cursor-pointer transition-shadow hover:shadow-lg hover:shadow-black/20',
        getHeatmapColor(item.change24h),
        sizeClasses[size]
      )}
    >
      <div className="font-bold text-white text-sm">{item.symbol}</div>
      <div className="text-white/80 text-xs truncate">{item.name}</div>
      <div className={cn(
        'font-mono text-sm mt-1',
        item.change24h >= 0 ? 'text-white' : 'text-white'
      )}>
        {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
      </div>
      {size !== 'sm' && (
        <div className="text-white/60 text-xs mt-1">
          {formatPrice(item.price)}
        </div>
      )}
    </motion.div>
  )
}

export function MarketHeatmapWidget() {
  const { formatPrice } = useCurrency()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all')
  const [data] = useState<HeatmapItem[]>(generateHeatmapData)

  const filteredData = useMemo(() => {
    if (sectorFilter === 'all') return data
    return data.filter(item => item.sector === sectorFilter)
  }, [data, sectorFilter])

  // Sort by market cap for sizing
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => b.marketCap - a.marketCap)
  }, [filteredData])

  // Calculate stats
  const stats = useMemo(() => {
    const gainers = data.filter(d => d.change24h > 0).length
    const losers = data.filter(d => d.change24h < 0).length
    const avgChange = data.reduce((sum, d) => sum + d.change24h, 0) / data.length
    return { gainers, losers, avgChange }
  }, [data])

  const sectors: { value: SectorFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'tech', label: 'Tech' },
    { value: 'finance', label: 'Finance' },
    { value: 'health', label: 'Health' },
    { value: 'energy', label: 'Energy' },
  ]

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Grid className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Market Heatmap</h3>
              <p className="text-xs text-gray-400">
                {data.length} assets tracked
              </p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded',
                viewMode === 'grid' ? 'bg-gray-700' : 'hover:bg-gray-700/50'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={cn(
                'p-1.5 rounded',
                viewMode === 'tree' ? 'bg-gray-700' : 'hover:bg-gray-700/50'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">{stats.gainers} gainers</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-red-400">{stats.losers} losers</span>
          </div>
          <div className="text-gray-400">
            Avg: <span className={stats.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {stats.avgChange >= 0 ? '+' : ''}{stats.avgChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Sector Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0 self-center" />
          {sectors.map(s => (
            <Button
              key={s.value}
              variant={sectorFilter === s.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSectorFilter(s.value)}
              className="whitespace-nowrap"
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'grid' ? (
          <div className="flex flex-wrap gap-2">
            {sortedData.map((item, index) => (
              <HeatmapCell
                key={item.symbol}
                item={item}
                size={index < 4 ? 'lg' : index < 10 ? 'md' : 'sm'}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedData.map(item => (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  getHeatmapColor(item.change24h)
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{item.symbol}</span>
                  <span className="text-white/80 text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-white">
                    {formatPrice(item.price)}
                  </span>
                  <span className={cn(
                    'font-mono font-bold min-w-[80px] text-right',
                    item.change24h >= 0 ? 'text-white' : 'text-white'
                  )}>
                    {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-center gap-1">
          <span className="text-xs text-gray-400">-10%</span>
          <div className="flex gap-0.5">
            <div className="w-6 h-3 bg-red-500 rounded-l" />
            <div className="w-6 h-3 bg-red-600" />
            <div className="w-6 h-3 bg-red-700" />
            <div className="w-6 h-3 bg-red-900" />
            <div className="w-6 h-3 bg-emerald-900" />
            <div className="w-6 h-3 bg-emerald-700" />
            <div className="w-6 h-3 bg-emerald-600" />
            <div className="w-6 h-3 bg-emerald-500 rounded-r" />
          </div>
          <span className="text-xs text-gray-400">+10%</span>
        </div>
      </div>
    </Card>
  )
}
