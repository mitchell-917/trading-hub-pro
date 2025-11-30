// ============================================
// TradingHub Pro - Stock Market API Service
// Alpha Vantage and Polygon.io integration for stocks
// ============================================

import type { OHLCV, MarketTicker } from '@/types'

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo'
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

// Polygon.io API configuration
const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY || ''
const POLYGON_BASE_URL = 'https://api.polygon.io'

interface AlphaVantageQuote {
  '01. symbol': string
  '02. open': string
  '03. high': string
  '04. low': string
  '05. price': string
  '06. volume': string
  '07. latest trading day': string
  '08. previous close': string
  '09. change': string
  '10. change percent': string
}

interface AlphaVantageTimeSeries {
  'Meta Data': {
    '1. Information': string
    '2. Symbol': string
    '3. Last Refreshed': string
    '4. Interval'?: string
    '5. Output Size': string
    '6. Time Zone': string
  }
  [key: string]: Record<string, string> | undefined
}

export interface StockQuote {
  symbol: string
  price: number
  open: number
  high: number
  low: number
  volume: number
  change: number
  changePercent: number
  previousClose: number
  latestTradingDay: string
}

export interface StockKline {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Popular stock indices and CFDs
export const STOCK_SYMBOLS = {
  indices: {
    SPY: 'S&P 500 ETF',
    QQQ: 'Nasdaq 100 ETF',
    DIA: 'Dow Jones ETF',
    IWM: 'Russell 2000 ETF',
    VIX: 'Volatility Index',
  },
  tech: {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corporation',
    GOOGL: 'Alphabet Inc.',
    AMZN: 'Amazon.com Inc.',
    NVDA: 'NVIDIA Corporation',
    TSLA: 'Tesla Inc.',
    META: 'Meta Platforms Inc.',
    AMD: 'Advanced Micro Devices',
  },
  finance: {
    JPM: 'JPMorgan Chase',
    BAC: 'Bank of America',
    GS: 'Goldman Sachs',
    V: 'Visa Inc.',
    MA: 'Mastercard Inc.',
  },
} as const

class StockAPI {
  private requestCache = new Map<string, { data: unknown; timestamp: number }>()
  private readonly CACHE_DURATION = 60 * 1000 // 1 minute cache

