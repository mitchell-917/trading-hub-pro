// ============================================
// TradingHub Pro - Market Data Hook Tests
// Tests for Binance API integration
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useMarketData, useOHLCVData, useMultipleTickers } from '../useMarketData'

// Mock the Binance API client
vi.mock('@/services/api/binance', () => ({
  binanceClient: {
    getTicker: vi.fn(),
    getOHLCV: vi.fn(),
    getMultipleTickers: vi.fn(),
  },
}))

// Mock the WebSocket
vi.mock('@/services/api/websocket', () => ({
  binanceWebSocket: {
    subscribeTicker: vi.fn(() => vi.fn()),
    subscribeMultipleTickers: vi.fn(() => vi.fn()),
  },
}))

// Mock the config
vi.mock('@/services/api/config', () => ({
  CRYPTO_MAPPINGS: {
    BTC: { binanceSymbol: 'BTCUSDT', name: 'Bitcoin' },
    ETH: { binanceSymbol: 'ETHUSDT', name: 'Ethereum' },
    SOL: { binanceSymbol: 'SOLUSDT', name: 'Solana' },
    XRP: { binanceSymbol: 'XRPUSDT', name: 'Ripple' },
    ADA: { binanceSymbol: 'ADAUSDT', name: 'Cardano' },
  },
}))

// Import after mocking
import { binanceClient } from '@/services/api/binance'

const mockTicker = {
  symbol: 'BTC',
  name: 'Bitcoin',
  price: 50000,
  change: 1250,
  changePercent: 2.5,
  volume: 1000000,
  high24h: 51000,
  low24h: 49000,
  lastUpdated: Date.now(),
}

const mockOHLCV = [
  {
    timestamp: Date.now() - 3600000,
    open: 49500,
    high: 50500,
    low: 49000,
    close: 50000,
    volume: 100,
  },
  {
    timestamp: Date.now(),
    open: 50000,
    high: 51000,
    low: 49500,
    close: 50500,
    volume: 150,
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useMarketData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(binanceClient.getTicker).mockResolvedValue(mockTicker)
    vi.mocked(binanceClient.getOHLCV).mockResolvedValue(mockOHLCV)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches ticker data for a valid crypto symbol', async () => {
    const { result } = renderHook(() => useMarketData('BTC'), {
      wrapper: createWrapper(),
    })

    // Initial loading state
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(binanceClient.getTicker).toHaveBeenCalledWith('BTC')
    expect(result.current.ticker).toEqual(mockTicker)
  })

  it('returns null ticker for invalid symbol', async () => {
    const { result } = renderHook(() => useMarketData('INVALID_SYMBOL'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Invalid symbols are not fetched
    expect(binanceClient.getTicker).not.toHaveBeenCalled()
    expect(result.current.ticker).toBeNull()
  })

  it('handles options object input', async () => {
    const { result } = renderHook(
      () => useMarketData({ symbol: 'ETH', enabled: true }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(binanceClient.getTicker).toHaveBeenCalledWith('ETH')
  })

  it('does not fetch when disabled', async () => {
    const { result } = renderHook(
      () => useMarketData({ symbol: 'BTC', enabled: false }),
      { wrapper: createWrapper() }
    )

    expect(binanceClient.getTicker).not.toHaveBeenCalled()
    expect(result.current.ticker).toBeNull()
  })

  it('provides error message on API failure', async () => {
    vi.mocked(binanceClient.getTicker).mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useMarketData('BTC'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.error).toBe('API Error')
    })
  })

  it('provides reconnect function', async () => {
    const { result } = renderHook(() => useMarketData('BTC'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(typeof result.current.reconnect).toBe('function')
  })
})

describe('useOHLCVData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(binanceClient.getOHLCV).mockResolvedValue(mockOHLCV)
  })

  it('fetches OHLCV data for a valid symbol', async () => {
    const { result } = renderHook(
      () => useOHLCVData({ symbol: 'BTC', timeframe: '1h', count: 100 }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(binanceClient.getOHLCV).toHaveBeenCalledWith('BTC', '1h', 100)
    expect(result.current.data).toEqual(mockOHLCV)
  })

  it('uses default timeframe and count', async () => {
    const { result } = renderHook(
      () => useOHLCVData({ symbol: 'ETH' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(binanceClient.getOHLCV).toHaveBeenCalledWith('ETH', '1h', 100)
  })

  it('handles custom timeframe and count', async () => {
    const { result } = renderHook(
      () => useOHLCVData({ symbol: 'BTC', timeframe: '4h', count: 200 }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(binanceClient.getOHLCV).toHaveBeenCalledWith('BTC', '4h', 200)
  })

  it('provides refetch function', async () => {
    const { result } = renderHook(
      () => useOHLCVData({ symbol: 'BTC' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(typeof result.current.refetch).toBe('function')
  })

  it('returns empty array when disabled', () => {
    const { result } = renderHook(
      () => useOHLCVData({ symbol: 'BTC', enabled: false }),
      { wrapper: createWrapper() }
    )

    expect(result.current.data).toEqual([])
  })
})

describe('useMultipleTickers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(binanceClient.getMultipleTickers).mockResolvedValue({
      BTC: { ...mockTicker, symbol: 'BTC' },
      ETH: { ...mockTicker, symbol: 'ETH', price: 3000 },
    })
  })

  it('fetches data for multiple valid symbols', async () => {
    const { result } = renderHook(
      () => useMultipleTickers({ symbols: ['BTC', 'ETH'] }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(binanceClient.getMultipleTickers).toHaveBeenCalledWith(['BTC', 'ETH'])
    expect(Object.keys(result.current.tickers)).toContain('BTC')
  })

  it('uses default symbols when none provided', async () => {
    const { result } = renderHook(() => useMultipleTickers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Default symbols are BTC, ETH, SOL, XRP, ADA
    expect(binanceClient.getMultipleTickers).toHaveBeenCalled()
  })

  it('does not fetch when disabled', () => {
    const { result } = renderHook(
      () => useMultipleTickers({ enabled: false }),
      { wrapper: createWrapper() }
    )

    expect(binanceClient.getMultipleTickers).not.toHaveBeenCalled()
    expect(result.current.tickers).toEqual({})
  })

  it('filters out invalid symbols', async () => {
    const { result } = renderHook(
      () => useMultipleTickers({ symbols: ['BTC', 'INVALID', 'ETH'] }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Only valid symbols should be passed
    expect(binanceClient.getMultipleTickers).toHaveBeenCalledWith(['BTC', 'ETH'])
  })

  it('provides isConnected status', async () => {
    const { result } = renderHook(
      () => useMultipleTickers({ symbols: ['BTC'] }),
      { wrapper: createWrapper() }
    )

    // Initially not connected via WebSocket (starts false)
    expect(typeof result.current.isConnected).toBe('boolean')
  })
})
