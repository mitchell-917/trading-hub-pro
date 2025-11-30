// ============================================
// TradingHub Pro - Binance WebSocket Client
// Real-time streaming data from Binance
// ============================================

import { CRYPTO_MAPPINGS, type CryptoSymbol } from './config'

export interface WebSocketTickerData {
  symbol: string
  price: number
  priceChange: number
  priceChangePercent: number
  high24h: number
  low24h: number
  volume: number
  quoteVolume: number
  timestamp: number
}

export interface WebSocketTradeData {
  symbol: string
  tradeId: number
  price: number
  quantity: number
  buyerMaker: boolean
  timestamp: number
}

export interface WebSocketKlineData {
  symbol: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  isClosed: boolean
}

export interface WebSocketDepthData {
  symbol: string
  bids: [number, number][]
  asks: [number, number][]
  timestamp: number
}

type TickerCallback = (data: WebSocketTickerData) => void
type TradeCallback = (data: WebSocketTradeData) => void
type KlineCallback = (data: WebSocketKlineData) => void
type DepthCallback = (data: WebSocketDepthData) => void

interface StreamCallbacks {
  ticker?: TickerCallback
  trade?: TradeCallback
  kline?: KlineCallback
  depth?: DepthCallback
}

/**
 * Binance WebSocket client for real-time streaming data
 */
export class BinanceWebSocket {
  private baseUrl = 'wss://stream.binance.com:9443/ws'
  private connections: Map<string, WebSocket> = new Map()
  private callbacks: Map<string, StreamCallbacks> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  /**
   * Get the Binance symbol for a crypto
   */
  private getSymbol(crypto: CryptoSymbol): string {
    return (CRYPTO_MAPPINGS[crypto]?.binance || `${crypto}USDT`).toLowerCase()
  }

  /**
   * Subscribe to ticker updates (24hr rolling window)
   */
  subscribeTicker(crypto: CryptoSymbol, callback: TickerCallback): () => void {
    const symbol = this.getSymbol(crypto)
    const streamName = `${symbol}@ticker`
    
    this.subscribe(streamName, { ticker: callback })
    
    return () => this.unsubscribe(streamName)
  }

  /**
   * Subscribe to trade updates
   */
  subscribeTrades(crypto: CryptoSymbol, callback: TradeCallback): () => void {
    const symbol = this.getSymbol(crypto)
    const streamName = `${symbol}@trade`
    
    this.subscribe(streamName, { trade: callback })
    
    return () => this.unsubscribe(streamName)
  }

  /**
   * Subscribe to kline/candlestick updates
   */
  subscribeKline(
    crypto: CryptoSymbol,
    interval: string,
    callback: KlineCallback
  ): () => void {
    const symbol = this.getSymbol(crypto)
    const streamName = `${symbol}@kline_${interval}`
    
    this.subscribe(streamName, { kline: callback })
    
    return () => this.unsubscribe(streamName)
  }

  /**
   * Subscribe to order book depth updates
   */
  subscribeDepth(crypto: CryptoSymbol, callback: DepthCallback): () => void {
    const symbol = this.getSymbol(crypto)
    const streamName = `${symbol}@depth20@100ms`
    
    this.subscribe(streamName, { depth: callback })
    
    return () => this.unsubscribe(streamName)
  }

