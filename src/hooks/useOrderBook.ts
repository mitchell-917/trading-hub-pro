// ============================================
// TradingHub Pro - Order Book Hook
// Real-time order book with depth visualization
// ============================================

import { useState, useEffect, useRef, useMemo } from 'react'
import type { OrderBook, OrderBookEntry, Trade } from '@/types'
import { generateOrderBook, generateTrades, randomBetween } from '@/lib/mock-data'

interface UseOrderBookOptions {
  symbol: string
  currentPrice: number
  depth?: number
  updateInterval?: number
  enabled?: boolean
}

interface UseOrderBookReturn {
  orderBook: OrderBook | null
  recentTrades: Trade[]
  isLoading: boolean
  error: string | null
  totalBidVolume: number
  totalAskVolume: number
  imbalance: number
  maxDepth: number
}

/**
 * Hook for real-time order book data
 */
export function useOrderBook({
  symbol,
  currentPrice,
  depth = 15,
  updateInterval = 500,
  enabled = true,
}: UseOrderBookOptions): UseOrderBookReturn {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null)
  const [recentTrades, setRecentTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Use refs to store latest values without causing re-renders
  const currentPriceRef = useRef(currentPrice)
  const symbolRef = useRef(symbol)
  
  // Update refs when values change
  useEffect(() => {
    currentPriceRef.current = currentPrice
    symbolRef.current = symbol
  }, [currentPrice, symbol])

  useEffect(() => {
    if (!enabled || !currentPrice) return

    let isMounted = true
    setError(null)

    // Initialize order book
    const initTimeout = setTimeout(() => {
      try {
        const initialOrderBook = generateOrderBook(currentPriceRef.current, depth)
        const initialTrades = generateTrades(symbolRef.current, currentPriceRef.current, 20)
        
        if (isMounted) {
          setOrderBook(initialOrderBook)
          setRecentTrades(initialTrades)
          setIsLoading(false)
        }

        // Start real-time updates
        intervalRef.current = setInterval(() => {
          if (!isMounted) return
          
          setOrderBook((prev) => {
            if (!prev) return prev

            // Simulate order book changes
            const newBids = prev.bids.map((bid: OrderBookEntry) => ({
              ...bid,
              quantity: Number(
                Math.max(0.1, bid.quantity * randomBetween(0.9, 1.1)).toFixed(4)
              ),
            }))

            const newAsks = prev.asks.map((ask: OrderBookEntry) => ({
              ...ask,
              quantity: Number(
                Math.max(0.1, ask.quantity * randomBetween(0.9, 1.1)).toFixed(4)
              ),
            }))

            // Recalculate totals
            let bidTotal = 0
            let askTotal = 0

            newBids.forEach((bid: OrderBookEntry) => {
              bidTotal += bid.quantity * bid.price
              bid.total = Number(bidTotal.toFixed(2))
            })

            newAsks.forEach((ask: OrderBookEntry) => {
              askTotal += ask.quantity * ask.price
              ask.total = Number(askTotal.toFixed(2))
            })

            return { ...prev, bids: newBids, asks: newAsks }
          })

          // Occasionally add new trades
          if (Math.random() > 0.5) {
            const price = currentPriceRef.current
            const newTrade: Trade = {
              id: `trade-${Date.now()}`,
              symbol: symbolRef.current,
              side: Math.random() > 0.5 ? 'buy' : 'sell',
              price: Number(
                (price + randomBetween(-0.5, 0.5)).toFixed(2)
              ),
              quantity: Number(randomBetween(0.01, 2).toFixed(4)),
              timestamp: Date.now(),
              maker: Math.random() > 0.5,
            }

            setRecentTrades((prev) => [newTrade, ...prev.slice(0, 49)])
          }
        }, updateInterval)
      } catch {
        if (isMounted) {
          setError('Failed to connect to order book')
          setIsLoading(false)
        }
      }
    }, 200)

    return () => {
      isMounted = false
      clearTimeout(initTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  // Only re-run when symbol changes or enabled changes, not when currentPrice changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, depth, updateInterval, enabled])

  // Calculate derived values
  const { totalBidVolume, totalAskVolume, imbalance, maxDepth } = useMemo(() => {
    if (!orderBook) {
      return { totalBidVolume: 0, totalAskVolume: 0, imbalance: 0, maxDepth: 0 }
    }

    const bidVolume = orderBook.bids.reduce((sum: number, b: OrderBookEntry) => sum + b.quantity, 0)
    const askVolume = orderBook.asks.reduce((sum: number, a: OrderBookEntry) => sum + a.quantity, 0)
    const total = bidVolume + askVolume
    const imbalanceValue = total > 0 ? (bidVolume - askVolume) / total : 0

    const maxBidQty = Math.max(...orderBook.bids.map((b: OrderBookEntry) => b.quantity))
    const maxAskQty = Math.max(...orderBook.asks.map((a: OrderBookEntry) => a.quantity))

    return {
      totalBidVolume: bidVolume,
      totalAskVolume: askVolume,
      imbalance: imbalanceValue,
      maxDepth: Math.max(maxBidQty, maxAskQty),
    }
  }, [orderBook])

  return {
    orderBook,
    recentTrades,
    isLoading,
    error,
    totalBidVolume,
    totalAskVolume,
    imbalance,
    maxDepth,
  }
}

/**
 * Calculate the depth percentage for visualization
 */
export function getDepthPercentage(
  quantity: number,
  maxDepth: number
): number {
  if (maxDepth === 0) return 0
  return Math.min((quantity / maxDepth) * 100, 100)
}

/**
 * Format order book entry for display
 */
export function formatOrderBookEntry(entry: OrderBookEntry): {
  price: string
  quantity: string
  total: string
} {
  return {
    price: entry.price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    quantity: entry.quantity.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }),
    total: entry.total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  }
}

/**
 * Calculate spread information
 */
export function calculateSpread(
  bids: OrderBookEntry[],
  asks: OrderBookEntry[]
): {
  absolute: number
  percentage: number
  midPrice: number
} {
  if (bids.length === 0 || asks.length === 0) {
    return { absolute: 0, percentage: 0, midPrice: 0 }
  }

  const bestBid = bids[0].price
  const bestAsk = asks[0].price
  const spread = bestAsk - bestBid
  const midPrice = (bestBid + bestAsk) / 2
  const spreadPercent = (spread / midPrice) * 100

  return {
    absolute: spread,
    percentage: spreadPercent,
    midPrice,
  }
}
