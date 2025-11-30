// ============================================
// TradingHub Pro - Skeleton Loader Component
// Loading placeholders with shimmer effect
// ============================================

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton',
    none: '',
  }

  return (
    <div
      className={cn(
        'bg-gray-800',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-gray-800/50 bg-gray-900/60 p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={120} height={20} variant="rounded" />
        <Skeleton width={60} height={24} variant="rounded" />
      </div>
      <div className="space-y-3">
        <Skeleton width="100%" height={40} variant="rounded" />
        <div className="flex gap-2">
          <Skeleton width="60%" height={16} variant="rounded" />
          <Skeleton width="30%" height={16} variant="rounded" />
        </div>
      </div>
    </div>
  )
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-800/50">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === 0 ? 120 : 80}
          height={16}
          variant="rounded"
          className="flex-1"
        />
      ))}
    </div>
  )
}

// Chart Skeleton - uses deterministic heights based on index
function getBarHeight(index: number): string {
  // Deterministic pseudo-random height based on index
  const heights = [45, 72, 38, 65, 28, 80, 55, 42, 68, 35, 75, 48, 62, 30, 78, 52, 40, 70, 33, 58]
  return `${heights[index % heights.length]}%`
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="rounded-xl border border-gray-800/50 bg-gray-900/60 p-4"
      style={{ height }}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={100} height={20} variant="rounded" />
        <div className="flex gap-2">
          <Skeleton width={60} height={28} variant="rounded" />
          <Skeleton width={60} height={28} variant="rounded" />
          <Skeleton width={60} height={28} variant="rounded" />
        </div>
      </div>
      <div className="h-full flex items-end gap-1 pb-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            className="flex-1"
            height={getBarHeight(i)}
          />
        ))}
      </div>
    </div>
  )
}

// Price Ticker Skeleton
export function PriceTickerSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-800/50 bg-gray-900/60">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width={80} height={16} variant="rounded" />
        <Skeleton width={120} height={14} variant="rounded" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton width={80} height={16} variant="rounded" />
        <Skeleton width={60} height={14} variant="rounded" />
      </div>
    </div>
  )
}

// List Skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-800/50 bg-gray-900/60">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={14} variant="rounded" />
            <Skeleton width="50%" height={12} variant="rounded" />
          </div>
          <Skeleton width={60} height={24} variant="rounded" />
        </div>
      ))}
    </div>
  )
}
