// ============================================
// TradingHub Pro - CoinGecko API Client
// Comprehensive cryptocurrency data from CoinGecko
// ============================================

import { API_CONFIG, CRYPTO_MAPPINGS, type CryptoSymbol } from './config'
import type { OHLCV, Ticker } from '@/types'

interface CoinGeckoPriceResponse {
  [coinId: string]: {
    usd: number
    usd_24h_change?: number
    usd_24h_vol?: number
    usd_market_cap?: number
  }
}

interface CoinGeckoMarketResponse {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
  sparkline_in_7d?: {
    price: number[]
  }
}

interface CoinGeckoOHLCResponse {
  0: number  // timestamp
  1: number  // open
  2: number  // high
  3: number  // low
  4: number  // close
}

interface CoinGeckoChartResponse {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

interface CoinGeckoTrendingResponse {
  coins: Array<{
    item: {
      id: string
      coin_id: number
      name: string
      symbol: string
      market_cap_rank: number
      thumb: string
      small: string
      large: string
      slug: string
      price_btc: number
      score: number
    }
  }>
}

/**
 * CoinGecko API client for cryptocurrency data
 */
export class CoinGeckoClient {
  private baseUrl: string
  private lastRequestTime: number = 0
  private minRequestInterval: number = 2000 // 2 seconds between requests for free tier

  constructor() {
    this.baseUrl = API_CONFIG.COINGECKO.BASE_URL
  }

  /**
   * Get the CoinGecko coin ID for a crypto symbol
   */
  private getCoinId(crypto: CryptoSymbol): string {
    return CRYPTO_MAPPINGS[crypto]?.coingecko || crypto.toLowerCase()
  }

  /**
   * Rate-limited fetch
   */
  private async rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      )
    }
    
    this.lastRequestTime = Date.now()
    return fetch(url)
  }

  /**
   * Get simple price data for multiple coins
   */
  async getPrices(
    cryptos: CryptoSymbol[],
    currency: string = 'usd'
  ): Promise<Record<string, number>> {
    const coinIds = cryptos.map(c => this.getCoinId(c)).join(',')
    const url = `${this.baseUrl}${API_CONFIG.COINGECKO.ENDPOINTS.PRICE}?ids=${coinIds}&vs_currencies=${currency}&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    
    const response = await this.rateLimitedFetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`)
    }

    const data: CoinGeckoPriceResponse = await response.json()
    const prices: Record<string, number> = {}

    for (const crypto of cryptos) {
      const coinId = this.getCoinId(crypto)
      if (data[coinId]) {
        prices[crypto] = data[coinId][currency as 'usd'] || 0
      }
    }

    return prices
  }

  /**
   * Get detailed market data for multiple coins
   */
  async getMarkets(
    cryptos: CryptoSymbol[],
    currency: string = 'usd',
    includeSparkline: boolean = false
  ): Promise<Ticker[]> {
    const coinIds = cryptos.map(c => this.getCoinId(c)).join(',')
    const url = `${this.baseUrl}${API_CONFIG.COINGECKO.ENDPOINTS.MARKETS}?vs_currency=${currency}&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=${includeSparkline}`
    
    const response = await this.rateLimitedFetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch markets: ${response.statusText}`)
    }

    const data: CoinGeckoMarketResponse[] = await response.json()

    return data.map(coin => {
      const cryptoSymbol = cryptos.find(c => 
        this.getCoinId(c) === coin.id
      ) || coin.symbol.toUpperCase() as CryptoSymbol

      return {
        symbol: cryptoSymbol,
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        volume: coin.total_volume,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        marketCap: coin.market_cap,
        lastUpdated: new Date(coin.last_updated).getTime(),
      }
    })
  }

  /**
   * Get OHLC data for a coin
   */
  async getOHLC(
    crypto: CryptoSymbol,
    days: number = 7,
    currency: string = 'usd'
  ): Promise<OHLCV[]> {
    const coinId = this.getCoinId(crypto)
    const url = `${this.baseUrl}${API_CONFIG.COINGECKO.ENDPOINTS.COIN_OHLC.replace('{id}', coinId)}?vs_currency=${currency}&days=${days}`
    
    const response = await this.rateLimitedFetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch OHLC: ${response.statusText}`)
    }

    const data: CoinGeckoOHLCResponse[] = await response.json()

    return data.map(candle => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: 0, // CoinGecko OHLC doesn't include volume
    }))
  }

  /**
   * Get market chart data (prices, market caps, volumes)
   */
  async getMarketChart(
    crypto: CryptoSymbol,
    days: number = 7,
    currency: string = 'usd'
  ): Promise<{
    prices: OHLCV[]
    volumes: Array<{ timestamp: number; volume: number }>
  }> {
    const coinId = this.getCoinId(crypto)
    const url = `${this.baseUrl}${API_CONFIG.COINGECKO.ENDPOINTS.COIN_MARKET_CHART.replace('{id}', coinId)}?vs_currency=${currency}&days=${days}`
    
    const response = await this.rateLimitedFetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch market chart: ${response.statusText}`)
    }

    const data: CoinGeckoChartResponse = await response.json()

    // Convert price data to OHLCV format (simplified - same open/high/low/close)
    const prices: OHLCV[] = data.prices.map(([timestamp, price], index) => {
      const volume = data.total_volumes[index]?.[1] || 0
      return {
        timestamp,
        open: price,
        high: price,
        low: price,
        close: price,
        volume,
      }
    })

    const volumes = data.total_volumes.map(([timestamp, volume]) => ({
      timestamp,
      volume,
    }))

    return { prices, volumes }
  }

  /**
   * Get trending coins
   */
  async getTrending(): Promise<Array<{
    id: string
    name: string
    symbol: string
    marketCapRank: number
    priceBtc: number
  }>> {
    const url = `${this.baseUrl}${API_CONFIG.COINGECKO.ENDPOINTS.TRENDING}`
    
    const response = await this.rateLimitedFetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch trending: ${response.statusText}`)
    }

    const data: CoinGeckoTrendingResponse = await response.json()

    return data.coins.map(({ item }) => ({
      id: item.id,
      name: item.name,
      symbol: item.symbol,
      marketCapRank: item.market_cap_rank,
      priceBtc: item.price_btc,
    }))
  }

  /**
   * Get single coin ticker
   */
  async getTicker(crypto: CryptoSymbol, currency: string = 'usd'): Promise<Ticker> {
    const tickers = await this.getMarkets([crypto], currency)
    if (tickers.length === 0) {
      throw new Error(`No data found for ${crypto}`)
    }
    return tickers[0]
  }
}

// Export singleton instance
export const coinGeckoClient = new CoinGeckoClient()
