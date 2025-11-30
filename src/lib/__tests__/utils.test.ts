// ============================================
// Utils Tests - Testing utility functions
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatCompact,
  formatPercent,
  formatPrice,
  formatQuantity,
  formatTimestamp,
  formatRelativeTime,
  formatListTime,
  calculateChange,
  getPnLClass,
  getPnLBgClass,
  clamp,
  generateId,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  groupBy,
  sortBy,
  cn,
} from '../utils'

describe('formatCurrency', () => {
  it('formats positive numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats negative numbers', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('uses custom decimals', () => {
    expect(formatCurrency(1234.5678, 4)).toBe('$1,234.5678')
  })

  it('uses custom currency', () => {
    const result = formatCurrency(1234.56, 2, 'EUR')
    expect(result).toContain('1,234.56')
  })

  it('handles very large numbers', () => {
    expect(formatCurrency(1234567890.12)).toBe('$1,234,567,890.12')
  })

  it('handles very small numbers', () => {
    expect(formatCurrency(0.01)).toBe('$0.01')
  })
})

describe('formatNumber', () => {
  it('formats numbers with default decimals', () => {
    expect(formatNumber(1234.567)).toBe('1,234.57')
  })

  it('formats with custom decimals', () => {
    expect(formatNumber(1234.5678, 4)).toBe('1,234.5678')
  })

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0.00')
  })

  it('formats negative numbers', () => {
    expect(formatNumber(-1234.56)).toBe('-1,234.56')
  })
})

describe('formatPercentage', () => {
  it('formats positive percentages with sign', () => {
    expect(formatPercentage(5.25)).toBe('+5.25%')
  })

  it('formats negative percentages', () => {
    expect(formatPercentage(-3.75)).toBe('-3.75%')
  })

  it('formats zero', () => {
    expect(formatPercentage(0)).toBe('+0.00%')
  })

  it('uses custom decimals', () => {
    expect(formatPercentage(5.2567, 4)).toBe('+5.2567%')
  })
})

describe('formatCompact', () => {
  it('formats thousands', () => {
    const result = formatCompact(1500)
    expect(result).toMatch(/1\.?5?K/i)
  })

  it('formats millions', () => {
    const result = formatCompact(1500000)
    expect(result).toMatch(/1\.?5?M/i)
  })

  it('formats billions', () => {
    const result = formatCompact(1500000000)
    expect(result).toMatch(/1\.?5?B/i)
  })

  it('handles small numbers', () => {
    expect(formatCompact(999)).toBe('999')
  })
})

describe('formatPercent', () => {
  it('formats with default options', () => {
    expect(formatPercent(5.25)).toBe('+5.25%')
  })

  it('hides sign when requested', () => {
    expect(formatPercent(5.25, { showSign: false })).toBe('5.25%')
  })

  it('uses custom decimals', () => {
    expect(formatPercent(5.2567, { decimals: 4 })).toBe('+5.2567%')
  })

  it('handles negative values', () => {
    expect(formatPercent(-3.75)).toBe('-3.75%')
  })
})

describe('formatPrice', () => {
  it('formats prices >= 10000 with no decimals', () => {
    expect(formatPrice(12345.67)).toBe('12346')
  })

  it('formats prices >= 1000 with 1 decimal', () => {
    expect(formatPrice(1234.56)).toBe('1234.6')
  })

  it('formats prices >= 1 with 2 decimals', () => {
    expect(formatPrice(123.456)).toBe('123.46')
  })

  it('formats prices >= 0.01 with 4 decimals', () => {
    expect(formatPrice(0.12345)).toBe('0.1235')
  })

  it('formats very small prices with 6 decimals', () => {
    expect(formatPrice(0.00123456)).toBe('0.001235')
  })
})

describe('formatQuantity', () => {
  it('formats quantities >= 1 with 4 decimals', () => {
    expect(formatQuantity(1.23456789)).toBe('1.2346')
  })

  it('formats small quantities with 6 decimals', () => {
    expect(formatQuantity(0.12345678)).toBe('0.123457')
  })
})

describe('formatTimestamp', () => {
  it('formats with default format', () => {
    const timestamp = new Date('2024-06-15T14:30:00').getTime()
    const result = formatTimestamp(timestamp)
    expect(result).toContain('Jun')
    expect(result).toContain('15')
  })

  it('uses custom format', () => {
    const timestamp = new Date('2024-06-15T14:30:00').getTime()
    const result = formatTimestamp(timestamp, 'yyyy-MM-dd')
    expect(result).toBe('2024-06-15')
  })
})

describe('formatRelativeTime', () => {
  it('formats recent times', () => {
    const now = Date.now()
    const result = formatRelativeTime(now - 1000 * 60 * 5) // 5 minutes ago
    expect(result).toContain('minutes ago')
  })

  it('formats with suffix', () => {
    const result = formatRelativeTime(Date.now() - 1000 * 60 * 60)
    expect(result).toContain('ago')
  })
})

