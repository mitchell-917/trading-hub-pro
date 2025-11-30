// ============================================
// TradingHub Pro - Price Alerts Widget
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell,
  BellRing,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Check,
  Settings,
  RefreshCw,
  Trash2,
  Edit2,
  Pause,
  Play,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Card, Button, Badge, Input } from '../ui'
import { useCurrency } from '../../context/CurrencyContext'
import { cn } from '../../lib/utils'

// ============================================
// Types
// ============================================
interface PriceAlert {
  id: string
  symbol: string
  name: string
  type: 'above' | 'below' | 'percent-change'
  targetPrice?: number
  percentChange?: number
  currentPrice: number
  isActive: boolean
  isTriggered: boolean
  triggeredAt?: Date
  createdAt: Date
  notifyVia: ('app' | 'email' | 'push')[]
}

// ============================================
// Mock Alerts Data
// ============================================
const generateMockAlerts = (): PriceAlert[] => [
  {
    id: 'alert-1',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'above',
    targetPrice: 70000,
    currentPrice: 67542,
    isActive: true,
    isTriggered: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notifyVia: ['app', 'push'],
  },
  {
    id: 'alert-2',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'below',
    targetPrice: 3200,
    currentPrice: 3456,
    isActive: true,
    isTriggered: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notifyVia: ['app'],
  },
  {
    id: 'alert-3',
    symbol: 'SOL',
    name: 'Solana',
    type: 'above',
    targetPrice: 150,
    currentPrice: 142,
    isActive: true,
    isTriggered: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    notifyVia: ['app', 'email', 'push'],
  },
  {
    id: 'alert-4',
    symbol: 'NVDA',
    name: 'NVIDIA',
    type: 'percent-change',
    percentChange: 5,
    currentPrice: 875,
    isActive: true,
    isTriggered: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    notifyVia: ['push'],
  },
  {
    id: 'alert-5',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'below',
    targetPrice: 60000,
    currentPrice: 67542,
    isActive: false,
    isTriggered: true,
    triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    notifyVia: ['app'],
  },
]

// ============================================
// Alert Type Badge
// ============================================
function AlertTypeBadge({ type, targetPrice, percentChange, formatPrice }: { 
  type: PriceAlert['type']
  targetPrice?: number
  percentChange?: number
  formatPrice: (price: number) => string
}) {
  if (type === 'above') {
    return (
      <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 text-xs">
        <ArrowUp className="w-3 h-3 mr-1" />
        Above {formatPrice(targetPrice!)}
      </Badge>
    )
  }
  if (type === 'below') {
    return (
      <Badge variant="default" className="bg-red-500/20 text-red-400 text-xs">
        <ArrowDown className="w-3 h-3 mr-1" />
        Below {formatPrice(targetPrice!)}
      </Badge>
    )
  }
  return (
    <Badge variant="default" className="bg-blue-500/20 text-blue-400 text-xs">
      ±{percentChange}% Change
    </Badge>
  )
}

// ============================================
// Distance Indicator
// ============================================
function DistanceIndicator({ alert, formatPrice }: { alert: PriceAlert; formatPrice: (price: number) => string }) {
  if (!alert.targetPrice) return null

  const distance = ((alert.targetPrice - alert.currentPrice) / alert.currentPrice) * 100
  const isClose = Math.abs(distance) < 5

  return (
    <div className={cn(
      'text-xs',
      isClose ? 'text-yellow-400' : 'text-slate-500'
    )}>
      {distance > 0 ? '+' : ''}{distance.toFixed(2)}% away
      {isClose && ' ⚡'}
    </div>
  )
}

