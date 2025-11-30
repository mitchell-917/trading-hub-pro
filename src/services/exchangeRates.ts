// ============================================
// TradingHub Pro - Exchange Rate Service
// Real-time currency exchange rates
// ============================================

import { SUPPORTED_CURRENCIES, type CurrencyConfig } from './currency'

interface ExchangeRates {
  base: string
  date: string
  rates: Record<string, number>
  timestamp: number
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour
const STORAGE_KEY = 'trading-hub-exchange-rates'

/**
 * Get cached exchange rates from localStorage
 */
function getCachedRates(): ExchangeRates | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (!cached) return null

    const data: ExchangeRates = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid
    if (now - data.timestamp < CACHE_DURATION) {
      return data
    }

    return null
  } catch {
    return null
  }
}

/**
 * Cache exchange rates in localStorage
 */
function cacheRates(rates: ExchangeRates): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates))
  }
}

/**
 * Fetch exchange rates from API
 */
export async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
  // Check cache first
  const cached = getCachedRates()
  if (cached && cached.base === baseCurrency) {
    return cached
  }

  try {
    // Try exchangerate-api.com (free tier)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (response.ok) {
      const data = await response.json()
      const rates: ExchangeRates = {
        base: data.base,
        date: data.date,
        rates: data.rates,
        timestamp: Date.now(),
      }
      cacheRates(rates)
      return rates
    }
  } catch (error) {
    console.warn('Failed to fetch from exchangerate-api:', error)
  }

  try {
    // Fallback: frankfurter.app (free, open source)
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${baseCurrency}`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (response.ok) {
      const data = await response.json()
      const rates: ExchangeRates = {
        base: data.base,
        date: data.date,
        rates: { ...data.rates, [baseCurrency]: 1 },
        timestamp: Date.now(),
      }
      cacheRates(rates)
      return rates
    }
  } catch (error) {
    console.warn('Failed to fetch from frankfurter.app:', error)
  }

  // Return cached data if available, even if expired
  if (cached) {
    return cached
  }

  // Last resort: return default USD rates
  return getDefaultRates()
}

/**
 * Get default exchange rates (approximate)
 */
function getDefaultRates(): ExchangeRates {
  return {
    base: 'USD',
    date: new Date().toISOString().split('T')[0],
    rates: {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.50,
      AUD: 1.53,
      CAD: 1.36,
      CHF: 0.88,
      CNY: 7.24,
      INR: 83.12,
      KRW: 1298,
      SGD: 1.34,
      HKD: 7.82,
      NZD: 1.64,
      SEK: 10.42,
      NOK: 10.58,
      DKK: 6.87,
      MXN: 17.15,
      BRL: 4.97,
      ZAR: 18.65,
      RUB: 92.50,
      TRY: 32.10,
      PLN: 3.98,
      THB: 35.20,
      IDR: 15650,
      MYR: 4.72,
      PHP: 55.90,
      VND: 24500,
      AED: 3.67,
      SAR: 3.75,
      ILS: 3.68,
    },
    timestamp: Date.now(),
  }
}

/**
 * Convert an amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount

  const rates = await fetchExchangeRates('USD')

  // Convert to USD first, then to target currency
  const fromRate = rates.rates[fromCurrency] || 1
  const toRate = rates.rates[toCurrency] || 1

  const amountInUSD = amount / fromRate
  return amountInUSD * toRate
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return 1

  const rates = await fetchExchangeRates('USD')

  const fromRate = rates.rates[fromCurrency] || 1
  const toRate = rates.rates[toCurrency] || 1

  return toRate / fromRate
}

/**
 * Format an amount in a specific currency with proper locale
 */
export function formatInCurrency(
  amount: number,
  currency: CurrencyConfig
): string {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount)
}

/**
 * Get all supported currencies with their current rates
 */
export async function getCurrenciesWithRates(): Promise<
  Array<CurrencyConfig & { rate: number }>
> {
  const rates = await fetchExchangeRates('USD')

  return Object.values(SUPPORTED_CURRENCIES).map((currency) => ({
    ...currency,
    rate: rates.rates[currency.code] || 1,
  }))
}
