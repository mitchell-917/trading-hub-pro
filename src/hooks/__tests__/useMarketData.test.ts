// ============================================
// TradingHub Pro - useMarketData Hook Tests
// Comprehensive tests for market data hooks
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMarketData, useMultipleTickers, useOHLCVData } from '../useMarketData'

// Mock the mock-data module
vi.mock('@/lib/mock-data', () => ({
  generateTicker: vi.fn((_symbol: string) => ({
    symbol: _symbol,
    name: `${_symbol} Token`,
    price: 50000,
    change: 1000,
    changePercent: 2.04,
    volume: 1000000000,
    high24h: 52000,
    low24h: 48000,
    lastUpdated: Date.now(),
  })),
  generateOHLCVData: vi.fn((_symbol: string, count: number) => {
    const data = []
    const now = Date.now()
    for (let i = 0; i < count; i++) {
      data.push({
        timestamp: now - (count - i) * 3600000,
        open: 50000 + i * 10,
        high: 50100 + i * 10,
        low: 49900 + i * 10,
        close: 50050 + i * 10,
        volume: 1000000,
      })
    }
    return data
  }),
  SYMBOLS: [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
  ],
  randomBetween: vi.fn(() => 0.001),
}))

describe('useMarketData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('with string parameter', () => {
    it('accepts a symbol string', async () => {
      const { result } = renderHook(() => useMarketData('BTC'))
      
      expect(result.current.isLoading).toBe(true)
      
      act(() => {
        vi.advanceTimersByTime(600)
      })
      
      expect(result.current.isLoading).toBe(false)
      expect(result.current.ticker?.symbol).toBe('BTC')
    })
  })

  describe('with options object', () => {
    it('returns initial loading state', () => {
      const { result } = renderHook(() => 
        useMarketData({ symbol: 'BTC' })
      )
      
      expect(result.current.isLoading).toBe(true)
      expect(result.current.ticker).toBe(null)
      expect(result.current.isConnected).toBe(false)
    })

    it('fetches ticker data after connection delay', () => {
      const { result } = renderHook(() => 
        useMarketData({ symbol: 'BTC' })
      )
      
      act(() => {
        vi.advanceTimersByTime(600)
      })
      
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isConnected).toBe(true)
      expect(result.current.ticker).not.toBe(null)
    })

    it('respects enabled option', () => {
      const { result } = renderHook(() => 
        useMarketData({ symbol: 'BTC', enabled: false })
      )
      
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      // Should remain in initial state when disabled
      expect(result.current.ticker).toBe(null)
    })

    it('provides reconnect function', () => {
      const { result } = renderHook(() => 
        useMarketData({ symbol: 'BTC' })
      )
      
      act(() => {
        vi.advanceTimersByTime(600)
      })
      
      expect(result.current.isConnected).toBe(true)
      
      // Call reconnect
      act(() => {
        result.current.reconnect()
      })
      
      expect(result.current.isConnected).toBe(false)
      expect(result.current.isLoading).toBe(true)
    })

    it('cleans up on unmount', () => {
      const { result, unmount } = renderHook(() => 
        useMarketData({ symbol: 'BTC' })
      )
      
      act(() => {
        vi.advanceTimersByTime(600)
      })
      
      expect(result.current.isConnected).toBe(true)
      
      unmount()
      
      // Should not throw or cause issues
    })
  })
})

describe('useMultipleTickers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useMultipleTickers())
    
    expect(result.current.isLoading).toBe(true)
    expect(Object.keys(result.current.tickers)).toHaveLength(0)
  })

  it('fetches multiple tickers', () => {
    const { result } = renderHook(() => 
      useMultipleTickers({ symbols: ['BTC', 'ETH'] })
    )
    
    act(() => {
      vi.advanceTimersByTime(400)
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isConnected).toBe(true)
    expect(result.current.tickers).toHaveProperty('BTC')
    expect(result.current.tickers).toHaveProperty('ETH')
  })

  it('uses default symbols when none provided', () => {
    const { result } = renderHook(() => useMultipleTickers())
    
    act(() => {
      vi.advanceTimersByTime(400)
    })
    
    expect(result.current.isConnected).toBe(true)
    expect(Object.keys(result.current.tickers).length).toBeGreaterThan(0)
  })

  it('respects enabled option', () => {
    const { result } = renderHook(() => 
      useMultipleTickers({ enabled: false })
    )
    
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(result.current.isLoading).toBe(true)
    expect(Object.keys(result.current.tickers)).toHaveLength(0)
  })
})

describe('useOHLCVData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('returns initial loading state', () => {
    const { result } = renderHook(() => 
      useOHLCVData({ symbol: 'BTC' })
    )
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toHaveLength(0)
  })

  it('fetches OHLCV data', () => {
    const { result } = renderHook(() => 
      useOHLCVData({ symbol: 'BTC', count: 50 })
    )
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data.length).toBe(50)
    expect(result.current.data[0]).toHaveProperty('open')
    expect(result.current.data[0]).toHaveProperty('high')
    expect(result.current.data[0]).toHaveProperty('low')
    expect(result.current.data[0]).toHaveProperty('close')
    expect(result.current.data[0]).toHaveProperty('volume')
  })

  it('respects timeframe option', () => {
    const { result } = renderHook(() => 
      useOHLCVData({ symbol: 'BTC', timeframe: '1d' })
    )
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data.length).toBeGreaterThan(0)
  })

  it('respects enabled option', () => {
    const { result } = renderHook(() => 
      useOHLCVData({ symbol: 'BTC', enabled: false })
    )
    
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    expect(result.current.data).toHaveLength(0)
  })

  it('provides refetch function', () => {
    const { result } = renderHook(() => 
      useOHLCVData({ symbol: 'BTC' })
    )
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(typeof result.current.refetch).toBe('function')
    
    // Call refetch
    act(() => {
      result.current.refetch()
    })
    
    // Should trigger a new fetch - the refetchCounter increments
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.data.length).toBeGreaterThan(0)
  })

  it('refetches when symbol changes', () => {
    const { result, rerender } = renderHook(
      ({ symbol }) => useOHLCVData({ symbol }),
      { initialProps: { symbol: 'BTC' } }
    )
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.isLoading).toBe(false)
    
    rerender({ symbol: 'ETH' })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data.length).toBeGreaterThan(0)
  })
})
