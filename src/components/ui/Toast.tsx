// ============================================
// TradingHub Pro - Toast Notification System
// Beautiful, animated toast notifications
// ============================================

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  TrendingUp,
  TrendingDown,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'trade-buy' | 'trade-sell' | 'alert'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience methods for common toast types
// eslint-disable-next-line react-refresh/only-export-components
export function useToastActions() {
  const { addToast } = useToast()
  
  return {
    success: (title: string, message?: string) => 
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => 
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => 
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => 
      addToast({ type: 'info', title, message }),
    tradeBuy: (title: string, message?: string) => 
      addToast({ type: 'trade-buy', title, message }),
    tradeSell: (title: string, message?: string) => 
      addToast({ type: 'trade-sell', title, message }),
    alert: (title: string, message?: string) => 
      addToast({ type: 'alert', title, message }),
  }
}

const toastConfig: Record<ToastType, {
  icon: typeof CheckCircle
  iconColor: string
  bgColor: string
  borderColor: string
}> = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  'trade-buy': {
    icon: TrendingUp,
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  'trade-sell': {
    icon: TrendingDown,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  alert: {
    icon: Bell,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const config = toastConfig[toast.type]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg min-w-[320px] max-w-[420px]',
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Progress bar for auto-dismiss */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className={cn(
            'absolute bottom-0 left-0 h-0.5 rounded-full',
            toast.type === 'error' ? 'bg-red-400' :
            toast.type === 'warning' ? 'bg-amber-400' :
            toast.type === 'success' || toast.type === 'trade-buy' ? 'bg-green-400' :
            toast.type === 'trade-sell' ? 'bg-red-400' :
            toast.type === 'alert' ? 'bg-purple-400' :
            'bg-blue-400'
          )}
        />
      )}

      <div className={cn('p-1 rounded-lg', config.bgColor)}>
        <Icon className={cn('w-5 h-5', config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-gray-400 mt-0.5">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm text-indigo-400 hover:text-indigo-300 mt-2 font-medium"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </motion.div>
  )
}

interface ToastProviderProps {
  children: ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
}

export function ToastProvider({ 
  children, 
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Define removeToast first so it can be used by addToast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = toast.duration ?? 5000

    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id, duration }]
      // Limit number of toasts
      return newToasts.slice(-maxToasts)
    })

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [maxToasts, removeToast])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className={cn(
        'fixed z-50 flex flex-col gap-2',
        positionClasses[position],
        position.includes('bottom') ? 'flex-col-reverse' : 'flex-col'
      )}>
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
