// ============================================
// Component Behavior Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import React, { useState, useEffect, useCallback, useMemo, useReducer, useRef, useContext, createContext } from 'react'

// ============================================
// Component Pattern Tests
// ============================================

describe('React Component Patterns', () => {
  describe('Controlled Input Components', () => {
    function ControlledInput() {
      const [value, setValue] = useState('')
      return (
        <input
          data-testid="input"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      )
    }

    it('handles value changes', () => {
      render(<ControlledInput />)
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: 'hello' } })
      expect(input).toHaveValue('hello')
    })
  })

  describe('Uncontrolled Input Components', () => {
    function UncontrolledInput() {
      const ref = useRef<HTMLInputElement>(null)
      return (
        <div>
          <input data-testid="input" ref={ref} defaultValue="" />
          <button data-testid="submit" onClick={() => ref.current?.value}>
            Submit
          </button>
        </div>
      )
    }

    it('uses ref for value', () => {
      render(<UncontrolledInput />)
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: 'hello' } })
      expect(input).toHaveValue('hello')
    })
  })

  describe('Compound Components', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const TabContext = createContext({ activeTab: '', setActiveTab: (_: string) => {} })

    function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
      const [activeTab, setActiveTab] = useState(defaultTab)
      return (
        <TabContext.Provider value={{ activeTab, setActiveTab }}>
          <div data-testid="tabs">{children}</div>
        </TabContext.Provider>
      )
    }

    function Tab({ id, children }: { id: string; children: React.ReactNode }) {
      const { activeTab, setActiveTab } = useContext(TabContext)
      return (
        <button
          data-testid={`tab-${id}`}
          onClick={() => setActiveTab(id)}
          data-active={activeTab === id}
        >
          {children}
        </button>
      )
    }

    function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
      const { activeTab } = useContext(TabContext)
      if (activeTab !== id) return null
      return <div data-testid={`panel-${id}`}>{children}</div>
    }

    it('switches between tabs', () => {
      render(
        <Tabs defaultTab="a">
          <Tab id="a">Tab A</Tab>
          <Tab id="b">Tab B</Tab>
          <TabPanel id="a">Panel A</TabPanel>
          <TabPanel id="b">Panel B</TabPanel>
        </Tabs>,
      )

      expect(screen.getByTestId('panel-a')).toBeInTheDocument()
      expect(screen.queryByTestId('panel-b')).not.toBeInTheDocument()

      fireEvent.click(screen.getByTestId('tab-b'))

      expect(screen.queryByTestId('panel-a')).not.toBeInTheDocument()
      expect(screen.getByTestId('panel-b')).toBeInTheDocument()
    })
  })

  describe('Render Props Pattern', () => {
    interface MousePosition {
      x: number
      y: number
    }

    function MouseTracker({ render }: { render: (pos: MousePosition) => React.ReactNode }) {
      const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 })
      return (
        <div
          data-testid="tracker"
          onMouseMove={e => setPosition({ x: e.clientX, y: e.clientY })}
        >
          {render(position)}
        </div>
      )
    }

    it('passes render data', () => {
      render(<MouseTracker render={pos => <span data-testid="pos">{pos.x},{pos.y}</span>} />)
      const tracker = screen.getByTestId('tracker')
      fireEvent.mouseMove(tracker, { clientX: 100, clientY: 200 })
      expect(screen.getByTestId('pos')).toHaveTextContent('100,200')
    })
  })

  describe('Higher-Order Components', () => {
    function withLoading<P extends object>(Component: React.ComponentType<P>) {
      return function WithLoading(props: P & { isLoading: boolean }) {
        const { isLoading, ...rest } = props
        if (isLoading) return <div data-testid="loading">Loading...</div>
        return <Component {...(rest as P)} />
      }
    }

    function Content({ text }: { text: string }) {
      return <div data-testid="content">{text}</div>
    }

    const ContentWithLoading = withLoading(Content)

    it('shows loading state', () => {
      render(<ContentWithLoading isLoading={true} text="Hello" />)
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('shows content when not loading', () => {
      render(<ContentWithLoading isLoading={false} text="Hello" />)
      expect(screen.getByTestId('content')).toHaveTextContent('Hello')
    })
  })

  describe('Custom Hook Pattern', () => {
    function useCounter(initial = 0) {
      const [count, setCount] = useState(initial)
      const increment = useCallback(() => setCount(c => c + 1), [])
      const decrement = useCallback(() => setCount(c => c - 1), [])
      const reset = useCallback(() => setCount(initial), [initial])
      return { count, increment, decrement, reset }
    }

    it('increments count', () => {
      const { result } = renderHook(() => useCounter())
      expect(result.current.count).toBe(0)
      act(() => result.current.increment())
      expect(result.current.count).toBe(1)
    })

    it('decrements count', () => {
      const { result } = renderHook(() => useCounter(5))
      act(() => result.current.decrement())
      expect(result.current.count).toBe(4)
    })

    it('resets count', () => {
      const { result } = renderHook(() => useCounter(10))
      act(() => {
        result.current.increment()
        result.current.increment()
        result.current.reset()
      })
      expect(result.current.count).toBe(10)
    })
  })

  describe('Reducer Pattern', () => {
    type State = { count: number }
    type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset'; payload: number }

    function reducer(state: State, action: Action): State {
      switch (action.type) {
        case 'increment':
          return { count: state.count + 1 }
        case 'decrement':
          return { count: state.count - 1 }
        case 'reset':
          return { count: action.payload }
        default:
          return state
      }
    }

    function Counter({ initial }: { initial: number }) {
      const [state, dispatch] = useReducer(reducer, { count: initial })
      return (
        <div>
          <span data-testid="count">{state.count}</span>
          <button data-testid="inc" onClick={() => dispatch({ type: 'increment' })}>+</button>
          <button data-testid="dec" onClick={() => dispatch({ type: 'decrement' })}>-</button>
          <button data-testid="reset" onClick={() => dispatch({ type: 'reset', payload: initial })}>
            Reset
          </button>
        </div>
      )
    }

    it('manages state with reducer', () => {
      render(<Counter initial={5} />)
      expect(screen.getByTestId('count')).toHaveTextContent('5')
      fireEvent.click(screen.getByTestId('inc'))
      expect(screen.getByTestId('count')).toHaveTextContent('6')
      fireEvent.click(screen.getByTestId('dec'))
      expect(screen.getByTestId('count')).toHaveTextContent('5')
      fireEvent.click(screen.getByTestId('reset'))
      expect(screen.getByTestId('count')).toHaveTextContent('5')
    })
  })
})

