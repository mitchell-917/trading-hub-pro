// ============================================
// TradingHub Pro - Sidebar Component
// Navigation and quick actions with React Router
// ============================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  History,
  Brain,
  Settings,
  Star,
  PieChart,
  TrendingUp,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen?: boolean
  isCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  activeView?: string
  onViewChange?: (view: string) => void
  className?: string
}

interface NavItem {
  id: string
  path: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const navItems: NavItem[] = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'charts', path: '/charts', label: 'Charts', icon: <LineChart className="w-5 h-5" /> },
  { id: 'portfolio', path: '/portfolio', label: 'Portfolio', icon: <PieChart className="w-5 h-5" /> },
  { id: 'scanner', path: '/scanner', label: 'Market Scanner', icon: <Search className="w-5 h-5" /> },
  { id: 'watchlist', path: '/watchlist', label: 'Watchlist', icon: <Star className="w-5 h-5" /> },
  { id: 'ai-signals', path: '/ai-signals', label: 'AI Signals', icon: <Brain className="w-5 h-5" />, badge: 3 },
  { id: 'history', path: '/history', label: 'Trade History', icon: <History className="w-5 h-5" /> },
]

const secondaryItems: NavItem[] = [
  { id: 'markets', path: '/markets', label: 'Markets', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'news', path: '/news', label: 'News', icon: <Newspaper className="w-5 h-5" /> },
  { id: 'wallet', path: '/wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
]

export function Sidebar({
  isOpen = true,
  isCollapsed = false,
  onCollapse,
  className,
}: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (path: string) => {
    navigate(path)
  }

  const checkActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 72 },
  }

  return (
    <motion.aside
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      className={cn(
        'h-[calc(100vh-64px)] bg-gray-900/95 backdrop-blur-xl border-r border-gray-800',
        'flex flex-col',
        'fixed lg:sticky top-16 left-0 z-40',
        'transition-transform duration-300',
        !isOpen && '-translate-x-full lg:translate-x-0',
        className
      )}
    >
      {/* Navigation Items */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={checkActive(item.path)}
              isCollapsed={isCollapsed}
              isHovered={hoveredItem === item.id}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 mx-3 h-px bg-gray-700" />

        {/* Secondary Items */}
        <div className="space-y-1">
          {secondaryItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={checkActive(item.path)}
              isCollapsed={isCollapsed}
              isHovered={hoveredItem === item.id}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            />
          ))}
        </div>
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-gray-800">
        <button
          onClick={() => onCollapse?.(!isCollapsed)}
          className={cn(
            'w-full p-3 rounded-lg hover:bg-gray-800 transition-colors',
            'flex items-center gap-3 text-gray-400 hover:text-white'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>

        {/* Settings */}
        <NavButton
          item={{ id: 'settings', path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }}
          isActive={checkActive('/settings')}
          isCollapsed={isCollapsed}
          isHovered={hoveredItem === 'settings'}
          onClick={() => handleNavClick('/settings')}
          onMouseEnter={() => setHoveredItem('settings')}
          onMouseLeave={() => setHoveredItem(null)}
        />
      </div>
    </motion.aside>
  )
}

// ============================================
// Nav Button Component
// ============================================

interface NavButtonProps {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
  isHovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function NavButton({
  item,
  isActive,
  isCollapsed,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: NavButtonProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          'w-full p-3 rounded-lg transition-all duration-200',
          'flex items-center gap-3',
          isActive
            ? 'bg-indigo-500/20 text-indigo-400'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        )}
      >
        <span className={cn(
          'flex-shrink-0',
          isActive && 'text-indigo-400'
        )}>
          {item.icon}
        </span>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge */}
        {item.badge && (
          <AnimatePresence>
            {!isCollapsed ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="ml-auto text-xs font-medium bg-indigo-500 text-white px-1.5 py-0.5 rounded"
              >
                {item.badge}
              </motion.span>
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"
              />
            )}
          </AnimatePresence>
        )}

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full"
          />
        )}
      </button>

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {isCollapsed && isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50"
          >
            <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-gray-700">
              {item.label}
              {item.badge && (
                <span className="ml-2 text-xs font-medium bg-indigo-500 text-white px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
