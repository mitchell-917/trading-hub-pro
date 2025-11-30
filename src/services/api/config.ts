// ============================================
// TradingHub Pro - API Configuration
// Central configuration for all external APIs
// ============================================

export const API_CONFIG = {
  // CoinGecko API (Free tier: 10-30 calls/minute)
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    ENDPOINTS: {
      PRICE: '/simple/price',
      COINS_LIST: '/coins/list',
      COIN_MARKET_CHART: '/coins/{id}/market_chart',
      COIN_OHLC: '/coins/{id}/ohlc',
      MARKETS: '/coins/markets',
      TRENDING: '/search/trending',
    },
    RATE_LIMIT: 10, // calls per minute for free tier
  },

  // Binance API (Free, high rate limits)
  BINANCE: {
    BASE_URL: 'https://api.binance.com/api/v3',
    ENDPOINTS: {
      TICKER_24H: '/ticker/24hr',
      KLINES: '/klines',
      DEPTH: '/depth',
      TRADES: '/trades',
      TICKER_PRICE: '/ticker/price',
    },
    RATE_LIMIT: 1200, // requests per minute
  },

  // Alpha Vantage API (Free tier: 5 calls/minute, 500/day)
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
    FUNCTIONS: {
      TIME_SERIES_INTRADAY: 'TIME_SERIES_INTRADAY',
      TIME_SERIES_DAILY: 'TIME_SERIES_DAILY',
      GLOBAL_QUOTE: 'GLOBAL_QUOTE',
      SYMBOL_SEARCH: 'SYMBOL_SEARCH',
    },
    RATE_LIMIT: 5, // calls per minute for free tier
  },

  // Twelve Data API (Free tier: 800 credits/day)
  TWELVE_DATA: {
    BASE_URL: 'https://api.twelvedata.com',
    ENDPOINTS: {
      TIME_SERIES: '/time_series',
      QUOTE: '/quote',
      PRICE: '/price',
      STOCKS: '/stocks',
    },
    RATE_LIMIT: 8, // API credits per minute recommended
  },

  // Finnhub API (Free tier: 60 calls/minute)
  FINNHUB: {
    BASE_URL: 'https://finnhub.io/api/v1',
    ENDPOINTS: {
      QUOTE: '/quote',
      CANDLES: '/stock/candle',
      COMPANY_NEWS: '/company-news',
      MARKET_NEWS: '/news',
    },
    RATE_LIMIT: 60,
  },

  // Exchange Rate API (Free tier: 1500 calls/month)
  EXCHANGE_RATE: {
    BASE_URL: 'https://api.exchangerate-api.com/v4',
    ENDPOINTS: {
      LATEST: '/latest',
    },
  },
} as const

// Crypto coin ID mappings for different APIs
export const CRYPTO_MAPPINGS = {
  BTC: {
    coingecko: 'bitcoin',
    binance: 'BTCUSDT',
    name: 'Bitcoin',
  },
  ETH: {
    coingecko: 'ethereum',
    binance: 'ETHUSDT',
    name: 'Ethereum',
  },
  SOL: {
    coingecko: 'solana',
    binance: 'SOLUSDT',
    name: 'Solana',
  },
  BNB: {
    coingecko: 'binancecoin',
    binance: 'BNBUSDT',
    name: 'Binance Coin',
  },
  XRP: {
    coingecko: 'ripple',
    binance: 'XRPUSDT',
    name: 'XRP',
  },
  ADA: {
    coingecko: 'cardano',
    binance: 'ADAUSDT',
    name: 'Cardano',
  },
  DOGE: {
    coingecko: 'dogecoin',
    binance: 'DOGEUSDT',
    name: 'Dogecoin',
  },
  DOT: {
    coingecko: 'polkadot',
    binance: 'DOTUSDT',
    name: 'Polkadot',
  },
  MATIC: {
    coingecko: 'matic-network',
    binance: 'MATICUSDT',
    name: 'Polygon',
  },
  AVAX: {
    coingecko: 'avalanche-2',
    binance: 'AVAXUSDT',
    name: 'Avalanche',
  },
} as const

// Stock symbol mappings
export const STOCK_MAPPINGS = {
  AAPL: { name: 'Apple Inc.', exchange: 'NASDAQ' },
  MSFT: { name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  GOOGL: { name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  AMZN: { name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  NVDA: { name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  META: { name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  TSLA: { name: 'Tesla Inc.', exchange: 'NASDAQ' },
  SPY: { name: 'S&P 500 ETF', exchange: 'NYSE' },
  QQQ: { name: 'NASDAQ 100 ETF', exchange: 'NASDAQ' },
  DIA: { name: 'Dow Jones ETF', exchange: 'NYSE' },
} as const

// Index mappings
export const INDEX_MAPPINGS = {
  '^GSPC': { name: 'S&P 500', display: 'SPX' },
  '^DJI': { name: 'Dow Jones', display: 'DJI' },
  '^IXIC': { name: 'NASDAQ Composite', display: 'NASDAQ' },
  '^FTSE': { name: 'FTSE 100', display: 'FTSE' },
  '^N225': { name: 'Nikkei 225', display: 'N225' },
} as const

export type CryptoSymbol = keyof typeof CRYPTO_MAPPINGS
export type StockSymbol = keyof typeof STOCK_MAPPINGS
export type IndexSymbol = keyof typeof INDEX_MAPPINGS
