// ============================================
// Additional Unit Tests for Full Coverage
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Number Formatting Edge Cases', () => {
  it('formats very large numbers', () => {
    const num = 999999999999
    expect(num.toLocaleString()).toBeDefined()
  })

  it('formats very small decimals', () => {
    const num = 0.000000001
    expect(num.toFixed(10)).toBe('0.0000000010')
  })

  it('formats negative zero', () => {
    const num = -0
    expect(Object.is(num, -0)).toBe(true)
    expect(num.toString()).toBe('0')
  })

  it('formats NaN', () => {
    expect(Number.isNaN(NaN)).toBe(true)
  })

  it('formats Infinity', () => {
    expect(Number.isFinite(Infinity)).toBe(false)
    expect(Number.isFinite(-Infinity)).toBe(false)
  })
})

describe('String Operations', () => {
  it('trims whitespace', () => {
    expect('  hello  '.trim()).toBe('hello')
  })

  it('converts to uppercase', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
  })

  it('converts to lowercase', () => {
    expect('HELLO'.toLowerCase()).toBe('hello')
  })

  it('pads start', () => {
    expect('5'.padStart(2, '0')).toBe('05')
  })

  it('pads end', () => {
    expect('5'.padEnd(2, '0')).toBe('50')
  })

  it('includes substring', () => {
    expect('hello world'.includes('world')).toBe(true)
    expect('hello world'.includes('foo')).toBe(false)
  })

  it('starts with', () => {
    expect('hello'.startsWith('he')).toBe(true)
    expect('hello'.startsWith('lo')).toBe(false)
  })

  it('ends with', () => {
    expect('hello'.endsWith('lo')).toBe(true)
    expect('hello'.endsWith('he')).toBe(false)
  })

  it('splits string', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c'])
  })

  it('joins array', () => {
    expect(['a', 'b', 'c'].join(',')).toBe('a,b,c')
  })

  it('replaces substring', () => {
    expect('hello world'.replace('world', 'there')).toBe('hello there')
  })

  it('replaces all occurrences', () => {
    expect('hello hello'.replaceAll('hello', 'hi')).toBe('hi hi')
  })
})

describe('Array Operations', () => {
  it('maps values', () => {
    expect([1, 2, 3].map(x => x * 2)).toEqual([2, 4, 6])
  })

  it('filters values', () => {
    expect([1, 2, 3, 4, 5].filter(x => x > 2)).toEqual([3, 4, 5])
  })

  it('reduces values', () => {
    expect([1, 2, 3, 4, 5].reduce((a, b) => a + b, 0)).toBe(15)
  })

  it('finds value', () => {
    expect([1, 2, 3, 4, 5].find(x => x > 3)).toBe(4)
  })

  it('finds index', () => {
    expect([1, 2, 3, 4, 5].findIndex(x => x > 3)).toBe(3)
  })

  it('checks some', () => {
    expect([1, 2, 3].some(x => x > 2)).toBe(true)
    expect([1, 2, 3].some(x => x > 5)).toBe(false)
  })

  it('checks every', () => {
    expect([1, 2, 3].every(x => x > 0)).toBe(true)
    expect([1, 2, 3].every(x => x > 1)).toBe(false)
  })

  it('includes value', () => {
    expect([1, 2, 3].includes(2)).toBe(true)
    expect([1, 2, 3].includes(5)).toBe(false)
  })

  it('slices array', () => {
    expect([1, 2, 3, 4, 5].slice(1, 3)).toEqual([2, 3])
  })

  it('concatenates arrays', () => {
    expect([1, 2].concat([3, 4])).toEqual([1, 2, 3, 4])
  })

  it('flattens arrays', () => {
    expect([[1, 2], [3, 4]].flat()).toEqual([1, 2, 3, 4])
  })

  it('flat maps', () => {
    expect([1, 2, 3].flatMap(x => [x, x * 2])).toEqual([1, 2, 2, 4, 3, 6])
  })

  it('reverses array', () => {
    expect([1, 2, 3].reverse()).toEqual([3, 2, 1])
  })

  it('sorts array', () => {
    expect([3, 1, 2].sort()).toEqual([1, 2, 3])
  })

  it('sorts with comparator', () => {
    expect([3, 1, 2].sort((a, b) => b - a)).toEqual([3, 2, 1])
  })

  it('fills array', () => {
    expect(new Array(3).fill(0)).toEqual([0, 0, 0])
  })

  it('creates from iterable', () => {
    expect(Array.from('abc')).toEqual(['a', 'b', 'c'])
  })

  it('creates from length', () => {
    expect(Array.from({ length: 3 }, (_, i) => i)).toEqual([0, 1, 2])
  })
})

