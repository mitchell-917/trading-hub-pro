// ============================================
// TradingHub Pro - Market Data Hook
// Real-time market data simulation with WebSocket-like updates
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Ticker, OHLCV } from '@/types'
import {
  generateTicker,
  generateOHLCVData,
  SYMBOLS,
  randomBetween,
} from '@/lib/mock-data'

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

/**
 * Hook for real-time market data with simulated WebSocket updates
 */
export function useMarketData(
  optionsOrSymbol: UseMarketDataOptions | string
): UseMarketDataReturn {
  // Support both string and options object
  const options: UseMarketDataOptions = typeof optionsOrSymbol === 'string' 
    ? { symbol: optionsOrSymbol }
    : optionsOrSymbol
  
  const { symbol, updateInterval = 1000, enabled = true } = options
  
  const [ticker, setTicker] = useState<Ticker | null>(null)
  const [ohlcv, setOhlcv] = useState<OHLCV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectTrigger = useRef(0)

  const reconnect = useCallback(() => {
    // Will be set after connection is established
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsConnected(false)
    // Trigger re-connection via useEffect by updating ref and forcing re-render
    reconnectTrigger.current += 1
    setIsLoading(true)
  }, [])

  useEffect(() => {
    if (!enabled) return

    let isMounted = true

    // Simulate connection delay
    const initTimeout = setTimeout(() => {
      try {
        const initialTicker = generateTicker(symbol)
        const initialOhlcv = generateOHLCVData(symbol, 100)
        
        if (isMounted) {
          setTicker(initialTicker)
          setOhlcv(initialOhlcv)
          setIsConnected(true)
          setIsLoading(false)
        }

        // Start price updates
        intervalRef.current = setInterval(() => {
          if (!isMounted) return
          setTicker((prev) => {
            if (!prev) return prev

            // Simulate price movement
            const priceChange = prev.price * randomBetween(-0.002, 0.002)
            const newPrice = Number((prev.price + priceChange).toFixed(2))
            const change = newPrice - (prev.price - prev.change)
            const changePercent = (change / (prev.price - prev.change)) * 100

            return {
              ...prev,
              price: newPrice,
              change: Number(change.toFixed(2)),
              changePercent: Number(changePercent.toFixed(2)),
              high24h: Math.max(prev.high24h, newPrice),
              low24h: Math.min(prev.low24h, newPrice),
              lastUpdated: Date.now(),
            }
          })
        }, updateInterval)
      } catch {
        // Error handled by setting isLoading to false
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }, 500)

    return () => {
      isMounted = false
      clearTimeout(initTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsConnected(false)
    }
  }, [symbol, updateInterval, enabled])

  return {
    ticker,
    ohlcv,
    isLoading,
    error,
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

/**
 * Hook for tracking multiple tickers simultaneously
 */
export function useMultipleTickers({
  symbols = SYMBOLS.map((s) => s.symbol),
  updateInterval = 1500,
  enabled = true,
}: UseMultipleTickersOptions = {}): UseMultipleTickersReturn {
  const [tickers, setTickers] = useState<Record<string, Ticker>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) return

    let isMounted = true

    // Initialize tickers
    const initTimeout = setTimeout(() => {
      if (!isMounted) return
      
      const initialTickers: Record<string, Ticker> = {}
      symbols.forEach((symbol) => {
        initialTickers[symbol] = generateTicker(symbol)
      })
      setTickers(initialTickers)
      setIsConnected(true)
      setIsLoading(false)

      // Start price updates
      intervalRef.current = setInterval(() => {
        if (!isMounted) return
        setTickers((prev) => {
          const updated = { ...prev }
          
          // Update random subset of tickers
          const updateCount = Math.ceil(symbols.length / 3)
          const shuffled = [...symbols].sort(() => Math.random() - 0.5)
          const toUpdate = shuffled.slice(0, updateCount)

          toUpdate.forEach((symbol) => {
            const ticker = updated[symbol]
            if (!ticker) return

            const priceChange = ticker.price * randomBetween(-0.003, 0.003)
            const newPrice = Number((ticker.price + priceChange).toFixed(2))
            const change = newPrice - (ticker.price - ticker.change)
            const changePercent = (change / (ticker.price - ticker.change)) * 100

            updated[symbol] = {
              ...ticker,
              price: newPrice,
              change: Number(change.toFixed(2)),
              changePercent: Number(changePercent.toFixed(2)),
              high24h: Math.max(ticker.high24h, newPrice),
              low24h: Math.min(ticker.low24h, newPrice),
              lastUpdated: Date.now(),
            }
          })

          return updated
        })
      }, updateInterval)
    }, 300)

    return () => {
      isMounted = false
      clearTimeout(initTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [symbols, updateInterval, enabled])

  return {
    tickers,
    isLoading,
    error,
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
 * Hook for fetching OHLCV (candlestick) data
 */
// Timeframe to milliseconds mapping - defined outside to avoid recreating
const TIMEFRAME_TO_MS: Record<string, number> = {
  '1m': 60000,
  '5m': 300000,
  '15m': 900000,
  '1h': 3600000,
  '4h': 14400000,
  '1d': 86400000,
}

export function useOHLCVData({
  symbol,
  timeframe = '1h',
  count = 100,
  enabled = true,
}: UseOHLCVDataOptions): UseOHLCVDataReturn {
  const [data, setData] = useState<OHLCV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [refetchCounter, setRefetchCounter] = useState(0)

  const refetch = useCallback(() => {
    setRefetchCounter((c) => c + 1)
  }, [])

  useEffect(() => {
    if (!enabled) return

    let isMounted = true

    // Simulate API delay - use setTimeout callback for state updates
    const timeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(true)
      }
      
      try {
        const ohlcvData = generateOHLCVData(
          symbol,
          count,
          TIMEFRAME_TO_MS[timeframe]
        )
        if (isMounted) {
          setData(ohlcvData)
          setIsLoading(false)
        }
      } catch {
        // Error handled by setting isLoading to false
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }, 200)

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [symbol, timeframe, count, enabled, refetchCounter])

  return {
    data,
    isLoading,
    error,
    refetch,
  }
}
