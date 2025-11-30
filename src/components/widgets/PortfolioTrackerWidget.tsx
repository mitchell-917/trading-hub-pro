// ============================================
// TradingHub Pro - Portfolio Tracker Widget
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet,
  PieChart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'
import { useCurrency } from '../../context/CurrencyContext'
import { cn } from '../../lib/utils'

// ============================================
// Types
// ============================================
interface PortfolioAsset {
  id: string
  symbol: string
  name: string
  type: 'crypto' | 'stock' | 'forex' | 'commodity'
  quantity: number
  avgBuyPrice: number
  currentPrice: number
  change24h: number
  changePercent24h: number
  allocation: number // percentage
}

interface PortfolioStats {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercent: number
  dayChange: number
  dayChangePercent: number
  bestPerformer: PortfolioAsset
  worstPerformer: PortfolioAsset
}

// ============================================
// Mock Portfolio Data
// ============================================
const generateMockPortfolio = (): PortfolioAsset[] => [
  {
    id: 'btc-1',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    quantity: 0.5,
    avgBuyPrice: 58000,
    currentPrice: 67542,
    change24h: 1580,
    changePercent24h: 2.4,
    allocation: 42,
  },
  {
    id: 'eth-1',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    quantity: 3.2,
    avgBuyPrice: 3100,
    currentPrice: 3456,
    change24h: 62,
    changePercent24h: 1.8,
    allocation: 14,
  },
  {
    id: 'aapl-1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    quantity: 50,
    avgBuyPrice: 165,
    currentPrice: 182,
    change24h: 2.5,
    changePercent24h: 1.4,
    allocation: 11,
  },
  {
    id: 'nvda-1',
    symbol: 'NVDA',
    name: 'NVIDIA Corp',
    type: 'stock',
    quantity: 15,
    avgBuyPrice: 450,
    currentPrice: 875,
    change24h: 28,
    changePercent24h: 3.3,
    allocation: 16,
  },
  {
    id: 'sol-1',
    symbol: 'SOL',
    name: 'Solana',
    type: 'crypto',
    quantity: 25,
    avgBuyPrice: 98,
    currentPrice: 142,
    change24h: 7.2,
    changePercent24h: 5.2,
    allocation: 4,
  },
  {
    id: 'xau-1',
    symbol: 'XAU',
    name: 'Gold',
    type: 'commodity',
    quantity: 2,
    avgBuyPrice: 2150,
    currentPrice: 2412,
    change24h: 18,
    changePercent24h: 0.75,
    allocation: 6,
  },
  {
    id: 'msft-1',
    symbol: 'MSFT',
    name: 'Microsoft',
    type: 'stock',
    quantity: 20,
    avgBuyPrice: 380,
    currentPrice: 415,
    change24h: 5.2,
    changePercent24h: 1.3,
    allocation: 10,
  },
]

// ============================================
// Calculate Portfolio Stats
// ============================================
function calculateStats(assets: PortfolioAsset[]): PortfolioStats {
  const totalValue = assets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0)
  const totalCost = assets.reduce((sum, a) => sum + (a.quantity * a.avgBuyPrice), 0)
  const totalPnL = totalValue - totalCost
  const totalPnLPercent = (totalPnL / totalCost) * 100
  
  const dayChange = assets.reduce((sum, a) => sum + (a.quantity * a.change24h), 0)
  const dayChangePercent = (dayChange / (totalValue - dayChange)) * 100

  const sortedByChange = [...assets].sort((a, b) => b.changePercent24h - a.changePercent24h)

  return {
    totalValue,
    totalCost,
    totalPnL,
    totalPnLPercent,
    dayChange,
    dayChangePercent,
    bestPerformer: sortedByChange[0],
    worstPerformer: sortedByChange[sortedByChange.length - 1],
  }
}

