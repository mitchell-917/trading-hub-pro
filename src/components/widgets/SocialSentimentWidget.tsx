// ============================================
// TradingHub Pro - Social Sentiment Widget
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Twitter,
  Globe,
  Users,
  RefreshCw,
  Activity,
  Zap,
  BarChart3,
  Hash,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'
import { cn } from '../../lib/utils'

// ============================================
// Types
// ============================================
interface SocialMention {
  id: string
  symbol: string
  platform: 'twitter' | 'reddit' | 'discord' | 'telegram'
  text: string
  author: string
  timestamp: Date
  sentiment: 'bullish' | 'bearish' | 'neutral'
  engagement: number
}

interface SentimentData {
  symbol: string
  name: string
  sentiment: number // -100 to 100
  change: number
  mentions: number
  trendingRank?: number
}

// ============================================
// Mock Social Data
// ============================================
const generateMockSentiment = (): SentimentData[] => [
  { symbol: 'BTC', name: 'Bitcoin', sentiment: 72, change: 5, mentions: 125420, trendingRank: 1 },
  { symbol: 'ETH', name: 'Ethereum', sentiment: 65, change: 8, mentions: 89320, trendingRank: 2 },
  { symbol: 'SOL', name: 'Solana', sentiment: 78, change: 15, mentions: 45680, trendingRank: 3 },
  { symbol: 'NVDA', name: 'NVIDIA', sentiment: 82, change: 3, mentions: 32150, trendingRank: 4 },
  { symbol: 'DOGE', name: 'Dogecoin', sentiment: 45, change: -12, mentions: 28900, trendingRank: 5 },
  { symbol: 'XRP', name: 'Ripple', sentiment: 38, change: -8, mentions: 21450 },
  { symbol: 'ADA', name: 'Cardano', sentiment: 55, change: 2, mentions: 18320 },
  { symbol: 'AAPL', name: 'Apple', sentiment: 68, change: 1, mentions: 15890 },
]

const generateMockMentions = (): SocialMention[] => [
  {
    id: 'm1',
    symbol: 'BTC',
    platform: 'twitter',
    text: '$BTC looking incredibly bullish! The breakout above $67k confirms the next leg up. Target: $75k 🚀',
    author: '@CryptoTrader',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    sentiment: 'bullish',
    engagement: 1520,
  },
  {
    id: 'm2',
    symbol: 'ETH',
    platform: 'reddit',
    text: 'Layer 2 adoption is accelerating faster than expected. ETH gas fees down 80% on Arbitrum. Bullish for the ecosystem.',
    author: 'u/ethmaxi',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    sentiment: 'bullish',
    engagement: 890,
  },
  {
    id: 'm3',
    symbol: 'SOL',
    platform: 'twitter',
    text: 'Solana NFT volume just hit new ATH. The ecosystem is absolutely thriving right now. $SOL',
    author: '@SolanaDaily',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    sentiment: 'bullish',
    engagement: 2100,
  },
  {
    id: 'm4',
    symbol: 'DOGE',
    platform: 'discord',
    text: 'DOGE rejected at resistance again. Might see further downside before any reversal.',
    author: 'DogeWatch#1234',
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    sentiment: 'bearish',
    engagement: 340,
  },
  {
    id: 'm5',
    symbol: 'NVDA',
    platform: 'reddit',
    text: 'NVIDIA earnings next week. AI demand still off the charts. This stock keeps surprising to the upside.',
    author: 'u/techstocks',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    sentiment: 'bullish',
    engagement: 1250,
  },
]

// ============================================
// Platform Icon
// ============================================
function PlatformIcon({ platform }: { platform: SocialMention['platform'] }) {
  const icons = {
    twitter: <Twitter className="w-4 h-4 text-sky-400" />,
    reddit: <MessageSquare className="w-4 h-4 text-orange-400" />,
    discord: <Hash className="w-4 h-4 text-indigo-400" />,
    telegram: <Globe className="w-4 h-4 text-blue-400" />,
  }
  return icons[platform]
}

// ============================================
// Sentiment Gauge
// ============================================
function SentimentGauge({ value }: { value: number }) {
  // Value from -100 to 100
  const normalizedValue = (value + 100) / 2 // 0 to 100
  const rotation = (normalizedValue / 100) * 180 - 90 // -90 to 90 degrees

  const getColor = () => {
    if (value > 50) return 'text-emerald-400'
    if (value > 20) return 'text-emerald-300'
    if (value > -20) return 'text-slate-400'
    if (value > -50) return 'text-red-300'
    return 'text-red-400'
  }

  const getLabel = () => {
    if (value > 60) return 'Very Bullish'
    if (value > 30) return 'Bullish'
    if (value > -30) return 'Neutral'
    if (value > -60) return 'Bearish'
    return 'Very Bearish'
  }

  return (
    <div className="relative w-32 h-20">
      {/* Background arc */}
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />
        {/* Gradient segments */}
        <defs>
          <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="75%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="url(#sentimentGradient)"
          strokeWidth="8"
          strokeDasharray="126"
          strokeDashoffset={126 - (normalizedValue / 100) * 126}
        />
      </svg>
      {/* Needle */}
      <div 
        className="absolute bottom-0 left-1/2 w-1 h-10 bg-white rounded-full origin-bottom transform -translate-x-1/2"
        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
      />
      {/* Center point */}
      <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 translate-y-1/2" />
      {/* Label */}
      <div className={cn('absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium', getColor())}>
        {getLabel()}
      </div>
    </div>
  )
}

// ============================================
// Sentiment Bar
// ============================================
function SentimentBar({ sentiment, change }: { sentiment: number; change: number }) {
  const normalizedValue = (sentiment + 100) / 2 // 0 to 100
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500',
            sentiment > 50 ? 'bg-emerald-400' :
            sentiment > 0 ? 'bg-emerald-300' :
            sentiment > -50 ? 'bg-yellow-400' : 'bg-red-400'
          )}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      <span className={cn(
        'text-xs font-medium w-12 text-right',
        change >= 0 ? 'text-emerald-400' : 'text-red-400'
      )}>
        {change >= 0 ? '+' : ''}{change}%
      </span>
    </div>
  )
}

