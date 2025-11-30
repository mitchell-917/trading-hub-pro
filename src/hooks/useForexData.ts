// ============================================
// TradingHub Pro - Forex & Commodities Data Hooks
// ============================================

import { useQuery, useQueries } from '@tanstack/react-query'
import { ForexAPI, ExchangeRateAPI, type ForexPair, type CommodityPrice } from '../services/api/forex'
import { useCurrency } from '../context/CurrencyContext'

// API Instances
const forexAPI = new ForexAPI()
const exchangeRateAPI = new ExchangeRateAPI()

// ============================================
// Forex Pair Hook
// ============================================
export function useForexPair(fromCurrency: string, toCurrency: string) {
  const { formatPrice } = useCurrency()

  return useQuery({
    queryKey: ['forex', 'pair', fromCurrency, toCurrency],
    queryFn: () => forexAPI.getExchangeRate(fromCurrency, toCurrency),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
    select: (data: ForexPair) => ({
      ...data,
      formattedRate: data.rate.toFixed(4),
      formattedBid: data.bid?.toFixed(4) ?? '-',
      formattedAsk: data.ask?.toFixed(4) ?? '-',
    }),
  })
}

// ============================================
// Major Forex Pairs Hook
// ============================================
export function useMajorForexPairs() {
  return useQuery({
    queryKey: ['forex', 'major-pairs'],
    queryFn: () => forexAPI.getMajorPairs(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// ============================================
// Forex History Hook
// ============================================
export function useForexHistory(
  fromCurrency: string, 
  toCurrency: string,
  interval: 'daily' | 'weekly' | 'monthly' = 'daily'
) {
  return useQuery({
    queryKey: ['forex', 'history', fromCurrency, toCurrency, interval],
    queryFn: () => forexAPI.getForexTimeSeries(fromCurrency, toCurrency, interval),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  })
}

// ============================================
// Commodity Prices Hook
// ============================================
export function useCommodityPrices() {
  const { currency, formatPrice } = useCurrency()

  return useQuery({
    queryKey: ['commodities', 'all'],
    queryFn: () => exchangeRateAPI.getCommodityPrices(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    select: (data: CommodityPrice[]) => 
      data.map(commodity => ({
        ...commodity,
        formattedPrice: formatPrice(commodity.price),
      })),
  })
}

// ============================================
// Gold Price Hook
// ============================================
export function useGoldPrice() {
  const { currency, formatPrice } = useCurrency()

  return useQuery({
    queryKey: ['commodities', 'gold', currency],
    queryFn: async () => {
      const commodities = await exchangeRateAPI.getCommodityPrices()
      return commodities.find(c => c.symbol === 'XAU')
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    select: (data) => data ? {
      ...data,
      formattedPrice: formatPrice(data.price),
    } : null,
  })
}

// ============================================
// Oil Prices Hook
// ============================================
export function useOilPrices() {
  const { formatPrice } = useCurrency()

  return useQuery({
    queryKey: ['commodities', 'oil'],
    queryFn: async () => {
      const commodities = await exchangeRateAPI.getCommodityPrices()
      return commodities.filter(c => 
        c.symbol === 'WTI' || c.symbol === 'BRENT'
      )
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    select: (data) => data.map(oil => ({
      ...oil,
      formattedPrice: formatPrice(oil.price),
    })),
  })
}

// ============================================
// Metals Prices Hook
// ============================================
export function useMetalPrices() {
  const { formatPrice } = useCurrency()

  return useQuery({
    queryKey: ['commodities', 'metals'],
    queryFn: async () => {
      const commodities = await exchangeRateAPI.getCommodityPrices()
      return commodities.filter(c => c.category === 'metals')
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    select: (data) => data.map(metal => ({
      ...metal,
      formattedPrice: formatPrice(metal.price),
    })),
  })
}

// ============================================
// Currency Converter Hook
// ============================================
export function useCurrencyConverter(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  return useQuery({
    queryKey: ['forex', 'convert', amount, fromCurrency, toCurrency],
    queryFn: async () => {
      const pair = await forexAPI.getExchangeRate(fromCurrency, toCurrency)
      return {
        amount,
        fromCurrency,
        toCurrency,
        rate: pair.rate,
        result: amount * pair.rate,
        formattedResult: `${(amount * pair.rate).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${toCurrency}`,
      }
    },
    staleTime: 30 * 1000,
    enabled: amount > 0,
  })
}

// ============================================
// Multiple Currency Rates Hook
// ============================================
export function useMultipleCurrencyRates(baseCurrency: string, targetCurrencies: string[]) {
  return useQueries({
    queries: targetCurrencies.map(target => ({
      queryKey: ['forex', 'pair', baseCurrency, target],
      queryFn: () => forexAPI.getExchangeRate(baseCurrency, target),
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    })),
    combine: (results) => ({
      data: results.map((r, i) => ({
        currency: targetCurrencies[i],
        ...r.data,
      })),
      isLoading: results.some(r => r.isLoading),
      isError: results.some(r => r.isError),
    }),
  })
}

// ============================================
// Forex Watchlist Hook
// ============================================
export function useForexWatchlist(pairs: Array<{ from: string; to: string }>) {
  return useQueries({
    queries: pairs.map(pair => ({
      queryKey: ['forex', 'pair', pair.from, pair.to],
      queryFn: () => forexAPI.getExchangeRate(pair.from, pair.to),
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    })),
    combine: (results) => ({
      data: results.map((r, i) => ({
        pair: `${pairs[i].from}/${pairs[i].to}`,
        ...r.data,
      })),
      isLoading: results.some(r => r.isLoading),
      isError: results.some(r => r.isError),
      refetch: () => results.forEach(r => r.refetch()),
    }),
  })
}

// ============================================
// Crypto vs Fiat Hook
// ============================================
export function useCryptoFiatRate(cryptoSymbol: string, fiatCurrency: string) {
  const { formatPrice } = useCurrency()

  return useQuery({
    queryKey: ['crypto', 'fiat', cryptoSymbol, fiatCurrency],
    queryFn: async () => {
      // For crypto, we'd typically use CoinGecko API
      // This is a placeholder that would integrate with our crypto services
      const mockCryptoRates: Record<string, number> = {
        'BTC': 67500,
        'ETH': 3450,
        'SOL': 142,
        'XRP': 0.52,
        'ADA': 0.45,
      }

      const usdRate = mockCryptoRates[cryptoSymbol] || 0
      
      // Convert to target fiat if not USD
      if (fiatCurrency !== 'USD') {
        const fxPair = await forexAPI.getExchangeRate('USD', fiatCurrency)
        return {
          symbol: cryptoSymbol,
          fiat: fiatCurrency,
          rate: usdRate * fxPair.rate,
          formattedRate: formatPrice(usdRate * fxPair.rate),
        }
      }

      return {
        symbol: cryptoSymbol,
        fiat: fiatCurrency,
        rate: usdRate,
        formattedRate: formatPrice(usdRate),
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// ============================================
// Market Movers Hook (Top gainers/losers)
// ============================================
export function useForexMarketMovers() {
  return useQuery({
    queryKey: ['forex', 'market-movers'],
    queryFn: async () => {
      const majorPairs = await forexAPI.getMajorPairs()
      const sorted = [...majorPairs].sort((a, b) => 
        Math.abs(b.changePercent) - Math.abs(a.changePercent)
      )

      return {
        gainers: sorted.filter(p => p.changePercent > 0).slice(0, 5),
        losers: sorted.filter(p => p.changePercent < 0).slice(0, 5),
        mostVolatile: sorted.slice(0, 5),
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}
