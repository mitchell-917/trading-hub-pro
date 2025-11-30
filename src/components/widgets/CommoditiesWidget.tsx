// ============================================
// TradingHub Pro - Commodities Widget Component
// ============================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gem,
  Droplets,
  Wheat,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Flame,
  Coins,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'
import { useCommodityPrices, useGoldPrice, useOilPrices, useMetalPrices } from '../../hooks/useForexData'
import { useCurrency } from '../../context/CurrencyContext'
import { cn } from '../../lib/utils'

// ============================================
// Commodity Icons
// ============================================
const getCommodityIcon = (symbol: string, category: string) => {
  if (symbol === 'XAU' || symbol === 'XAG' || symbol === 'XPT' || symbol === 'XPD') {
    return <Gem className="w-5 h-5" />
  }
  if (symbol === 'WTI' || symbol === 'BRENT' || category === 'energy') {
    return <Flame className="w-5 h-5" />
  }
  if (category === 'agricultural') {
    return <Wheat className="w-5 h-5" />
  }
  return <Coins className="w-5 h-5" />
}

const getCommodityColor = (symbol: string, category: string): string => {
  if (symbol === 'XAU') return 'text-yellow-400 bg-yellow-500/20'
  if (symbol === 'XAG') return 'text-slate-300 bg-slate-400/20'
  if (symbol === 'XPT' || symbol === 'XPD') return 'text-indigo-400 bg-indigo-500/20'
  if (symbol === 'WTI' || symbol === 'BRENT') return 'text-amber-400 bg-amber-500/20'
  if (category === 'agricultural') return 'text-green-400 bg-green-500/20'
  return 'text-blue-400 bg-blue-500/20'
}

// ============================================
// Commodity Card
// ============================================
interface CommodityCardProps {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  category: string
  unit: string
  formattedPrice?: string
}

function CommodityCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  category,
  unit,
  formattedPrice,
}: CommodityCardProps) {
  const isPositive = change >= 0
  const colorClass = getCommodityColor(symbol, category)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'p-4 rounded-xl border transition-all duration-200',
        'bg-slate-800/50 border-slate-700/50',
        'hover:shadow-lg hover:shadow-black/20'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          colorClass
        )}>
          {getCommodityIcon(symbol, category)}
        </div>
        <Badge 
          variant={isPositive ? 'success' : 'destructive'}
          className="text-xs"
        >
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </Badge>
      </div>

      <div className="space-y-1">
        <h4 className="font-semibold text-white text-sm">{name}</h4>
        <div className="text-xs text-slate-500">{symbol} • {unit}</div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-xl font-bold text-white">
          {formattedPrice || `$${price.toLocaleString()}`}
        </span>
        <div className={cn(
          'flex items-center gap-1 text-xs',
          isPositive ? 'text-emerald-400' : 'text-red-400'
        )}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{isPositive ? '+' : ''}{change.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Gold Spotlight
// ============================================
function GoldSpotlight() {
  const { data: goldData, isLoading } = useGoldPrice()

  if (isLoading) {
    return (
      <div className="h-24 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl animate-pulse" />
    )
  }

  if (!goldData) return null

  const isPositive = goldData.changePercent >= 0

  return (
    <Card className="p-5 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-yellow-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Gem className="w-7 h-7 text-yellow-400" />
          </div>
          <div>
            <div className="text-sm text-yellow-400/80 font-medium">GOLD (XAU/USD)</div>
            <div className="text-3xl font-bold text-white">
              {goldData.formattedPrice}
            </div>
            <div className="text-xs text-slate-400">per troy ounce</div>
          </div>
        </div>

        <div className="text-right">
          <div className={cn(
            'text-2xl font-bold flex items-center gap-2 justify-end',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {isPositive ? (
              <TrendingUp className="w-6 h-6" />
            ) : (
              <TrendingDown className="w-6 h-6" />
            )}
            {isPositive ? '+' : ''}{goldData.changePercent.toFixed(2)}%
          </div>
          <div className="text-sm text-slate-400">
            {isPositive ? '+' : ''}{goldData.change.toFixed(2)} today
          </div>
        </div>
      </div>
    </Card>
  )
}

// ============================================
// Oil Prices Section
// ============================================
function OilPricesSection() {
  const { data: oilData, isLoading } = useOilPrices()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-slate-700/30 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Flame className="w-4 h-4 text-amber-400" />
        Crude Oil
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {oilData?.map((oil, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <div className="text-xs text-amber-400 font-medium mb-1">
              {oil.name}
            </div>
            <div className="text-xl font-bold text-white">
              {oil.formattedPrice}
            </div>
            <div className={cn(
              'text-xs mt-1',
              oil.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {oil.changePercent >= 0 ? '+' : ''}{oil.changePercent.toFixed(2)}%
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Metals Section
// ============================================
function MetalsSection() {
  const { data: metals, isLoading } = useMetalPrices()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-slate-700/30 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Gem className="w-4 h-4 text-indigo-400" />
        Precious Metals
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metals?.map((metal, i) => (
          <CommodityCard
            key={i}
            symbol={metal.symbol}
            name={metal.name}
            price={metal.price}
            change={metal.change}
            changePercent={metal.changePercent}
            category={metal.category}
            unit={metal.unit}
            formattedPrice={metal.formattedPrice}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Main Commodities Widget
// ============================================
interface CommoditiesWidgetProps {
  compact?: boolean
  className?: string
}

type TabType = 'all' | 'metals' | 'energy' | 'agricultural'

export function CommoditiesWidget({ compact = false, className }: CommoditiesWidgetProps) {
  const { data: commodities, isLoading, refetch, isFetching } = useCommodityPrices()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const { formatPrice } = useCurrency()

  const filteredCommodities = commodities?.filter(c => {
    if (activeTab === 'all') return true
    return c.category === activeTab
  })

  if (compact) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-white">Commodities</h3>
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
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-slate-700/30 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {commodities?.slice(0, 4).map((commodity, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded bg-slate-800/30"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    getCommodityColor(commodity.symbol, commodity.category)
                  )}>
                    {getCommodityIcon(commodity.symbol, commodity.category)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{commodity.symbol}</div>
                    <div className="text-xs text-slate-500">{commodity.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {commodity.formattedPrice}
                  </div>
                  <div className={cn(
                    'text-xs',
                    commodity.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    )
  }

  const tabs: { value: TabType; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <Coins className="w-4 h-4" /> },
    { value: 'metals', label: 'Metals', icon: <Gem className="w-4 h-4" /> },
    { value: 'energy', label: 'Energy', icon: <Flame className="w-4 h-4" /> },
    { value: 'agricultural', label: 'Agriculture', icon: <Wheat className="w-4 h-4" /> },
  ]

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Gem className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Commodities</h3>
            <p className="text-sm text-slate-400">Metals, Energy & Agriculture</p>
          </div>
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

      {/* Gold Spotlight */}
      <div className="mb-6">
        <GoldSpotlight />
      </div>

      {/* Oil Prices */}
      <div className="mb-6">
        <OilPricesSection />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.value)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Commodities Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i}
                className="h-32 bg-slate-700/30 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredCommodities?.map((commodity, i) => (
              <CommodityCard
                key={commodity.symbol}
                symbol={commodity.symbol}
                name={commodity.name}
                price={commodity.price}
                change={commodity.change}
                changePercent={commodity.changePercent}
                category={commodity.category}
                unit={commodity.unit}
                formattedPrice={commodity.formattedPrice}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-slate-500 text-center">
        Commodity prices are delayed by 15 minutes • Prices in your local currency
      </div>
    </Card>
  )
}

export default CommoditiesWidget
