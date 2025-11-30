// ============================================
// TradingHub Pro - Stock Market Data Hook
// Real-time stock data with currency conversion
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { stockAPI, STOCK_SYMBOLS, type StockQuote } from '@/services/api/stocks'
import { useCurrency } from '@/context/CurrencyContext'

interface UseStockDataOptions {
  symbol: string
  interval?: '1min' | '5min' | '15min' | '30min' | '60min'
  refetchInterval?: number
  enabled?: boolean
}

interface UseStockDataResult {
  quote: StockQuote | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
  formattedPrice: string
  formattedChange: string
  marketSession: string
  isMarketOpen: boolean
}

/**
 * Hook for fetching real-time stock quotes with currency conversion
 */
export function useStockQuote({
  symbol,
  refetchInterval = 60000, // 1 minute default (Alpha Vantage rate limits)
  enabled = true,
}: Omit<UseStockDataOptions, 'interval'>): UseStockDataResult {
  const { formatPrice } = useCurrency()
  const [marketSession, setMarketSession] = useState<string>('closed')

  const {
    data: quote,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['stock-quote', symbol],
    queryFn: () => stockAPI.getQuote(symbol),
    refetchInterval: enabled ? refetchInterval : false,
    enabled,
    staleTime: 30000,
  })

  // Update market session
  useEffect(() => {
    const updateSession = () => {
      setMarketSession(stockAPI.getMarketSession())
    }
    updateSession()
    const interval = setInterval(updateSession, 60000)
    return () => clearInterval(interval)
  }, [])

  const formattedPrice = quote ? formatPrice(quote.price) : '--'
  const formattedChange = quote 
    ? `${quote.change >= 0 ? '+' : ''}${formatPrice(quote.change)} (${quote.changePercent.toFixed(2)}%)`
    : '--'

  return {
    quote: quote || null,
    isLoading,
    error: error as Error | null,
    refetch,
    formattedPrice,
    formattedChange,
    marketSession,
    isMarketOpen: stockAPI.isMarketOpen(),
  }
}

/**
 * Hook for fetching historical stock data
 */
export function useStockHistory({
  symbol,
  interval = '5min',
  enabled = true,
}: UseStockDataOptions) {
  const { formatPrice } = useCurrency()

  const {
    data: klines,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['stock-history', symbol, interval],
    queryFn: () => stockAPI.getIntradayData(symbol, interval),
    enabled,
    staleTime: 60000,
  })

  const ohlcvData = useMemo(() => {
    return klines ? stockAPI.klineToOHLCV(klines) : []
  }, [klines])

  const { high, low, change, changePercent } = useMemo(() => {
    if (!klines || klines.length === 0) {
      return { high: 0, low: 0, change: 0, changePercent: 0 }
    }
    
    const allHighs = klines.map(k => k.high)
    const allLows = klines.map(k => k.low)
    const first = klines[0]
    const last = klines[klines.length - 1]
    
    return {
      high: Math.max(...allHighs),
      low: Math.min(...allLows),
      change: last.close - first.open,
      changePercent: ((last.close - first.open) / first.open) * 100,
    }
  }, [klines])

  return {
    klines: klines || [],
    ohlcvData,
    isLoading,
    error: error as Error | null,
    refetch,
    high,
    low,
    change,
    changePercent,
    formatPrice,
  }
}

/**
 * Hook for fetching multiple stock quotes (e.g., watchlist)
 */
export function useMultipleStockQuotes(symbols: string[], enabled = true) {
  const { formatPrice } = useCurrency()
  const queryClient = useQueryClient()

  const {
    data: quotes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['stock-quotes-multiple', symbols.join(',')],
    queryFn: async () => {
      const results: Record<string, StockQuote> = {}
      for (const symbol of symbols) {
        const quote = await stockAPI.getQuote(symbol)
        if (quote) {
          results[symbol] = quote
        }
      }
      return results
    },
    enabled: enabled && symbols.length > 0,
    staleTime: 30000,
    refetchInterval: 60000,
  })

  const prefetchQuote = useCallback((symbol: string) => {
    queryClient.prefetchQuery({
      queryKey: ['stock-quote', symbol],
      queryFn: () => stockAPI.getQuote(symbol),
    })
  }, [queryClient])

  return {
    quotes: quotes || {},
    isLoading,
    error: error as Error | null,
    refetch,
    formatPrice,
    prefetchQuote,
  }
}

/**
 * Hook for searching stock symbols
 */
export function useStockSearch(query: string, enabled = true) {
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['stock-search', query],
    queryFn: () => stockAPI.searchSymbols(query),
    enabled: enabled && query.length >= 2,
    staleTime: 300000, // 5 minutes cache for search results
  })

  return {
    results: results || [],
    isLoading,
    error: error as Error | null,
  }
}

/**
 * Hook for popular market indices
 */
export function useMarketIndices() {
  const indices = Object.keys(STOCK_SYMBOLS.indices) as Array<keyof typeof STOCK_SYMBOLS.indices>
  
  return useMultipleStockQuotes(indices)
}

/**
 * Hook for daily historical data
 */
export function useStockDailyHistory(symbol: string, outputSize: 'compact' | 'full' = 'compact') {
  const {
    data: klines,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['stock-daily', symbol, outputSize],
    queryFn: () => stockAPI.getDailyData(symbol, outputSize),
    staleTime: 3600000, // 1 hour cache for daily data
  })

  const ohlcvData = useMemo(() => {
    return klines ? stockAPI.klineToOHLCV(klines) : []
  }, [klines])

  return {
    klines: klines || [],
    ohlcvData,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}
