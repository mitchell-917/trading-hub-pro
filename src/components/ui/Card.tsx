// ============================================
// TradingHub Pro - Card Component
// Glassmorphism card with hover effects
// ============================================

import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: 'default' | 'elevated' | 'interactive'
  noPadding?: boolean
  animate?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', noPadding = false, animate = true, children, ...props }, ref) => {
    const baseClasses = cn(
      'rounded-xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-sm',
      !noPadding && 'p-4',
      variant === 'elevated' && 'shadow-xl shadow-black/20',
      variant === 'interactive' && 'cursor-pointer hover:border-indigo-500/50 hover:bg-gray-900/80 transition-all duration-200',
      className
    )

    if (!animate) {
      return (
        <div ref={ref} className={baseClasses} {...props}>
          {children}
        </div>
      )
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={baseClasses}
        {...(props as HTMLMotionProps<'div'>)}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between mb-4', className)}
        {...props}
      >
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          )}
          {children}
        </div>
        {action && <div>{action}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// Card Content
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />
  }
)

CardContent.displayName = 'CardContent'

// Card Footer
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between',
          className
        )}
        {...props}
      />
    )
  }
)

CardFooter.displayName = 'CardFooter'