describe('Effect Patterns', () => {
  describe('Data Fetching', () => {
    interface User {
      id: number
      name: string
    }

    // Custom hook for data fetching to demonstrate the pattern
    function useFetchUser(userId: number) {
      const [state, setState] = useState<{
        user: User | null
        loading: boolean
        error: Error | null
      }>({ user: null, loading: true, error: null })

      useEffect(() => {
        let cancelled = false

        const fetchData = async () => {
          try {
            const res = await fetch(`/api/users/${userId}`)
            const data = await res.json()
            if (!cancelled) {
              setState({ user: data, loading: false, error: null })
            }
          } catch (err) {
            if (!cancelled) {
              setState({ user: null, loading: false, error: err as Error })
            }
          }
        }

        fetchData()

        return () => {
          cancelled = true
        }
      }, [userId])

      return state
    }

    function UserProfile({ userId }: { userId: number }) {
      const { user, loading, error } = useFetchUser(userId)

      if (loading) return <div data-testid="loading">Loading...</div>
      if (error) return <div data-testid="error">{error.message}</div>
      return <div data-testid="user">{user?.name}</div>
    }

    beforeEach(() => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({ id: 1, name: 'John' }),
      } as Response)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('shows loading state initially', () => {
      render(<UserProfile userId={1} />)
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('shows user data after fetch', async () => {
      render(<UserProfile userId={1} />)
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('John')
      })
    })

    it('handles fetch error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))
      render(<UserProfile userId={1} />)
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Network error')
      })
    })
  })

  describe('Debounced Input', () => {
    function DebouncedSearch({ onSearch }: { onSearch: (term: string) => void }) {
      const [value, setValue] = useState('')

      useEffect(() => {
        const timeout = setTimeout(() => {
          if (value) onSearch(value)
        }, 300)
        return () => clearTimeout(timeout)
      }, [value, onSearch])

      return (
        <input
          data-testid="search"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      )
    }

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('debounces search', () => {
      const onSearch = vi.fn()
      render(<DebouncedSearch onSearch={onSearch} />)
      const input = screen.getByTestId('search')

      fireEvent.change(input, { target: { value: 'hello' } })
      expect(onSearch).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)
      expect(onSearch).toHaveBeenCalledWith('hello')
    })

    it('cancels previous debounce', () => {
      const onSearch = vi.fn()
      render(<DebouncedSearch onSearch={onSearch} />)
      const input = screen.getByTestId('search')

      fireEvent.change(input, { target: { value: 'hel' } })
      vi.advanceTimersByTime(200)
      fireEvent.change(input, { target: { value: 'hello' } })
      vi.advanceTimersByTime(300)

      expect(onSearch).toHaveBeenCalledTimes(1)
      expect(onSearch).toHaveBeenCalledWith('hello')
    })
  })

  describe('Resize Observer', () => {
    function ResizeAwareBox() {
      const [size, setSize] = useState({ width: 0, height: 0 })
      const ref = useRef<HTMLDivElement>(null)

      useEffect(() => {
        if (!ref.current) return

        const observer = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect
          setSize({ width, height })
        })

        observer.observe(ref.current)
        return () => observer.disconnect()
      }, [])

      return (
        <div ref={ref} data-testid="box">
          {size.width}x{size.height}
        </div>
      )
    }

    it('renders resize aware box', () => {
      render(<ResizeAwareBox />)
      expect(screen.getByTestId('box')).toBeInTheDocument()
    })
  })

  describe('Cleanup on Unmount', () => {
    function Subscription({ onMount, onUnmount }: { onMount: () => void; onUnmount: () => void }) {
      useEffect(() => {
        onMount()
        return () => onUnmount()
      }, [onMount, onUnmount])

      return <div data-testid="subscription">Subscribed</div>
    }

    it('calls mount and unmount handlers', () => {
      const onMount = vi.fn()
      const onUnmount = vi.fn()

      const { unmount } = render(<Subscription onMount={onMount} onUnmount={onUnmount} />)
      expect(onMount).toHaveBeenCalledTimes(1)
      expect(onUnmount).not.toHaveBeenCalled()

      unmount()
      expect(onUnmount).toHaveBeenCalledTimes(1)
    })
  })
})

