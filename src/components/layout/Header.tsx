// ============================================
// TradingHub Pro - Header Component
// Main navigation and branding
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  Bell,
  Settings,
  User,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Wallet,
  Activity,
  HelpCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useTradingStore } from '@/lib/store'
import { formatCurrency, cn } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle?: () => void
  className?: string
}

export function Header({ onMenuToggle, className }: HeaderProps) {
  const positions = useTradingStore((s) => s.positions)
  const settings = useTradingStore((s) => s.settings)
  const updateSettings = useTradingStore((s) => s.updateSettings)

  // Compute portfolio values with useMemo to avoid infinite loops
  const portfolio = useMemo(() => {
    const totalValue = positions.reduce(
      (sum, p) => sum + p.quantity * p.currentPrice,
      0
    )
    const unrealizedPnL = positions.reduce(
      (sum, p) => sum + p.unrealizedPnL,
      0
    )
    const dailyPnL = unrealizedPnL * 0.3
    const dailyPnLPercent = totalValue > 0 ? (dailyPnL / totalValue) * 100 : 0
    const buyingPower = 100000 - totalValue

    return {
      totalValue,
      dailyPnL,
      dailyPnLPercent,
      unrealizedPnL,
      positionsCount: positions.length,
      buyingPower,
    }
  }, [positions])

  const toggleTheme = () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const notifications = [
    { id: 1, type: 'success', message: 'Order filled: Buy 0.5 BTC @ $51,234', time: '2m ago' },
    { id: 2, type: 'warning', message: 'Stop loss triggered on ETH position', time: '15m ago' },
    { id: 3, type: 'info', message: 'New AI signal available for SOLUSD', time: '1h ago' },
  ]

  return (
    <header className={cn(
      'h-16 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800',
      'flex items-center justify-between px-4 lg:px-6',
      'sticky top-0 z-50',
      className
    )}>
      {/* Left: Logo & Menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">TradingHub</h1>
            <span className="text-xs text-indigo-400">PRO</span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-2 ml-4">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Center: Portfolio Summary */}
      <div className="hidden md:flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-gray-400">Portfolio Value</p>
          <p className="font-semibold number-mono">{formatCurrency(portfolio.totalValue)}</p>
        </div>
        <div className="h-8 w-px bg-gray-700" />
        <div className="text-center">
          <p className="text-xs text-gray-400">Today's P&L</p>
          <p className={cn(
            'font-semibold number-mono',
            portfolio.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {portfolio.dailyPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.dailyPnL)}
          </p>
        </div>
        <div className="h-8 w-px bg-gray-700" />
        <div className="text-center">
          <p className="text-xs text-gray-400">Buying Power</p>
          <p className="font-semibold number-mono text-indigo-400">
            {formatCurrency(portfolio.buyingPower)}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    <Badge color="purple" size="sm">{notifications.length}</Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                            notif.type === 'success' && 'bg-green-500/20',
                            notif.type === 'warning' && 'bg-yellow-500/20',
                            notif.type === 'info' && 'bg-blue-500/20'
                          )}>
                            <Activity className={cn(
                              'w-4 h-4',
                              notif.type === 'success' && 'text-green-400',
                              notif.type === 'warning' && 'text-yellow-400',
                              notif.type === 'info' && 'text-blue-400'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-700">
                    <Button variant="ghost" size="sm" fullWidth>
                      View All Notifications
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <ChevronDown className={cn(
              'w-4 h-4 text-gray-400 transition-transform',
              isProfileOpen && 'rotate-180'
            )} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-700">
                    <p className="font-medium">John Trader</p>
                    <p className="text-xs text-gray-400">john@tradinghub.pro</p>
                  </div>
                  <div className="p-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      <Wallet className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Wallet</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Help & Support</span>
                    </button>
                  </div>
                  <div className="p-1 border-t border-gray-700">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