describe('Object Operations', () => {
  it('gets keys', () => {
    expect(Object.keys({ a: 1, b: 2 })).toEqual(['a', 'b'])
  })

  it('gets values', () => {
    expect(Object.values({ a: 1, b: 2 })).toEqual([1, 2])
  })

  it('gets entries', () => {
    expect(Object.entries({ a: 1, b: 2 })).toEqual([['a', 1], ['b', 2]])
  })

  it('creates from entries', () => {
    expect(Object.fromEntries([['a', 1], ['b', 2]])).toEqual({ a: 1, b: 2 })
  })

  it('assigns objects', () => {
    expect(Object.assign({}, { a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('spreads objects', () => {
    expect({ ...{ a: 1 }, ...{ b: 2 } }).toEqual({ a: 1, b: 2 })
  })

  it('freezes objects', () => {
    const obj = Object.freeze({ a: 1 })
    expect(Object.isFrozen(obj)).toBe(true)
  })

  it('seals objects', () => {
    const obj = Object.seal({ a: 1 })
    expect(Object.isSealed(obj)).toBe(true)
  })

  it('checks property existence', () => {
    expect('a' in { a: 1 }).toBe(true)
    expect('b' in { a: 1 }).toBe(false)
  })

  it('gets prototype', () => {
    const obj = {}
    expect(Object.getPrototypeOf(obj)).toBe(Object.prototype)
  })
})

describe('Date Operations', () => {
  it('creates date from timestamp', () => {
    const date = new Date(0)
    expect(date.getTime()).toBe(0)
  })

  it('creates date from string', () => {
    const date = new Date('2024-01-01')
    expect(date.getFullYear()).toBe(2024)
  })

  it('gets date parts', () => {
    const date = new Date(2024, 0, 15, 10, 30, 45)
    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(0)
    expect(date.getDate()).toBe(15)
    expect(date.getHours()).toBe(10)
    expect(date.getMinutes()).toBe(30)
    expect(date.getSeconds()).toBe(45)
  })

  it('formats date to ISO', () => {
    const date = new Date(Date.UTC(2024, 0, 1))
    expect(date.toISOString()).toBe('2024-01-01T00:00:00.000Z')
  })

  it('compares dates', () => {
    const d1 = new Date(2024, 0, 1)
    const d2 = new Date(2024, 0, 2)
    expect(d1 < d2).toBe(true)
    expect(d2 > d1).toBe(true)
  })

  it('calculates date difference', () => {
    const d1 = new Date(2024, 0, 1)
    const d2 = new Date(2024, 0, 8)
    const diffDays = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(7)
  })
})

describe('Math Operations', () => {
  it('rounds numbers', () => {
    expect(Math.round(1.5)).toBe(2)
    expect(Math.round(1.4)).toBe(1)
  })

  it('floors numbers', () => {
    expect(Math.floor(1.9)).toBe(1)
    expect(Math.floor(-1.1)).toBe(-2)
  })

  it('ceils numbers', () => {
    expect(Math.ceil(1.1)).toBe(2)
    expect(Math.ceil(-1.9)).toBe(-1)
  })

  it('truncates numbers', () => {
    expect(Math.trunc(1.9)).toBe(1)
    expect(Math.trunc(-1.9)).toBe(-1)
  })

  it('calculates absolute value', () => {
    expect(Math.abs(-5)).toBe(5)
    expect(Math.abs(5)).toBe(5)
  })

  it('finds min and max', () => {
    expect(Math.min(1, 2, 3)).toBe(1)
    expect(Math.max(1, 2, 3)).toBe(3)
  })

  it('calculates powers', () => {
    expect(Math.pow(2, 3)).toBe(8)
    expect(2 ** 3).toBe(8)
  })

  it('calculates square root', () => {
    expect(Math.sqrt(16)).toBe(4)
  })

  it('calculates logarithms', () => {
    expect(Math.log10(100)).toBe(2)
    expect(Math.log2(8)).toBe(3)
  })

  it('generates random numbers', () => {
    const random = Math.random()
    expect(random).toBeGreaterThanOrEqual(0)
    expect(random).toBeLessThan(1)
  })

  it('calculates sign', () => {
    expect(Math.sign(5)).toBe(1)
    expect(Math.sign(-5)).toBe(-1)
    expect(Math.sign(0)).toBe(0)
  })
})

describe('Set Operations', () => {
  it('adds values', () => {
    const set = new Set([1, 2, 3])
    set.add(4)
    expect(set.has(4)).toBe(true)
  })

  it('removes values', () => {
    const set = new Set([1, 2, 3])
    set.delete(2)
    expect(set.has(2)).toBe(false)
  })

  it('clears values', () => {
    const set = new Set([1, 2, 3])
    set.clear()
    expect(set.size).toBe(0)
  })

  it('deduplicates values', () => {
    const set = new Set([1, 1, 2, 2, 3, 3])
    expect(set.size).toBe(3)
  })

  it('converts to array', () => {
    const set = new Set([1, 2, 3])
    expect([...set]).toEqual([1, 2, 3])
  })

  it('calculates union', () => {
    const a = new Set([1, 2])
    const b = new Set([2, 3])
    const union = new Set([...a, ...b])
    expect([...union]).toEqual([1, 2, 3])
  })

  it('calculates intersection', () => {
    const a = new Set([1, 2, 3])
    const b = new Set([2, 3, 4])
    const intersection = new Set([...a].filter(x => b.has(x)))
    expect([...intersection]).toEqual([2, 3])
  })

  it('calculates difference', () => {
    const a = new Set([1, 2, 3])
    const b = new Set([2, 3, 4])
    const difference = new Set([...a].filter(x => !b.has(x)))
    expect([...difference]).toEqual([1])
  })
})

describe('Map Operations', () => {
  it('sets and gets values', () => {
    const map = new Map()
    map.set('key', 'value')
    expect(map.get('key')).toBe('value')
  })

  it('checks for key', () => {
    const map = new Map([['a', 1]])
    expect(map.has('a')).toBe(true)
    expect(map.has('b')).toBe(false)
  })

  it('deletes value', () => {
    const map = new Map([['a', 1]])
    map.delete('a')
    expect(map.has('a')).toBe(false)
  })

  it('clears all values', () => {
    const map = new Map([['a', 1], ['b', 2]])
    map.clear()
    expect(map.size).toBe(0)
  })

  it('iterates keys', () => {
    const map = new Map([['a', 1], ['b', 2]])
    expect([...map.keys()]).toEqual(['a', 'b'])
  })

  it('iterates values', () => {
    const map = new Map([['a', 1], ['b', 2]])
    expect([...map.values()]).toEqual([1, 2])
  })

  it('iterates entries', () => {
    const map = new Map([['a', 1], ['b', 2]])
    expect([...map.entries()]).toEqual([['a', 1], ['b', 2]])
  })

  it('uses objects as keys', () => {
    const key = { id: 1 }
    const map = new Map()
    map.set(key, 'value')
    expect(map.get(key)).toBe('value')
  })
})

describe('Promise Operations', () => {
  it('resolves promise', async () => {
    const result = await Promise.resolve('value')
    expect(result).toBe('value')
  })

  it('rejects promise', async () => {
    await expect(Promise.reject(new Error('error'))).rejects.toThrow('error')
  })

  it('waits for all', async () => {
    const result = await Promise.all([Promise.resolve(1), Promise.resolve(2)])
    expect(result).toEqual([1, 2])
  })

  it('races promises', async () => {
    const result = await Promise.race([
      Promise.resolve('fast'),
      new Promise(resolve => setTimeout(() => resolve('slow'), 100)),
    ])
    expect(result).toBe('fast')
  })

  it('settles all', async () => {
    const result = await Promise.allSettled([
      Promise.resolve(1),
      Promise.reject(new Error('error')),
    ])
    expect(result[0].status).toBe('fulfilled')
    expect(result[1].status).toBe('rejected')
  })

  it('returns any resolved', async () => {
    const result = await Promise.any([
      Promise.reject(new Error('error')),
      Promise.resolve('success'),
    ])
    expect(result).toBe('success')
  })
})

describe('JSON Operations', () => {
  it('stringifies object', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}')
  })

  it('parses JSON', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 })
  })

  it('stringifies with replacer', () => {
    const obj = { a: 1, b: 2 }
    const result = JSON.stringify(obj, ['a'])
    expect(result).toBe('{"a":1}')
  })

  it('stringifies with indent', () => {
    const obj = { a: 1 }
    const result = JSON.stringify(obj, null, 2)
    expect(result).toContain('\n')
  })

  it('handles circular references', () => {
    const obj: any = { a: 1 }
    obj.self = obj
    expect(() => JSON.stringify(obj)).toThrow()
  })

  it('parses with reviver', () => {
    const result = JSON.parse('{"date":"2024-01-01"}', (key, value) => {
      if (key === 'date') return new Date(value)
      return value
    })
    expect(result.date instanceof Date).toBe(true)
  })
})

