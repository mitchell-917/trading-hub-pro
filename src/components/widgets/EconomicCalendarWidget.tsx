// ============================================
// TradingHub Pro - Economic Calendar Widget
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Filter,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'
import { 
  useCalendarEvents,
  useTodayEvents,
  useHighImpactEvents,
  useCalendarCountries,
  useCalendarCategories,
} from '../../hooks/useCalendar'
import { cn } from '../../lib/utils'
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns'
import type { EconomicEvent } from '../../services/api/calendar'

// ============================================
// Impact Badge
// ============================================
function ImpactBadge({ impact }: { impact: EconomicEvent['impact'] }) {
  const config = {
    high: { color: 'bg-red-500/20 text-red-400 border-red-500/30', dots: 3 },
    medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dots: 2 },
    low: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', dots: 1 },
  }

  const { color, dots } = config[impact]

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border',
      color
    )}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span 
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            i < dots ? 'bg-current' : 'bg-current opacity-20'
          )} 
        />
      ))}
    </span>
  )
}

// ============================================
// Country Flag
// ============================================
function CountryFlag({ countryCode }: { countryCode: string }) {
  const { data: countries } = useCalendarCountries()
  const country = countries?.find(c => c.code === countryCode)
  return <span className="text-lg">{country?.flag || '🌐'}</span>
}

// ============================================
// Actual vs Forecast Indicator
// ============================================
function ActualIndicator({ event }: { event: EconomicEvent }) {
  if (!event.actual || !event.forecast) return null

  const actualNum = parseFloat(event.actual.replace(/[^0-9.-]/g, ''))
  const forecastNum = parseFloat(event.forecast.replace(/[^0-9.-]/g, ''))

  if (isNaN(actualNum) || isNaN(forecastNum)) return null

  const diff = actualNum - forecastNum
  const isPositive = diff > 0
  const isNeutral = Math.abs(diff) < 0.01

  if (isNeutral) {
    return <Minus className="w-4 h-4 text-slate-400" />
  }

  return isPositive ? (
    <TrendingUp className="w-4 h-4 text-emerald-400" />
  ) : (
    <TrendingDown className="w-4 h-4 text-red-400" />
  )
}

// ============================================
// Event Card
// ============================================
interface EventCardProps {
  event: EconomicEvent
  expanded?: boolean
  onToggle?: () => void
}

