// ============================================
// TradingHub Pro - News API Service
// ============================================

import { API_CONFIG } from './config'

// ============================================
// Types
// ============================================
export interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  url: string
  imageUrl?: string
  publishedAt: Date
  category: 'crypto' | 'stocks' | 'forex' | 'commodities' | 'general'
  sentiment?: 'bullish' | 'bearish' | 'neutral'
  symbols?: string[]
  author?: string
}

export interface NewsResponse {
  articles: NewsArticle[]
  totalResults: number
  page: number
  pageSize: number
}

// ============================================
// Mock News Data (Production would use real APIs)
// ============================================
const generateMockNews = (): NewsArticle[] => {
  const now = new Date()
  
  return [
    // Crypto News
    {
      id: 'news-1',
      title: 'Bitcoin Surges Past $68,000 as Institutional Demand Grows',
      summary: 'Bitcoin reached new highs as major institutional investors continue to allocate funds to digital assets, with ETF inflows reaching record levels.',
      source: 'CryptoNews',
      url: 'https://example.com/news/1',
      imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
      publishedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      category: 'crypto',
      sentiment: 'bullish',
      symbols: ['BTC', 'BTCUSDT'],
      author: 'Michael Chen',
    },
    {
      id: 'news-2',
      title: 'Ethereum Layer 2 Solutions See Record Activity',
      summary: 'Layer 2 scaling solutions on Ethereum network processed over 10 million transactions last week, showing growing adoption.',
      source: 'DeFi Daily',
      url: 'https://example.com/news/2',
      imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400',
      publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      category: 'crypto',
      sentiment: 'bullish',
      symbols: ['ETH', 'ETHUSDT'],
      author: 'Sarah Johnson',
    },
    // Stock News
    {
      id: 'news-3',
      title: 'S&P 500 Hits All-Time High Amid Strong Earnings',
      summary: 'The S&P 500 index reached a new record as tech giants report better-than-expected quarterly earnings.',
      source: 'Market Watch',
      url: 'https://example.com/news/3',
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
      publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      category: 'stocks',
      sentiment: 'bullish',
      symbols: ['SPY', 'SPX'],
      author: 'David Wilson',
    },
    {
      id: 'news-4',
      title: 'Tech Sector Leads Market Rally on AI Optimism',
      summary: 'Technology stocks continue to outperform as investors bet on artificial intelligence driving future growth.',
      source: 'Bloomberg',
      url: 'https://example.com/news/4',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      category: 'stocks',
      sentiment: 'bullish',
      symbols: ['NVDA', 'MSFT', 'GOOGL'],
      author: 'Emily Brown',
    },
    {
      id: 'news-5',
      title: 'NASDAQ Composite Posts Weekly Gains of 3.2%',
      summary: 'The tech-heavy NASDAQ index saw significant gains this week, driven by strong performance in semiconductor and software stocks.',
      source: 'Reuters',
      url: 'https://example.com/news/5',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
      publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      category: 'stocks',
      sentiment: 'bullish',
      symbols: ['QQQ', 'IXIC'],
      author: 'James Thompson',
    },
    // Forex News
    {
      id: 'news-6',
      title: 'EUR/USD Climbs as ECB Signals Rate Hold',
      summary: 'The Euro strengthened against the Dollar following ECB comments suggesting rates will remain unchanged.',
      source: 'FX Street',
      url: 'https://example.com/news/6',
      imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400',
      publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      category: 'forex',
      sentiment: 'bullish',
      symbols: ['EURUSD'],
      author: 'Anna Schmidt',
    },
    {
      id: 'news-7',
      title: 'Japanese Yen Weakens on BoJ Policy Divergence',
      summary: 'USD/JPY reaches 150 level as the Bank of Japan maintains ultra-loose monetary policy while Fed stays hawkish.',
      source: 'ForexLive',
      url: 'https://example.com/news/7',
      publishedAt: new Date(now.getTime() - 7 * 60 * 60 * 1000),
      category: 'forex',
      sentiment: 'bearish',
      symbols: ['USDJPY'],
      author: 'Kenji Tanaka',
    },
    // Commodities News
    {
      id: 'news-8',
      title: 'Gold Prices Rally on Safe-Haven Demand',
      summary: 'Gold prices climb above $2,400/oz as geopolitical tensions drive investors toward safe-haven assets.',
      source: 'Kitco News',
      url: 'https://example.com/news/8',
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400',
      publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      category: 'commodities',
      sentiment: 'bullish',
      symbols: ['XAU', 'XAUUSD'],
      author: 'Robert Miller',
    },
    {
      id: 'news-9',
      title: 'Oil Prices Stabilize Near $80 as OPEC+ Maintains Output',
      summary: 'Crude oil prices hold steady as OPEC+ members agree to maintain current production levels through Q2.',
      source: 'Oil Price',
      url: 'https://example.com/news/9',
      publishedAt: new Date(now.getTime() - 9 * 60 * 60 * 1000),
      category: 'commodities',
      sentiment: 'neutral',
      symbols: ['WTI', 'BRENT'],
      author: 'Amanda Clark',
    },
    // General Financial News
    {
      id: 'news-10',
      title: 'Federal Reserve Minutes Reveal Inflation Concerns',
      summary: 'Latest Fed meeting minutes show policymakers remain focused on bringing inflation back to 2% target.',
      source: 'CNBC',
      url: 'https://example.com/news/10',
      imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400',
      publishedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
      category: 'general',
      sentiment: 'neutral',
      author: 'Jennifer Adams',
    },
    {
      id: 'news-11',
      title: 'Global Markets React to US Jobs Report',
      summary: 'Strong employment data from the US sends mixed signals about future Fed rate decisions.',
      source: 'Financial Times',
      url: 'https://example.com/news/11',
      publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      category: 'general',
      sentiment: 'neutral',
      author: 'Christopher Lee',
    },
    {
      id: 'news-12',
      title: 'Solana Network Hits New Transaction Record',
      summary: 'Solana processes over 65 million transactions in 24 hours, showcasing its scalability.',
      source: 'CoinDesk',
      url: 'https://example.com/news/12',
      publishedAt: new Date(now.getTime() - 14 * 60 * 60 * 1000),
      category: 'crypto',
      sentiment: 'bullish',
      symbols: ['SOL', 'SOLUSDT'],
      author: 'Marcus Rodriguez',
    },
  ]
}

