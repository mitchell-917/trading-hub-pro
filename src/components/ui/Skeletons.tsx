// ============================================
// TradingHub Pro - Skeleton Loaders
// Loading placeholders for async components
// ============================================

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * Base skeleton component with animated pulse effect
 */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-800/50',
        className
      )}
      style={style}
    />
  )
}

/**
 * Skeleton for page headers
 */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
  )
}

/**
 * Skeleton for metric cards (stats)
 */
export function MetricCardSkeleton() {
  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Skeleton for chart containers
 */
export function ChartSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-full rounded-lg" style={{ height }} />
    </div>
  )
}

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-800">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-5',
            i === 0 ? 'w-20' : 'flex-1'
          )} 
        />
      ))}
    </div>
  )
}

/**
 * Skeleton for list items
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  )
}

/**
 * Full dashboard skeleton loader
 */
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <PageHeaderSkeleton />
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton height={400} />
        </div>
        <div className="space-y-4">
          <ChartSkeleton height={180} />
          <ChartSkeleton height={180} />
        </div>
      </div>
      
      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <Skeleton className="h-6 w-32 mb-4" />
            {Array.from({ length: 3 }).map((_, j) => (
              <ListItemSkeleton key={j} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Portfolio page skeleton loader
 */
export function PortfolioSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <PageHeaderSkeleton />
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Performance chart */}
      <ChartSkeleton height={320} />
      
      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={200} />
        <ChartSkeleton height={200} />
      </div>
      
      {/* Risk metrics */}
      <ChartSkeleton height={120} />
      
      {/* Monthly returns */}
      <ChartSkeleton height={200} />
    </div>
  )
}

/**
 * Market scanner skeleton loader
 */
export function MarketScannerSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <PageHeaderSkeleton />
      
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
      
      {/* Table */}
      <div className="rounded-lg bg-gray-900/50 border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 flex-1" />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRowSkeleton key={i} columns={6} />
        ))}
      </div>
    </div>
  )
}

/**
 * Settings page skeleton loader
 */
export function SettingsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <PageHeaderSkeleton />
      
      {/* Settings sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 rounded-lg bg-gray-900/50 border border-gray-800 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
