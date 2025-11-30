// ============================================
// TradingHub Pro - Real-Time Market Data Hook
// Uses Binance WebSocket for live crypto data
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Ticker, OHLCV, OrderBook, Trade } from '@/types'
import { binanceClient } from '@/services/api/binance'
import {
  binanceWebSocket,
  type WebSocketTickerData,
  type WebSocketKlineData,
} from '@/services/api/websocket'
import { CRYPTO_MAPPINGS, type CryptoSymbol } from '@/services/api/config'

interface UseRealTimeMarketDataOptions {
  symbol: CryptoSymbol
  enabled?: boolean
  enableWebSocket?: boolean
}

interface UseRealTimeMarketDataReturn {
  ticker: Ticker | null
  ohlcv: OHLCV[]
  orderBook: OrderBook | null
  trades: Trade[]
  isLoading: boolean
  isConnected: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for real-time cryptocurrency market data using Binance
 */
export function useRealTimeMarketData({
  symbol,
  enabled = true,
  enableWebSocket = true,
}: UseRealTimeMarketDataOptions): UseRealTimeMarketDataReturn {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeTicker, setRealtimeTicker] = useState<Ticker | null>(null)
  const [realtimeOhlcv, setRealtimeOhlcv] = useState<OHLCV[]>([])
  const unsubscribeRef = useRef<(() => void)[]>([])

  // Validate symbol
  const isValidSymbol = symbol in CRYPTO_MAPPINGS

  // Fetch initial ticker data
  const {
    data: initialTicker,
    isLoading: isTickerLoading,
    error: tickerError,
    refetch: refetchTicker,
  } = useQuery({
    queryKey: ['ticker', symbol],
    queryFn: () => binanceClient.getTicker(symbol),
    enabled: enabled && isValidSymbol,
    staleTime: 5000,
    refetchInterval: enableWebSocket ? false : 5000,
  })

  // Fetch OHLCV data
  const {
    data: ohlcvData,
    isLoading: isOhlcvLoading,
    error: ohlcvError,
    refetch: refetchOhlcv,
  } = useQuery({
    queryKey: ['ohlcv', symbol],
    queryFn: () => binanceClient.getOHLCV(symbol, '1h', 100),
    enabled: enabled && isValidSymbol,
    staleTime: 60000,
    refetchInterval: 60000,
  })

  // Fetch order book
  const {
    data: orderBook,
    isLoading: isOrderBookLoading,
    error: orderBookError,
  } = useQuery({
    queryKey: ['orderbook', symbol],
    queryFn: () => binanceClient.getOrderBook(symbol, 20),
    enabled: enabled && isValidSymbol,
    staleTime: 1000,
    refetchInterval: 5000,
  })

  // Fetch recent trades
  const {
    data: trades,
    isLoading: isTradesLoading,
    error: tradesError,
  } = useQuery({
    queryKey: ['trades', symbol],
    queryFn: () => binanceClient.getTrades(symbol, 50),
    enabled: enabled && isValidSymbol,
    staleTime: 1000,
    refetchInterval: 5000,
  })

  // WebSocket subscription for real-time ticker updates
  useEffect(() => {
    if (!enabled || !enableWebSocket || !isValidSymbol) {
      return
    }

    // Subscribe to ticker updates
    const unsubscribeTicker = binanceWebSocket.subscribeTicker(
      symbol,
      (data: WebSocketTickerData) => {
        setRealtimeTicker({
          symbol: data.symbol,
          name: CRYPTO_MAPPINGS[symbol]?.name || symbol,
          price: data.price,
          change: data.priceChange,
          changePercent: data.priceChangePercent,
          volume: data.volume,
          high24h: data.high24h,
          low24h: data.low24h,
          lastUpdated: data.timestamp,
        })
        setIsConnected(true)
      }
    )

    // Subscribe to kline updates for live candlestick data
    const unsubscribeKline = binanceWebSocket.subscribeKline(
      symbol,
      '1h',
      (data: WebSocketKlineData) => {
        setRealtimeOhlcv((prev) => {
          if (prev.length === 0) return prev

          const lastCandle = prev[prev.length - 1]
          const newCandle: OHLCV = {
            timestamp: data.timestamp,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: data.volume,
          }

          // Update the last candle if it's the same period
          if (lastCandle && lastCandle.timestamp === data.timestamp) {
            return [...prev.slice(0, -1), newCandle]
          }

          // Add new candle if period closed
          if (data.isClosed) {
            return [...prev.slice(1), newCandle]
          }

          return prev
        })
      }
    )

    unsubscribeRef.current = [unsubscribeTicker, unsubscribeKline]

    return () => {
      unsubscribeRef.current.forEach((unsub) => unsub())
      unsubscribeRef.current = []
      setIsConnected(false)
    }
  }, [symbol, enabled, enableWebSocket, isValidSymbol])