// ============================================
// Asset Type Badge
// ============================================
function AssetTypeBadge({ type }: { type: PortfolioAsset['type'] }) {
  const config = {
    crypto: { label: 'Crypto', color: 'bg-orange-500/20 text-orange-400' },
    stock: { label: 'Stock', color: 'bg-blue-500/20 text-blue-400' },
    forex: { label: 'Forex', color: 'bg-green-500/20 text-green-400' },
    commodity: { label: 'Commodity', color: 'bg-yellow-500/20 text-yellow-400' },
  }

  const { label, color } = config[type]

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs', color)}>
      {label}
    </span>
  )
}

// ============================================
// Allocation Ring
// ============================================
function AllocationRing({ assets }: { assets: PortfolioAsset[] }) {
  const colors = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4']
  
  // Create SVG arc paths
  let cumulativePercent = 0
  const arcs = assets.map((asset, i) => {
    const startPercent = cumulativePercent
    cumulativePercent += asset.allocation
    return {
      ...asset,
      startPercent,
      endPercent: cumulativePercent,
      color: colors[i % colors.length],
    }
  })

  const getArcPath = (startPercent: number, endPercent: number) => {
    const start = ((startPercent / 100) * 360 - 90) * (Math.PI / 180)
    const end = ((endPercent / 100) * 360 - 90) * (Math.PI / 180)
    const largeArc = endPercent - startPercent > 50 ? 1 : 0
    
    const r = 40
    const cx = 50
    const cy = 50
    
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {arcs.map((arc, i) => (
          <path
            key={arc.id}
            d={getArcPath(arc.startPercent, arc.endPercent)}
            fill="none"
            stroke={arc.color}
            strokeWidth="12"
            className="transition-all duration-300"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <PieChart className="w-6 h-6 text-slate-500" />
      </div>
    </div>
  )
}

// ============================================
// Asset Row
// ============================================
interface AssetRowProps {
  asset: PortfolioAsset
  showBalance: boolean
  formatPrice: (price: number) => string
}

function AssetRow({ asset, showBalance, formatPrice }: AssetRowProps) {
  const value = asset.quantity * asset.currentPrice
  const pnl = value - (asset.quantity * asset.avgBuyPrice)
  const pnlPercent = (pnl / (asset.quantity * asset.avgBuyPrice)) * 100
  const isPositive = pnl >= 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white">
          {asset.symbol.substring(0, 2)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{asset.symbol}</span>
            <AssetTypeBadge type={asset.type} />
          </div>
          <div className="text-xs text-slate-500">
            {showBalance ? `${asset.quantity} units` : '••••'}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-medium text-white">
          {showBalance ? formatPrice(value) : '••••••'}
        </div>
        <div className={cn(
          'flex items-center justify-end gap-1 text-xs',
          isPositive ? 'text-emerald-400' : 'text-red-400'
        )}>
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Stats Cards
// ============================================
interface StatsCardsProps {
  stats: PortfolioStats
  showBalance: boolean
  formatPrice: (price: number) => string
}

function StatsCards({ stats, showBalance, formatPrice }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Value',
      value: showBalance ? formatPrice(stats.totalValue) : '••••••',
      icon: <Wallet className="w-4 h-4" />,
      color: 'text-blue-400',
    },
    {
      label: 'Total P/L',
      value: showBalance 
        ? `${stats.totalPnL >= 0 ? '+' : ''}${formatPrice(stats.totalPnL)}` 
        : '••••••',
      subValue: `${stats.totalPnLPercent >= 0 ? '+' : ''}${stats.totalPnLPercent.toFixed(2)}%`,
      icon: stats.totalPnL >= 0 ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      ),
      color: stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: '24h Change',
      value: showBalance 
        ? `${stats.dayChange >= 0 ? '+' : ''}${formatPrice(stats.dayChange)}`
        : '••••••',
      subValue: `${stats.dayChangePercent >= 0 ? '+' : ''}${stats.dayChangePercent.toFixed(2)}%`,
      icon: stats.dayChange >= 0 ? (
        <ArrowUpRight className="w-4 h-4" />
      ) : (
        <ArrowDownRight className="w-4 h-4" />
      ),
      color: stats.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-3 rounded-lg bg-slate-800/30"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={card.color}>{card.icon}</span>
            <span className="text-xs text-slate-500">{card.label}</span>
          </div>
          <div className={cn('font-bold', card.color)}>{card.value}</div>
          {card.subValue && (
            <div className={cn('text-xs', card.color)}>{card.subValue}</div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// Top Performers
// ============================================
function TopPerformers({ stats }: { stats: PortfolioStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <Card className="p-3 bg-emerald-500/10 border-emerald-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400">Best Performer</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{stats.bestPerformer.symbol}</span>
          <span className="text-emerald-400 text-sm">
            +{stats.bestPerformer.changePercent24h.toFixed(2)}%
          </span>
        </div>
      </Card>
      <Card className="p-3 bg-red-500/10 border-red-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-400">Needs Attention</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{stats.worstPerformer.symbol}</span>
          <span className="text-red-400 text-sm">
            {stats.worstPerformer.changePercent24h >= 0 ? '+' : ''}
            {stats.worstPerformer.changePercent24h.toFixed(2)}%
          </span>
        </div>
      </Card>
    </div>
  )
}

// ============================================
// Main Portfolio Tracker Widget
// ============================================
interface PortfolioTrackerWidgetProps {
  compact?: boolean
  className?: string
}

export function PortfolioTrackerWidget({ compact = false, className }: PortfolioTrackerWidgetProps) {
  const [showBalance, setShowBalance] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { formatPrice } = useCurrency()

  const assets = useMemo(() => generateMockPortfolio(), [])
  const stats = useMemo(() => calculateStats(assets), [assets])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (compact) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Portfolio</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-white">
            {showBalance ? formatPrice(stats.totalValue) : '••••••••'}
          </div>
          <div className={cn(
            'flex items-center gap-1 text-sm',
            stats.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {stats.dayChange >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {showBalance ? (
              <>
                {stats.dayChange >= 0 ? '+' : ''}{formatPrice(stats.dayChange)}
                <span className="text-xs">({stats.dayChangePercent >= 0 ? '+' : ''}{stats.dayChangePercent.toFixed(2)}%)</span>
              </>
            ) : '••••'}
          </div>
        </div>

        <div className="space-y-2">
          {assets.slice(0, 4).map(asset => (
            <AssetRow 
              key={asset.id} 
              asset={asset} 
              showBalance={showBalance}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Portfolio Tracker</h3>
            <p className="text-sm text-slate-400">Your investment overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          </Button>
          <Button variant="default" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} showBalance={showBalance} formatPrice={formatPrice} />

      {/* Top Performers */}
      <TopPerformers stats={stats} />

      {/* Allocation & Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Ring */}
        <div className="flex flex-col items-center justify-center">
          <AllocationRing assets={assets} />
          <div className="mt-4 grid grid-cols-2 gap-2 w-full">
            {assets.slice(0, 4).map(asset => (
              <div key={asset.id} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    backgroundColor: asset.type === 'crypto' ? '#f97316' 
                      : asset.type === 'stock' ? '#3b82f6' 
                      : asset.type === 'commodity' ? '#eab308' 
                      : '#22c55e' 
                  }} 
                />
                <span className="text-slate-400">{asset.symbol}</span>
                <span className="text-white">{asset.allocation}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings List */}
        <div className="lg:col-span-2 space-y-2">
          <h4 className="text-sm font-medium text-slate-400 mb-3">Holdings</h4>
          {assets.map(asset => (
            <AssetRow 
              key={asset.id} 
              asset={asset} 
              showBalance={showBalance}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-slate-500 text-center">
        Last updated just now • Prices may be delayed
      </div>
    </Card>
  )
}

export default PortfolioTrackerWidget
