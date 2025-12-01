// ============================================
// TradingHub Pro - Currency Context Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { CurrencyProvider, useCurrency } from '../CurrencyContext'

// Mock the currency service
vi.mock('@/services/currency', () => ({
  SUPPORTED_CURRENCIES: {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2 },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', decimals: 2 },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2 },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0 },
  },
  getCurrencyConfig: vi.fn((code: string) => ({
    code,
    symbol: code === 'EUR' ? '€' : code === 'GBP' ? '£' : code === 'JPY' ? '¥' : '$',
    name: code,
    locale: code === 'EUR' ? 'de-DE' : code === 'GBP' ? 'en-GB' : code === 'JPY' ? 'ja-JP' : 'en-US',
    decimals: code === 'JPY' ? 0 : 2,
  })),
  getStoredCurrency: vi.fn(() => null),
  setStoredCurrency: vi.fn(),
  detectAndSetCurrency: vi.fn().mockResolvedValue({
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
  }),
}))

import { 
  getStoredCurrency, 
  setStoredCurrency, 
  detectAndSetCurrency 
} from '@/services/currency'

describe('CurrencyContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getStoredCurrency).mockReturnValue(null)
  })

  describe('CurrencyProvider', () => {
    it('should render children', () => {
      render(
        <CurrencyProvider>
          <div data-testid="child">Content</div>
        </CurrencyProvider>
      )
      
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should use default currency when no stored preference', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider defaultCurrency="EUR">{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      expect(result.current.currencyCode).toBe('EUR')
    })

    it('should use stored currency if available', () => {
      vi.mocked(getStoredCurrency).mockReturnValue('GBP')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      expect(result.current.currencyCode).toBe('GBP')
    })

    it('should auto-detect currency when enabled', async () => {
      vi.mocked(detectAndSetCurrency).mockResolvedValue({
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        locale: 'de-DE',
        decimals: 2,
      })
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider autoDetect={true}>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(detectAndSetCurrency).toHaveBeenCalled()
    })

    it('should not auto-detect when disabled', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider autoDetect={false}>{children}</CurrencyProvider>
      )
      
      renderHook(() => useCurrency(), { wrapper })
      
      expect(detectAndSetCurrency).not.toHaveBeenCalled()
    })

    it('should skip auto-detect when stored currency exists', () => {
      vi.mocked(getStoredCurrency).mockReturnValue('GBP')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider autoDetect={true}>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      expect(result.current.currencyCode).toBe('GBP')
      expect(detectAndSetCurrency).not.toHaveBeenCalled()
    })
  })

  describe('useCurrency', () => {
    it('should throw when used outside provider', () => {
      expect(() => {
        renderHook(() => useCurrency())
      }).toThrow('useCurrency must be used within a CurrencyProvider')
    })

    it('should return currency config', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      expect(result.current.currency).toBeDefined()
      expect(result.current.currency.code).toBeDefined()
      expect(result.current.currency.symbol).toBeDefined()
    })

    it('should return available currencies', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      expect(result.current.availableCurrencies).toBeInstanceOf(Array)
      expect(result.current.availableCurrencies.length).toBeGreaterThan(0)
    })
  })

  describe('setCurrency', () => {
    it('should update currency code', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      act(() => {
        result.current.setCurrency('EUR')
      })
      
      expect(result.current.currencyCode).toBe('EUR')
    })

    it('should persist currency choice', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      act(() => {
        result.current.setCurrency('GBP')
      })
      
      expect(setStoredCurrency).toHaveBeenCalledWith('GBP')
    })

    it('should ignore unsupported currencies', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider defaultCurrency="USD">{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      act(() => {
        result.current.setCurrency('INVALID')
      })
      
      expect(result.current.currencyCode).toBe('USD')
    })
  })

  describe('formatPrice', () => {
    it('should format price with currency symbol', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider defaultCurrency="USD">{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      const formatted = result.current.formatPrice(1234.56)
      
      expect(formatted).toContain('$')
      expect(formatted).toContain('1,234')
    })

    it('should respect custom decimals', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider defaultCurrency="USD">{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      const formatted = result.current.formatPrice(1234.5678, 4)
      
      expect(formatted).toContain('5678')
    })

    it('should use currency locale formatting', () => {
      vi.mocked(getStoredCurrency).mockReturnValue('EUR')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      const formatted = result.current.formatPrice(1234.56)
      
      // EUR uses different formatting
      expect(formatted).toContain('€')
    })
  })

  describe('formatCompact', () => {
    it('should format large numbers compactly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider defaultCurrency="USD">{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      const formatted = result.current.formatCompact(1000000)
      
      expect(formatted).toContain('$')
      expect(formatted.toLowerCase()).toMatch(/m|million/i)
    })

    it('should handle billions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider defaultCurrency="USD">{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      const formatted = result.current.formatCompact(1500000000)
      
      expect(formatted).toContain('$')
      expect(formatted.toLowerCase()).toMatch(/b|billion/i)
    })
  })

  describe('isLoading', () => {
    it('should be false when auto-detect is disabled', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider autoDetect={false}>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      expect(result.current.isLoading).toBe(false)
    })

    it('should be false when stored currency exists', () => {
      vi.mocked(getStoredCurrency).mockReturnValue('GBP')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider autoDetect={true}>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      expect(result.current.isLoading).toBe(false)
    })

    it('should be true during auto-detection', () => {
      vi.mocked(detectAndSetCurrency).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider autoDetect={true}>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('isAutoDetected', () => {
    it('should track if currency was auto-detected', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )
      
      const { result } = renderHook(() => useCurrency(), { wrapper })
      
      expect(typeof result.current.isAutoDetected).toBe('boolean')
    })
  })
})
