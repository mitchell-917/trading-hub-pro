// ============================================
// TradingHub Pro - Dashboard Page
// Main trading dashboard view
// ============================================

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Percent,
  Zap,
  RefreshCw,
} from 'lucide-react'
import {
  ContentContainer,
  DashboardGrid,
  ChartSection,
  SideSection,
  FullWidthSection,
  Panel,
} from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { CandlestickChart } from '@/components/charts/CandlestickChart'
import { TradingAreaChart } from '@/components/charts/AreaChart'
import { RSIChart } from '@/components/charts/RSIChart'
import { DepthChart } from '@/components/charts/DepthChart'
import { OrderPanel } from '@/components/widgets/OrderPanel'
import { PositionManager } from '@/components/widgets/PositionManager'
import { Watchlist } from '@/components/widgets/Watchlist'
import { TradeHistory } from '@/components/widgets/TradeHistory'
import { AISignalPanel } from '@/components/widgets/AISignalPanel'
import { useMarketData } from '@/hooks/useMarketData'
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators'
import { useOrderBook } from '@/hooks/useOrderBook'
import { useTradingStore } from '@/lib/store'
import { formatCurrency, formatPercentage, cn } from '@/lib/utils'

export function Dashboard() {
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol)
  const setSelectedSymbol = useTradingStore((s) => s.setSelectedSymbol)
  const portfolio = useTradingStore((s) => s.getPortfolioValue())

  const { ticker, ohlcv, isLoading: isMarketLoading } = useMarketData(selectedSymbol)
  const { rsi, macd, bollinger, sma } = useTechnicalIndicators(ohlcv)
  const { bids, asks, spread } = useOrderBook(selectedSymbol)

  const [chartType, setChartType] = useState<'candles' | 'area'>('candles')
  const [timeframe, setTimeframe] = useState('1H')

  // Stats cards data
  const statsCards = useMemo(() => [
    {
      title: 'Portfolio Value',
      value: formatCurrency(portfolio.totalValue),
      change: portfolio.dailyPnLPercent,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'indigo',
    },
    {
      title: "Today's P&L",
      value: formatCurrency(portfolio.dailyPnL),
      change: portfolio.dailyPnLPercent,
      icon: portfolio.dailyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
      color: portfolio.dailyPnL >= 0 ? 'green' : 'red',
    },
    {
      title: 'Open Positions',
      value: portfolio.positionsCount.toString(),
      subtext: `${formatCurrency(portfolio.unrealizedPnL)} unrealized`,
      icon: <Activity className="w-5 h-5" />,
      color: 'purple',
    },
    {
      title: 'Win Rate',
      value: '68.5%',
      subtext: 'Last 30 days',
      icon: <Percent className="w-5 h-5" />,
      color: 'blue',
    },
  ], [portfolio])

  // Transform OHLCV data for area chart
  const areaChartData = useMemo(() => {
    return ohlcv.map((candle) => ({
      timestamp: candle.timestamp,
      value: candle.close,
    }))
  }, [ohlcv])

  // Transform RSI data
  const rsiData = useMemo(() => {
    return rsi.map((value, index) => ({
      timestamp: ohlcv[index]?.timestamp || Date.now() - (rsi.length - index) * 60000,
      value,
    }))
  }, [rsi, ohlcv])

  return (
    <ContentContainer
      title="Dashboard"
      subtitle={`Welcome back! Here's your trading overview.`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            className="text-gray-400"
          >
            Refresh
          </Button>
          <Badge color="green" pulsing className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Live
          </Badge>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 number-mono">{stat.value}</p>
                  {stat.change !== undefined && (
                    <p className={cn(
                      'text-sm mt-1 number-mono',
                      stat.change >= 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {stat.change >= 0 ? '+' : ''}{formatPercentage(stat.change)}
                    </p>
                  )}
                  {stat.subtext && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                  )}
                </div>
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  stat.color === 'indigo' && 'bg-indigo-500/20 text-indigo-400',
                  stat.color === 'green' && 'bg-green-500/20 text-green-400',
                  stat.color === 'red' && 'bg-red-500/20 text-red-400',
                  stat.color === 'purple' && 'bg-purple-500/20 text-purple-400',
                  stat.color === 'blue' && 'bg-blue-500/20 text-blue-400'
                )}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <DashboardGrid>
        {/* Main Chart Section */}
        <ChartSection>
          <Panel title={selectedSymbol} noPadding>
            {/* Chart Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Current Price */}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-3xl font-bold number-mono">
                      {ticker ? formatCurrency(ticker.price) : '-'}
                    </p>
                    {ticker && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-sm font-medium number-mono',
                          (ticker.priceChange24h ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          {(ticker.priceChange24h ?? 0) >= 0 ? '+' : ''}
                          {formatCurrency(ticker.priceChange24h ?? 0)}
                        </span>
                        <span className={cn(
                          'text-sm number-mono',
                          (ticker.priceChangePercent24h ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          ({formatPercentage(ticker.priceChangePercent24h ?? 0)})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* High/Low */}
                  <div className="hidden sm:block text-sm">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-gray-400">H: </span>
                        <span className="text-green-400 number-mono">
                          {ticker ? formatCurrency(ticker.high24h) : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">L: </span>
                        <span className="text-red-400 number-mono">
                          {ticker ? formatCurrency(ticker.low24h) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setChartType('candles')}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-md transition-colors',
                        chartType === 'candles' 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-400 hover:text-white'
                      )}
                    >
                      Candles
                    </button>
                    <button
                      onClick={() => setChartType('area')}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-md transition-colors',
                        chartType === 'area' 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-400 hover:text-white'
                      )}
                    >
                      Area
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chart */}
            <div className="p-4">
              {chartType === 'candles' ? (
                <CandlestickChart data={ohlcv} height={400} />
              ) : (
                <TradingAreaChart data={areaChartData} height={400} />
              )}
            </div>

            {/* Technical Indicators */}
            <div className="p-4 border-t border-gray-800">
              <Tabs defaultValue="rsi">
                <TabsList>
                  <TabsTrigger value="rsi">RSI</TabsTrigger>
                  <TabsTrigger value="depth">Order Book Depth</TabsTrigger>
                </TabsList>
                <TabsContent value="rsi" className="mt-4">
                  <RSIChart data={rsiData} height={100} />
                </TabsContent>
                <TabsContent value="depth" className="mt-4">
                  <DepthChart 
                    bids={bids} 
                    asks={asks} 
                    midPrice={ticker?.price}
                    height={100} 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </Panel>
        </ChartSection>

        {/* Right Sidebar */}
        <SideSection>
          {/* Order Panel */}
          <OrderPanel 
            symbol={selectedSymbol} 
            currentPrice={ticker?.price || 0} 
          />

          {/* AI Signals */}
          <AISignalPanel symbol={selectedSymbol} />
        </SideSection>

        {/* Full Width Bottom Section */}
        <FullWidthSection>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Positions */}
            <PositionManager maxVisiblePositions={3} />

            {/* Watchlist */}
            <Watchlist onSelectSymbol={setSelectedSymbol} />

            {/* Trade History */}
            <TradeHistory maxVisibleTrades={5} />
          </div>
        </FullWidthSection>
      </DashboardGrid>
    </ContentContainer>
  )
}
