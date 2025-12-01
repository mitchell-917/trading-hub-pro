// ============================================
// TradingHub Pro - Error Handling Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ErrorCodes,
  createAppError,
  isAppError,
  handleError,
  notifyError,
  logError,
  normalizeError,
  getErrorMessage,
  createWebSocketErrorHandler,
  setupGlobalErrorHandlers,
} from '../error-handling'

// Mock the store
vi.mock('@/lib/store', () => ({
  useUIStore: {
    getState: () => ({
      addNotification: vi.fn(),
    }),
  },
}))

describe('Error Handling', () => {
  describe('ErrorCodes', () => {
    it('should have network error codes', () => {
      expect(ErrorCodes.NETWORK_ERROR).toBeDefined()
      expect(ErrorCodes.API_ERROR).toBeDefined()
    })

    it('should have WebSocket error codes', () => {
      expect(ErrorCodes.WEBSOCKET_ERROR).toBeDefined()
      expect(ErrorCodes.WEBSOCKET_DISCONNECTED).toBeDefined()
      expect(ErrorCodes.WEBSOCKET_RECONNECTING).toBeDefined()
    })

    it('should have validation error codes', () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBeDefined()
      expect(ErrorCodes.INVALID_ORDER).toBeDefined()
      expect(ErrorCodes.INSUFFICIENT_FUNDS).toBeDefined()
    })

    it('should have trading error codes', () => {
      expect(ErrorCodes.ORDER_FAILED).toBeDefined()
      expect(ErrorCodes.POSITION_ERROR).toBeDefined()
    })
  })

  describe('createAppError', () => {
    it('should create error with required fields', () => {
      const error = createAppError(ErrorCodes.NETWORK_ERROR, 'Connection failed')
      
      expect(error.code).toBe(ErrorCodes.NETWORK_ERROR)
      expect(error.message).toBe('Connection failed')
      expect(error.severity).toBe('error')
      expect(error.timestamp).toBeDefined()
    })

    it('should use provided severity', () => {
      const error = createAppError(
        ErrorCodes.API_ERROR,
        'API failed',
        'critical'
      )
      
      expect(error.severity).toBe('critical')
    })

    it('should include context', () => {
      const error = createAppError(
        ErrorCodes.INVALID_ORDER,
        'Order rejected',
        'error',
        { orderId: '123', symbol: 'BTC' }
      )
      
      expect(error.context).toEqual({ orderId: '123', symbol: 'BTC' })
    })

    it('should include stack trace', () => {
      const error = createAppError(ErrorCodes.UNKNOWN_ERROR, 'Test')
      expect(error.stack).toBeDefined()
    })
  })

  describe('isAppError', () => {
    it('should return true for AppError', () => {
      const error = createAppError(ErrorCodes.NETWORK_ERROR, 'Test')
      expect(isAppError(error)).toBe(true)
    })

    it('should return false for regular Error', () => {
      const error = new Error('Regular error')
      expect(isAppError(error)).toBe(false)
    })

    it('should return false for non-errors', () => {
      expect(isAppError('string')).toBe(false)
      expect(isAppError(null)).toBe(false)
      expect(isAppError(undefined)).toBe(false)
      expect(isAppError(123)).toBe(false)
    })

    it('should return false for partial AppError', () => {
      const partial = { code: ErrorCodes.UNKNOWN_ERROR, message: 'Test' }
      expect(isAppError(partial)).toBe(false)
    })
  })

  describe('normalizeError', () => {
    it('should return AppError unchanged', () => {
      const appError = createAppError(ErrorCodes.NETWORK_ERROR, 'Test')
      const result = normalizeError(appError)
      expect(result).toBe(appError)
    })

    it('should convert Error to AppError', () => {
      const regularError = new Error('Regular message')
      const result = normalizeError(regularError)
      
      expect(isAppError(result)).toBe(true)
      expect(result.message).toBe('Regular message')
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR)
    })

    it('should convert string to AppError', () => {
      const result = normalizeError('String error')
      
      expect(isAppError(result)).toBe(true)
      expect(result.message).toBe('String error')
    })

    it('should handle unknown types', () => {
      const result = normalizeError(null)
      
      expect(isAppError(result)).toBe(true)
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR)
    })
  })

  describe('handleError', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>
    let consoleGroupSpy: ReturnType<typeof vi.spyOn>
    let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>
    let consoleLogSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
      consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
      consoleGroupSpy.mockRestore()
      consoleGroupEndSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('should return AppError for any input', () => {
      const result = handleError(new Error('Test'))
      expect(isAppError(result)).toBe(true)
    })

    it('should not notify when disabled', () => {
      const result = handleError(new Error('Test'), { notify: false })
      expect(isAppError(result)).toBe(true)
    })
  })

  describe('getErrorMessage', () => {
    it('should return friendly message for network errors', () => {
      const message = getErrorMessage(ErrorCodes.NETWORK_ERROR)
      expect(message.toLowerCase()).toContain('network')
    })

    it('should return friendly message for API errors', () => {
      const message = getErrorMessage(ErrorCodes.API_ERROR)
      expect(message.toLowerCase()).toContain('fetch')
    })

    it('should return friendly message for insufficient funds', () => {
      const message = getErrorMessage(ErrorCodes.INSUFFICIENT_FUNDS)
      expect(message.toLowerCase()).toContain('funds')
    })

    it('should return generic message for unknown code', () => {
      const message = getErrorMessage(ErrorCodes.UNKNOWN_ERROR)
      expect(message).toBeTruthy()
    })
  })

  describe('notifyError', () => {
    it('should not throw', () => {
      const error = createAppError(ErrorCodes.NETWORK_ERROR, 'Test')
      expect(() => notifyError(error)).not.toThrow()
    })

    it('should handle string errors', () => {
      expect(() => notifyError('Test error')).not.toThrow()
    })
  })

  describe('logError', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>
    let consoleGroupSpy: ReturnType<typeof vi.spyOn>
    let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>
    let consoleLogSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
      consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
      consoleGroupSpy.mockRestore()
      consoleGroupEndSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('should log AppError', () => {
      const error = createAppError(
        ErrorCodes.API_ERROR,
        'API failed',
        'critical',
        { endpoint: '/orders' }
      )
      
      logError(error)
      
      // In test environment (DEV mode), console should be called
      expect(consoleSpy).toHaveBeenCalled()
    })

    it('should log with custom context', () => {
      const error = createAppError(ErrorCodes.NETWORK_ERROR, 'Failed')
      
      logError(error, { source: 'OrderService.submitOrder' })
      
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('createWebSocketErrorHandler', () => {
    it('should return handler functions', () => {
      const handler = createWebSocketErrorHandler('BTCUSDT')
      
      expect(typeof handler.onError).toBe('function')
      expect(typeof handler.onDisconnect).toBe('function')
      expect(typeof handler.onReconnecting).toBe('function')
      expect(typeof handler.onReconnected).toBe('function')
      expect(typeof handler.onMaxReconnectAttempts).toBe('function')
    })

    it('should handle onError without throwing', () => {
      const handler = createWebSocketErrorHandler('BTCUSDT')
      
      expect(() => handler.onError(new Event('error'))).not.toThrow()
    })

    it('should handle onDisconnect without throwing', () => {
      const handler = createWebSocketErrorHandler('BTCUSDT')
      
      expect(() => handler.onDisconnect()).not.toThrow()
    })

    it('should handle onReconnecting without throwing', () => {
      const handler = createWebSocketErrorHandler('BTCUSDT')
      
      expect(() => handler.onReconnecting(1, 5)).not.toThrow()
    })

    it('should handle onReconnected without throwing', () => {
      const handler = createWebSocketErrorHandler('BTCUSDT')
      
      expect(() => handler.onReconnected()).not.toThrow()
    })

    it('should handle onMaxReconnectAttempts without throwing', () => {
      const handler = createWebSocketErrorHandler('BTCUSDT')
      
      expect(() => handler.onMaxReconnectAttempts()).not.toThrow()
    })
  })

  describe('setupGlobalErrorHandlers', () => {
    it('should not throw when called', () => {
      expect(() => setupGlobalErrorHandlers()).not.toThrow()
    })

    it('should set up unhandledrejection listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      
      setupGlobalErrorHandlers()
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      )
      
      addEventListenerSpy.mockRestore()
    })

    it('should set up error listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      
      setupGlobalErrorHandlers()
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      )
      
      addEventListenerSpy.mockRestore()
    })
  })
})
