// ============================================
// TradingHub Pro - Price Display Component
// Reusable component for displaying prices with currency
// ============================================

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  value: number
  previousValue?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showChange?: boolean
  showIcon?: boolean
  animated?: boolean
  className?: string
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
}

export function PriceDisplay({
  value,
  previousValue,
  size = 'md',
  showChange = false,
  showIcon = false,
  animated = true,
  className,
}: PriceDisplayProps) {
  const { formatPrice } = useCurrency()

  const { change, changePercent, isPositive } = useMemo(() => {
    if (previousValue === undefined || previousValue === 0) {
      return { change: 0, changePercent: 0, isPositive: true }
    }
    const diff = value - previousValue
    const percent = (diff / previousValue) * 100
    return {
      change: diff,
      changePercent: percent,
      isPositive: diff >= 0,
    }
  }, [value, previousValue])

  const formattedValue = formatPrice(value)
  const formattedChange = formatPrice(Math.abs(change))

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={formattedValue}
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={animated ? { opacity: 0, y: -10 } : undefined}
          transition={{ duration: 0.2 }}
          className={cn(
            'font-mono font-medium',
            sizeClasses[size],
            showChange && previousValue !== undefined && (
              isPositive ? 'text-green-400' : 'text-red-400'
            )
          )}
        >
          {formattedValue}
        </motion.span>
      </AnimatePresence>

      {showChange && previousValue !== undefined && change !== 0 && (
        <span className={cn(
          'inline-flex items-center gap-1 text-xs',
          isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {showIcon && (
            isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )
          )}
          <span>
            {isPositive ? '+' : '-'}{formattedChange}
          </span>
          <span className="opacity-70">
            ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </span>
      )}
    </div>
  )
}

// ============================================
// Compact Price with Ticker-style Animation
// ============================================

interface TickerPriceProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TickerPrice({ value, size = 'md', className }: TickerPriceProps) {
  const { formatPrice } = useCurrency()
  const formattedValue = formatPrice(value)
  
  const sizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  return (
    <motion.span
      key={Math.floor(value)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'font-mono font-semibold tabular-nums',
        sizeMap[size],
        className
      )}
    >
      {formattedValue}
    </motion.span>
  )
}

// ============================================
// Large Hero Price Display
// ============================================

interface HeroPriceProps {
  value: number
  change?: number
  changePercent?: number
  label?: string
  className?: string
}

export function HeroPrice({
  value,
  change,
  changePercent,
  label,
  className,
}: HeroPriceProps) {
  const { formatPrice } = useCurrency()
  const isPositive = (change ?? 0) >= 0

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <p className="text-sm text-gray-400">{label}</p>
      )}
      <div className="flex items-baseline gap-3">
        <motion.span
          key={Math.floor(value)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold font-mono tracking-tight"
        >
          {formatPrice(value)}
        </motion.span>
        
        {change !== undefined && changePercent !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isPositive ? 'text-green-400' : 'text-red-400'
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {isPositive ? '+' : ''}{formatPrice(change)}
            </span>
            <span className="opacity-70">
              ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
