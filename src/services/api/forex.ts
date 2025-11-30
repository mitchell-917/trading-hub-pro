// ============================================
// TradingHub Pro - Forex & Commodities API
// Support for FX pairs and commodity prices
// ============================================

import type { Ticker } from '@/types'

// Exchange Rate API configuration
const EXCHANGE_RATE_API_BASE = 'https://open.er-api.com/v6'

// Common forex pairs
export const FOREX_PAIRS = {
  major: {
    EURUSD: { base: 'EUR', quote: 'USD', name: 'Euro / US Dollar' },
    GBPUSD: { base: 'GBP', quote: 'USD', name: 'British Pound / US Dollar' },
    USDJPY: { base: 'USD', quote: 'JPY', name: 'US Dollar / Japanese Yen' },
    USDCHF: { base: 'USD', quote: 'CHF', name: 'US Dollar / Swiss Franc' },
    AUDUSD: { base: 'AUD', quote: 'USD', name: 'Australian Dollar / US Dollar' },
    USDCAD: { base: 'USD', quote: 'CAD', name: 'US Dollar / Canadian Dollar' },
    NZDUSD: { base: 'NZD', quote: 'USD', name: 'New Zealand Dollar / US Dollar' },
  },
  crosses: {
    EURGBP: { base: 'EUR', quote: 'GBP', name: 'Euro / British Pound' },
    EURJPY: { base: 'EUR', quote: 'JPY', name: 'Euro / Japanese Yen' },
    GBPJPY: { base: 'GBP', quote: 'JPY', name: 'British Pound / Japanese Yen' },
    EURCHF: { base: 'EUR', quote: 'CHF', name: 'Euro / Swiss Franc' },
    AUDNZD: { base: 'AUD', quote: 'NZD', name: 'Australian Dollar / New Zealand Dollar' },
  },
} as const

// Common commodities (usually quoted in USD)
export const COMMODITIES = {
  metals: {
    XAUUSD: { name: 'Gold', unit: 'oz' },
    XAGUSD: { name: 'Silver', unit: 'oz' },
    XPTUSD: { name: 'Platinum', unit: 'oz' },
    XPDUSD: { name: 'Palladium', unit: 'oz' },
  },
  energy: {
    WTIUSD: { name: 'Crude Oil WTI', unit: 'bbl' },
    BRENTUSD: { name: 'Brent Crude', unit: 'bbl' },
    NATGASUSD: { name: 'Natural Gas', unit: 'MMBtu' },
  },
} as const

interface ForexRate {
  pair: string
  rate: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  lastUpdate: number
}

interface ExchangeRateAPIResponse {
  result: string
  time_last_update_utc: string
  rates: Record<string, number>
}

class ForexAPI {
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private readonly CACHE_DURATION = 60 * 1000 // 1 minute

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T
    }
    return null
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * Fetch latest exchange rates for a base currency
   */
  async getRates(baseCurrency = 'USD'): Promise<Record<string, number>> {
    const cacheKey = `rates-${baseCurrency}`
    const cached = this.getCached<Record<string, number>>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${EXCHANGE_RATE_API_BASE}/latest/${baseCurrency}`)
      if (!response.ok) throw new Error('Failed to fetch rates')
      
      const data: ExchangeRateAPIResponse = await response.json()
      if (data.result !== 'success') throw new Error('API returned error')
      
      this.setCache(cacheKey, data.rates)
      return data.rates
    } catch (error) {
      console.error('Failed to fetch forex rates:', error)
      return {}
    }
  }

  /**
   * Get forex pair rate
   */
  async getForexPair(base: string, quote: string): Promise<ForexRate | null> {
    try {
      const rates = await this.getRates(base)
      const rate = rates[quote]
      
      if (!rate) return null

      // Calculate simulated 24h change (since free APIs don't provide historical)
      const seed = base.charCodeAt(0) + quote.charCodeAt(0)
      const pseudoRandom = Math.sin(seed * Date.now() / 86400000) * 0.5 + 0.5
      const change = (pseudoRandom - 0.5) * rate * 0.01
      
      return {
        pair: `${base}${quote}`,
        rate,
        change24h: change,
        changePercent24h: (change / rate) * 100,
        high24h: rate * 1.005,
        low24h: rate * 0.995,
        lastUpdate: Date.now(),
      }
    } catch (error) {
      console.error('Failed to get forex pair:', error)
      return null
    }
  }

  /**
   * Convert forex rate to Ticker format
   */
  forexToTicker(forex: ForexRate, name?: string): Ticker {
    return {
      symbol: forex.pair,
      name: name || forex.pair,
      price: forex.rate,
      change: forex.change24h,
      changePercent: forex.changePercent24h,
      high24h: forex.high24h,
      low24h: forex.low24h,
      volume: 0, // Forex doesn't have volume in free APIs
      marketCap: 0,
      lastUpdated: forex.lastUpdate,
    }
  }

  /**
   * Get multiple forex pairs at once
   */
  async getMultipleForexPairs(pairs: Array<{ base: string; quote: string }>): Promise<Map<string, ForexRate>> {
    const results = new Map<string, ForexRate>()
    
    // Group by base currency for efficiency
    const byBase = new Map<string, string[]>()
    for (const pair of pairs) {
      const quotes = byBase.get(pair.base) || []
      quotes.push(pair.quote)
      byBase.set(pair.base, quotes)
    }

    // Fetch rates for each base currency
    for (const [base, quotes] of byBase) {
      const rates = await this.getRates(base)
      
      for (const quote of quotes) {
        const rate = rates[quote]
        if (rate) {
          const pairName = `${base}${quote}`
          const seed = base.charCodeAt(0) + quote.charCodeAt(0)
          const pseudoRandom = Math.sin(seed * Date.now() / 86400000) * 0.5 + 0.5
          const change = (pseudoRandom - 0.5) * rate * 0.01
          
          results.set(pairName, {
            pair: pairName,
            rate,
            change24h: change,
            changePercent24h: (change / rate) * 100,
            high24h: rate * 1.005,
            low24h: rate * 0.995,
            lastUpdate: Date.now(),
          })
        }
      }
    }

    return results
  }

  /**
   * Get all major forex pairs
   */
  async getMajorPairs(): Promise<Map<string, ForexRate>> {
    const pairs = Object.values(FOREX_PAIRS.major).map(p => ({
      base: p.base,
      quote: p.quote,
    }))
    return this.getMultipleForexPairs(pairs)
  }

  /**
   * Check if forex market is open
   */
  isForexMarketOpen(): boolean {
    const now = new Date()
    const utcDay = now.getUTCDay()
    const utcHours = now.getUTCHours()

    // Forex is closed from Friday 21:00 UTC to Sunday 21:00 UTC
    if (utcDay === 6) return false // Saturday
    if (utcDay === 0 && utcHours < 21) return false // Sunday before 21:00 UTC
    if (utcDay === 5 && utcHours >= 21) return false // Friday after 21:00 UTC

    return true
  }
}

// Export singleton instance
export const forexAPI = new ForexAPI()
