// ============================================
// TradingHub Pro - Mock Data Providers
// React context for toggling mock/real data
// ============================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_FLAGS, PRODUCTION_FLAGS, type DataSourceFlags } from './utils'

// Re-export type for convenience
export type { DataSourceFlags } from './utils'

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

// NOTE: Utility functions (isTestEnvironment, isDevelopment, etc.) 
// are in utils.ts - import from there directly
