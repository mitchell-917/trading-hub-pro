// ============================================
// TradingHub Pro - Error Handling Utilities
// Global error handling, logging, and notification
// ============================================

import { useUIStore } from '@/lib/store'

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface AppError {
  code: string
  message: string
  severity: ErrorSeverity
  context?: Record<string, unknown>
  timestamp: number
  stack?: string
}

export interface ErrorReport {
  error: AppError
  userAgent: string
  url: string
  userId?: string
}

// Error codes for consistent error handling
export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  WEBSOCKET_ERROR: 'WEBSOCKET_ERROR',
  WEBSOCKET_DISCONNECTED: 'WEBSOCKET_DISCONNECTED',
  WEBSOCKET_RECONNECTING: 'WEBSOCKET_RECONNECTING',
  
  // Trading errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  ORDER_FAILED: 'ORDER_FAILED',
  POSITION_ERROR: 'POSITION_ERROR',
  INVALID_ORDER: 'INVALID_ORDER',
  
  // Data errors
  PARSE_ERROR: 'PARSE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  
  // System errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  COMPONENT_ERROR: 'COMPONENT_ERROR',
  INITIALIZATION_ERROR: 'INITIALIZATION_ERROR',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

/**
 * Create a standardized application error
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  severity: ErrorSeverity = 'error',
  context?: Record<string, unknown>
): AppError {
  return {
    code,
    message,
    severity,
    context,
    timestamp: Date.now(),
    stack: new Error().stack,
  }
}

/**
 * Convert any error to AppError format
 */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }
  
  if (error instanceof Error) {
    return {
      code: ErrorCodes.UNKNOWN_ERROR,
      message: error.message,
      severity: 'error',
      timestamp: Date.now(),
      stack: error.stack,
    }
  }
  
  return {
    code: ErrorCodes.UNKNOWN_ERROR,
    message: String(error),
    severity: 'error',
    timestamp: Date.now(),
  }
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'severity' in error &&
    'timestamp' in error
  )
}

/**
 * Get user-friendly message for error code
 */
export function getErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCodes.NETWORK_ERROR]: 'Network connection issue. Please check your internet.',
    [ErrorCodes.API_ERROR]: 'Unable to fetch data. Please try again.',
    [ErrorCodes.WEBSOCKET_ERROR]: 'Real-time connection issue.',
    [ErrorCodes.WEBSOCKET_DISCONNECTED]: 'Real-time connection lost. Attempting to reconnect...',
    [ErrorCodes.WEBSOCKET_RECONNECTING]: 'Reconnecting to real-time data...',
    [ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient funds for this transaction.',
    [ErrorCodes.ORDER_FAILED]: 'Order could not be processed. Please try again.',
    [ErrorCodes.POSITION_ERROR]: 'Position operation failed.',
    [ErrorCodes.INVALID_ORDER]: 'Invalid order parameters.',
    [ErrorCodes.PARSE_ERROR]: 'Error processing data.',
    [ErrorCodes.VALIDATION_ERROR]: 'Invalid input. Please check your entries.',
    [ErrorCodes.DATA_NOT_FOUND]: 'Requested data not found.',
    [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred.',
    [ErrorCodes.COMPONENT_ERROR]: 'A component error occurred.',
    [ErrorCodes.INITIALIZATION_ERROR]: 'Failed to initialize application.',
  }
  
  return messages[code] || messages[ErrorCodes.UNKNOWN_ERROR]
}

/**
 * Map severity to toast notification type
 */
function severityToNotificationType(severity: ErrorSeverity): 'success' | 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical':
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'error'
  }
}

/**
 * Show error notification to user
 */
export function notifyError(error: AppError | string): void {
  const appError = typeof error === 'string' 
    ? createAppError(ErrorCodes.UNKNOWN_ERROR, error) 
    : error
  
  const addNotification = useUIStore.getState().addNotification
  
  addNotification({
    type: severityToNotificationType(appError.severity),
    message: appError.message,
  })
}

/**
 * Log error for debugging (in development) or reporting (in production)
 */
export function logError(error: AppError, context?: Record<string, unknown>): void {
  const enrichedError = {
    ...error,
    context: { ...error.context, ...context },
  }
  
  // Always log to console in development
  if (import.meta.env.DEV) {
    console.group(`[${enrichedError.severity.toUpperCase()}] ${enrichedError.code}`)
    console.error(enrichedError.message)
    if (enrichedError.context) {
      console.log('Context:', enrichedError.context)
    }
    if (enrichedError.stack) {
      console.log('Stack:', enrichedError.stack)
    }
    console.groupEnd()
  }
  
  // In production, send to error tracking service (e.g., Sentry)
  if (import.meta.env.PROD) {
    reportError(enrichedError)
  }
}

/**
 * Report error to external service (placeholder for Sentry, etc.)
 */
function reportError(error: AppError): void {
  // TODO: Integrate with error tracking service (Sentry, Bugsnag, etc.)
  // Example:
  // Sentry.captureException(error)
  
  // For now, just log to console in production
  console.error('[Error Report]', error)
}

/**
 * Handle error with logging and optional notification
 */
export function handleError(
  error: unknown,
  options: {
    notify?: boolean
    context?: Record<string, unknown>
    fallbackMessage?: string
  } = {}
): AppError {
  const { notify = true, context, fallbackMessage } = options
  
  let appError = normalizeError(error)
  
  if (fallbackMessage && appError.message === String(error)) {
    appError = { ...appError, message: fallbackMessage }
  }
  
  logError(appError, context)
  
  if (notify) {
    notifyError(appError)
  }
  
  return appError
}

/**
 * Create WebSocket-specific error handlers
 */
export function createWebSocketErrorHandler(symbol: string) {
  return {
    onError: (event: Event) => {
      const error = createAppError(
        ErrorCodes.WEBSOCKET_ERROR,
        'WebSocket connection error',
        'warning',
        { symbol, event: event.type }
      )
      logError(error)
      // Don't notify for transient WS errors, only for persistent issues
    },
    
    onDisconnect: () => {
      const error = createAppError(
        ErrorCodes.WEBSOCKET_DISCONNECTED,
        'Real-time data connection lost',
        'warning',
        { symbol }
      )
      logError(error)
      notifyError(error)
    },
    
    onReconnecting: (attempt: number, maxAttempts: number) => {
      const error = createAppError(
        ErrorCodes.WEBSOCKET_RECONNECTING,
        `Reconnecting... (${attempt}/${maxAttempts})`,
        'info',
        { symbol, attempt, maxAttempts }
      )
      logError(error)
      // Only notify on first reconnect attempt
      if (attempt === 1) {
        notifyError(error)
      }
    },
    
    onReconnected: () => {
      useUIStore.getState().addNotification({
        type: 'success',
        message: 'Real-time data connection restored',
      })
    },
    
    onMaxReconnectAttempts: () => {
      const error = createAppError(
        ErrorCodes.WEBSOCKET_ERROR,
        'Unable to establish real-time connection. Data may be delayed.',
        'error',
        { symbol }
      )
      logError(error)
      notifyError(error)
    },
  }
}

/**
 * Set up global unhandled error handlers
 */
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = createAppError(
      ErrorCodes.UNKNOWN_ERROR,
      event.reason?.message || 'Unhandled promise rejection',
      'error',
      { reason: event.reason }
    )
    logError(error)
    // Prevent default browser error reporting
    event.preventDefault()
  })
  
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = createAppError(
      ErrorCodes.UNKNOWN_ERROR,
      event.message || 'Uncaught error',
      'error',
      { 
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    )
    logError(error)
    // Prevent default browser error reporting
    event.preventDefault()
  })
}
