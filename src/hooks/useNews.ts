// ============================================
// TradingHub Pro - News Data Hooks
// ============================================

import { useQuery } from '@tanstack/react-query'
import { 
  newsAPI, 
  cryptoNewsAPI,
  type NewsArticle,
  type NewsResponse,
} from '../services/api/news'

// ============================================
// All News Hook
// ============================================
export function useNews(
  page: number = 1,
  pageSize: number = 10,
  category?: NewsArticle['category']
) {
  return useQuery({
    queryKey: ['news', page, pageSize, category],
    queryFn: () => newsAPI.getNews(page, pageSize, category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  })
}

// ============================================
// Breaking News Hook
// ============================================
export function useBreakingNews() {
  return useQuery({
    queryKey: ['news', 'breaking'],
    queryFn: () => newsAPI.getBreakingNews(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000,
  })
}

// ============================================
// News by Category Hook
// ============================================
export function useNewsByCategory(category: NewsArticle['category']) {
  return useQuery({
    queryKey: ['news', 'category', category],
    queryFn: () => newsAPI.getNewsByCategory(category),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ============================================
// News by Symbols Hook
// ============================================
export function useNewsBySymbols(symbols: string[]) {
  return useQuery({
    queryKey: ['news', 'symbols', symbols],
    queryFn: () => newsAPI.getNewsBySymbols(symbols),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: symbols.length > 0,
  })
}

// ============================================
// Market Sentiment Hook
// ============================================
export function useMarketSentiment() {
  return useQuery({
    queryKey: ['news', 'sentiment'],
    queryFn: () => newsAPI.getMarketSentiment(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000,
  })
}

// ============================================
// News Search Hook
// ============================================
export function useNewsSearch(query: string) {
  return useQuery({
    queryKey: ['news', 'search', query],
    queryFn: () => newsAPI.searchNews(query),
    staleTime: 5 * 60 * 1000,
    enabled: query.length >= 2,
  })
}

// ============================================
// Crypto News Hook
// ============================================
export function useCryptoNews() {
  return useQuery({
    queryKey: ['news', 'crypto'],
    queryFn: () => cryptoNewsAPI.getLatestNews(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ============================================
// Trending Topics Hook
// ============================================
export function useTrendingTopics() {
  return useQuery({
    queryKey: ['news', 'trending'],
    queryFn: () => cryptoNewsAPI.getTrendingTopics(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000,
  })
}

// ============================================
// Coin-Specific News Hook
// ============================================
export function useCoinNews(symbol: string) {
  return useQuery({
    queryKey: ['news', 'coin', symbol],
    queryFn: () => cryptoNewsAPI.getCoinNews(symbol),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: Boolean(symbol),
  })
}

// ============================================
// Combined Market News Hook
// ============================================
export function useMarketNews() {
  return useQuery({
    queryKey: ['news', 'market', 'all'],
    queryFn: async () => {
      const [news, sentiment] = await Promise.all([
        newsAPI.getBreakingNews(),
        newsAPI.getMarketSentiment(),
      ])
      return { news, sentiment }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ============================================
// Portfolio News Hook
// ============================================
export function usePortfolioNews(holdings: string[]) {
  return useQuery({
    queryKey: ['news', 'portfolio', holdings],
    queryFn: () => newsAPI.getNewsBySymbols(holdings),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: holdings.length > 0,
  })
}