describe('formatListTime', () => {
  it('formats today\'s time', () => {
    const today = new Date()
    today.setHours(14, 30, 0, 0)
    const result = formatListTime(today.getTime())
    expect(result).toBe('14:30')
  })

  it('formats yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const result = formatListTime(yesterday.getTime())
    expect(result).toBe('Yesterday')
  })

  it('formats older dates', () => {
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 5)
    const result = formatListTime(oldDate.getTime())
    expect(result).toMatch(/\w{3} \d+/)
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

  it('handles zero previous value', () => {
    const result = calculateChange(100, 0)
    expect(result.change).toBe(100)
    expect(result.changePercent).toBe(0)
  })

  it('handles no change', () => {
    const result = calculateChange(100, 100)
    expect(result.change).toBe(0)
    expect(result.changePercent).toBe(0)
  })
})

describe('getPnLClass', () => {
  it('returns profit class for positive values', () => {
    expect(getPnLClass(100)).toBe('text-profit')
  })

  it('returns loss class for negative values', () => {
    expect(getPnLClass(-100)).toBe('text-loss')
  })

  it('returns neutral class for zero', () => {
    expect(getPnLClass(0)).toBe('text-neutral')
  })
})

describe('getPnLBgClass', () => {
  it('returns profit background class for positive values', () => {
    expect(getPnLBgClass(100)).toBe('bg-profit/10 text-profit')
  })

  it('returns loss background class for negative values', () => {
    expect(getPnLBgClass(-100)).toBe('bg-loss/10 text-loss')
  })

  it('returns neutral background class for zero', () => {
    expect(getPnLBgClass(0)).toBe('bg-neutral/10 text-neutral')
  })
})

describe('clamp', () => {
  it('clamps value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps to maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('handles equal min and max', () => {
    expect(clamp(5, 5, 5)).toBe(5)
  })
})

describe('generateId', () => {
  it('generates unique ids', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('uses default prefix', () => {
    const id = generateId()
    expect(id).toMatch(/^id-/)
  })

  it('uses custom prefix', () => {
    const id = generateId('order')
    expect(id).toMatch(/^order-/)
  })

  it('contains timestamp and random component', () => {
    const id = generateId()
    const parts = id.split('-')
    expect(parts.length).toBe(3)
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

  it('only calls once for multiple rapid calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes arguments correctly', () => {
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

  it('calls function immediately on first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('ignores calls within throttle period', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('allows calls after throttle period', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    vi.advanceTimersByTime(100)
    throttled()

    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('deepClone', () => {
  it('clones simple objects', () => {
    const obj = { a: 1, b: 2 }
    const clone = deepClone(obj)
    
    expect(clone).toEqual(obj)
    expect(clone).not.toBe(obj)
  })

  it('clones nested objects', () => {
    const obj = { a: { b: { c: 1 } } }
    const clone = deepClone(obj)
    
    expect(clone).toEqual(obj)
    expect(clone.a).not.toBe(obj.a)
  })

  it('clones arrays', () => {
    const arr = [1, 2, [3, 4]]
    const clone = deepClone(arr)
    
    expect(clone).toEqual(arr)
    expect(clone).not.toBe(arr)
    expect(clone[2]).not.toBe(arr[2])
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
    expect(isEmpty([1])).toBe(false)
    expect(isEmpty({ a: 1 })).toBe(false)
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(false)).toBe(false)
  })
})

describe('groupBy', () => {
  it('groups objects by key', () => {
    const items = [
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
      { type: 'a', value: 3 },
    ]
    
    const result = groupBy(items, 'type')
    
    expect(result.a).toHaveLength(2)
    expect(result.b).toHaveLength(1)
  })

  it('handles empty array', () => {
    const result = groupBy([], 'type')
    expect(result).toEqual({})
  })
})

describe('sortBy', () => {
  it('sorts by single key', () => {
    const items = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 35 },
    ]
    
    const result = sortBy(items, 'name')
    
    expect(result[0].name).toBe('Alice')
    expect(result[1].name).toBe('Bob')
    expect(result[2].name).toBe('Charlie')
  })

  it('sorts by function', () => {
    const items = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 35 },
    ]
    
    const result = sortBy(items, (item) => item.age)
    
    expect(result[0].age).toBe(25)
    expect(result[1].age).toBe(30)
    expect(result[2].age).toBe(35)
  })

  it('does not mutate original array', () => {
    const items = [{ a: 3 }, { a: 1 }, { a: 2 }]
    const original = [...items]
    
    sortBy(items, 'a')
    
    expect(items).toEqual(original)
  })
})

describe('cn', () => {
  it('joins classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles single class', () => {
    expect(cn('single')).toBe('single')
  })
})
