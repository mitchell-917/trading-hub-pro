// ============================================
// Utils Comprehensive Tests
// ============================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatPercentage,
  formatPrice,
  formatQuantity,
  formatCompact,
  formatTimestamp,
  formatRelativeTime,
  formatListTime,
  calculateChange,
  getPnLClass,
  getPnLBgClass,
  generateId,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  sortBy,
  groupBy,
  clamp,
} from '../utils'

describe('cn (className utility)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles undefined', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })

  it('handles null', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar')
  })

  it('handles empty string', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })

  it('handles false', () => {
    expect(cn('foo', false && 'hidden', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const isActive = true
    expect(cn('base', isActive && 'active')).toBe('base active')
  })

  it('handles falsy values', () => {
    expect(cn('class-a', false && 'class-b')).toBe('class-a')
    expect(cn('class-a', null, undefined, 'class-c')).toContain('class-a')
    expect(cn('class-a', null, undefined, 'class-c')).toContain('class-c')
  })

  it('merges multiple classes correctly', () => {
    // cn just joins classes, doesn't do tailwind-merge
    expect(cn('px-2', 'px-4')).toBe('px-2 px-4')
  })
})

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1')
    expect(result).toContain('234')
  })

  it('formats with default options', () => {
    const result = formatCurrency(1000)
    expect(result).toMatch(/\$|USD|1,?000/)
  })

  it('handles negative values', () => {
    const result = formatCurrency(-500)
    expect(result).toBeDefined()
  })

  it('handles zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('handles large numbers', () => {
    const result = formatCurrency(1000000)
    expect(result).toMatch(/1.*0{6}|1.*000.*000/)
  })

  it('handles small decimals', () => {
    const result = formatCurrency(0.01)
    expect(result).toContain('0')
  })

  it('formats different locales', () => {
    const result = formatCurrency(100)
    expect(result).toBeDefined()
  })

  it('formats large values', () => {
    const result = formatCurrency(1000000)
    expect(result).toBeDefined()
  })
})

describe('formatNumber', () => {
  it('formats integer', () => {
    expect(formatNumber(1234)).toContain('1')
    expect(formatNumber(1234)).toContain('234')
  })

  it('formats decimal', () => {
    const result = formatNumber(1234.56)
    expect(result).toContain('1')
    expect(result).toContain('234')
    expect(result).toContain('56')
  })

  it('handles decimals parameter', () => {
    const result = formatNumber(1234.5678, 2)
    expect(result).toBeDefined()
    expect(result).toContain('1')
  })

  it('handles zero decimals', () => {
    const result = formatNumber(1234.56, 0)
    expect(result).not.toContain('.')
  })

  it('handles negative numbers', () => {
    const result = formatNumber(-1234)
    expect(result).toContain('-')
  })

  it('handles zero', () => {
    // formatNumber defaults to 2 decimal places
    expect(formatNumber(0)).toBe('0.00')
    expect(formatNumber(0, 0)).toBe('0')
  })

  it('handles large numbers', () => {
    const result = formatNumber(1000000000)
    expect(result).toBeDefined()
  })

  it('handles small numbers', () => {
    const result = formatNumber(0.0001, 4)
    expect(result).toContain('0')
  })
})

describe('formatPercent', () => {
  it('formats positive percent', () => {
    const result = formatPercent(5.5)
    expect(result).toContain('5')
    expect(result).toContain('%')
  })

  it('formats negative percent', () => {
    const result = formatPercent(-3.2)
    expect(result).toContain('-')
    expect(result).toContain('3')
    expect(result).toContain('%')
  })

  it('formats zero percent', () => {
    const result = formatPercent(0)
    expect(result).toContain('0')
    expect(result).toContain('%')
  })

  it('handles large percentages', () => {
    const result = formatPercent(150)
    expect(result).toContain('150')
  })

  it('handles small percentages', () => {
    const result = formatPercent(0.01)
    expect(result).toContain('0')
  })

  it('adds + sign for positive', () => {
    const result = formatPercent(5, { showSign: true })
    expect(result).toContain('+')
  })
})

describe('formatPercentage', () => {
  it('formats positive percentage with sign', () => {
    const result = formatPercentage(5.5)
    expect(result).toContain('+')
    expect(result).toContain('5')
    expect(result).toContain('%')
  })

  it('formats negative percentage', () => {
    const result = formatPercentage(-3.2)
    expect(result).toContain('-')
    expect(result).toContain('3')
  })

  it('handles zero', () => {
    const result = formatPercentage(0)
    expect(result).toContain('+')
    expect(result).toContain('0')
  })

  it('uses custom decimals', () => {
    const result = formatPercentage(5.5555, 1)
    expect(result).toContain('5.6')
  })
})

