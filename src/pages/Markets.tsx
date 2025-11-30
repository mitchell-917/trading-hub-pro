// ============================================
// TradingHub Pro - Markets Page
// ============================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, 
  Bitcoin, 
  LineChart, 
  Gem, 
  Newspaper,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Card, Button, Badge } from '../components/ui'
import { MarketOverview, ForexWidget, CommoditiesWidget, NewsWidget } from '../components/widgets'
import { useCurrency } from '../context/CurrencyContext'
import { cn } from '../lib/utils'

// ============================================
// Market Tab Type
// ============================================
type MarketTab = 'overview' | 'crypto' | 'stocks' | 'forex' | 'commodities' | 'news'

// ============================================
// Tab Configuration
// ============================================
const marketTabs: { value: MarketTab; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'overview', 
    label: 'Overview', 
    icon: <LayoutGrid className="w-5 h-5" />,
    description: 'All markets at a glance',
  },
  { 
    value: 'crypto', 
    label: 'Crypto', 
    icon: <Bitcoin className="w-5 h-5" />,
    description: 'Cryptocurrency markets',
  },
  { 
    value: 'stocks', 
    label: 'Stocks', 
    icon: <LineChart className="w-5 h-5" />,
    description: 'Stock market indices',
  },
  { 
    value: 'forex', 
    label: 'Forex', 
    icon: <Globe className="w-5 h-5" />,
    description: 'Foreign exchange',
  },
  { 
    value: 'commodities', 
    label: 'Commodities', 
    icon: <Gem className="w-5 h-5" />,
    description: 'Metals, oil & more',
  },
  { 
    value: 'news', 
    label: 'News', 
    icon: <Newspaper className="w-5 h-5" />,
    description: 'Market headlines',
  },
]

// ============================================
// Market Stats Banner
// ============================================
function MarketStatsBanner() {
  const { formatPrice } = useCurrency()

  // Mock global market stats
  const stats = [
    { label: 'Total Market Cap', value: formatPrice(2.85e12), change: 2.4 },
    { label: 'BTC Dominance', value: '52.3%', change: 0.8 },
    { label: '24h Volume', value: formatPrice(98.5e9), change: -1.2 },
    { label: 'Fear & Greed', value: '65', change: 5, badge: 'Greed' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-slate-800/80 to-slate-800/40">
            <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-white">{stat.value}</span>
              <div className={cn(
                'flex items-center gap-1 text-sm',
                stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {stat.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stat.change >= 0 ? '+' : ''}{stat.change}%</span>
              </div>
            </div>
            {stat.badge && (
              <Badge variant="default" className="mt-2 text-xs bg-amber-500/20 text-amber-400">
                {stat.badge}
              </Badge>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// Overview Content
// ============================================
function OverviewContent() {
  return (
    <div className="space-y-8">
      {/* Market Indices */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-blue-400" />
          Market Indices
        </h2>
        <MarketOverview />
      </section>

      {/* Forex Quick View */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-400" />
          Forex Markets
        </h2>
        <ForexWidget compact />
      </section>

      {/* Commodities Quick View */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Gem className="w-5 h-5 text-yellow-400" />
          Commodities
        </h2>
        <CommoditiesWidget compact />
      </section>

      {/* News Quick View */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-purple-400" />
          Latest News
        </h2>
        <NewsWidget compact />
      </section>
    </div>
  )
}

// ============================================
// Crypto Content
// ============================================
function CryptoContent() {
  const { formatPrice } = useCurrency()

  // Mock crypto data
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', price: 67542, change: 2.4, marketCap: 1.32e12, volume: 28.5e9 },
    { symbol: 'ETH', name: 'Ethereum', price: 3456, change: 1.8, marketCap: 415e9, volume: 12.3e9 },
    { symbol: 'SOL', name: 'Solana', price: 142, change: 5.2, marketCap: 62e9, volume: 3.2e9 },
    { symbol: 'XRP', name: 'Ripple', price: 0.52, change: -0.8, marketCap: 28e9, volume: 1.5e9 },
    { symbol: 'ADA', name: 'Cardano', price: 0.45, change: 1.2, marketCap: 16e9, volume: 450e6 },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.15, change: 8.5, marketCap: 21e9, volume: 2.1e9 },
    { symbol: 'DOT', name: 'Polkadot', price: 7.25, change: -1.5, marketCap: 9.5e9, volume: 280e6 },
    { symbol: 'AVAX', name: 'Avalanche', price: 35.80, change: 3.1, marketCap: 13.5e9, volume: 520e6 },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Bitcoin className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Cryptocurrency</h2>
            <p className="text-sm text-slate-400">Top coins by market cap</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-700/50">
              <th className="pb-3 font-medium">#</th>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium text-right">Price</th>
              <th className="pb-3 font-medium text-right">24h %</th>
              <th className="pb-3 font-medium text-right">Market Cap</th>
              <th className="pb-3 font-medium text-right">Volume (24h)</th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map((crypto, i) => (
              <motion.tr
                key={crypto.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-slate-700/30 hover:bg-slate-800/30"
              >
                <td className="py-4 text-slate-400">{i + 1}</td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                      {crypto.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{crypto.name}</div>
                      <div className="text-xs text-slate-500">{crypto.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-right font-medium text-white">
                  {formatPrice(crypto.price)}
                </td>
                <td className={cn(
                  'py-4 text-right font-medium',
                  crypto.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                </td>
                <td className="py-4 text-right text-slate-300">
                  {formatPrice(crypto.marketCap)}
                </td>
                <td className="py-4 text-right text-slate-300">
                  {formatPrice(crypto.volume)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ============================================
// Stocks Content
// ============================================
function StocksContent() {
  return <MarketOverview />
}

// ============================================
// Forex Content
// ============================================
function ForexContent() {
  return <ForexWidget />
}

// ============================================
// Commodities Content
// ============================================
function CommoditiesContent() {
  return <CommoditiesWidget />
}

// ============================================
// News Content
// ============================================
function NewsContent() {
  return <NewsWidget />
}

// ============================================
// Content Renderer
// ============================================
function renderContent(tab: MarketTab) {
  switch (tab) {
    case 'overview':
      return <OverviewContent />
    case 'crypto':
      return <CryptoContent />
    case 'stocks':
      return <StocksContent />
    case 'forex':
      return <ForexContent />
    case 'commodities':
      return <CommoditiesContent />
    case 'news':
      return <NewsContent />
    default:
      return <OverviewContent />
  }
}

// ============================================
// Markets Page Component
// ============================================
export function MarketsPage() {
  const [activeTab, setActiveTab] = useState<MarketTab>('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Markets
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400"
          >
            Real-time market data across crypto, stocks, forex, and commodities
          </motion.p>
        </div>

        {/* Global Stats */}
        <MarketStatsBanner />

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {marketTabs.map((tab, i) => (
            <motion.button
              key={tab.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap',
                activeTab === tab.value
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-white'
              )}
            >
              {tab.icon}
              <div className="text-left">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs opacity-60 hidden sm:block">{tab.description}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MarketsPage