// ============================================
// Alert Card
// ============================================
interface AlertCardProps {
  alert: PriceAlert
  formatPrice: (price: number) => string
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

function AlertCard({ alert, formatPrice, onToggle, onDelete }: AlertCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'p-4 rounded-lg border transition-all duration-200',
        'bg-slate-800/50 border-slate-700/50',
        alert.isTriggered && 'border-yellow-500/30 bg-yellow-500/5',
        !alert.isActive && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            alert.isTriggered 
              ? 'bg-yellow-500/20' 
              : alert.isActive 
              ? 'bg-blue-500/20' 
              : 'bg-slate-700'
          )}>
            {alert.isTriggered ? (
              <BellRing className="w-5 h-5 text-yellow-400" />
            ) : (
              <Bell className={cn(
                'w-5 h-5',
                alert.isActive ? 'text-blue-400' : 'text-slate-500'
              )} />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">{alert.symbol}</span>
              <AlertTypeBadge 
                type={alert.type} 
                targetPrice={alert.targetPrice}
                percentChange={alert.percentChange}
                formatPrice={formatPrice}
              />
            </div>
            <div className="text-sm text-slate-400 mb-1">{alert.name}</div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Current: {formatPrice(alert.currentPrice)}
              </span>
              <DistanceIndicator alert={alert} formatPrice={formatPrice} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(alert.id)}
            className="h-8 w-8 p-0"
          >
            {alert.isActive ? (
              <Pause className="w-4 h-4 text-slate-400" />
            ) : (
              <Play className="w-4 h-4 text-emerald-400" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(alert.id)}
            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Triggered Alert */}
      {alert.isTriggered && alert.triggeredAt && (
        <div className="mt-3 pt-3 border-t border-yellow-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <Check className="w-4 h-4" />
            <span>Triggered</span>
          </div>
          <span className="text-xs text-slate-500">
            {alert.triggeredAt.toLocaleDateString()}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// Create Alert Form
// ============================================
interface CreateAlertFormProps {
  onClose: () => void
  onCreate: (alert: Partial<PriceAlert>) => void
}

function CreateAlertForm({ onClose, onCreate }: CreateAlertFormProps) {
  const [symbol, setSymbol] = useState('')
  const [type, setType] = useState<PriceAlert['type']>('above')
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      symbol: symbol.toUpperCase(),
      type,
      targetPrice: type !== 'percent-change' ? parseFloat(value) : undefined,
      percentChange: type === 'percent-change' ? parseFloat(value) : undefined,
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <Card className="p-4 mb-4 bg-slate-800/50 border-blue-500/30">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-white">Create Alert</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Symbol</label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="BTC, ETH, AAPL..."
                className="bg-slate-900/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block">Alert Type</label>
              <div className="flex gap-2">
                {(['above', 'below', 'percent-change'] as PriceAlert['type'][]).map(t => (
                  <Button
                    key={t}
                    type="button"
                    variant={type === t ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setType(t)}
                    className="flex-1"
                  >
                    {t === 'above' && <ArrowUp className="w-3 h-3 mr-1" />}
                    {t === 'below' && <ArrowDown className="w-3 h-3 mr-1" />}
                    {t === 'above' ? 'Above' : t === 'below' ? 'Below' : '% Change'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                {type === 'percent-change' ? 'Percent Change' : 'Target Price'}
              </label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'percent-change' ? '5' : '70000'}
                className="bg-slate-900/50"
              />
            </div>

            <Button type="submit" className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}

// ============================================
// Main Price Alerts Widget
// ============================================
interface PriceAlertsWidgetProps {
  compact?: boolean
  className?: string
}

export function PriceAlertsWidget({ compact = false, className }: PriceAlertsWidgetProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(generateMockAlerts())
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('all')
  const { formatPrice } = useCurrency()

  const filteredAlerts = useMemo(() => {
    switch (filter) {
      case 'active':
        return alerts.filter(a => a.isActive && !a.isTriggered)
      case 'triggered':
        return alerts.filter(a => a.isTriggered)
      default:
        return alerts
    }
  }, [alerts, filter])

  const handleToggle = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ))
  }

  const handleDelete = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const handleCreate = (newAlert: Partial<PriceAlert>) => {
    const alert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol: newAlert.symbol || 'BTC',
      name: newAlert.symbol || 'Bitcoin',
      type: newAlert.type || 'above',
      targetPrice: newAlert.targetPrice,
      percentChange: newAlert.percentChange,
      currentPrice: 67542, // Mock
      isActive: true,
      isTriggered: false,
      createdAt: new Date(),
      notifyVia: ['app'],
    }
    setAlerts(prev => [alert, ...prev])
  }

  if (compact) {
    const activeAlerts = alerts.filter(a => a.isActive && !a.isTriggered)

    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Price Alerts</h3>
            <Badge variant="default" className="text-xs">
              {activeAlerts.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {activeAlerts.slice(0, 3).map(alert => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-2 rounded bg-slate-800/30"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-white text-sm">{alert.symbol}</span>
                <AlertTypeBadge 
                  type={alert.type}
                  targetPrice={alert.targetPrice}
                  percentChange={alert.percentChange}
                  formatPrice={formatPrice}
                />
              </div>
              <DistanceIndicator alert={alert} formatPrice={formatPrice} />
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-4">
              No active alerts
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Price Alerts</h3>
            <p className="text-sm text-slate-400">
              {alerts.filter(a => a.isActive).length} active alerts
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Alert
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateAlertForm 
            onClose={() => setShowCreateForm(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'triggered'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
            {f === 'active' && (
              <Badge variant="default" className="ml-2 text-xs">
                {alerts.filter(a => a.isActive && !a.isTriggered).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              formatPrice={formatPrice}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
        {filteredAlerts.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-8">
            No alerts to display
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-slate-500 text-center">
        Alerts are checked in real-time • Notifications enabled
      </div>
    </Card>
  )
}

export default PriceAlertsWidget
