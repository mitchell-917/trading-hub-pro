// ============================================
// TradingHub Pro - Mock Providers Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import {
  MockDataProvider,
  useMockData,
} from '../providers'
import {
  PRODUCTION_FLAGS,
  isTestEnvironment,
  isDevelopment,
  isProduction,
  getEnvironmentFlags,
} from '../utils'

describe('MockDataProvider', () => {
  describe('useMockData hook', () => {
    it('should return default flags when not wrapped in provider', () => {
      const { result } = renderHook(() => useMockData())
      
      expect(result.current.flags.useMockMarketData).toBe(true)
      expect(result.current.flags.useMockPortfolio).toBe(true)
      expect(result.current.flags.simulateLatency).toBe(true)
    })

    it('should provide context when wrapped in provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider>{children}</MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      expect(result.current.flags.useMockMarketData).toBe(true)
      expect(typeof result.current.setFlag).toBe('function')
      expect(typeof result.current.isMockEnabled).toBe('function')
    })

    it('should apply initial flags', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider initialFlags={{ useMockMarketData: false }}>
          {children}
        </MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      expect(result.current.flags.useMockMarketData).toBe(false)
      expect(result.current.flags.useMockPortfolio).toBe(true)
    })
  })

  describe('isMockEnabled', () => {
    it('should check if specific mock is enabled', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider initialFlags={{ useMockMarketData: false }}>
          {children}
        </MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      expect(result.current.isMockEnabled('useMockMarketData')).toBe(false)
      expect(result.current.isMockEnabled('useMockPortfolio')).toBe(true)
    })
  })

  describe('setFlag', () => {
    it('should update a specific flag', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider>{children}</MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      expect(result.current.flags.useMockAISignals).toBe(true)
      
      act(() => {
        result.current.setFlag('useMockAISignals', false)
      })
      
      expect(result.current.flags.useMockAISignals).toBe(false)
    })

    it('should update latency range', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider>{children}</MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      act(() => {
        result.current.setFlag('latencyRange', [50, 200])
      })
      
      expect(result.current.flags.latencyRange).toEqual([50, 200])
    })
  })

  describe('enableAllMocks / disableAllMocks', () => {
    it('should enable all mocks', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider initialFlags={PRODUCTION_FLAGS}>
          {children}
        </MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      expect(result.current.flags.useMockMarketData).toBe(false)
      
      act(() => {
        result.current.enableAllMocks()
      })
      
      expect(result.current.flags.useMockMarketData).toBe(true)
      expect(result.current.flags.useMockPortfolio).toBe(true)
      expect(result.current.flags.useMockOrders).toBe(true)
    })

    it('should disable all mocks', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider>{children}</MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      expect(result.current.flags.useMockMarketData).toBe(true)
      
      act(() => {
        result.current.disableAllMocks()
      })
      
      expect(result.current.flags.useMockMarketData).toBe(false)
      expect(result.current.flags.useMockPortfolio).toBe(false)
      expect(result.current.flags.simulateLatency).toBe(false)
    })
  })

  describe('simulateDelay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('should simulate latency when enabled', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider initialFlags={{ 
          simulateLatency: true, 
          latencyRange: [100, 100] 
        }}>
          {children}
        </MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      let resolved = false
      act(() => {
        result.current.simulateDelay().then(() => {
          resolved = true
        })
      })
      
      expect(resolved).toBe(false)
      
      await act(async () => {
        vi.advanceTimersByTime(100)
      })
      
      expect(resolved).toBe(true)
    })

    it('should not delay when latency is disabled', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider initialFlags={{ simulateLatency: false }}>
          {children}
        </MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      let resolved = false
      await act(async () => {
        await result.current.simulateDelay()
        resolved = true
      })
      
      expect(resolved).toBe(true)
    })

    afterEach(() => {
      vi.useRealTimers()
    })
  })

  describe('resetFlags', () => {
    it('should reset to default flags', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockDataProvider initialFlags={{ 
          useMockMarketData: false,
          simulateLatency: false 
        }}>
          {children}
        </MockDataProvider>
      )
      
      const { result } = renderHook(() => useMockData(), { wrapper })
      
      expect(result.current.flags.useMockMarketData).toBe(false)
      
      act(() => {
        result.current.resetFlags()
      })
      
      expect(result.current.flags.useMockMarketData).toBe(true)
      expect(result.current.flags.simulateLatency).toBe(true)
    })
  })
})

describe('Environment helpers', () => {
  describe('isTestEnvironment', () => {
    it('should return true in test environment', () => {
      expect(isTestEnvironment()).toBe(true)
    })
  })

  describe('isDevelopment / isProduction', () => {
    it('should detect development mode', () => {
      // In Vitest, typically DEV is false
      expect(typeof isDevelopment()).toBe('boolean')
    })

    it('should detect production mode', () => {
      expect(typeof isProduction()).toBe('boolean')
    })

    it('should not be both dev and prod', () => {
      expect(isDevelopment() && isProduction()).toBe(false)
    })
  })

  describe('getEnvironmentFlags', () => {
    it('should return appropriate flags based on environment', () => {
      const flags = getEnvironmentFlags()
      
      expect(flags).toHaveProperty('useMockMarketData')
      expect(flags).toHaveProperty('useMockPortfolio')
      expect(flags).toHaveProperty('simulateLatency')
    })
  })
})

describe('PRODUCTION_FLAGS', () => {
  it('should have all mocks disabled', () => {
    expect(PRODUCTION_FLAGS.useMockMarketData).toBe(false)
    expect(PRODUCTION_FLAGS.useMockPortfolio).toBe(false)
    expect(PRODUCTION_FLAGS.useMockOrders).toBe(false)
    expect(PRODUCTION_FLAGS.useMockAISignals).toBe(false)
    expect(PRODUCTION_FLAGS.useMockNews).toBe(false)
  })

  it('should have latency simulation disabled', () => {
    expect(PRODUCTION_FLAGS.simulateLatency).toBe(false)
    expect(PRODUCTION_FLAGS.latencyRange).toEqual([0, 0])
  })
})