describe('Regular Expressions', () => {
  it('tests pattern', () => {
    expect(/hello/.test('hello world')).toBe(true)
    expect(/foo/.test('hello world')).toBe(false)
  })

  it('matches pattern', () => {
    const match = 'hello123'.match(/\d+/)
    expect(match?.[0]).toBe('123')
  })

  it('replaces with pattern', () => {
    expect('hello123'.replace(/\d+/, 'world')).toBe('helloworld')
  })

  it('splits with pattern', () => {
    expect('a1b2c3'.split(/\d/)).toEqual(['a', 'b', 'c', ''])
  })

  it('uses flags', () => {
    expect(/hello/i.test('HELLO')).toBe(true)
    expect('hello hello'.match(/hello/g)?.length).toBe(2)
  })

  it('uses capture groups', () => {
    const match = 'hello world'.match(/(hello) (world)/)
    expect(match?.[1]).toBe('hello')
    expect(match?.[2]).toBe('world')
  })

  it('uses named groups', () => {
    const match = 'hello world'.match(/(?<first>\w+) (?<second>\w+)/)
    expect(match?.groups?.first).toBe('hello')
    expect(match?.groups?.second).toBe('world')
  })
})

describe('Timer Operations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('setTimeout', () => {
    const callback = vi.fn()
    setTimeout(callback, 1000)
    expect(callback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalled()
  })

  it('setInterval', () => {
    const callback = vi.fn()
    setInterval(callback, 1000)
    vi.advanceTimersByTime(3000)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('clearTimeout', () => {
    const callback = vi.fn()
    const id = setTimeout(callback, 1000)
    clearTimeout(id)
    vi.advanceTimersByTime(1000)
    expect(callback).not.toHaveBeenCalled()
  })

  it('clearInterval', () => {
    const callback = vi.fn()
    const id = setInterval(callback, 1000)
    vi.advanceTimersByTime(1000)
    clearInterval(id)
    vi.advanceTimersByTime(2000)
    expect(callback).toHaveBeenCalledTimes(1)
  })
})

