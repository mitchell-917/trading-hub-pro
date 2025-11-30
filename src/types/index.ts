// ============================================
// TradingHub Pro - Core Type Definitions
// ============================================

// Price and Market Data Types
export interface OHLCV {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Ticker {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  high24h: number
  low24h: number
  marketCap?: number
  lastUpdated: number
}

export interface OrderBookEntry {
  price: number
  quantity: number
  total: number
}

export interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  spread: number
  spreadPercent: number
}

export interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
  timestamp: number
  maker: boolean
}

// Portfolio Types
export interface Position {
  id: string
  symbol: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  allocation: number
  lastUpdated: number
}

export interface PortfolioSummary {
  totalValue: number
  totalPnl: number
  totalPnlPercent: number
  dayPnl: number
  dayPnlPercent: number
  positions: Position[]
  cashBalance: number
  marginUsed: number
  marginAvailable: number
}

// Order Types
export type OrderType = 'market' | 'limit' | 'stop' | 'stop-limit' | 'trailing-stop'
export type OrderSide = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'open' | 'filled' | 'partially-filled' | 'cancelled' | 'rejected'
export type TimeInForce = 'gtc' | 'day' | 'ioc' | 'fok'

export interface Order {
  id: string
  symbol: string
  side: OrderSide
  type: OrderType
  status: OrderStatus
  quantity: number
  filledQuantity: number
  price?: number
  stopPrice?: number
  trailingAmount?: number
  timeInForce: TimeInForce
  createdAt: number
  updatedAt: number
  filledAt?: number
}

// Technical Indicator Types
export interface RSIData {
  timestamp: number
  value: number
  overbought: boolean
  oversold: boolean
}

export interface MACDData {
  timestamp: number
  macd: number
  signal: number
  histogram: number
}

export interface BollingerBandsData {
  timestamp: number
  upper: number
  middle: number
  lower: number
  bandwidth: number
}

export interface SMAData {
  timestamp: number
  value: number
  period: number
}

export interface EMAData {
  timestamp: number
  value: number
  period: number
}

export interface TechnicalIndicators {
  rsi: RSIData[]
  macd: MACDData[]
  bollingerBands: BollingerBandsData[]
  sma: Record<number, SMAData[]>
  ema: Record<number, EMAData[]>
}

// AI Signal Types
export type SignalStrength = 'strong' | 'moderate' | 'weak'
export type SignalDirection = 'bullish' | 'bearish' | 'neutral'

export interface AISignal {
  id: string
  symbol: string
  direction: SignalDirection
  strength: SignalStrength
  confidence: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  riskRewardRatio: number
  reasoning: string[]
  indicators: string[]
  timestamp: number
  expiresAt: number
}

export interface AIAnalysis {
  symbol: string
  summary: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  sentimentScore: number
  keyFactors: string[]
  signals: AISignal[]
  lastUpdated: number
}

// Watchlist Types
export interface WatchlistItem {
  symbol: string
  name: string
  addedAt: number
  alertPrice?: number
  notes?: string
}

export interface Watchlist {
  id: string
  name: string
  items: WatchlistItem[]
  createdAt: number
  updatedAt: number
}

// Alert Types
export type AlertType = 'price-above' | 'price-below' | 'percent-change' | 'volume-spike' | 'signal'
export type AlertStatus = 'active' | 'triggered' | 'expired' | 'disabled'

export interface Alert {
  id: string
  symbol: string
  type: AlertType
  status: AlertStatus
  condition: string
  targetValue: number
  currentValue: number
  message: string
  createdAt: number
  triggeredAt?: number
}

// News and Sentiment Types
export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url: string
  sentiment: 'positive' | 'negative' | 'neutral'
  symbols: string[]
  publishedAt: number
}

// Chart Configuration Types
export type ChartType = 'candlestick' | 'line' | 'area' | 'bar'
export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M'

export interface ChartConfig {
  type: ChartType
  timeFrame: TimeFrame
  indicators: {
    rsi: boolean
    macd: boolean
    bollingerBands: boolean
    sma: number[]
    ema: number[]
    volume: boolean
  }
  overlays: {
    positions: boolean
    orders: boolean
    signals: boolean
  }
}

// App State Types
export interface UserPreferences {
  theme: 'dark' | 'light' | 'system'
  defaultTimeFrame: TimeFrame
  defaultChartType: ChartType
  soundAlerts: boolean
  pushNotifications: boolean
  compactMode: boolean
}

export interface AppState {
  activeSymbol: string
  activePage: 'dashboard' | 'trade' | 'portfolio' | 'signals' | 'settings'
  sidebarCollapsed: boolean
  preferences: UserPreferences
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  status: LoadingState
  error: string | null
}
