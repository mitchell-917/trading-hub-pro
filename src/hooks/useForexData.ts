// ============================================
// TradingHub Pro - Forex & Commodities Data Hooks
// ============================================

import { useQuery } from '@tanstack/react-query'
import { forexAPI, FOREX_PAIRS, COMMODITIES } from '../services/api/forex'

// ============================================
// Forex Pair Hook
// ============================================
export function useForexPair(base: string, quote: string) {
  return useQuery({
    queryKey: ['forex', 'pair', base, quote],
    queryFn: () => forexAPI.getForexPair(base, quote),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  })
}

// ============================================
// Major Forex Pairs Hook
// ============================================
export function useMajorForexPairs() {
  return useQuery({
    queryKey: ['forex', 'major-pairs'],
    queryFn: async () => {
      const ratesMap = await forexAPI.getMajorPairs()
      const pairs = Object.entries(FOREX_PAIRS.major).map(([symbol, info]) => {
        const rate = ratesMap.get(symbol)
        return {
          symbol,
          name: info.name,
          base: info.base,
          quote: info.quote,
          rate: rate?.rate ?? 0,
          change24h: rate?.change24h ?? 0,
          changePercent24h: rate?.changePercent24h ?? 0,
          high24h: rate?.high24h ?? 0,
          low24h: rate?.low24h ?? 0,
          lastUpdate: rate?.lastUpdate ?? Date.now(),
        }
      })
      return pairs
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// ============================================
// Commodity Prices (simulated with FX rates)
// ============================================
export function useCommodityPrices() {
  return useQuery({
    queryKey: ['commodities', 'all'],
    queryFn: async () => {
      // Commodities are typically quoted in USD
      // We simulate prices based on typical market values
      const metals = Object.entries(COMMODITIES.metals).map(([symbol, info]) => {
        // Base prices for simulation
        const basePrices: Record<string, number> = {
          XAUUSD: 2350,
          XAGUSD: 27.50,
          XPTUSD: 985,
          XPDUSD: 945,
        }
        const basePrice = basePrices[symbol] ?? 100
        // Add some randomness for realism
        const variation = (Math.random() - 0.5) * basePrice * 0.01
        const price = basePrice + variation
        const change = (Math.random() - 0.5) * basePrice * 0.02
        
        return {
          symbol,
          name: info.name,
          unit: info.unit,
          price,
          change24h: change,
          changePercent24h: (change / price) * 100,
          category: 'metals' as const,
        }
      })

      const energy = Object.entries(COMMODITIES.energy).map(([symbol, info]) => {
        const basePrices: Record<string, number> = {
          WTIUSD: 78.50,
          BRENTUSD: 82.30,
          NATGASUSD: 2.85,
        }
        const basePrice = basePrices[symbol] ?? 50
        const variation = (Math.random() - 0.5) * basePrice * 0.01
        const price = basePrice + variation
        const change = (Math.random() - 0.5) * basePrice * 0.03
        
        return {
          symbol,
          name: info.name,
          unit: info.unit,
          price,
          change24h: change,
          changePercent24h: (change / price) * 100,
          category: 'energy' as const,
        }
      })

      return { metals, energy }
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  })
}

// ============================================
// Gold Price Hook
// ============================================
export function useGoldPrice() {
  return useQuery({
    queryKey: ['commodities', 'gold'],
    queryFn: async () => {
      const basePrice = 2350
      const variation = (Math.random() - 0.5) * basePrice * 0.005
      const price = basePrice + variation
      const change = (Math.random() - 0.5) * basePrice * 0.015
      
      return {
        symbol: 'XAUUSD',
        name: 'Gold',
        price,
        change24h: change,
        changePercent24h: (change / price) * 100,
        unit: 'oz',
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// ============================================
// Oil Prices Hook
// ============================================
export function useOilPrices() {
  return useQuery({
    queryKey: ['commodities', 'oil'],
    queryFn: async () => {
      const wtiBase = 78.50
      const brentBase = 82.30
      
      return [
        {
          symbol: 'WTIUSD',
          name: 'WTI Crude',
          price: wtiBase + (Math.random() - 0.5) * 0.5,
          change24h: (Math.random() - 0.5) * 2,
          changePercent24h: (Math.random() - 0.5) * 2.5,
          unit: 'bbl',
        },
        {
          symbol: 'BRENTUSD',
          name: 'Brent Crude',
          price: brentBase + (Math.random() - 0.5) * 0.5,
          change24h: (Math.random() - 0.5) * 2,
          changePercent24h: (Math.random() - 0.5) * 2.5,
          unit: 'bbl',
        },
      ]
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// ============================================
// Metal Prices Hook
// ============================================
export function useMetalPrices() {
  return useQuery({
    queryKey: ['commodities', 'metals'],
    queryFn: async () => {
      const metals = [
        { symbol: 'XAUUSD', name: 'Gold', basePrice: 2350 },
        { symbol: 'XAGUSD', name: 'Silver', basePrice: 27.50 },
        { symbol: 'XPTUSD', name: 'Platinum', basePrice: 985 },
        { symbol: 'XPDUSD', name: 'Palladium', basePrice: 945 },
      ]

      return metals.map((metal) => ({
        symbol: metal.symbol,
        name: metal.name,
        price: metal.basePrice + (Math.random() - 0.5) * metal.basePrice * 0.005,
        change24h: (Math.random() - 0.5) * metal.basePrice * 0.015,
        changePercent24h: (Math.random() - 0.5) * 1.5,
        unit: 'oz',
      }))
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// ============================================
// Exchange Rates Hook (for currency conversion)
// ============================================
export function useExchangeRates(baseCurrency = 'USD') {
  return useQuery({
    queryKey: ['forex', 'rates', baseCurrency],
    queryFn: () => forexAPI.getRates(baseCurrency),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })
}

// ============================================
// Forex Market Status Hook
// ============================================
export function useForexMarketStatus() {
  return {
    isOpen: forexAPI.isForexMarketOpen(),
    message: forexAPI.isForexMarketOpen() 
      ? 'Forex market is open' 
      : 'Forex market is closed (Weekend)',
  }
}

// Export constants for use in components
export { FOREX_PAIRS, COMMODITIES }