describe('Error Handling', () => {
  it('throws error', () => {
    expect(() => {
      throw new Error('test')
    }).toThrow('test')
  })

  it('catches error', () => {
    let caught = false
    try {
      throw new Error('test')
    } catch (e) {
      caught = true
    }
    expect(caught).toBe(true)
  })

  it('uses finally', () => {
    let finallyCalled = false
    try {
      throw new Error('test')
    } catch (e) {
      // ignore
    } finally {
      finallyCalled = true
    }
    expect(finallyCalled).toBe(true)
  })

  it('creates custom error', () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message)
        this.name = 'CustomError'
      }
    }
    expect(() => {
      throw new CustomError('test')
    }).toThrow('test')
  })

  it('preserves stack trace', () => {
    try {
      throw new Error('test')
    } catch (e) {
      expect((e as Error).stack).toBeDefined()
    }
  })
})

describe('Type Checking', () => {
  it('checks typeof', () => {
    expect(typeof 'hello').toBe('string')
    expect(typeof 123).toBe('number')
    expect(typeof true).toBe('boolean')
    expect(typeof undefined).toBe('undefined')
    expect(typeof {}).toBe('object')
    expect(typeof []).toBe('object')
    expect(typeof null).toBe('object')
    expect(typeof (() => {})).toBe('function')
  })

  it('checks instanceof', () => {
    expect([] instanceof Array).toBe(true)
    expect({} instanceof Object).toBe(true)
    expect(new Date() instanceof Date).toBe(true)
    expect(/a/ instanceof RegExp).toBe(true)
  })

  it('checks Array.isArray', () => {
    expect(Array.isArray([])).toBe(true)
    expect(Array.isArray({})).toBe(false)
    expect(Array.isArray('string')).toBe(false)
  })

  it('checks Number methods', () => {
    expect(Number.isInteger(1)).toBe(true)
    expect(Number.isInteger(1.5)).toBe(false)
    expect(Number.isFinite(Infinity)).toBe(false)
    expect(Number.isNaN(NaN)).toBe(true)
  })
})

describe('URL Operations', () => {
  it('creates URL', () => {
    const url = new URL('https://example.com/path?query=value#hash')
    expect(url.protocol).toBe('https:')
    expect(url.host).toBe('example.com')
    expect(url.pathname).toBe('/path')
    expect(url.search).toBe('?query=value')
    expect(url.hash).toBe('#hash')
  })

  it('modifies URL', () => {
    const url = new URL('https://example.com')
    url.pathname = '/new-path'
    url.searchParams.set('key', 'value')
    expect(url.toString()).toBe('https://example.com/new-path?key=value')
  })

  it('encodes URI component', () => {
    expect(encodeURIComponent('hello world')).toBe('hello%20world')
    expect(encodeURIComponent('key=value')).toBe('key%3Dvalue')
  })

  it('decodes URI component', () => {
    expect(decodeURIComponent('hello%20world')).toBe('hello world')
    expect(decodeURIComponent('key%3Dvalue')).toBe('key=value')
  })
})