  private async fetchWithCache<T>(url: string): Promise<T> {
    const cached = this.requestCache.get(url)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Stock API error: ${response.statusText}`)
    }

    const data = await response.json()
    this.requestCache.set(url, { data, timestamp: Date.now() })
    return data
  }

  /**
   * Get real-time quote from Alpha Vantage
   */
  async getQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      const data = await this.fetchWithCache<{ 'Global Quote': AlphaVantageQuote }>(url)
      
      const quote = data['Global Quote']
      if (!quote || !quote['05. price']) {
        return null
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        volume: parseInt(quote['06. volume']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        previousClose: parseFloat(quote['08. previous close']),
        latestTradingDay: quote['07. latest trading day'],
      }
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Get intraday data from Alpha Vantage
   */
  async getIntradayData(
    symbol: string, 
    interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'
  ): Promise<StockKline[]> {
    try {
      const url = `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=compact`
      const data = await this.fetchWithCache<AlphaVantageTimeSeries>(url)
      
      const timeSeriesKey = `Time Series (${interval})`
      const timeSeries = data[timeSeriesKey]
      
      if (!timeSeries) {
        return []
      }

      return Object.entries(timeSeries)
        .map(([dateStr, values]) => ({
          timestamp: new Date(dateStr).getTime(),
          open: parseFloat((values as Record<string, string>)['1. open']),
          high: parseFloat((values as Record<string, string>)['2. high']),
          low: parseFloat((values as Record<string, string>)['3. low']),
          close: parseFloat((values as Record<string, string>)['4. close']),
          volume: parseInt((values as Record<string, string>)['5. volume']),
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
    } catch (error) {
      console.error(`Failed to fetch intraday data for ${symbol}:`, error)
      return []
    }
  }

  /**
   * Get daily historical data
   */
  async getDailyData(symbol: string, outputSize: 'compact' | 'full' = 'compact'): Promise<StockKline[]> {
    try {
      const url = `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=${outputSize}`
      const data = await this.fetchWithCache<AlphaVantageTimeSeries>(url)
      
      const timeSeries = data['Time Series (Daily)']
      
      if (!timeSeries) {
        return []
      }

      return Object.entries(timeSeries)
        .map(([dateStr, values]) => ({
          timestamp: new Date(dateStr).getTime(),
          open: parseFloat((values as Record<string, string>)['1. open']),
          high: parseFloat((values as Record<string, string>)['2. high']),
          low: parseFloat((values as Record<string, string>)['3. low']),
          close: parseFloat((values as Record<string, string>)['4. close']),
          volume: parseInt((values as Record<string, string>)['5. volume']),
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
    } catch (error) {
      console.error(`Failed to fetch daily data for ${symbol}:`, error)
      return []
    }
  }

  /**
   * Convert StockQuote to MarketTicker format
   */
  quoteToTicker(quote: StockQuote, name?: string): MarketTicker {
    return {
      symbol: quote.symbol,
      name: name || quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      high24h: quote.high,
      low24h: quote.low,
      volume: quote.volume,
      marketCap: 0,
      lastUpdate: Date.now(),
    }
  }

  /**
   * Convert StockKline to OHLCV format
   */
  klineToOHLCV(klines: StockKline[]): OHLCV[] {
    return klines.map((k) => ({
      timestamp: k.timestamp,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
      volume: k.volume,
    }))
  }

  /**
   * Get multiple quotes at once
   */
  async getMultipleQuotes(symbols: string[]): Promise<Map<string, StockQuote>> {
    const results = new Map<string, StockQuote>()
    
    // Alpha Vantage has rate limits, so we process sequentially
    for (const symbol of symbols) {
      const quote = await this.getQuote(symbol)
      if (quote) {
        results.set(symbol, quote)
      }
      // Add delay to respect rate limits (5 calls per minute for free tier)
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    
    return results
  }

  /**
   * Search for stock symbols
   */
  async searchSymbols(keywords: string): Promise<Array<{ symbol: string; name: string; type: string }>> {
    try {
      const url = `${ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${ALPHA_VANTAGE_API_KEY}`
      const data = await this.fetchWithCache<{ bestMatches: Array<{ 
        '1. symbol': string
        '2. name': string
        '3. type': string
      }> }>(url)
      
      return (data.bestMatches || []).map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
      }))
    } catch (error) {
      console.error('Failed to search symbols:', error)
      return []
    }
  }

  /**
   * Check if market is currently open
   */
  isMarketOpen(): boolean {
    const now = new Date()
    const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const day = nyTime.getDay()
    const hours = nyTime.getHours()
    const minutes = nyTime.getMinutes()
    const time = hours * 60 + minutes

    // Market is closed on weekends
    if (day === 0 || day === 6) return false

    // Market hours: 9:30 AM - 4:00 PM ET
    const marketOpen = 9 * 60 + 30 // 9:30 AM
    const marketClose = 16 * 60 // 4:00 PM

    return time >= marketOpen && time < marketClose
  }

  /**
   * Get pre-market or after-hours status
   */
  getMarketSession(): 'pre-market' | 'regular' | 'after-hours' | 'closed' {
    const now = new Date()
    const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const day = nyTime.getDay()
    const hours = nyTime.getHours()
    const minutes = nyTime.getMinutes()
    const time = hours * 60 + minutes

    // Closed on weekends
    if (day === 0 || day === 6) return 'closed'

    const preMarketOpen = 4 * 60 // 4:00 AM
    const marketOpen = 9 * 60 + 30 // 9:30 AM
    const marketClose = 16 * 60 // 4:00 PM
    const afterHoursClose = 20 * 60 // 8:00 PM

    if (time >= preMarketOpen && time < marketOpen) return 'pre-market'
    if (time >= marketOpen && time < marketClose) return 'regular'
    if (time >= marketClose && time < afterHoursClose) return 'after-hours'
    
    return 'closed'
  }
}

// Export singleton instance
export const stockAPI = new StockAPI()