// ============================================
// Trending Assets
// ============================================
function TrendingAssets({ data }: { data: SentimentData[] }) {
  const trending = data.filter(d => d.trendingRank).sort((a, b) => (a.trendingRank || 0) - (b.trendingRank || 0))

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h4 className="font-medium text-white text-sm">Trending Now</h4>
      </div>
      <div className="flex gap-2 flex-wrap">
        {trending.map((item, i) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
              i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
              i === 1 ? 'bg-slate-300/20 text-slate-300' :
              i === 2 ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-500/20 text-slate-400'
            )}
          >
            <span className="font-bold">#{i + 1}</span>
            <span>{item.symbol}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

// ============================================
// Social Mention Card
// ============================================
function MentionCard({ mention }: { mention: SocialMention }) {
  const timeAgo = Math.round((Date.now() - mention.timestamp.getTime()) / (60 * 1000))
  const timeLabel = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          mention.sentiment === 'bullish' ? 'bg-emerald-500/20' :
          mention.sentiment === 'bearish' ? 'bg-red-500/20' : 'bg-slate-500/20'
        )}>
          <PlatformIcon platform={mention.platform} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-400">{mention.author}</span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs text-slate-500">{timeLabel}</span>
            <Badge 
              variant="default" 
              className={cn(
                'text-xs ml-auto',
                mention.sentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                mention.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                'bg-slate-500/20 text-slate-400'
              )}
            >
              {mention.sentiment}
            </Badge>
          </div>
          <p className="text-sm text-slate-300 line-clamp-2">{mention.text}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {mention.engagement.toLocaleString()} engagements
            </span>
            <span className="font-medium text-white">${mention.symbol}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Sentiment Table Row
// ============================================
function SentimentRow({ data }: { data: SentimentData }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white">
          {data.symbol.substring(0, 2)}
        </div>
        <div>
          <div className="font-medium text-white text-sm">{data.symbol}</div>
          <div className="text-xs text-slate-500">{data.name}</div>
        </div>
      </div>
      <div className="flex-1 px-4">
        <SentimentBar sentiment={data.sentiment} change={data.change} />
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-white">{data.mentions.toLocaleString()}</div>
        <div className="text-xs text-slate-500">mentions</div>
      </div>
    </div>
  )
}

// ============================================
// Main Social Sentiment Widget
// ============================================
interface SocialSentimentWidgetProps {
  compact?: boolean
  className?: string
}

export function SocialSentimentWidget({ compact = false, className }: SocialSentimentWidgetProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'mentions'>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const sentimentData = useMemo(() => generateMockSentiment(), [])
  const mentions = useMemo(() => generateMockMentions(), [])

  // Calculate overall market sentiment
  const overallSentiment = useMemo(() => {
    const weightedSum = sentimentData.reduce((sum, d) => sum + d.sentiment * d.mentions, 0)
    const totalMentions = sentimentData.reduce((sum, d) => sum + d.mentions, 0)
    return Math.round(weightedSum / totalMentions)
  }, [sentimentData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (compact) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Social Sentiment</h3>
          </div>
          <Badge 
            variant="default"
            className={cn(
              'text-xs',
              overallSentiment > 30 ? 'bg-emerald-500/20 text-emerald-400' :
              overallSentiment > -30 ? 'bg-slate-500/20 text-slate-400' :
              'bg-red-500/20 text-red-400'
            )}
          >
            {overallSentiment > 0 ? '+' : ''}{overallSentiment}
          </Badge>
        </div>

        <div className="space-y-2">
          {sentimentData.slice(0, 4).map(data => (
            <SentimentRow key={data.symbol} data={data} />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Social Sentiment</h3>
            <p className="text-sm text-slate-400">Real-time social media analysis</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
        </Button>
      </div>

      {/* Overall Sentiment Gauge */}
      <div className="flex items-center justify-center mb-8">
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-2">Market Sentiment</div>
          <SentimentGauge value={overallSentiment} />
        </div>
      </div>

      {/* Trending */}
      <div className="mb-6">
        <TrendingAssets data={sentimentData} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'mentions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('mentions')}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Latest Mentions
        </Button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {sentimentData.map(data => (
              <SentimentRow key={data.symbol} data={data} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="mentions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {mentions.map(mention => (
              <MentionCard key={mention.id} mention={mention} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-slate-500 text-center">
        Data from Twitter, Reddit, Discord & Telegram • Updated every minute
      </div>
    </Card>
  )
}

export default SocialSentimentWidget
