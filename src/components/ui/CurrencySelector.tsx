// ============================================
// TradingHub Pro - Currency Selector Component
// Dropdown to select user's preferred currency
// ============================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Globe, Search } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { cn } from '@/lib/utils'

interface CurrencySelectorProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function CurrencySelector({
  size = 'md',
  showLabel = true,
  className,
}: CurrencySelectorProps) {
  const { currency, setCurrency, availableCurrencies, isLoading } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return availableCurrencies

    const query = searchQuery.toLowerCase()
    return availableCurrencies.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query)
    )
  }, [availableCurrencies, searchQuery])

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  }

  const handleSelect = (code: string) => {
    setCurrency(code)
    setIsOpen(false)
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <div className={cn(
        'flex items-center gap-2 bg-gray-800 rounded-lg animate-pulse',
        sizeClasses[size],
        className
      )}>
        <div className="w-4 h-4 bg-gray-700 rounded" />
        <div className="w-12 h-4 bg-gray-700 rounded" />
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700 hover:border-gray-600',
          sizeClasses[size]
        )}
      >
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{currency.symbol}</span>
        {showLabel && (
          <span className="text-gray-400">{currency.code}</span>
        )}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false)
                setSearchQuery('')
              }}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
            >
              {/* Search */}
              <div className="p-2 border-b border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search currencies..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Currency list */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCurrencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-800 transition-colors',
                      c.code === currency.code && 'bg-gray-800'
                    )}
                  >
                    <span className="w-8 text-center font-medium text-gray-300">
                      {c.symbol}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{c.code}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {c.name}
                      </div>
                    </div>
                    {c.code === currency.code && (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </button>
                ))}

                {filteredCurrencies.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No currencies found
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

interface CurrencyBadgeProps {
  className?: string
}

/**
 * Simple badge showing current currency
 */
export function CurrencyBadge({ className }: CurrencyBadgeProps) {
  const { currency, isLoading } = useCurrency()

  if (isLoading) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs animate-pulse',
        className
      )}>
        <div className="w-8 h-3 bg-gray-700 rounded" />
      </div>
    )
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs',
      className
    )}>
      <span className="text-gray-400">{currency.symbol}</span>
      <span className="font-medium">{currency.code}</span>
    </div>
  )
}