  // Initialize realtime OHLCV from query data
  useEffect(() => {
    if (ohlcvData && ohlcvData.length > 0) {
      setRealtimeOhlcv(ohlcvData)
    }
  }, [ohlcvData])

  const refetch = useCallback(() => {
    refetchTicker()
    refetchOhlcv()
    queryClient.invalidateQueries({ queryKey: ['orderbook', symbol] })
    queryClient.invalidateQueries({ queryKey: ['trades', symbol] })
  }, [refetchTicker, refetchOhlcv, queryClient, symbol])

  // Combine errors
  const error = tickerError || ohlcvError || orderBookError || tradesError

  return {
    ticker: realtimeTicker || initialTicker || null,
    ohlcv: realtimeOhlcv.length > 0 ? realtimeOhlcv : ohlcvData || [],
    orderBook: orderBook || null,
    trades: trades || [],
    isLoading: isTickerLoading || isOhlcvLoading || isOrderBookLoading || isTradesLoading,
    isConnected,
    error: error as Error | null,
    refetch,
  }
}

interface UseMultipleRealTimeTickersOptions {
  symbols: CryptoSymbol[]
  enabled?: boolean
}

interface UseMultipleRealTimeTickersReturn {
  tickers: Record<string, Ticker>
  isLoading: boolean
  isConnected: boolean
  error: Error | null
}

/**
 * Hook for tracking multiple real-time cryptocurrency tickers
 */
export function useMultipleRealTimeTickers({
  symbols,
  enabled = true,
}: UseMultipleRealTimeTickersOptions): UseMultipleRealTimeTickersReturn {
  const [tickers, setTickers] = useState<Record<string, Ticker>>({})
  const [isConnected, setIsConnected] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Validate symbols
  const validSymbols = symbols.filter((s) => s in CRYPTO_MAPPINGS)

  // Fetch initial data
  const {
    data: initialTickers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tickers', validSymbols.join(',')],
    queryFn: () => binanceClient.getMultipleTickers(validSymbols),
    enabled: enabled && validSymbols.length > 0,
    staleTime: 5000,
  })

  // Initialize tickers from query data
  useEffect(() => {
    if (initialTickers) {
      setTickers(initialTickers)
    }
  }, [initialTickers])

  // WebSocket subscription
  useEffect(() => {
    if (!enabled || validSymbols.length === 0) {
      return
    }

    unsubscribeRef.current = binanceWebSocket.subscribeMultipleTickers(
      validSymbols,
      (data) => {
        setTickers((prev) => {
          const updated = { ...prev }
          for (const [symbol, tickerData] of Object.entries(data)) {
            updated[symbol] = {
              symbol,
              name: CRYPTO_MAPPINGS[symbol as CryptoSymbol]?.name || symbol,
              price: tickerData.price,
              change: tickerData.priceChange,
              changePercent: tickerData.priceChangePercent,
              volume: tickerData.volume,
              high24h: tickerData.high24h,
              low24h: tickerData.low24h,
              lastUpdated: tickerData.timestamp,
            }
          }
          return updated
        })
        setIsConnected(true)
      }
    )

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [validSymbols, enabled])

  return {
    tickers,
    isLoading,
    isConnected,
    error: error as Error | null,
  }
}
