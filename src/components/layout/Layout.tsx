// ============================================
// TradingHub Pro - Main Layout Component
// Complete app layout structure
// ============================================

import { useState, useCallback } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'
import { SkipLink } from '@/lib/accessibility'

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')

  const handleMenuToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view)
    // Close mobile sidebar on navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SkipLink href="#main-content" />
      <Header onMenuToggle={handleMenuToggle} />

      <div className="flex">
        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onCollapse={setIsSidebarCollapsed}
          activeView={activeView}
          onViewChange={handleViewChange}
        />

        <main
          id="main-content"
          role="main"
          aria-label="Main content"
          className={cn(
            'flex-1 min-h-[calc(100vh-64px)] transition-all duration-300',
            isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]',
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

// ============================================
// Content Container Component
// ============================================

interface ContentContainerProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function ContentContainer({
  children,
  title,
  subtitle,
  actions,
  className,
}: ContentContainerProps) {
  return (
    <div className={cn('p-4 lg:p-6', className)}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// ============================================
// Grid Layouts
// ============================================

interface GridProps {
  children: React.ReactNode
  className?: string
}

export function DashboardGrid({ children, className }: GridProps) {
  return (
    <div
      className={cn(
        'grid gap-4 lg:gap-6',
        'grid-cols-1 lg:grid-cols-12',
        className
      )}
    >
      {children}
    </div>
  )
}

export function ChartSection({ children, className }: GridProps) {
  return (
    <div className={cn('lg:col-span-8', className)}>
      {children}
    </div>
  )
}

export function SideSection({ children, className }: GridProps) {
  return (
    <div className={cn('lg:col-span-4 space-y-4 lg:space-y-6', className)}>
      {children}
    </div>
  )
}

export function FullWidthSection({ children, className }: GridProps) {
  return (
    <div className={cn('lg:col-span-12', className)}>
      {children}
    </div>
  )
}

// ============================================
// Panel Component (for dashboard sections)
// ============================================

interface PanelProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Panel({
  children,
  title,
  actions,
  className,
  noPadding,
}: PanelProps) {
  return (
    <div
      className={cn(
        'bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800',
        !noPadding && 'p-4 lg:p-6',
        className
      )}
    >
      {(title || actions) && (
        <div className={cn(
          'flex items-center justify-between',
          !noPadding ? 'mb-4' : 'p-4 border-b border-gray-800'
        )}>
          {title && <h3 className="font-semibold">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