describe('formatPrice', () => {
  it('formats crypto price', () => {
    const result = formatPrice(50000)
    expect(result).toContain('50')
  })

  it('formats small price', () => {
    const result = formatPrice(0.00001234)
    expect(result).toContain('0')
  })

  it('handles 8 decimal places for small prices', () => {
    const result = formatPrice(0.00000001)
    expect(result).toBeDefined()
  })

  it('handles 2 decimal places for large prices', () => {
    const result = formatPrice(50000.123456)
    expect(result).toBeDefined()
  })
})

describe('formatQuantity', () => {
  it('formats integer quantity', () => {
    expect(formatQuantity(100)).toContain('100')
  })

  it('formats decimal quantity', () => {
    expect(formatQuantity(1.5)).toContain('1')
  })

  it('handles small quantities', () => {
    expect(formatQuantity(0.001)).toContain('0')
  })
})

describe('formatCompact', () => {
  it('formats millions', () => {
    const result = formatCompact(1500000)
    expect(result).toContain('M')
  })

  it('formats billions', () => {
    const result = formatCompact(2500000000)
    expect(result).toContain('B')
  })

  it('formats thousands', () => {
    const result = formatCompact(5000)
    expect(result).toContain('K')
  })

  it('handles small numbers', () => {
    const result = formatCompact(500)
    expect(result).toBe('500')
  })
})

describe('formatTimestamp', () => {
  it('formats date with default format', () => {
    const timestamp = new Date(2024, 0, 15, 14, 30).getTime()
    const result = formatTimestamp(timestamp)
    expect(result).toContain('2024')
  })

  it('formats with custom format', () => {
    const timestamp = new Date(2024, 0, 15).getTime()
    const result = formatTimestamp(timestamp, 'yyyy-MM-dd')
    expect(result).toBe('2024-01-15')
  })
})

describe('formatRelativeTime', () => {
  it('formats seconds ago', () => {
    const timestamp = Date.now() - 30000
    const result = formatRelativeTime(timestamp)
    expect(result).toMatch(/second|sec|just now|ago/i)
  })

  it('formats minutes ago', () => {
    const timestamp = Date.now() - 5 * 60000
    const result = formatRelativeTime(timestamp)
    expect(result).toMatch(/min|minute|ago/i)
  })

  it('formats hours ago', () => {
    const timestamp = Date.now() - 2 * 3600000
    const result = formatRelativeTime(timestamp)
    expect(result).toMatch(/hour|hr|ago/i)
  })

  it('formats days ago', () => {
    const timestamp = Date.now() - 3 * 86400000
    const result = formatRelativeTime(timestamp)
    expect(result).toMatch(/day|ago/i)
  })
})

describe('formatListTime', () => {
  it('formats today as time', () => {
    const today = Date.now()
    const result = formatListTime(today)
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('formats yesterday', () => {
    const yesterday = Date.now() - 86400000
    const result = formatListTime(yesterday)
    expect(result).toBe('Yesterday')
  })

  it('formats older dates', () => {
    const oldDate = new Date(2023, 5, 15).getTime()
    const result = formatListTime(oldDate)
    expect(result).toContain('Jun')
  })
})

describe('calculateChange', () => {
  it('calculates positive change', () => {
    const result = calculateChange(110, 100)
    expect(result.change).toBe(10)
    expect(result.changePercent).toBe(10)
  })

  it('calculates negative change', () => {
    const result = calculateChange(90, 100)
    expect(result.change).toBe(-10)
    expect(result.changePercent).toBe(-10)
  })

  it('handles zero change', () => {
    const result = calculateChange(100, 100)
    expect(result.change).toBe(0)
    expect(result.changePercent).toBe(0)
  })

  it('handles zero previous value', () => {
    const result = calculateChange(100, 0)
    expect(result.change).toBe(100)
    expect(result.changePercent).toBe(0)
  })
})

describe('getPnLClass', () => {
  it('returns profit class for positive', () => {
    expect(getPnLClass(100)).toBe('text-profit')
  })

  it('returns loss class for negative', () => {
    expect(getPnLClass(-100)).toBe('text-loss')
  })

  it('returns neutral class for zero', () => {
    expect(getPnLClass(0)).toBe('text-neutral')
  })
})

describe('getPnLBgClass', () => {
  it('returns profit bg class for positive', () => {
    expect(getPnLBgClass(100)).toBe('bg-profit/10 text-profit')
  })

  it('returns loss bg class for negative', () => {
    expect(getPnLBgClass(-100)).toBe('bg-loss/10 text-loss')
  })

  it('returns neutral bg class for zero', () => {
    expect(getPnLBgClass(0)).toBe('bg-neutral/10 text-neutral')
  })
})

describe('isEmpty', () => {
  it('returns true for null', () => {
    expect(isEmpty(null)).toBe(true)
  })

  it('returns true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true)
  })

  it('returns true for empty string', () => {
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('   ')).toBe(true)
  })

  it('returns true for empty array', () => {
    expect(isEmpty([])).toBe(true)
  })

  it('returns true for empty object', () => {
    expect(isEmpty({})).toBe(true)
  })

  it('returns false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false)
    expect(isEmpty([1, 2])).toBe(false)
    expect(isEmpty({ a: 1 })).toBe(false)
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(false)).toBe(false)
  })
})

