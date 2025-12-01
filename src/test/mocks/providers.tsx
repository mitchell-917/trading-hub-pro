// ============================================
// TradingHub Pro - Mock Data Provider Component
// React context provider for toggling mock/real data
// ============================================

import React, { useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_FLAGS, PRODUCTION_FLAGS, type DataSourceFlags } from './utils'
import { MockDataContext, type MockDataContextValue } from './MockDataContext'

// Re-export type for convenience
export type { DataSourceFlags } from './utils'

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