  /**
   * Subscribe to multiple tickers at once
   */
  subscribeMultipleTickers(
    cryptos: CryptoSymbol[],
    callback: (data: Record<string, WebSocketTickerData>) => void
  ): () => void {
    const symbols = cryptos.map(c => this.getSymbol(c))
    const streamNames = symbols.map(s => `${s}@ticker`)
    const streamPath = streamNames.join('/')
    
    const latestData: Record<string, WebSocketTickerData> = {}
    
    const ws = new WebSocket(`${this.baseUrl}/${streamPath}`)
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        const symbol = message.s?.toUpperCase()?.replace('USDT', '') || ''
        
        if (symbol) {
          latestData[symbol] = {
            symbol,
            price: parseFloat(message.c),
            priceChange: parseFloat(message.p),
            priceChangePercent: parseFloat(message.P),
            high24h: parseFloat(message.h),
            low24h: parseFloat(message.l),
            volume: parseFloat(message.v),
            quoteVolume: parseFloat(message.q),
            timestamp: message.E,
          }
          callback({ ...latestData })
        }
      } catch (error) {
        console.error('Error parsing ticker data:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    this.connections.set('multi-ticker', ws)
    
    return () => {
      ws.close()
      this.connections.delete('multi-ticker')
    }
  }

  /**
   * Internal subscribe method
   */
  private subscribe(streamName: string, callbacks: StreamCallbacks): void {
    // Store callbacks
    this.callbacks.set(streamName, {
      ...this.callbacks.get(streamName),
      ...callbacks,
    })

    // Check if connection already exists
    if (this.connections.has(streamName)) {
      return
    }

    this.connect(streamName)
  }

  /**
   * Connect to a stream
   */
  private connect(streamName: string): void {
    const ws = new WebSocket(`${this.baseUrl}/${streamName}`)

    ws.onopen = () => {
      console.log(`WebSocket connected: ${streamName}`)
      this.reconnectAttempts.set(streamName, 0)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(streamName, data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error(`WebSocket error on ${streamName}:`, error)
    }

    ws.onclose = () => {
      console.log(`WebSocket closed: ${streamName}`)
      this.connections.delete(streamName)
      this.attemptReconnect(streamName)
    }

    this.connections.set(streamName, ws)
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(streamName: string, data: Record<string, unknown>): void {
    const callbacks = this.callbacks.get(streamName)
    if (!callbacks) return

    // Ticker stream
    if (streamName.includes('@ticker') && callbacks.ticker) {
      callbacks.ticker({
        symbol: (data.s as string)?.toUpperCase()?.replace('USDT', '') || '',
        price: parseFloat(data.c as string),
        priceChange: parseFloat(data.p as string),
        priceChangePercent: parseFloat(data.P as string),
        high24h: parseFloat(data.h as string),
        low24h: parseFloat(data.l as string),
        volume: parseFloat(data.v as string),
        quoteVolume: parseFloat(data.q as string),
        timestamp: data.E as number,
      })
    }

    // Trade stream
    if (streamName.includes('@trade') && callbacks.trade) {
      callbacks.trade({
        symbol: (data.s as string)?.toUpperCase()?.replace('USDT', '') || '',
        tradeId: data.t as number,
        price: parseFloat(data.p as string),
        quantity: parseFloat(data.q as string),
        buyerMaker: data.m as boolean,
        timestamp: data.T as number,
      })
    }

    // Kline stream
    if (streamName.includes('@kline') && callbacks.kline) {
      const kline = data.k as Record<string, unknown>
      callbacks.kline({
        symbol: (kline.s as string)?.toUpperCase()?.replace('USDT', '') || '',
        timestamp: kline.t as number,
        open: parseFloat(kline.o as string),
        high: parseFloat(kline.h as string),
        low: parseFloat(kline.l as string),
        close: parseFloat(kline.c as string),
        volume: parseFloat(kline.v as string),
        isClosed: kline.x as boolean,
      })
    }

    // Depth stream
    if (streamName.includes('@depth') && callbacks.depth) {
      const symbol = streamName.split('@')[0].toUpperCase().replace('USDT', '')
      callbacks.depth({
        symbol,
        bids: (data.bids as [string, string][])?.map(([p, q]) => [
          parseFloat(p),
          parseFloat(q),
        ]) || [],
        asks: (data.asks as [string, string][])?.map(([p, q]) => [
          parseFloat(p),
          parseFloat(q),
        ]) || [],
        timestamp: data.lastUpdateId as number,
      })
    }
  }

  /**
   * Attempt to reconnect to a stream
   */
  private attemptReconnect(streamName: string): void {
    const attempts = this.reconnectAttempts.get(streamName) || 0
    
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnect attempts reached for ${streamName}`)
      return
    }

    this.reconnectAttempts.set(streamName, attempts + 1)
    
    setTimeout(() => {
      if (this.callbacks.has(streamName)) {
        console.log(`Attempting to reconnect ${streamName}... (attempt ${attempts + 1})`)
        this.connect(streamName)
      }
    }, this.reconnectDelay * (attempts + 1))
  }

  /**
   * Unsubscribe from a stream
   */
  private unsubscribe(streamName: string): void {
    const ws = this.connections.get(streamName)
    if (ws) {
      ws.close()
      this.connections.delete(streamName)
    }
    this.callbacks.delete(streamName)
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    for (const [streamName, ws] of this.connections) {
      ws.close()
      this.connections.delete(streamName)
    }
    this.callbacks.clear()
    this.reconnectAttempts.clear()
  }
}

// Export singleton instance
export const binanceWebSocket = new BinanceWebSocket()