function EventCard({ event, expanded = false, onToggle }: EventCardProps) {
  const timeLabel = isToday(event.date) 
    ? `Today ${event.time}`
    : isTomorrow(event.date)
    ? `Tomorrow ${event.time}`
    : `${format(event.date, 'MMM d')} ${event.time}`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'border rounded-lg transition-all duration-200',
        'bg-slate-800/50 border-slate-700/50',
        'hover:bg-slate-800/80 hover:border-slate-600',
        expanded && 'border-blue-500/30'
      )}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <CountryFlag countryCode={event.countryCode} />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white mb-1 pr-8">{event.title}</h4>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeLabel}
                </span>
                <span>•</span>
                <span>{event.currency}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ImpactBadge impact={event.impact} />
            {onToggle && (
              <motion.div
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Data Values Row */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Previous</div>
            <div className="text-sm text-slate-300">{event.previous || '-'}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Forecast</div>
            <div className="text-sm text-slate-300">{event.forecast || '-'}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Actual</div>
            <div className="flex items-center gap-1">
              <span className={cn(
                'text-sm font-medium',
                event.actual ? 'text-white' : 'text-slate-500'
              )}>
                {event.actual || '-'}
              </span>
              <ActualIndicator event={event} />
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && event.description && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-slate-400 border-t border-slate-700/50 pt-3">
              {event.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// Date Group Header
// ============================================
function DateGroupHeader({ date }: { date: Date }) {
  let label = format(date, 'EEEE, MMMM d')
  if (isToday(date)) {
    label = 'Today'
  } else if (isTomorrow(date)) {
    label = 'Tomorrow'
  }

  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
        <Calendar className="w-4 h-4 text-blue-400" />
      </div>
      <span className="font-semibold text-white">{label}</span>
      {isToday(date) && (
        <Badge variant="default" className="text-xs bg-blue-500/20 text-blue-400">
          Live
        </Badge>
      )}
    </div>
  )
}

// ============================================
// Filter Panel
// ============================================
interface FilterPanelProps {
  selectedImpact: EconomicEvent['impact'][]
  onImpactChange: (impact: EconomicEvent['impact'][]) => void
  selectedCountries: string[]
  onCountriesChange: (countries: string[]) => void
}

function FilterPanel({
  selectedImpact,
  onImpactChange,
  selectedCountries,
  onCountriesChange,
}: FilterPanelProps) {
  const { data: countries } = useCalendarCountries()

  const impactOptions: EconomicEvent['impact'][] = ['high', 'medium', 'low']

  const toggleImpact = (impact: EconomicEvent['impact']) => {
    if (selectedImpact.includes(impact)) {
      onImpactChange(selectedImpact.filter(i => i !== impact))
    } else {
      onImpactChange([...selectedImpact, impact])
    }
  }

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      onCountriesChange(selectedCountries.filter(c => c !== code))
    } else {
      onCountriesChange([...selectedCountries, code])
    }
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <Card className="p-4 mb-4 bg-slate-800/30">
        <div className="space-y-4">
          {/* Impact Filter */}
          <div>
            <div className="text-xs text-slate-500 mb-2">Impact Level</div>
            <div className="flex gap-2">
              {impactOptions.map(impact => (
                <Button
                  key={impact}
                  variant={selectedImpact.includes(impact) ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => toggleImpact(impact)}
                  className="capitalize"
                >
                  <ImpactBadge impact={impact} />
                  <span className="ml-2">{impact}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Countries Filter */}
          <div>
            <div className="text-xs text-slate-500 mb-2">Countries</div>
            <div className="flex flex-wrap gap-2">
              {countries?.slice(0, 6).map(country => (
                <Button
                  key={country.code}
                  variant={selectedCountries.includes(country.code) ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => toggleCountry(country.code)}
                >
                  <span className="mr-1">{country.flag}</span>
                  {country.code}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// Main Economic Calendar Widget
// ============================================
interface EconomicCalendarWidgetProps {
  compact?: boolean
  className?: string
}

export function EconomicCalendarWidget({ compact = false, className }: EconomicCalendarWidgetProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedImpact, setSelectedImpact] = useState<EconomicEvent['impact'][]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const { data: events, isLoading, refetch, isFetching } = useCalendarEvents({
    impact: selectedImpact.length > 0 ? selectedImpact : undefined,
    countries: selectedCountries.length > 0 ? selectedCountries : undefined,
  })

  // Group events by date
  const groupedEvents = useMemo(() => {
    if (!events) return {}
    
    return events.reduce((acc, event) => {
      const dateKey = format(event.date, 'yyyy-MM-dd')
      if (!acc[dateKey]) {
        acc[dateKey] = { date: event.date, events: [] }
      }
      acc[dateKey].events.push(event)
      return acc
    }, {} as Record<string, { date: Date; events: EconomicEvent[] }>)
  }, [events])

  if (compact) {
    const todayEvents = events?.filter(e => isToday(e.date)).slice(0, 4)

    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Economic Calendar</h3>
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
            {todayEvents?.map(event => (
              <div
                key={event.id}
                className="flex items-center justify-between p-2 rounded bg-slate-800/30"
              >
                <div className="flex items-center gap-2">
                  <CountryFlag countryCode={event.countryCode} />
                  <div>
                    <div className="text-sm font-medium text-white line-clamp-1">
                      {event.title}
                    </div>
                    <div className="text-xs text-slate-500">{event.time}</div>
                  </div>
                </div>
                <ImpactBadge impact={event.impact} />
              </div>
            ))}
            {!todayEvents?.length && (
              <div className="text-center text-sm text-slate-500 py-4">
                No events today
              </div>
            )}
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
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Economic Calendar</h3>
            <p className="text-sm text-slate-400">Upcoming market-moving events</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            selectedImpact={selectedImpact}
            onImpactChange={setSelectedImpact}
            selectedCountries={selectedCountries}
            onCountriesChange={setSelectedCountries}
          />
        )}
      </AnimatePresence>

      {/* Events List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-700/30 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([dateKey, { date, events }]) => (
            <div key={dateKey}>
              <DateGroupHeader date={date} />
              <div className="space-y-3 mt-3">
                {events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    expanded={expandedEvent === event.id}
                    onToggle={() => setExpandedEvent(
                      expandedEvent === event.id ? null : event.id
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-slate-500 text-center">
        All times shown in your local timezone • Updated every 5 minutes
      </div>
    </Card>
  )
}

export default EconomicCalendarWidget