// ============================================
// News API Class
// ============================================
export class NewsAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = 'https://newsapi.org/v2' // Example API
  }

  /**
   * Fetch all news articles
   */
  async getNews(
    page: number = 1,
    pageSize: number = 10,
    category?: NewsArticle['category']
  ): Promise<NewsResponse> {
    // In production, this would fetch from a real API
    // For now, return mock data
    const allNews = generateMockNews()
    const filtered = category 
      ? allNews.filter(n => n.category === category)
      : allNews

    const startIndex = (page - 1) * pageSize
    const articles = filtered.slice(startIndex, startIndex + pageSize)

    return {
      articles,
      totalResults: filtered.length,
      page,
      pageSize,
    }
  }

  /**
   * Fetch news by category
   */
  async getNewsByCategory(category: NewsArticle['category']): Promise<NewsArticle[]> {
    const news = generateMockNews()
    return news.filter(n => n.category === category)
  }

  /**
   * Fetch news for specific symbols
   */
  async getNewsBySymbols(symbols: string[]): Promise<NewsArticle[]> {
    const news = generateMockNews()
    return news.filter(article => 
      article.symbols?.some(s => symbols.includes(s))
    )
  }

  /**
   * Fetch latest breaking news
   */
  async getBreakingNews(): Promise<NewsArticle[]> {
    const news = generateMockNews()
    // Return articles from the last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000)
    return news.filter(n => n.publishedAt > fourHoursAgo).slice(0, 5)
  }

  /**
   * Fetch market sentiment summary
   */
  async getMarketSentiment(): Promise<{
    overall: 'bullish' | 'bearish' | 'neutral'
    byCategory: Record<string, { bullish: number; bearish: number; neutral: number }>
  }> {
    const news = generateMockNews()
    
    const sentimentCounts = news.reduce((acc, article) => {
      if (article.sentiment) {
        acc[article.sentiment]++
      }
      return acc
    }, { bullish: 0, bearish: 0, neutral: 0 })

    // Determine overall sentiment
    let overall: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (sentimentCounts.bullish > sentimentCounts.bearish + 2) {
      overall = 'bullish'
    } else if (sentimentCounts.bearish > sentimentCounts.bullish + 2) {
      overall = 'bearish'
    }

    // Group by category
    const byCategory = news.reduce((acc, article) => {
      if (!acc[article.category]) {
        acc[article.category] = { bullish: 0, bearish: 0, neutral: 0 }
      }
      if (article.sentiment) {
        acc[article.category][article.sentiment]++
      }
      return acc
    }, {} as Record<string, { bullish: number; bearish: number; neutral: number }>)

    return { overall, byCategory }
  }

  /**
   * Search news articles
   */
  async searchNews(query: string): Promise<NewsArticle[]> {
    const news = generateMockNews()
    const lowerQuery = query.toLowerCase()
    return news.filter(article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.summary.toLowerCase().includes(lowerQuery) ||
      article.symbols?.some(s => s.toLowerCase().includes(lowerQuery))
    )
  }
}

// ============================================
// Crypto News API (CryptoPanic-like)
// ============================================
export class CryptoNewsAPI {
  async getLatestNews(): Promise<NewsArticle[]> {
    const news = generateMockNews()
    return news.filter(n => n.category === 'crypto')
  }

  async getTrendingTopics(): Promise<string[]> {
    return ['Bitcoin ETF', 'Ethereum Merge', 'DeFi Summer', 'NFT Revival', 'Layer 2']
  }

  async getCoinNews(symbol: string): Promise<NewsArticle[]> {
    const news = generateMockNews()
    return news.filter(article => 
      article.symbols?.some(s => s.includes(symbol.toUpperCase()))
    )
  }
}

// ============================================
// Export instances
// ============================================
export const newsAPI = new NewsAPI()
export const cryptoNewsAPI = new CryptoNewsAPI()
