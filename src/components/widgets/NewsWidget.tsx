// ============================================
// TradingHub Pro - News Widget Component
// ============================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ExternalLink,
  RefreshCw,
  Filter,
  Bitcoin,
  LineChart,
  Globe,
  Gem,
  Zap,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'
import { 
  useBreakingNews, 
  useNewsByCategory, 
  useMarketSentiment,
  useTrendingTopics,
} from '../../hooks/useNews'
import { cn } from '../../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { NewsArticle } from '../../services/api/news'

// ============================================
// Category Icons
// ============================================
const getCategoryIcon = (category: NewsArticle['category']) => {
  const icons = {
    crypto: <Bitcoin className="w-4 h-4" />,
    stocks: <LineChart className="w-4 h-4" />,
    forex: <Globe className="w-4 h-4" />,
    commodities: <Gem className="w-4 h-4" />,
    general: <Newspaper className="w-4 h-4" />,
  }
  return icons[category] || icons.general
}

const getCategoryColor = (category: NewsArticle['category']): string => {
  const colors = {
    crypto: 'text-orange-400 bg-orange-500/20',
    stocks: 'text-blue-400 bg-blue-500/20',
    forex: 'text-green-400 bg-green-500/20',
    commodities: 'text-yellow-400 bg-yellow-500/20',
    general: 'text-slate-400 bg-slate-500/20',
  }
  return colors[category] || colors.general
}

// ============================================
// Sentiment Badge
// ============================================
function SentimentBadge({ sentiment }: { sentiment?: 'bullish' | 'bearish' | 'neutral' }) {
  if (!sentiment) return null

  const config = {
    bullish: { 
      icon: <TrendingUp className="w-3 h-3" />, 
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    },
    bearish: { 
      icon: <TrendingDown className="w-3 h-3" />, 
      color: 'bg-red-500/20 text-red-400 border-red-500/30' 
    },
    neutral: { 
      icon: <Minus className="w-3 h-3" />, 
      color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' 
    },
  }

  const { icon, color } = config[sentiment]

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border',
      color
    )}>
      {icon}
      {sentiment}
    </span>
  )
}

// ============================================
// News Article Card
// ============================================
interface NewsCardProps {
  article: NewsArticle
  compact?: boolean
}