describe('Memo Patterns', () => {
  describe('useMemo', () => {
    function ExpensiveCalculation({ items }: { items: number[] }) {
      const sum = useMemo(() => {
        return items.reduce((acc, item) => acc + item, 0)
      }, [items])

      return <div data-testid="sum">{sum}</div>
    }

    it('memoizes calculation', () => {
      const { rerender } = render(<ExpensiveCalculation items={[1, 2, 3]} />)
      expect(screen.getByTestId('sum')).toHaveTextContent('6')

      rerender(<ExpensiveCalculation items={[1, 2, 3, 4]} />)
      expect(screen.getByTestId('sum')).toHaveTextContent('10')
    })
  })

  describe('useCallback', () => {
    function Parent() {
      const [count, setCount] = useState(0)
      const increment = useCallback(() => setCount(c => c + 1), [])

      return (
        <div>
          <span data-testid="count">{count}</span>
          <Child onClick={increment} />
        </div>
      )
    }

    const Child = React.memo(function Child({ onClick }: { onClick: () => void }) {
      return <button data-testid="button" onClick={onClick}>Click</button>
    })

    it('maintains callback reference', () => {
      render(<Parent />)
      fireEvent.click(screen.getByTestId('button'))
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })
  })

  describe('React.memo', () => {
    const renderSpy = vi.fn()

    const MemoizedChild = React.memo(function MemoizedChild({ value }: { value: number }) {
      renderSpy()
      return <div data-testid="child">{value}</div>
    })

    beforeEach(() => {
      renderSpy.mockClear()
    })

    it('prevents unnecessary rerenders', () => {
      const { rerender } = render(<MemoizedChild value={1} />)
      expect(renderSpy).toHaveBeenCalledTimes(1)

      rerender(<MemoizedChild value={1} />)
      expect(renderSpy).toHaveBeenCalledTimes(1)

      rerender(<MemoizedChild value={2} />)
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })
  })
})

