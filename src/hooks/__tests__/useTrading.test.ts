// ============================================
// TradingHub Pro - Trading Hook Tests
// ============================================

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTrading, calculateOrderValue, validateOrder, formatOrderDisplay } from '../useTrading'
import type { Order } from '@/types'

// Wrapper component for testing hooks that use Zustand
const wrapper = ({ children }: { children: React.ReactNode }) => children

describe('useTrading', () => {
  describe('placeOrder', () => {
    it('places a market order successfully', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'BTC',
          side: 'buy',
          type: 'market',
          quantity: 1,
        })
      })

      expect(orderResult!.success).toBe(true)
      expect(orderResult!.order).toBeDefined()
      expect(orderResult!.order?.status).toBe('filled')
      expect(orderResult!.order?.type).toBe('market')
    })

    it('places a limit order successfully', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'ETH',
          side: 'sell',
          type: 'limit',
          quantity: 5,
          price: 3500,
        })
      })

      expect(orderResult!.success).toBe(true)
      expect(orderResult!.order?.status).toBe('open')
      expect(orderResult!.order?.price).toBe(3500)
    })

    it('rejects order with zero quantity', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'BTC',
          side: 'buy',
          type: 'market',
          quantity: 0,
        })
      })

      expect(orderResult!.success).toBe(false)
      expect(orderResult!.error).toBe('Quantity must be greater than 0')
    })

    it('rejects order with negative quantity', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'BTC',
          side: 'buy',
          type: 'market',
          quantity: -5,
        })
      })

      expect(orderResult!.success).toBe(false)
      expect(orderResult!.error).toBe('Quantity must be greater than 0')
    })

    it('rejects limit order without price', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'BTC',
          side: 'buy',
          type: 'limit',
          quantity: 1,
        })
      })

      expect(orderResult!.success).toBe(false)
      expect(orderResult!.error).toBe('Limit orders require a price')
    })

    it('rejects stop order without stop price', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'BTC',
          side: 'sell',
          type: 'stop',
          quantity: 1,
        })
      })

      expect(orderResult!.success).toBe(false)
      expect(orderResult!.error).toBe('Stop orders require a stop price')
    })

    it('rejects stop-limit order without stop price', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'BTC',
          side: 'sell',
          type: 'stop-limit',
          quantity: 1,
          price: 50000,
        })
      })

      expect(orderResult!.success).toBe(false)
      expect(orderResult!.error).toBe('Stop orders require a stop price')
    })

    it('places stop order with stop price successfully', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'BTC',
          side: 'sell',
          type: 'stop',
          quantity: 1,
          stopPrice: 45000,
        })
      })

      expect(orderResult!.success).toBe(true)
      expect(orderResult!.order?.stopPrice).toBe(45000)
      expect(orderResult!.order?.status).toBe('open')
    })

    it('places stop-limit order with both prices successfully', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'BTC',
          side: 'sell',
          type: 'stop-limit',
          quantity: 1,
          price: 44000,
          stopPrice: 45000,
        })
      })

      expect(orderResult!.success).toBe(true)
      expect(orderResult!.order?.stopPrice).toBe(45000)
      expect(orderResult!.order?.price).toBe(44000)
    })

    it('sets isSubmitting during order placement', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      expect(result.current.isSubmitting).toBe(false)

      act(() => {
        result.current.placeOrder({
          symbol: 'BTC',
          side: 'buy',
          type: 'market',
          quantity: 1,
        })
      })

      expect(result.current.isSubmitting).toBe(true)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    it('uses custom timeInForce when provided', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let orderResult: Awaited<ReturnType<typeof result.current.placeOrder>>

      await act(async () => {
        orderResult = await result.current.placeOrder({
          symbol: 'BTC',
          side: 'buy',
          type: 'limit',
          quantity: 1,
          price: 50000,
          timeInForce: 'ioc',
        })
      })

      expect(orderResult!.success).toBe(true)
      expect(orderResult!.order?.timeInForce).toBe('ioc')
    })
  })

  describe('cancelOrder', () => {
    it('cancels an order successfully', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let cancelResult: Awaited<ReturnType<typeof result.current.cancelOrder>>

      await act(async () => {
        cancelResult = await result.current.cancelOrder('order-123')
      })

      expect(cancelResult!.success).toBe(true)
    })

    it('sets isSubmitting during cancellation', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      expect(result.current.isSubmitting).toBe(false)

      act(() => {
        result.current.cancelOrder('order-123')
      })

      expect(result.current.isSubmitting).toBe(true)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })
  })

  describe('modifyOrder', () => {
    it('modifies an order successfully', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let modifyResult: Awaited<ReturnType<typeof result.current.modifyOrder>>

      await act(async () => {
        modifyResult = await result.current.modifyOrder('order-123', {
          quantity: 10,
          price: 55000,
        })
      })

      expect(modifyResult!.success).toBe(true)
    })

    it('rejects modification with zero quantity', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let modifyResult: Awaited<ReturnType<typeof result.current.modifyOrder>>

      await act(async () => {
        modifyResult = await result.current.modifyOrder('order-123', {
          quantity: 0,
        })
      })

      expect(modifyResult!.success).toBe(false)
      expect(modifyResult!.error).toBe('Quantity must be greater than 0')
    })

    it('rejects modification with negative quantity', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let modifyResult: Awaited<ReturnType<typeof result.current.modifyOrder>>

      await act(async () => {
        modifyResult = await result.current.modifyOrder('order-123', {
          quantity: -5,
        })
      })

      expect(modifyResult!.success).toBe(false)
      expect(modifyResult!.error).toBe('Quantity must be greater than 0')
    })

    it('modifies only price without changing quantity', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let modifyResult: Awaited<ReturnType<typeof result.current.modifyOrder>>

      await act(async () => {
        modifyResult = await result.current.modifyOrder('order-123', {
          price: 60000,
        })
      })

      expect(modifyResult!.success).toBe(true)
    })

    it('modifies stop price', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      let modifyResult: Awaited<ReturnType<typeof result.current.modifyOrder>>

      await act(async () => {
        modifyResult = await result.current.modifyOrder('order-123', {
          stopPrice: 48000,
        })
      })

      expect(modifyResult!.success).toBe(true)
    })

    it('sets isSubmitting during modification', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      expect(result.current.isSubmitting).toBe(false)

      act(() => {
        result.current.modifyOrder('order-123', { quantity: 5 })
      })

      expect(result.current.isSubmitting).toBe(true)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })
  })

  describe('hook return values', () => {
    it('provides balance value', () => {
      const { result } = renderHook(() => useTrading(), { wrapper })
      expect(result.current.balance).toBe(50000)
    })

    it('provides buyingPower value', () => {
      const { result } = renderHook(() => useTrading(), { wrapper })
      expect(result.current.buyingPower).toBe(100000)
    })

    it('provides isPlacingOrder alias for isSubmitting', () => {
      const { result } = renderHook(() => useTrading(), { wrapper })
      expect(result.current.isPlacingOrder).toBe(result.current.isSubmitting)
    })

    it('initially has no lastError', () => {
      const { result } = renderHook(() => useTrading(), { wrapper })
      expect(result.current.lastError).toBeNull()
    })

    it('sets lastError on validation failure', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      await act(async () => {
        await result.current.placeOrder({
          symbol: 'BTC',
          side: 'buy',
          type: 'market',
          quantity: 0,
        })
      })

      expect(result.current.lastError).toBe('Quantity must be greater than 0')
    })

    it('clears lastError on successful order', async () => {
      const { result } = renderHook(() => useTrading(), { wrapper })

      // First, cause an error
      await act(async () => {
        await result.current.placeOrder({
          symbol: 'BTC',
          side: 'buy',
          type: 'market',
          quantity: 0,
        })
      })

      expect(result.current.lastError).not.toBeNull()

      // Then place a valid order
      await act(async () => {
        await result.current.placeOrder({
          symbol: 'BTC',
          side: 'buy',
          type: 'market',
          quantity: 1,
        })
      })

      expect(result.current.lastError).toBeNull()
    })
  })
})

