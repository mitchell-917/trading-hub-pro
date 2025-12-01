// ============================================
// TradingHub Pro - Accessibility Utilities Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render, screen } from '@testing-library/react'
import React from 'react'
import {
  VisuallyHidden,
  SkipLink,
  useAnnounce,
  usePriceChangeAnnouncement,
  useFocusTrap,
  useRestoreFocus,
  useId,
  announce,
  getPriceChangeAriaLabel,
  getPnLAriaLabel,
  colorBlindSafeColors,
  usePrefersReducedMotion,
  generateId,
} from '../accessibility'

describe('Accessibility Utilities', () => {
  describe('VisuallyHidden', () => {
    it('should render children', () => {
      render(<VisuallyHidden>Hidden text</VisuallyHidden>)
      expect(screen.getByText('Hidden text')).toBeInTheDocument()
    })

    it('should hide content visually', () => {
      render(<VisuallyHidden>Hidden</VisuallyHidden>)
      const element = screen.getByText('Hidden')
      
      // Check that it has hiding styles
      expect(element).toHaveStyle({ position: 'absolute' })
      expect(element).toHaveStyle({ width: '1px' })
      expect(element).toHaveStyle({ height: '1px' })
    })
  })

  describe('SkipLink', () => {
    it('should render skip link', () => {
      render(<SkipLink />)
      expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    })

    it('should have correct default href', () => {
      render(<SkipLink />)
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '#main-content')
    })

    it('should use custom href', () => {
      render(<SkipLink href="#nav" />)
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '#nav')
    })

    it('should have sr-only styling', () => {
      render(<SkipLink />)
      const link = screen.getByRole('link')
      expect(link).toHaveClass('sr-only')
    })
  })

  describe('useAnnounce', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })

    it('should return announce function', () => {
      const { result } = renderHook(() => useAnnounce())
      expect(typeof result.current).toBe('function')
    })

    it('should create live region on announce', () => {
      const { result } = renderHook(() => useAnnounce())
      
      act(() => {
        result.current('Test message')
      })
      
      const region = document.querySelector('[aria-live]')
      expect(region).toBeInTheDocument()
    })

    afterEach(() => {
      document.body.innerHTML = ''
    })
  })

  describe('usePriceChangeAnnouncement', () => {
    it('should not throw on render', () => {
      expect(() => {
        renderHook(() => usePriceChangeAnnouncement('BTC', 67500, 2.5))
      }).not.toThrow()
    })

    it('should accept disabled state', () => {
      const { result } = renderHook(() => 
        usePriceChangeAnnouncement('BTC', 67500, 2.5, false)
      )
      expect(result.current).toBeUndefined()
    })
  })

  describe('useFocusTrap', () => {
    it('should return ref', () => {
      const { result } = renderHook(() => useFocusTrap(true))
      expect(result.current).toBeDefined()
      expect(result.current.current).toBeNull()
    })

    it('should not throw when disabled', () => {
      const { result } = renderHook(() => useFocusTrap(false))
      expect(result.current).toBeDefined()
    })
  })

  describe('useRestoreFocus', () => {
    it('should not throw', () => {
      expect(() => {
        renderHook(() => useRestoreFocus())
      }).not.toThrow()
    })
  })

  describe('useId', () => {
    it('should generate unique id', () => {
      const { result: result1 } = renderHook(() => useId())
      const { result: result2 } = renderHook(() => useId())
      
      expect(result1.current).toBeTruthy()
      expect(result2.current).toBeTruthy()
      expect(result1.current).not.toBe(result2.current)
    })

    it('should use prefix', () => {
      const { result } = renderHook(() => useId('modal'))
      expect(result.current).toContain('modal')
    })

    it('should be stable across renders', () => {
      const { result, rerender } = renderHook(() => useId('btn'))
      const firstId = result.current
      
      rerender()
      
      expect(result.current).toBe(firstId)
    })
  })

  describe('generateId', () => {
    it('should generate unique ids', () => {
      const id1 = generateId('test')
      const id2 = generateId('test')
      
      expect(id1).not.toBe(id2)
    })

    it('should use prefix', () => {
      const id = generateId('prefix')
      expect(id).toContain('prefix')
    })
  })

  describe('announce', () => {
    it('should not throw when called', () => {
      expect(() => announce('Test')).not.toThrow()
    })

    it('should accept assertive priority', () => {
      expect(() => announce('Urgent', 'assertive')).not.toThrow()
    })
  })

  describe('getPriceChangeAriaLabel', () => {
    it('should generate label for positive change', () => {
      const label = getPriceChangeAriaLabel('BTC', 67500, 1250, 2.5)
      
      expect(label).toContain('BTC')
      expect(label).toContain('up')
      expect(label).toContain('2.5')
    })

    it('should generate label for negative change', () => {
      const label = getPriceChangeAriaLabel('ETH', 3500, -100, -1.5)
      
      expect(label).toContain('ETH')
      expect(label).toContain('down')
      expect(label).toContain('1.5')
    })
  })

  describe('getPnLAriaLabel', () => {
    it('should generate label for profit', () => {
      const label = getPnLAriaLabel(1000)
      
      expect(label).toContain('profit')
      expect(label).toContain('$1,000')
    })

    it('should generate label for loss', () => {
      const label = getPnLAriaLabel(-500)
      
      expect(label).toContain('loss')
      expect(label).toContain('$500')
    })

    it('should include type', () => {
      const label = getPnLAriaLabel(100, 'daily')
      
      expect(label).toContain('daily')
    })
  })

  describe('colorBlindSafeColors', () => {
    it('should have positive color', () => {
      expect(colorBlindSafeColors.positive).toBeDefined()
      expect(typeof colorBlindSafeColors.positive).toBe('string')
    })

    it('should have negative color', () => {
      expect(colorBlindSafeColors.negative).toBeDefined()
      expect(typeof colorBlindSafeColors.negative).toBe('string')
    })

    it('should have neutral color', () => {
      expect(colorBlindSafeColors.neutral).toBeDefined()
      expect(typeof colorBlindSafeColors.neutral).toBe('string')
    })

    it('should have alt colors for deuteranopia', () => {
      expect(colorBlindSafeColors.positiveAlt).toBeDefined()
      expect(colorBlindSafeColors.negativeAlt).toBeDefined()
    })

    it('should have distinct colors', () => {
      expect(colorBlindSafeColors.positive).not.toBe(colorBlindSafeColors.negative)
      expect(colorBlindSafeColors.positive).not.toBe(colorBlindSafeColors.neutral)
      expect(colorBlindSafeColors.negative).not.toBe(colorBlindSafeColors.neutral)
    })
  })

  describe('usePrefersReducedMotion', () => {
    it('should return boolean', () => {
      const { result } = renderHook(() => usePrefersReducedMotion())
      expect(typeof result.current).toBe('boolean')
    })
  })
})