function NewsCard({ article, compact = false }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })

  if (compact) {
    return (
      <motion.a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: 4 }}
        className={cn(
          'block p-3 rounded-lg border transition-all duration-200',
          'bg-slate-800/30 border-slate-700/50',
          'hover:bg-slate-800/60 hover:border-slate-600'
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-medium text-white line-clamp-2 flex-1">
            {article.title}
          </h4>
          <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0 mt-1" />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{article.source}</span>
          <span>•</span>
          <span>{timeAgo}</span>
          {article.sentiment && (
            <>
              <span>•</span>
              <SentimentBadge sentiment={article.sentiment} />
            </>
          )}
        </div>
      </motion.a>
    )
  }

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        'block p-4 rounded-xl border transition-all duration-200',
        'bg-slate-800/50 border-slate-700/50',
        'hover:bg-slate-800/80 hover:border-slate-600',
        'hover:shadow-lg hover:shadow-black/20'
      )}
    >
      {article.imageUrl && (
        <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          <div className="absolute bottom-2 left-2">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
              getCategoryColor(article.category)
            )}>
              {getCategoryIcon(article.category)}
              {article.category}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-white line-clamp-2">
            {article.title}
          </h4>
          <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </div>

        <p className="text-sm text-slate-400 line-clamp-2">
          {article.summary}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">{article.source}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
          <SentimentBadge sentiment={article.sentiment} />
        </div>

        {article.symbols && article.symbols.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {article.symbols.map(symbol => (
              <span
                key={symbol}
                className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-300 rounded"
              >
                {symbol}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.a>
  )
}

// ============================================
// Market Sentiment Overview
// ============================================
function MarketSentimentOverview() {
  const { data: sentiment, isLoading } = useMarketSentiment()

  if (isLoading) {
    return (
      <div className="h-20 bg-slate-700/30 rounded-xl animate-pulse" />
    )
  }

  const getSentimentColor = (s: string) => {
    if (s === 'bullish') return 'text-emerald-400'
    if (s === 'bearish') return 'text-red-400'
    return 'text-slate-400'
  }

  const getSentimentIcon = (s: string) => {
    if (s === 'bullish') return <TrendingUp className="w-6 h-6" />
    if (s === 'bearish') return <TrendingDown className="w-6 h-6" />
    return <Minus className="w-6 h-6" />
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-800/30">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 mb-1">Market Sentiment</div>
          <div className={cn(
            'text-xl font-bold capitalize flex items-center gap-2',
            getSentimentColor(sentiment?.overall || 'neutral')
          )}>
            {getSentimentIcon(sentiment?.overall || 'neutral')}
            {sentiment?.overall || 'Neutral'}
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="text-center">
            <div className="text-emerald-400 font-bold">
              {Object.values(sentiment?.byCategory || {}).reduce((acc, c) => acc + c.bullish, 0)}
            </div>
            <div className="text-slate-500">Bullish</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold">
              {Object.values(sentiment?.byCategory || {}).reduce((acc, c) => acc + c.bearish, 0)}
            </div>
            <div className="text-slate-500">Bearish</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 font-bold">
              {Object.values(sentiment?.byCategory || {}).reduce((acc, c) => acc + c.neutral, 0)}
            </div>
            <div className="text-slate-500">Neutral</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ============================================
// Trending Topics
// ============================================
function TrendingTopicsSection() {
  const { data: topics, isLoading } = useTrendingTopics()

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 w-24 bg-slate-700/30 rounded-full animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Zap className="w-4 h-4 text-yellow-400" />
        Trending
      </div>
      <div className="flex gap-2 flex-wrap">
        {topics?.map((topic, i) => (
          <motion.span
            key={topic}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="px-3 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-full hover:bg-slate-700 cursor-pointer transition-colors"
          >
            #{topic}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Main News Widget
// ============================================
type CategoryFilter = NewsArticle['category'] | 'all'

interface NewsWidgetProps {
  compact?: boolean
  className?: string
}

export function NewsWidget({ compact = false, className }: NewsWidgetProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const { data: breakingNews, isLoading: loadingBreaking, refetch, isFetching } = useBreakingNews()
  const { data: categoryNews, isLoading: loadingCategory } = useNewsByCategory(
    activeCategory === 'all' ? 'general' : activeCategory
  )

  const displayNews = activeCategory === 'all' ? breakingNews : categoryNews
  const isLoading = activeCategory === 'all' ? loadingBreaking : loadingCategory

  const categories: { value: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <Newspaper className="w-4 h-4" /> },
    { value: 'crypto', label: 'Crypto', icon: <Bitcoin className="w-4 h-4" /> },
    { value: 'stocks', label: 'Stocks', icon: <LineChart className="w-4 h-4" /> },
    { value: 'forex', label: 'Forex', icon: <Globe className="w-4 h-4" /> },
    { value: 'commodities', label: 'Commodities', icon: <Gem className="w-4 h-4" /> },
  ]

  if (compact) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Latest News</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-700/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayNews?.slice(0, 4).map(article => (
              <NewsCard key={article.id} article={article} compact />
            ))}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Market News</h3>
            <p className="text-sm text-slate-400">Latest financial headlines</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
        </Button>
      </div>

      {/* Sentiment Overview */}
      <div className="mb-6">
        <MarketSentimentOverview />
      </div>

      {/* Trending Topics */}
      <div className="mb-6">
        <TrendingTopicsSection />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveCategory(cat.value)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {cat.icon}
            {cat.label}
          </Button>
        ))}
      </div>

      {/* News Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-slate-700/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {displayNews?.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <span>Updated every 5 minutes</span>
        <span>Powered by multiple news sources</span>
      </div>
    </Card>
  )
}

export default NewsWidget