describe('Form Patterns', () => {
  describe('Form Validation', () => {
    function ValidatedForm({ onSubmit }: { onSubmit: (data: { email: string }) => void }) {
      const [email, setEmail] = useState('')
      const [error, setError] = useState('')

      const validate = (value: string) => {
        if (!value) return 'Email is required'
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email'
        return ''
      }

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const validationError = validate(email)
        if (validationError) {
          setError(validationError)
          return
        }
        onSubmit({ email })
      }

      return (
        <form onSubmit={handleSubmit}>
          <input
            data-testid="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {error && <span data-testid="error">{error}</span>}
          <button type="submit" data-testid="submit">Submit</button>
        </form>
      )
    }

    it('shows error for empty email', () => {
      const onSubmit = vi.fn()
      render(<ValidatedForm onSubmit={onSubmit} />)
      fireEvent.click(screen.getByTestId('submit'))
      expect(screen.getByTestId('error')).toHaveTextContent('Email is required')
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('shows error for invalid email', () => {
      const onSubmit = vi.fn()
      render(<ValidatedForm onSubmit={onSubmit} />)
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'invalid' } })
      fireEvent.click(screen.getByTestId('submit'))
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid email')
    })

    it('submits valid email', () => {
      const onSubmit = vi.fn()
      render(<ValidatedForm onSubmit={onSubmit} />)
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@example.com' } })
      fireEvent.click(screen.getByTestId('submit'))
      expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })
    })
  })

  describe('Multi-step Form', () => {
    function MultiStepForm({ onComplete }: { onComplete: (data: { name: string; email: string }) => void }) {
      const [step, setStep] = useState(1)
      const [name, setName] = useState('')
      const [email, setEmail] = useState('')

      const handleNext = () => {
        if (step === 1 && name) setStep(2)
      }

      const handleSubmit = () => {
        if (email) onComplete({ name, email })
      }

      return (
        <div>
          <span data-testid="step">Step {step}</span>
          {step === 1 && (
            <div>
              <input data-testid="name" value={name} onChange={e => setName(e.target.value)} />
              <button data-testid="next" onClick={handleNext}>Next</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <input data-testid="email" value={email} onChange={e => setEmail(e.target.value)} />
              <button data-testid="complete" onClick={handleSubmit}>Complete</button>
            </div>
          )}
        </div>
      )
    }

    it('navigates through steps', () => {
      const onComplete = vi.fn()
      render(<MultiStepForm onComplete={onComplete} />)
      
      expect(screen.getByTestId('step')).toHaveTextContent('Step 1')
      fireEvent.change(screen.getByTestId('name'), { target: { value: 'John' } })
      fireEvent.click(screen.getByTestId('next'))
      
      expect(screen.getByTestId('step')).toHaveTextContent('Step 2')
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'john@example.com' } })
      fireEvent.click(screen.getByTestId('complete'))
      
      expect(onComplete).toHaveBeenCalledWith({ name: 'John', email: 'john@example.com' })
    })
  })
})

describe('List Rendering Patterns', () => {
  describe('Virtual List', () => {
    interface Item {
      id: number
      text: string
    }

    function SimpleList({ items }: { items: Item[] }) {
      return (
        <ul data-testid="list">
          {items.map(item => (
            <li key={item.id} data-testid={`item-${item.id}`}>
              {item.text}
            </li>
          ))}
        </ul>
      )
    }

    it('renders items with keys', () => {
      const items = [
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
        { id: 3, text: 'Item 3' },
      ]
      render(<SimpleList items={items} />)
      expect(screen.getByTestId('item-1')).toHaveTextContent('Item 1')
      expect(screen.getByTestId('item-2')).toHaveTextContent('Item 2')
      expect(screen.getByTestId('item-3')).toHaveTextContent('Item 3')
    })
  })

  describe('Sortable List', () => {
    function SortableList({ items }: { items: string[] }) {
      const [sorted, setSorted] = useState(items)
      const [ascending, setAscending] = useState(true)

      const toggleSort = () => {
        setAscending(!ascending)
        setSorted([...sorted].sort((a, b) => ascending ? b.localeCompare(a) : a.localeCompare(b)))
      }

      return (
        <div>
          <button data-testid="sort" onClick={toggleSort}>Sort</button>
          <ul data-testid="list">
            {sorted.map((item, i) => (
              <li key={i} data-testid={`item-${i}`}>{item}</li>
            ))}
          </ul>
        </div>
      )
    }

    it('sorts items', () => {
      render(<SortableList items={['c', 'a', 'b']} />)
      fireEvent.click(screen.getByTestId('sort'))
      expect(screen.getByTestId('item-0')).toHaveTextContent('c')
      fireEvent.click(screen.getByTestId('sort'))
      expect(screen.getByTestId('item-0')).toHaveTextContent('a')
    })
  })

  describe('Filterable List', () => {
    function FilterableList({ items }: { items: string[] }) {
      const [filter, setFilter] = useState('')
      const filtered = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()))

      return (
        <div>
          <input data-testid="filter" value={filter} onChange={e => setFilter(e.target.value)} />
          <ul data-testid="list">
            {filtered.map((item, i) => (
              <li key={i} data-testid={`item-${i}`}>{item}</li>
            ))}
          </ul>
        </div>
      )
    }

    it('filters items', () => {
      render(<FilterableList items={['Apple', 'Banana', 'Cherry']} />)
      expect(screen.getByTestId('item-0')).toBeInTheDocument()
      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.getByTestId('item-2')).toBeInTheDocument()

      fireEvent.change(screen.getByTestId('filter'), { target: { value: 'an' } })
      expect(screen.getByTestId('item-0')).toHaveTextContent('Banana')
      expect(screen.queryByTestId('item-1')).not.toBeInTheDocument()
    })
  })
})
