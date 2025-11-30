// ============================================
// TradingHub Pro - Currency Context Provider
// Provides currency state throughout the app
// ============================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  type CurrencyConfig,
  SUPPORTED_CURRENCIES,
  getCurrencyConfig,
  getStoredCurrency,
  setStoredCurrency,
  detectAndSetCurrency,
} from '@/services/currency'

interface CurrencyContextValue {
  currency: CurrencyConfig
  currencyCode: string
  setCurrency: (code: string) => void
  isLoading: boolean
  isAutoDetected: boolean
  availableCurrencies: CurrencyConfig[]
  formatPrice: (price: number, decimals?: number) => string
  formatCompact: (value: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

interface CurrencyProviderProps {
  children: ReactNode
  defaultCurrency?: string
  autoDetect?: boolean
}

export function CurrencyProvider({
  children,
  defaultCurrency = 'USD',
  autoDetect = true,
}: CurrencyProviderProps) {
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    return getStoredCurrency() || defaultCurrency
  })
  
  // Determine initial loading state: only load if autoDetect is on AND no stored currency
  const [isLoading, setIsLoading] = useState(() => {
    if (!autoDetect) return false
    const stored = getStoredCurrency()
    // If we have a stored preference (that's not just default USD), no need to auto-detect
    if (stored && stored !== 'USD') return false
    return true
  })

  // Auto-detect currency on mount (only runs if isLoading was initialized to true)
  useEffect(() => {
    if (!autoDetect) return

    // Only auto-detect if no stored preference
    const stored = getStoredCurrency()
    if (stored && stored !== 'USD') return

    let cancelled = false
    
    detectAndSetCurrency()
      .then((config) => {
        if (!cancelled) {
          setCurrencyCode(config.code)
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })
    
    return () => {
      cancelled = true
    }
  }, [autoDetect])

  const setCurrency = useCallback((code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyCode(code)
      setStoredCurrency(code)
    }
  }, [])

  const currency = getCurrencyConfig(currencyCode)

  const formatPrice = useCallback(
    (price: number, decimals?: number) => {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: decimals ?? currency.decimals,
        maximumFractionDigits: decimals ?? currency.decimals,
      }).format(price)
    },
    [currency]
  )

  const formatCompact = useCallback(
    (value: number) => {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2,
      }).format(value)
    },
    [currency]
  )

  const availableCurrencies = Object.values(SUPPORTED_CURRENCIES)
  
  // Track if currency was auto-detected (not manually set by user)
  const isAutoDetected = !getStoredCurrency() || getStoredCurrency() === currencyCode

  const value: CurrencyContextValue = {
    currency,
    currencyCode,
    setCurrency,
    isLoading,
    isAutoDetected,
    availableCurrencies,
    formatPrice,
    formatCompact,
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
