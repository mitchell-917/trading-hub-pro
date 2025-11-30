// ============================================
// TradingHub Pro - Button Component
// Premium button with multiple variants and states
// ============================================

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25',
  ghost: 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white',
  outline: 'bg-transparent border border-gray-600 hover:border-indigo-500 text-gray-300 hover:text-white',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