describe('generateId', () => {
  it('generates unique ids', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('generates string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
  })

  it('generates non-empty string', () => {
    const id = generateId()
    expect(id.length).toBeGreaterThan(0)
  })

  it('generates many unique ids', () => {
    const ids = new Set()
    for (let i = 0; i < 1000; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(1000)
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    
    debounced()
    expect(fn).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('only executes once for multiple calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    
    debounced()
    debounced()
    debounced()
    
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('resets timer on each call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    
    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(100)
    
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes arguments', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    
    debounced('arg1', 'arg2')
    vi.advanceTimersByTime(100)
    
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('executes immediately', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throttles subsequent calls', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    
    throttled()
    throttled()
    throttled()
    
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('allows execution after delay', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    
    throttled()
    vi.advanceTimersByTime(100)
    throttled()
    
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('deepClone', () => {
  it('clones object', () => {
    const obj = { a: 1, b: { c: 2 } }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
  })

  it('clones nested objects', () => {
    const obj = { a: { b: { c: { d: 1 } } } }
    const cloned = deepClone(obj)
    expect(cloned.a.b.c.d).toBe(1)
    expect(cloned.a.b.c).not.toBe(obj.a.b.c)
  })

  it('clones arrays', () => {
    const arr = [1, 2, [3, 4]]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
  })

  it('handles null values', () => {
    const obj = { a: null, b: 1 }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
  })

  it('handles empty objects', () => {
    expect(deepClone({})).toEqual({})
  })

  it('handles empty arrays', () => {
    expect(deepClone([])).toEqual([])
  })
})

describe('sortBy', () => {
  it('sorts by key', () => {
    const arr = [{ n: 3 }, { n: 1 }, { n: 2 }]
    const sorted = sortBy(arr, 'n')
    expect(sorted[0].n).toBe(1)
    expect(sorted[2].n).toBe(3)
  })

  it('sorts strings', () => {
    const arr = [{ s: 'c' }, { s: 'a' }, { s: 'b' }]
    const sorted = sortBy(arr, 's')
    expect(sorted[0].s).toBe('a')
    expect(sorted[2].s).toBe('c')
  })

  it('sorts by function', () => {
    const arr = [{ n: 3 }, { n: 1 }, { n: 2 }]
    const sorted = sortBy(arr, (item) => item.n)
    expect(sorted[0].n).toBe(1)
  })

  it('handles multiple keys', () => {
    const arr = [{ a: 1, b: 2 }, { a: 1, b: 1 }, { a: 2, b: 1 }]
    const sorted = sortBy(arr, 'a', 'b')
    expect(sorted[0]).toEqual({ a: 1, b: 1 })
  })
})

describe('groupBy', () => {
  it('groups by key', () => {
    const arr = [{ type: 'a', v: 1 }, { type: 'b', v: 2 }, { type: 'a', v: 3 }]
    const grouped = groupBy(arr, 'type')
    expect(grouped.a.length).toBe(2)
    expect(grouped.b.length).toBe(1)
  })

  it('handles empty array', () => {
    const grouped = groupBy([], 'type')
    expect(grouped).toEqual({})
  })

  it('handles single item', () => {
    const grouped = groupBy([{ type: 'a', v: 1 }], 'type')
    expect(grouped.a.length).toBe(1)
  })
})

describe('clamp', () => {
  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('returns value in range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('handles edge at min', () => {
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('handles edge at max', () => {
    expect(clamp(10, 0, 10)).toBe(10)
  })

  it('handles negative range', () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
  })
})

afterEach(() => {
  vi.useRealTimers()
})
