// ============================================
// TradingHub Pro - Utility Functions
// ============================================

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

/**
 * Format a number as currency
 */
export const formatCurrency = (
  value: number,
  decimals: number = 2,
  currency: string = 'USD'
): string => {
  if (typeof decimals === 'string') {
    // Handle old API signature: formatCurrency(value, currency)
    currency = decimals
    decimals = 2
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a number with specified decimal places
 */
export const formatNumber = (
  value: number,
  decimals: number = 2
): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a number as percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2
): string => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Format a number with compact notation (e.g., 1.2M, 3.4B)
 */
export const formatCompact = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a number as a percentage (legacy)
 */
export const formatPercent = (
  value: number,
  options?: { showSign?: boolean; decimals?: number }
): string => {
  const { showSign = true, decimals = 2 } = options || {}
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Format a price based on its magnitude
 */
export const formatPrice = (price: number): string => {
  if (price >= 10000) {
    return price.toFixed(0)
  } else if (price >= 1000) {
    return price.toFixed(1)
  } else if (price >= 1) {
    return price.toFixed(2)
  } else if (price >= 0.01) {
    return price.toFixed(4)
  } else {
    return price.toFixed(6)
  }
}

/**
 * Format a quantity/volume
 */
export const formatQuantity = (quantity: number): string => {
  if (quantity >= 1) {
    return quantity.toFixed(4)
  } else {
    return quantity.toFixed(6)
  }
}

/**
 * Format a timestamp to a readable date/time
 */
export const formatTimestamp = (
  timestamp: number,
  formatString: string = 'MMM d, yyyy HH:mm'
): string => {
  return format(new Date(timestamp), formatString)
}

/**
 * Format a timestamp as relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

/**
 * Format a timestamp for display in lists
 */
export const formatListTime = (timestamp: number): string => {
  const date = new Date(timestamp)

  if (isToday(date)) {
    return format(date, 'HH:mm')
  } else if (isYesterday(date)) {
    return 'Yesterday'
  } else {
    return format(date, 'MMM d')
  }
}

/**
 * Calculate percentage change between two values
 */
export const calculateChange = (
  current: number,
  previous: number
): { change: number; changePercent: number } => {
  const change = current - previous
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0
  return { change, changePercent }
}

/**
 * Get CSS class for profit/loss coloring
 */
export const getPnLClass = (value: number): string => {
  if (value > 0) return 'text-profit'
  if (value < 0) return 'text-loss'
  return 'text-neutral'
}

/**
 * Get CSS class for background profit/loss coloring
 */
export const getPnLBgClass = (value: number): string => {
  if (value > 0) return 'bg-profit/10 text-profit'
  if (value < 0) return 'bg-loss/10 text-loss'
  return 'bg-neutral/10 text-neutral'
}

/**
 * Clamp a number between min and max values
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Generate a unique ID
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Debounce a function
 */
export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle a function
 */
export const throttle = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

/**
 * Group an array of objects by a key
 */
export const groupBy = <T extends Record<string, unknown>>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>
  )
}

/**
 * Sort an array of objects by multiple keys
 */
export const sortBy = <T>(
  array: T[],
  ...keys: Array<keyof T | ((item: T) => number | string)>
): T[] => {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      const aVal = typeof key === 'function' ? key(a) : a[key]
      const bVal = typeof key === 'function' ? key(b) : b[key]

      if (aVal < bVal) return -1
      if (aVal > bVal) return 1
    }
    return 0
  })
}

/**
 * Classnames utility for conditional class joining
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}
