// ============================================
// TradingHub Pro - Badge Component
// Status badges and labels
// ============================================

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  pulse?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-700 text-gray-300',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  outline: 'bg-transparent text-gray-300 border-gray-600',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      dot = false,
      pulse = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full border',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className="relative flex h-2 w-2">
            {pulse && (
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  variant === 'success' && 'bg-emerald-400',
                  variant === 'warning' && 'bg-yellow-400',
                  variant === 'danger' && 'bg-red-400',
                  variant === 'info' && 'bg-indigo-400',
                  (variant === 'default' || variant === 'outline') && 'bg-gray-400'
                )}
              />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                variant === 'success' && 'bg-emerald-400',
                variant === 'warning' && 'bg-yellow-400',
                variant === 'danger' && 'bg-red-400',
                variant === 'info' && 'bg-indigo-400',
                (variant === 'default' || variant === 'outline') && 'bg-gray-400'
              )}
            />
          </span>
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Status Badge for order/trade status
interface StatusBadgeProps {
  status: 'open' | 'filled' | 'cancelled' | 'pending' | 'rejected' | 'partially-filled'
  size?: BadgeSize
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<
    StatusBadgeProps['status'],
    { variant: BadgeVariant; label: string; pulse?: boolean }
  > = {
    open: { variant: 'info', label: 'Open', pulse: true },
    pending: { variant: 'warning', label: 'Pending', pulse: true },
    filled: { variant: 'success', label: 'Filled' },
    'partially-filled': { variant: 'info', label: 'Partial' },
    cancelled: { variant: 'default', label: 'Cancelled' },
    rejected: { variant: 'danger', label: 'Rejected' },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} size={size} dot pulse={config.pulse}>
      {config.label}
    </Badge>
  )
}

// Signal Badge for trading signals
interface SignalBadgeProps {
  direction: 'bullish' | 'bearish' | 'neutral'
  strength?: 'strong' | 'moderate' | 'weak'
  size?: BadgeSize
}

export function SignalBadge({ direction, strength, size = 'md' }: SignalBadgeProps) {
  const directionConfig: Record<
    SignalBadgeProps['direction'],
    { variant: BadgeVariant; label: string }
  > = {
    bullish: { variant: 'success', label: '▲ Bullish' },
    bearish: { variant: 'danger', label: '▼ Bearish' },
    neutral: { variant: 'warning', label: '◆ Neutral' },
  }

  const config = directionConfig[direction]

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
      {strength && ` (${strength})`}
    </Badge>
  )
}
