// ============================================
// TradingHub Pro - Binance API Client
// Real-time cryptocurrency data from Binance
// ============================================

import { API_CONFIG, CRYPTO_MAPPINGS, type CryptoSymbol } from './config'
import type { OHLCV, Ticker, OrderBook, OrderBookEntry, Trade } from '@/types'

interface BinanceTickerResponse {
  symbol: string
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  prevClosePrice: string
  lastPrice: string
  lastQty: string
  bidPrice: string
  bidQty: string
  askPrice: string
  askQty: string
  openPrice: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
  openTime: number
  closeTime: number
  firstId: number
  lastId: number
  count: number
}

interface BinanceKlineResponse {
  0: number   // Open time
  1: string   // Open
  2: string   // High
  3: string   // Low
  4: string   // Close
  5: string   // Volume
  6: number   // Close time
  7: string   // Quote asset volume
  8: number   // Number of trades
  9: string   // Taker buy base asset volume
  10: string  // Taker buy quote asset volume
  11: string  // Ignore
}

interface BinanceDepthResponse {
  lastUpdateId: number
  bids: [string, string][]  // [price, quantity]
  asks: [string, string][]  // [price, quantity]
}

interface BinanceTradeResponse {
  id: number
  price: string
  qty: string
  quoteQty: string
  time: number
  isBuyerMaker: boolean
  isBestMatch: boolean
}

type TimeframeMap = Record<string, string>

const TIMEFRAME_MAP: TimeframeMap = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
  '1w': '1w',
  '1M': '1M',
}

/**
 * Binance API client for cryptocurrency data
 */
export class BinanceClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_CONFIG.BINANCE.BASE_URL
  }

  /**
   * Get the Binance symbol for a crypto
   */
  private getSymbol(crypto: CryptoSymbol): string {
    return CRYPTO_MAPPINGS[crypto]?.binance || `${crypto}USDT`
  }

  /**
   * Fetch 24h ticker data for a symbol
   */
  async getTicker(crypto: CryptoSymbol): Promise<Ticker> {
    const symbol = this.getSymbol(crypto)
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.BINANCE.ENDPOINTS.TICKER_24H}?symbol=${symbol}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch ticker: ${response.statusText}`)
    }

    const data: BinanceTickerResponse = await response.json()

    return {
      symbol: crypto,
      name: CRYPTO_MAPPINGS[crypto]?.name || crypto,
      price: parseFloat(data.lastPrice),
      change: parseFloat(data.priceChange),
      changePercent: parseFloat(data.priceChangePercent),
      volume: parseFloat(data.volume),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      marketCap: undefined,
      lastUpdated: Date.now(),
    }
  }

  /**
   * Fetch multiple tickers at once
   */
  async getMultipleTickers(cryptos: CryptoSymbol[]): Promise<Record<string, Ticker>> {
    const symbols = cryptos.map(c => this.getSymbol(c))
    const symbolsParam = JSON.stringify(symbols)
    
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.BINANCE.ENDPOINTS.TICKER_24H}?symbols=${encodeURIComponent(symbolsParam)}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch tickers: ${response.statusText}`)
    }

    const data: BinanceTickerResponse[] = await response.json()
    const tickers: Record<string, Ticker> = {}

    for (const item of data) {
      const crypto = cryptos.find(c => this.getSymbol(c) === item.symbol)
      if (crypto) {
        tickers[crypto] = {
          symbol: crypto,
          name: CRYPTO_MAPPINGS[crypto]?.name || crypto,
          price: parseFloat(item.lastPrice),
          change: parseFloat(item.priceChange),
          changePercent: parseFloat(item.priceChangePercent),
          volume: parseFloat(item.volume),
          high24h: parseFloat(item.highPrice),
          low24h: parseFloat(item.lowPrice),
          marketCap: undefined,
          lastUpdated: Date.now(),
        }
      }
    }

    return tickers
  }

  /**
   * Fetch OHLCV (candlestick) data
   */
  async getOHLCV(
    crypto: CryptoSymbol,
    timeframe: string = '1h',
    limit: number = 100
  ): Promise<OHLCV[]> {
    const symbol = this.getSymbol(crypto)
    const interval = TIMEFRAME_MAP[timeframe] || '1h'
    
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.BINANCE.ENDPOINTS.KLINES}?symbol=${symbol}&interval=${interval}&limit=${limit}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch OHLCV: ${response.statusText}`)
    }

    const data: BinanceKlineResponse[] = await response.json()

    return data.map((kline) => ({
      timestamp: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }))
  }

  /**
   * Fetch order book depth
   */
  async getOrderBook(crypto: CryptoSymbol, limit: number = 20): Promise<OrderBook> {
    const symbol = this.getSymbol(crypto)
    
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.BINANCE.ENDPOINTS.DEPTH}?symbol=${symbol}&limit=${limit}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch order book: ${response.statusText}`)
    }

    const data: BinanceDepthResponse = await response.json()

    let bidTotal = 0
    let askTotal = 0

    const bids: OrderBookEntry[] = data.bids.map(([price, quantity]) => {
      const priceNum = parseFloat(price)
      const quantityNum = parseFloat(quantity)
      bidTotal += priceNum * quantityNum
      return {
        price: priceNum,
        quantity: quantityNum,
        total: bidTotal,
      }
    })

    const asks: OrderBookEntry[] = data.asks.map(([price, quantity]) => {
      const priceNum = parseFloat(price)
      const quantityNum = parseFloat(quantity)
      askTotal += priceNum * quantityNum
      return {
        price: priceNum,
        quantity: quantityNum,
        total: askTotal,
      }
    })

    const bestBid = bids[0]?.price || 0
    const bestAsk = asks[0]?.price || 0
    const spread = bestAsk - bestBid
    const midPrice = (bestBid + bestAsk) / 2
    const spreadPercent = midPrice > 0 ? (spread / midPrice) * 100 : 0

    return {
      bids,
      asks,
      spread,
      spreadPercent,
    }
  }

  /**
   * Fetch recent trades
   */
  async getTrades(crypto: CryptoSymbol, limit: number = 50): Promise<Trade[]> {
    const symbol = this.getSymbol(crypto)
    
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.BINANCE.ENDPOINTS.TRADES}?symbol=${symbol}&limit=${limit}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch trades: ${response.statusText}`)
    }

    const data: BinanceTradeResponse[] = await response.json()

    return data.map((trade) => ({
      id: trade.id.toString(),
      symbol: crypto,
      side: trade.isBuyerMaker ? 'sell' : 'buy',
      price: parseFloat(trade.price),
      quantity: parseFloat(trade.qty),
      timestamp: trade.time,
      maker: trade.isBuyerMaker,
    }))
  }
}

// Export singleton instance
export const binanceClient = new BinanceClient()
