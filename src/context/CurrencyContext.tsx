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
  const [isLoading, setIsLoading] = useState(autoDetect)

  // Auto-detect currency on mount
  useEffect(() => {
    if (!autoDetect) {
      setIsLoading(false)
      return
    }

    // Only auto-detect if no stored preference
    const stored = getStoredCurrency()
    if (stored && stored !== 'USD') {
      setIsLoading(false)
      return
    }

    detectAndSetCurrency()
      .then((config) => {
        setCurrencyCode(config.code)
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
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

  const value: CurrencyContextValue = {
    currency,
    currencyCode,
    setCurrency,
    isLoading,
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
