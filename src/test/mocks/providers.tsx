// ============================================
// TradingHub Pro - Mock Data Providers
// React context for toggling mock/real data
// ============================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'

/**
 * Feature flags for data sources
 */
export interface DataSourceFlags {
  /** Use mock data for market prices */
  useMockMarketData: boolean
  /** Use mock data for portfolio */
  useMockPortfolio: boolean
  /** Use mock data for orders */
  useMockOrders: boolean
  /** Use mock data for AI signals */
  useMockAISignals: boolean
  /** Use mock data for news */
  useMockNews: boolean
  /** Simulate network latency */
  simulateLatency: boolean
  /** Latency range in milliseconds [min, max] */
  latencyRange: [number, number]
}

/**
 * Default feature flags (all mock in development)
 */
const DEFAULT_FLAGS: DataSourceFlags = {
  useMockMarketData: true,
  useMockPortfolio: true,
  useMockOrders: true,
  useMockAISignals: true,
  useMockNews: true,
  simulateLatency: true,
  latencyRange: [100, 500],
}

/**
 * Production flags (all real data)
 */
export const PRODUCTION_FLAGS: DataSourceFlags = {
  useMockMarketData: false,
  useMockPortfolio: false,
  useMockOrders: false,
  useMockAISignals: false,
  useMockNews: false,
  simulateLatency: false,
  latencyRange: [0, 0],
}

interface MockDataContextValue {
  /** Current feature flags */
  flags: DataSourceFlags
  /** Check if a specific mock is enabled */
  isMockEnabled: (key: keyof Omit<DataSourceFlags, 'simulateLatency' | 'latencyRange'>) => boolean
  /** Update a specific flag */
  setFlag: <K extends keyof DataSourceFlags>(key: K, value: DataSourceFlags[K]) => void
  /** Enable all mocks */
  enableAllMocks: () => void
  /** Disable all mocks (use real data) */
  disableAllMocks: () => void
  /** Simulate network latency */
  simulateDelay: () => Promise<void>
  /** Reset to default flags */
  resetFlags: () => void
}

const MockDataContext = createContext<MockDataContextValue | null>(null)

interface MockDataProviderProps {
  children: ReactNode
  /** Initial flags (defaults to development settings) */
  initialFlags?: Partial<DataSourceFlags>
}

/**
 * Provider for mock data feature flags
 * 
 * @example
 * ```tsx
 * <MockDataProvider initialFlags={{ useMockMarketData: false }}>
 *   <App />
 * </MockDataProvider>
 * ```
 */
export function MockDataProvider({ 
  children, 
  initialFlags = {} 
}: MockDataProviderProps): React.ReactElement {
  const [flags, setFlags] = useState<DataSourceFlags>(() => ({
    ...DEFAULT_FLAGS,
    ...initialFlags,
  }))

  const isMockEnabled = useCallback(
    (key: keyof Omit<DataSourceFlags, 'simulateLatency' | 'latencyRange'>) => flags[key],
    [flags]
  )

  const setFlag = useCallback(<K extends keyof DataSourceFlags>(
    key: K, 
    value: DataSourceFlags[K]
  ) => {
    setFlags(prev => ({ ...prev, [key]: value }))
  }, [])

  const enableAllMocks = useCallback(() => {
    setFlags(DEFAULT_FLAGS)
  }, [])

  const disableAllMocks = useCallback(() => {
    setFlags(PRODUCTION_FLAGS)
  }, [])

  const simulateDelay = useCallback(async () => {
    if (!flags.simulateLatency) return
    
    const [min, max] = flags.latencyRange
    const delay = Math.random() * (max - min) + min
    await new Promise(resolve => setTimeout(resolve, delay))
  }, [flags.simulateLatency, flags.latencyRange])

  const resetFlags = useCallback(() => {
    setFlags(DEFAULT_FLAGS)
  }, [])

  const value = useMemo((): MockDataContextValue => ({
    flags,
    isMockEnabled,
    setFlag,
    enableAllMocks,
    disableAllMocks,
    simulateDelay,
    resetFlags,
  }), [flags, isMockEnabled, setFlag, enableAllMocks, disableAllMocks, simulateDelay, resetFlags])

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  )
}

/**
 * Hook to access mock data settings
 * 
 * @example
 * ```tsx
 * function MarketData() {
 *   const { isMockEnabled, simulateDelay } = useMockData()
 *   
 *   useEffect(() => {
 *     async function fetchData() {
 *       await simulateDelay()
 *       if (isMockEnabled('useMockMarketData')) {
 *         // Use mock generator
 *       } else {
 *         // Fetch from API
 *       }
 *     }
 *     fetchData()
 *   }, [])
 * }
 * ```
 */
export function useMockData(): MockDataContextValue {
  const context = useContext(MockDataContext)
  
  if (!context) {
    // Return default implementation if not in provider
    // This allows hooks to work outside provider for backward compatibility
    return {
      flags: DEFAULT_FLAGS,
      isMockEnabled: () => true,
      setFlag: () => {},
      enableAllMocks: () => {},
      disableAllMocks: () => {},
      simulateDelay: () => Promise.resolve(),
      resetFlags: () => {},
    }
  }
  
  return context
}

/**
 * Helper to determine if running in test environment
 */
export function isTestEnvironment(): boolean {
  return import.meta.env.MODE === 'test' || 
         typeof (globalThis as { vi?: unknown }).vi !== 'undefined'
}

/**
 * Helper to determine if running in development
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV
}

/**
 * Helper to determine if running in production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD
}

/**
 * Get recommended flags based on environment
 */
export function getEnvironmentFlags(): DataSourceFlags {
  if (isProduction()) {
    return PRODUCTION_FLAGS
  }
  
  // In development and test, use mocks
  return DEFAULT_FLAGS
}
