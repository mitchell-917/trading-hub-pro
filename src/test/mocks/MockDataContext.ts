// ============================================
// TradingHub Pro - Mock Data Context
// Context definition for mock data provider
// ============================================

import { createContext } from 'react'
import type { DataSourceFlags } from './utils'

export interface MockDataContextValue {
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

export const MockDataContext = createContext<MockDataContextValue | null>(null)
