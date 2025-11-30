// ============================================
// TradingHub Pro - Currency Conversion Hook
// Provides easy currency conversion throughout the app
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { useCurrency } from '@/context/CurrencyContext'
import {
  fetchExchangeRates,
  convertCurrency,
  getExchangeRate,
} from '@/services/exchangeRates'

interface UseExchangeRatesReturn {
  rates: Record<string, number>
  isLoading: boolean
  error: Error | null
  convert: (amount: number, from?: string, to?: string) => number
  getRate: (from: string, to: string) => number
  refresh: () => Promise<void>
}

/**
 * Hook for exchange rates and currency conversion
 */
export function useExchangeRates(): UseExchangeRatesReturn {
  const { currencyCode } = useCurrency()
  const [rates, setRates] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadRates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchExchangeRates('USD')
      setRates(data.rates)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load exchange rates'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRates()
  }, [loadRates])

  const convert = useCallback(
    (amount: number, from: string = 'USD', to: string = currencyCode): number => {
      if (from === to) return amount
      if (!rates[from] || !rates[to]) return amount

      const amountInUSD = amount / rates[from]
      return amountInUSD * rates[to]
    },
    [rates, currencyCode]
  )

  const getRate = useCallback(
    (from: string, to: string): number => {
      if (from === to) return 1
      if (!rates[from] || !rates[to]) return 1

      return rates[to] / rates[from]
    },
    [rates]
  )

  return {
    rates,
    isLoading,
    error,
    convert,
    getRate,
    refresh: loadRates,
  }
}

interface UsePriceConversionOptions {
  basePrice: number
  baseCurrency?: string
}

interface UsePriceConversionReturn {
  price: number
  formattedPrice: string
  isConverted: boolean
  originalPrice: number
  conversionRate: number
}

/**
 * Hook for converting and formatting a price to user's currency
 */
export function usePriceConversion({
  basePrice,
  baseCurrency = 'USD',
}: UsePriceConversionOptions): UsePriceConversionReturn {
  const { currencyCode, formatPrice } = useCurrency()
  const { convert, getRate } = useExchangeRates()

  const isConverted = baseCurrency !== currencyCode
  const conversionRate = getRate(baseCurrency, currencyCode)
  const price = convert(basePrice, baseCurrency, currencyCode)
  const formattedPrice = formatPrice(price)

  return {
    price,
    formattedPrice,
    isConverted,
    originalPrice: basePrice,
    conversionRate,
  }
}

/**
 * Hook for async currency conversion
 */
export function useAsyncCurrencyConversion() {
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const convert = useCallback(
    async (
      amount: number,
      fromCurrency: string,
      toCurrency: string
    ): Promise<number> => {
      if (fromCurrency === toCurrency) return amount

      setIsConverting(true)
      setError(null)

      try {
        const result = await convertCurrency(amount, fromCurrency, toCurrency)
        return result
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Conversion failed'))
        return amount
      } finally {
        setIsConverting(false)
      }
    },
    []
  )

  const getRate = useCallback(
    async (fromCurrency: string, toCurrency: string): Promise<number> => {
      if (fromCurrency === toCurrency) return 1

      try {
        return await getExchangeRate(fromCurrency, toCurrency)
      } catch {
        return 1
      }
    },
    []
  )

  return {
    convert,
    getRate,
    isConverting,
    error,
  }
}