describe('calculateOrderValue', () => {
  it('calculates buy order value correctly', () => {
    const result = calculateOrderValue(10, 100, 'buy')

    expect(result.notional).toBe(1000)
    expect(result.fee).toBe(1) // 0.1% of 1000
    expect(result.total).toBe(1001)
  })

  it('calculates sell order value correctly', () => {
    const result = calculateOrderValue(10, 100, 'sell')

    expect(result.notional).toBe(1000)
    expect(result.fee).toBe(1)
    expect(result.total).toBe(999)
  })

  it('handles decimal quantities', () => {
    const result = calculateOrderValue(0.5, 67500, 'buy')

    expect(result.notional).toBe(33750)
    expect(result.fee).toBe(33.75)
    expect(result.total).toBe(33783.75)
  })
})

describe('validateOrder', () => {
  it('validates correct market order', () => {
    const result = validateOrder({
      symbol: 'BTC',
      side: 'buy',
      type: 'market',
      quantity: 1,
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('validates correct limit order', () => {
    const result = validateOrder({
      symbol: 'ETH',
      side: 'sell',
      type: 'limit',
      quantity: 5,
      price: 3500,
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects order without symbol', () => {
    const result = validateOrder({
      symbol: '',
      side: 'buy',
      type: 'market',
      quantity: 1,
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Symbol is required')
  })

  it('rejects order with zero quantity', () => {
    const result = validateOrder({
      symbol: 'BTC',
      side: 'buy',
      type: 'market',
      quantity: 0,
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Quantity must be greater than 0')
  })

  it('rejects limit order without price', () => {
    const result = validateOrder({
      symbol: 'BTC',
      side: 'buy',
      type: 'limit',
      quantity: 1,
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Valid price is required for limit orders')
  })

  it('rejects stop order without stop price', () => {
    const result = validateOrder({
      symbol: 'BTC',
      side: 'sell',
      type: 'stop',
      quantity: 1,
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Valid stop price is required for stop orders')
  })

  it('rejects stop-limit order without both prices', () => {
    const result = validateOrder({
      symbol: 'BTC',
      side: 'sell',
      type: 'stop-limit',
      quantity: 1,
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Valid stop price is required for stop orders')
    expect(result.errors).toContain('Valid limit price is required for stop-limit orders')
  })

  it('validates correct stop-limit order', () => {
    const result = validateOrder({
      symbol: 'BTC',
      side: 'sell',
      type: 'stop-limit',
      quantity: 1,
      price: 65000,
      stopPrice: 64000,
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('formatOrderDisplay', () => {
  it('formats market buy order', () => {
    const order: Order = {
      id: 'test-1',
      symbol: 'BTC',
      side: 'buy',
      type: 'market',
      status: 'filled',
      quantity: 1.5,
      filledQuantity: 1.5,
      timeInForce: 'gtc',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const result = formatOrderDisplay(order)

    expect(result.typeLabel).toBe('Market')
    expect(result.sideLabel).toBe('Buy')
    expect(result.statusLabel).toBe('Filled')
    expect(result.priceDisplay).toBe('Market')
    expect(result.fillPercentage).toBe(100)
  })

  it('formats limit sell order', () => {
    const order: Order = {
      id: 'test-2',
      symbol: 'ETH',
      side: 'sell',
      type: 'limit',
      status: 'open',
      quantity: 10,
      filledQuantity: 0,
      price: 3500,
      timeInForce: 'gtc',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const result = formatOrderDisplay(order)

    expect(result.typeLabel).toBe('Limit')
    expect(result.sideLabel).toBe('Sell')
    expect(result.statusLabel).toBe('Open')
    expect(result.priceDisplay).toBe('$3,500')
    expect(result.fillPercentage).toBe(0)
  })

  it('calculates partial fill percentage', () => {
    const order: Order = {
      id: 'test-3',
      symbol: 'SOL',
      side: 'buy',
      type: 'limit',
      status: 'partially-filled',
      quantity: 100,
      filledQuantity: 25,
      price: 178,
      timeInForce: 'gtc',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const result = formatOrderDisplay(order)

    expect(result.fillPercentage).toBe(25)
    expect(result.statusLabel).toBe('Partially-filled')
  })
})
