// ============================================
// TradingHub Pro - Input Component
// Premium input with validation states
// ============================================

import { forwardRef, InputHTMLAttributes, useState } from 'react'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success,
      hint,
      leftIcon,
      rightIcon,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    const hasError = !!error
    const hasSuccess = !!success && !hasError

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg text-white text-sm',
              'bg-gray-800/50 border border-gray-700/50',
              'placeholder:text-gray-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              hasError && 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50',
              hasSuccess && 'border-emerald-500/50 focus:ring-emerald-500/50 focus:border-emerald-500/50',
              className
            )}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
          
          {hasError && !rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          
          {hasSuccess && !rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {(error || success || hint) && (
          <p
            className={cn(
              'mt-1.5 text-xs',
              hasError && 'text-red-400',
              hasSuccess && 'text-emerald-400',
              !hasError && !hasSuccess && 'text-gray-500'
            )}
          >
            {error || success || hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Number Input with increment/decrement
interface NumberInputProps extends Omit<InputProps, 'type'> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = Infinity,
      step = 1,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const handleIncrement = () => {
      const newValue = Math.min(value + step, max)
      onChange(Number(newValue.toFixed(8)))
    }

    const handleDecrement = () => {
      const newValue = Math.max(value - step, min)
      onChange(Number(newValue.toFixed(8)))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value) || 0
      if (newValue >= min && newValue <= max) {
        onChange(newValue)
      }
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="number"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn('pr-16 text-right number-mono', className)}
          {...props}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || value >= max}
            className="px-2 py-0.5 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-400 hover:text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || value <= min}
            className="px-2 py-0.5 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-400 hover:text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ▼
          </button>
        </div>
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'
