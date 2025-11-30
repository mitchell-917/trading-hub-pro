// ============================================
// TradingHub Pro - Select Component
// Dropdown select with search and custom rendering
// ============================================

import { useState, useRef, useEffect, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  description?: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
  className?: string
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      label,
      error,
      disabled = false,
      searchable = false,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    const filteredOptions = searchable
      ? options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchQuery('')
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, [isOpen, searchable])

    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return
      onChange(option.value)
      setIsOpen(false)
      setSearchQuery('')
    }

    return (
      <div ref={ref} className={cn('relative w-full', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg text-left text-sm',
              'bg-gray-800/50 border border-gray-700/50',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500/50',
              isOpen && 'ring-2 ring-indigo-500/50 border-indigo-500/50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedOption?.icon}
                <span
                  className={cn(
                    'truncate',
                    selectedOption ? 'text-white' : 'text-gray-500'
                  )}
                >
                  {selectedOption?.label || placeholder}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform flex-shrink-0',
                  isOpen && 'transform rotate-180'
                )}
              />
            </div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
              >
                {searchable && (
                  <div className="p-2 border-b border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-md text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto py-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No options found
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(option)}
                        disabled={option.disabled}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-sm transition-colors',
                          'flex items-center gap-2',
                          option.disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-700/50 cursor-pointer',
                          option.value === value && 'bg-indigo-500/10'
                        )}
                      >
                        {option.icon && (
                          <span className="flex-shrink-0">{option.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white truncate">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                        {option.value === value && (
                          <Check className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
