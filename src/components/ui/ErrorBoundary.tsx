// ============================================
// TradingHub Pro - Error Boundary Component
// Graceful error handling with recovery options
// ============================================

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  copied: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
    
    // Log to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    })
  }

  handleCopyError = async () => {
    const errorText = `
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
    `.trim()
    
    await navigator.clipboard.writeText(errorText)
    this.setState({ copied: true })
    setTimeout(() => this.setState({ copied: false }), 2000)
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <Card className="p-8 text-center">
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center"
              >
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </motion.div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-gray-400 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Button
                  variant="primary"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Home className="w-4 h-4" />}
                  onClick={this.handleGoHome}
                >
                  Go Home
                </Button>
              </div>

              {/* Error Details (if enabled) */}
              {this.props.showDetails && this.state.error && (
                <div className="mt-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Error Details
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={this.state.copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      onClick={this.handleCopyError}
                    >
                      {this.state.copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                      {this.state.error.message}
                    </pre>
                    {this.state.error.stack && (
                      <pre className="text-xs text-gray-500 font-mono mt-2 whitespace-pre-wrap">
                        {this.state.error.stack.split('\n').slice(1, 5).join('\n')}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Help Text */}
            <p className="text-center text-sm text-gray-500 mt-4">
              If this problem persists, please contact{' '}
              <a href="mailto:support@tradinghub.pro" className="text-indigo-400 hover:underline">
                support@tradinghub.pro
              </a>
            </p>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use with hooks
interface ErrorBoundaryWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryWrapperProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for triggering errors (useful for testing)
// eslint-disable-next-line react-refresh/only-export-components
export function useErrorHandler() {
  return (error: Error) => {
    throw error
  }
}

export default ErrorBoundary
