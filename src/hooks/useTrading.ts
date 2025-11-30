// ============================================
// TradingHub Pro - Trading Hook
// Order management and trade execution
// ============================================

import { useState, useCallback } from 'react'
import type { Order, OrderType, OrderSide, TimeInForce } from '@/types'
import { useOrdersStore } from '@/lib/store'
import { generateId } from '@/lib/utils'

interface PlaceOrderParams {
  symbol: string
  side: OrderSide
  type: OrderType
  quantity: number
  price?: number
  stopPrice?: number
  timeInForce?: TimeInForce
}

interface PlaceOrderResult {
  success: boolean
  order?: Order
  error?: string
}

interface UseTradingReturn {
  placeOrder: (params: PlaceOrderParams) => Promise<PlaceOrderResult>
  cancelOrder: (orderId: string) => Promise<{ success: boolean; error?: string }>
  modifyOrder: (
    orderId: string,
    updates: Partial<Pick<Order, 'quantity' | 'price' | 'stopPrice'>>
  ) => Promise<{ success: boolean; error?: string }>
  isSubmitting: boolean
  isPlacingOrder: boolean
  lastError: string | null
  balance: number
  buyingPower: number
}

/**
 * Hook for order management and trade execution
 */
export function useTrading(): UseTradingReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  
  const { addOrder, updateOrder, cancelOrder: cancelStoreOrder } = useOrdersStore()

  const placeOrder = useCallback(
    async (params: PlaceOrderParams): Promise<PlaceOrderResult> => {
      setIsSubmitting(true)
      setLastError(null)

      // Validate order
      if (params.quantity <= 0) {
        const error = 'Quantity must be greater than 0'
        setLastError(error)
        setIsSubmitting(false)
        return { success: false, error }
      }

      if (params.type === 'limit' && !params.price) {
        const error = 'Limit orders require a price'
        setLastError(error)
        setIsSubmitting(false)
        return { success: false, error }
      }

      if ((params.type === 'stop' || params.type === 'stop-limit') && !params.stopPrice) {
        const error = 'Stop orders require a stop price'
        setLastError(error)
        setIsSubmitting(false)
        return { success: false, error }
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      try {
        const order: Order = {
          id: generateId('order'),
          symbol: params.symbol,
          side: params.side,
          type: params.type,
          status: params.type === 'market' ? 'filled' : 'open',
          quantity: params.quantity,
          filledQuantity: params.type === 'market' ? params.quantity : 0,
          price: params.price,
          stopPrice: params.stopPrice,
          timeInForce: params.timeInForce || 'gtc',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          filledAt: params.type === 'market' ? Date.now() : undefined,
        }

        addOrder(order)
        setIsSubmitting(false)

        return { success: true, order }
      } catch (err) {
        const error = 'Failed to place order'
        setLastError(error)
        setIsSubmitting(false)
        return { success: false, error }
      }
    },
    [addOrder]
  )

  const cancelOrder = useCallback(
    async (orderId: string): Promise<{ success: boolean; error?: string }> => {
      setIsSubmitting(true)
      setLastError(null)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      try {
        cancelStoreOrder(orderId)
        setIsSubmitting(false)
        return { success: true }
      } catch (err) {
        const error = 'Failed to cancel order'
        setLastError(error)
        setIsSubmitting(false)
        return { success: false, error }
      }
    },
    [cancelStoreOrder]
  )

  const modifyOrder = useCallback(
    async (
      orderId: string,
      updates: Partial<Pick<Order, 'quantity' | 'price' | 'stopPrice'>>
    ): Promise<{ success: boolean; error?: string }> => {
      setIsSubmitting(true)
      setLastError(null)

      // Validate updates
      if (updates.quantity !== undefined && updates.quantity <= 0) {
        const error = 'Quantity must be greater than 0'
        setLastError(error)
        setIsSubmitting(false)
        return { success: false, error }
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      try {
        updateOrder(orderId, {
          ...updates,
          updatedAt: Date.now(),
        })
        setIsSubmitting(false)
        return { success: true }
      } catch (err) {
        const error = 'Failed to modify order'
        setLastError(error)
        setIsSubmitting(false)
        return { success: false, error }
      }
    },
    [updateOrder]
  )

  return {
    placeOrder,
    cancelOrder,
    modifyOrder,
    isSubmitting,
    isPlacingOrder: isSubmitting,
    lastError,
    balance: 50000, // Mock balance
    buyingPower: 100000, // Mock buying power (with margin)
  }
}

/**
 * Calculate order value
 */
export function calculateOrderValue(
  quantity: number,
  price: number,
  side: OrderSide
): {
  notional: number
  fee: number
  total: number
} {
  const notional = quantity * price
  const feeRate = 0.001 // 0.1% fee
  const fee = notional * feeRate
  const total = side === 'buy' ? notional + fee : notional - fee

  return {
    notional: Number(notional.toFixed(2)),
    fee: Number(fee.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

/**
 * Validate order parameters
 */
export function validateOrder(params: PlaceOrderParams): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!params.symbol) {
    errors.push('Symbol is required')
  }

  if (params.quantity <= 0) {
    errors.push('Quantity must be greater than 0')
  }

  if (params.type === 'limit') {
    if (!params.price || params.price <= 0) {
      errors.push('Valid price is required for limit orders')
    }
  }

  if (params.type === 'stop' || params.type === 'stop-limit') {
    if (!params.stopPrice || params.stopPrice <= 0) {
      errors.push('Valid stop price is required for stop orders')
    }
  }

  if (params.type === 'stop-limit') {
    if (!params.price || params.price <= 0) {
      errors.push('Valid limit price is required for stop-limit orders')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Format order for display
 */
export function formatOrderDisplay(order: Order): {
  typeLabel: string
  sideLabel: string
  statusLabel: string
  priceDisplay: string
  quantityDisplay: string
  fillPercentage: number
} {
  const typeLabels: Record<OrderType, string> = {
    market: 'Market',
    limit: 'Limit',
    stop: 'Stop',
    'stop-limit': 'Stop Limit',
    'trailing-stop': 'Trailing Stop',
  }

  const fillPercentage =
    order.quantity > 0 ? (order.filledQuantity / order.quantity) * 100 : 0

  return {
    typeLabel: typeLabels[order.type],
    sideLabel: order.side === 'buy' ? 'Buy' : 'Sell',
    statusLabel: order.status.charAt(0).toUpperCase() + order.status.slice(1),
    priceDisplay: order.price
      ? `$${order.price.toLocaleString()}`
      : 'Market',
    quantityDisplay: order.quantity.toLocaleString(undefined, {
      minimumFractionDigits: 4,
    }),
    fillPercentage: Number(fillPercentage.toFixed(1)),
  }
}
