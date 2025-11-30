// ============================================
// TradingHub Pro - Order Panel Widget
// Place buy/sell orders with advanced options
// ============================================

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Settings, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Tooltip } from '@/components/ui/Tooltip'
import { useTrading } from '@/hooks/useTrading'
import { useTradingStore } from '@/lib/store'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import type { OrderSide, OrderType } from '@/types'

interface OrderPanelProps {
  symbol?: string
  currentPrice?: number
  className?: string
}

export function OrderPanel({
  symbol: propSymbol,
  currentPrice = 0,
  className,
}: OrderPanelProps) {
  const storeSymbol = useTradingStore((s) => s.selectedSymbol)
  const symbol = propSymbol || storeSymbol

  const [side, setSide] = useState<OrderSide>('buy')
  const [orderType, setOrderType] = useState<OrderType>('limit')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')
  const [takeProfitPrice, setTakeProfitPrice] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { placeOrder, isPlacingOrder, balance, buyingPower } = useTrading()

  // Calculate order value
  const orderValue = useMemo(() => {
    const qty = parseFloat(quantity) || 0
    const p = orderType === 'market' ? currentPrice : parseFloat(price) || 0
    return qty * p
  }, [quantity, price, orderType, currentPrice])

  // Calculate percentage of buying power
  const percentOfBuyingPower = useMemo(() => {
    if (!buyingPower || buyingPower === 0) return 0
    return (orderValue / buyingPower) * 100
  }, [orderValue, buyingPower])

  // Quick percentage buttons
  const handleQuickPercent = useCallback((percent: number) => {
    if (!buyingPower) return
    const value = (buyingPower * percent) / 100
    const p = orderType === 'market' ? currentPrice : parseFloat(price) || currentPrice
    if (p > 0) {
      setQuantity((value / p).toFixed(8))
    }
  }, [buyingPower, orderType, currentPrice, price])

  // Handle order submission
  const handleSubmit = useCallback(async () => {
    if (!symbol || !quantity) return

    const orderPrice = orderType === 'market' ? currentPrice : parseFloat(price)
    if (!orderPrice) return

    const orderParams = {
      symbol,
      side,
      type: orderType,
      quantity: parseFloat(quantity),
      price: orderType === 'market' ? undefined : orderPrice,
      stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
      takeProfitPrice: takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
    }

    const result = await placeOrder(orderParams as Parameters<typeof placeOrder>[0])
    if (result) {
      setQuantity('')
      setPrice('')
      setStopPrice('')
      setTakeProfitPrice('')
    }
  }, [symbol, side, orderType, quantity, price, stopPrice, takeProfitPrice, currentPrice, placeOrder])

  const isBuy = side === 'buy'

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Place Order
          <span className="text-sm text-gray-400 font-normal">{symbol}</span>
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          variant={isBuy ? 'success' : 'ghost'}
          size="lg"
          onClick={() => setSide('buy')}
          icon={<ArrowUpCircle className="w-5 h-5" />}
          className={cn(
            'justify-center font-semibold',
            isBuy && 'ring-2 ring-green-500/50'
          )}
        >
          Buy
        </Button>
        <Button
          variant={!isBuy ? 'danger' : 'ghost'}
          size="lg"
          onClick={() => setSide('sell')}
          icon={<ArrowDownCircle className="w-5 h-5" />}
          className={cn(
            'justify-center font-semibold',
            !isBuy && 'ring-2 ring-red-500/50'
          )}
        >
          Sell
        </Button>
      </div>

      {/* Order Type Tabs */}
      <Tabs value={orderType} onChange={(v) => setOrderType(v as OrderType)} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="limit" className="flex-1">Limit</TabsTrigger>
          <TabsTrigger value="market" className="flex-1">Market</TabsTrigger>
          <TabsTrigger value="stop-limit" className="flex-1">Stop</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Order Form */}
      <div className="space-y-4">
        {/* Price Input (for limit/stop orders) */}
        {orderType !== 'market' && (
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">
              {orderType === 'stop-limit' ? 'Limit Price' : 'Price'}
            </label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={currentPrice.toFixed(2)}
              leftIcon={<span className="text-gray-400 text-sm">$</span>}
              className="number-mono"
            />
          </div>
        )}

        {/* Stop Price (for stop orders) */}
        {orderType === 'stop-limit' && (
          <div>
            <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-1">
              Stop Price
              <Tooltip content="Order triggers when price reaches this level">
                <Info className="w-3 h-3" />
              </Tooltip>
            </label>
            <Input
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              placeholder="0.00"
              leftIcon={<span className="text-gray-400 text-sm">$</span>}
              className="number-mono"
            />
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Quantity</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            className="number-mono"
          />
        </div>

        {/* Quick Percent Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => handleQuickPercent(percent)}
              className="py-1.5 text-xs font-medium text-gray-400 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              {percent}%
            </button>
          ))}
        </div>

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4"
            >
              <div>
                <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                  Take Profit
                  <Tooltip content="Automatically close position at profit target">
                    <Info className="w-3 h-3" />
                  </Tooltip>
                </label>
                <Input
                  type="number"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  placeholder="0.00"
                  leftIcon={<TrendingUp className="w-4 h-4 text-green-400" />}
                  className="number-mono"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                  Stop Loss
                  <Tooltip content="Automatically close position to limit losses">
                    <Info className="w-3 h-3" />
                  </Tooltip>
                </label>
                <Input
                  type="number"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  placeholder="0.00"
                  leftIcon={<TrendingDown className="w-4 h-4 text-red-400" />}
                  className="number-mono"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Summary */}
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Order Value</span>
            <span className="number-mono font-medium">
              {formatCurrency(orderValue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Buying Power</span>
            <span className="number-mono text-gray-300">
              {formatCurrency(buyingPower)}
            </span>
          </div>
          {percentOfBuyingPower > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  percentOfBuyingPower <= 50
                    ? 'bg-green-500'
                    : percentOfBuyingPower <= 80
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                )}
                style={{ width: `${Math.min(percentOfBuyingPower, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Warning for high percentage */}
        {percentOfBuyingPower > 80 && (
          <div className="flex items-start gap-2 text-xs text-yellow-400 bg-yellow-500/10 rounded-lg p-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This order uses {percentOfBuyingPower.toFixed(0)}% of your buying power.
              Consider diversifying your risk.
            </span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          variant={isBuy ? 'success' : 'danger'}
          size="lg"
          fullWidth
          onClick={handleSubmit}
          loading={isPlacingOrder}
          disabled={!quantity || (orderType !== 'market' && !price)}
          className="font-semibold"
        >
          {isBuy ? 'Buy' : 'Sell'} {symbol}
        </Button>
      </div>
    </Card>
  )
}
