// ============================================
// TradingHub Pro - Trade History Widget
// View past trades and order history
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useTradingStore } from '@/lib/store'
import { formatNumber, cn } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'
import type { Order, OrderStatus } from '@/types'

interface TradeHistoryProps {
  maxVisibleTrades?: number
  className?: string
}

type FilterType = 'all' | 'filled' | 'cancelled' | 'pending'

export function TradeHistory({
  maxVisibleTrades = 10,
  className,
}: TradeHistoryProps) {
  const orders = useTradingStore((s) => s.orders)
  const { formatPrice } = useCurrency()
  
  const [filter, setFilter] = useState<FilterType>('all')
  const [showAll, setShowAll] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter orders based on status
  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders
    if (filter === 'filled') return orders.filter((o: Order) => o.status === 'filled')
    if (filter === 'cancelled') return orders.filter((o: Order) => o.status === 'cancelled')
    if (filter === 'pending') return orders.filter((o: Order) => 
      o.status === 'pending' || o.status === 'open'
    )
    return orders
  }, [orders, filter])

  // Calculate stats
  const stats = useMemo(() => {
    const filledOrders = orders.filter((o: Order) => o.status === 'filled')
    const buyOrders = filledOrders.filter((o: Order) => o.side === 'buy')
    const sellOrders = filledOrders.filter((o: Order) => o.side === 'sell')
    const totalVolume = filledOrders.reduce((sum: number, o: Order) => 
      sum + (o.quantity * (o.price ?? 0)), 0
    )

    return {
      total: orders.length,
      filled: filledOrders.length,
      buys: buyOrders.length,
      sells: sellOrders.length,
      totalVolume,
    }
  }, [orders])

  const displayOrders = showAll 
    ? filteredOrders 
    : filteredOrders.slice(0, maxVisibleTrades)

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'filled', label: 'Filled' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <Card className={cn('p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold">Trade History</h3>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            {filterOptions.find((f) => f.value === filter)?.label}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden"
              >
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value)
                      setIsFilterOpen(false)
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors',
                      filter === option.value && 'bg-indigo-500/20 text-indigo-400'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-400">Total</p>
          <p className="font-semibold number-mono">{stats.total}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-400">Filled</p>
          <p className="font-semibold text-green-400 number-mono">{stats.filled}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-400">Buys</p>
          <p className="font-semibold text-blue-400 number-mono">{stats.buys}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-400">Sells</p>
          <p className="font-semibold text-red-400 number-mono">{stats.sells}</p>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No trade history</p>
          <p className="text-gray-500 text-xs mt-1">
            Your trades will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {displayOrders.map((order, index) => (
                <OrderRow key={order.id} order={order} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {filteredOrders.length > maxVisibleTrades && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1"
            >
              {showAll ? 'Show Less' : `Show ${filteredOrders.length - maxVisibleTrades} More`}
              <ChevronDown className={cn('w-4 h-4', showAll && 'rotate-180')} />
            </button>
          )}
        </>
      )}

      {/* Total Volume Footer */}
      {stats.totalVolume > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Volume</span>
            <span className="font-medium number-mono">
              {formatPrice(stats.totalVolume)}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}

// ============================================
// Order Row Component
// ============================================

interface OrderRowProps {
  order: Order
  index: number
}

function OrderRow({ order, index }: OrderRowProps) {
  const { formatPrice } = useCurrency()
  const isBuy = order.side === 'buy'

  const statusConfig: Record<OrderStatus, { 
    icon: React.ReactNode
    color: 'green' | 'red' | 'yellow' | 'blue' | 'gray'
    label: string 
  }> = {
    filled: { 
      icon: <CheckCircle className="w-3 h-3" />, 
      color: 'green', 
      label: 'Filled' 
    },
    cancelled: { 
      icon: <XCircle className="w-3 h-3" />, 
      color: 'red', 
      label: 'Cancelled' 
    },
    pending: { 
      icon: <Clock className="w-3 h-3" />, 
      color: 'yellow', 
      label: 'Pending' 
    },
    open: { 
      icon: <Clock className="w-3 h-3" />, 
      color: 'blue', 
      label: 'Open' 
    },
    'partially-filled': { 
      icon: <Clock className="w-3 h-3" />, 
      color: 'yellow', 
      label: 'Partial' 
    },
    rejected: { 
      icon: <XCircle className="w-3 h-3" />, 
      color: 'red', 
      label: 'Rejected' 
    },
  }

  const status = statusConfig[order.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          isBuy ? 'bg-green-500/20' : 'bg-red-500/20'
        )}>
          {isBuy ? (
            <ArrowUpRight className="w-4 h-4 text-green-400" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{order.symbol}</span>
            <Badge color={isBuy ? 'green' : 'red'} size="sm">
              {isBuy ? 'BUY' : 'SELL'}
            </Badge>
            <Badge 
              color={status.color} 
              size="sm" 
              className="flex items-center gap-1"
            >
              {status.icon}
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-medium number-mono">
          {formatNumber(order.quantity, 4)}
        </p>
        <p className="text-xs text-gray-400 number-mono">
          @ {formatPrice(order.price ?? 0)}
        </p>
      </div>
    </motion.div>
  )
}
