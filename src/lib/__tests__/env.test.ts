// ============================================
// TradingHub Pro - Environment Validation Tests
// ============================================

import { describe, it, expect } from 'vitest'
import {
  getEnv,
  useMockData,
  devToolsEnabled,
  aiEnabled,
  realtimeEnabled,
  getApiConfig,
  getAnalyticsConfig,
} from '../env'

describe('Environment Validation', () => {
  describe('getEnv', () => {
    it('should return environment object', () => {
      const env = getEnv()
      
      expect(env).toBeDefined()
      expect(typeof env).toBe('object')
    })

    it('should have mock data flag', () => {
      const env = getEnv()
      expect(env).toHaveProperty('VITE_USE_MOCK_DATA')
    })

    it('should have feature flags', () => {
      const env = getEnv()
      expect(env).toHaveProperty('VITE_AI_ENABLED')
      expect(env).toHaveProperty('VITE_REALTIME_ENABLED')
    })

    it('should have API URLs', () => {
      const env = getEnv()
      expect(env).toHaveProperty('VITE_BINANCE_WS_URL')
      expect(env).toHaveProperty('VITE_BINANCE_REST_URL')
    })
  })

  describe('helper functions', () => {
    it('useMockData should return boolean', () => {
      const result = useMockData()
      expect(typeof result).toBe('boolean')
    })

    it('devToolsEnabled should return boolean', () => {
      const result = devToolsEnabled()
      expect(typeof result).toBe('boolean')
    })

    it('aiEnabled should return boolean', () => {
      const result = aiEnabled()
      expect(typeof result).toBe('boolean')
    })

    it('realtimeEnabled should return boolean', () => {
      const result = realtimeEnabled()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('getApiConfig', () => {
    it('should return API configuration object', () => {
      const config = getApiConfig()
      
      expect(config).toBeDefined()
      expect(config).toHaveProperty('binanceWsUrl')
      expect(config).toHaveProperty('binanceRestUrl')
      expect(config).toHaveProperty('allowedOrigins')
    })

    it('should have valid WebSocket URL', () => {
      const config = getApiConfig()
      expect(config.binanceWsUrl).toMatch(/^wss:\/\//)
    })

    it('should have valid REST URL', () => {
      const config = getApiConfig()
      expect(config.binanceRestUrl).toMatch(/^https:\/\//)
    })

    it('should have allowed origins array', () => {
      const config = getApiConfig()
      expect(Array.isArray(config.allowedOrigins)).toBe(true)
    })
  })

  describe('getAnalyticsConfig', () => {
    it('should return analytics configuration object', () => {
      const config = getAnalyticsConfig()
      
      expect(config).toBeDefined()
      expect(config).toHaveProperty('sentryDsn')
      expect(config).toHaveProperty('analyticsId')
    })
  })
})
