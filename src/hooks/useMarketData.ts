// ============================================
// TradingHub Pro - Market Data Hook
// Real-time market data from Binance API
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Ticker, OHLCV } from '@/types'
import { binanceClient } from '@/services/api/binance'
import {
  binanceWebSocket,
  type WebSocketTickerData,
} from '@/services/api/websocket'
import { CRYPTO_MAPPINGS, type CryptoSymbol } from '@/services/api/config'

interface UseMarketDataOptions {
  symbol: string
  updateInterval?: number
  enabled?: boolean
}

interface UseMarketDataReturn {
  ticker: Ticker | null
  ohlcv: OHLCV[]
  isLoading: boolean
  error: string | null
  isConnected: boolean
  reconnect: () => void
}

// Check if a symbol is a valid crypto symbol
function isCryptoSymbol(symbol: string): symbol is CryptoSymbol {
  return symbol in CRYPTO_MAPPINGS
}

/**
 * Hook for real-time market data from Binance
 */
export function useMarketData(
  optionsOrSymbol: UseMarketDataOptions | string
): UseMarketDataReturn {
  // Support both string and options object
  const options: UseMarketDataOptions = typeof optionsOrSymbol === 'string' 
    ? { symbol: optionsOrSymbol }
    : optionsOrSymbol
  
  const { symbol, enabled = true } = options
  const queryClient = useQueryClient()
  
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeTicker, setRealtimeTicker] = useState<Ticker | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  
  // Check if it's a crypto symbol we support
  const isValidSymbol = isCryptoSymbol(symbol)

  // Fetch ticker data from Binance
  const {
    data: initialTicker,
    isLoading: isTickerLoading,
    error: tickerError,
    refetch: refetchTicker,
  } = useQuery({
    queryKey: ['binance-ticker', symbol],
    queryFn: () => binanceClient.getTicker(symbol as CryptoSymbol),
    enabled: enabled && isValidSymbol,
    staleTime: 5000,
    refetchInterval: 10000, // Fallback refetch every 10s if WebSocket fails
  })

  // Fetch OHLCV data from Binance
  const {
    data: ohlcvData,
    isLoading: isOhlcvLoading,
    error: ohlcvError,
  } = useQuery({
    queryKey: ['binance-ohlcv', symbol],
    queryFn: () => binanceClient.getOHLCV(symbol as CryptoSymbol, '1h', 100),
    enabled: enabled && isValidSymbol,
    staleTime: 60000,
    refetchInterval: 60000, // Refetch every minute
  })

  // WebSocket subscription for real-time ticker updates
  useEffect(() => {
    if (!enabled || !isValidSymbol) {
      return
    }

    // Subscribe to ticker updates
    unsubscribeRef.current = binanceWebSocket.subscribeTicker(
      symbol as CryptoSymbol,
      (data: WebSocketTickerData) => {
        setRealtimeTicker({
          symbol: data.symbol,
          name: CRYPTO_MAPPINGS[symbol as CryptoSymbol]?.name || symbol,
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

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [symbol, enabled, isValidSymbol])

  const reconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
    setIsConnected(false)
    refetchTicker()
    queryClient.invalidateQueries({ queryKey: ['binance-ohlcv', symbol] })
  }, [refetchTicker, queryClient, symbol])

  // Combine errors
  const error = tickerError || ohlcvError
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null

  return {
    ticker: realtimeTicker || initialTicker || null,
    ohlcv: ohlcvData || [],
    isLoading: isTickerLoading || isOhlcvLoading,
    error: errorMessage,
    isConnected,
    reconnect,
  }
}

interface UseMultipleTickersOptions {
  symbols?: string[]
  updateInterval?: number
  enabled?: boolean
}

interface UseMultipleTickersReturn {
  tickers: Record<string, Ticker>
  isLoading: boolean
  error: string | null
  isConnected: boolean
}

// Default crypto symbols
const DEFAULT_CRYPTO_SYMBOLS: CryptoSymbol[] = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA']

/**
 * Hook for tracking multiple tickers simultaneously from Binance
 */
export function useMultipleTickers({
  symbols = DEFAULT_CRYPTO_SYMBOLS,
  enabled = true,
}: UseMultipleTickersOptions = {}): UseMultipleTickersReturn {
  const [tickers, setTickers] = useState<Record<string, Ticker>>({})
  const [isConnected, setIsConnected] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Filter to valid crypto symbols only
  const validSymbols = symbols.filter(isCryptoSymbol) as CryptoSymbol[]

  // Fetch initial data
  const {
    data: initialTickers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['binance-tickers', validSymbols.join(',')],
    queryFn: () => binanceClient.getMultipleTickers(validSymbols),
    enabled: enabled && validSymbols.length > 0,
    staleTime: 5000,
    refetchInterval: 10000,
  })

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

  // Merge initial tickers with real-time updates
  const mergedTickers = { ...initialTickers, ...tickers }
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null

  return {
    tickers: mergedTickers,
    isLoading,
    error: errorMessage,
    isConnected,
  }
}

interface UseOHLCVDataOptions {
  symbol: string
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  count?: number
  enabled?: boolean
}

interface UseOHLCVDataReturn {
  data: OHLCV[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook for fetching OHLCV (candlestick) data from Binance
 */
export function useOHLCVData({
  symbol,
  timeframe = '1h',
  count = 100,
  enabled = true,
}: UseOHLCVDataOptions): UseOHLCVDataReturn {
  const queryClient = useQueryClient()
  const isValidSymbol = isCryptoSymbol(symbol)

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['binance-ohlcv', symbol, timeframe, count],
    queryFn: () => binanceClient.getOHLCV(symbol as CryptoSymbol, timeframe, count),
    enabled: enabled && isValidSymbol,
    staleTime: 60000,
    refetchInterval: 60000,
  })

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['binance-ohlcv', symbol, timeframe, count] })
  }, [queryClient, symbol, timeframe, count])

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null

  return {
    data: data || [],
    isLoading,
    error: errorMessage,
    refetch,
  }
}
