// ============================================
// useKeyboardShortcuts Hook Tests
// ============================================

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useKeyboardShortcuts, KeyboardShortcutsProvider, formatKey, KeyboardShortcutDisplay, defaultShortcuts } from '../useKeyboardShortcuts'
import { BrowserRouter } from 'react-router-dom'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  }
})

// Test component that uses the hook
function TestComponent() {
  const { shortcuts, isHelpOpen, toggleHelp, registerShortcut, unregisterShortcut } = useKeyboardShortcuts()
  
  return (
    <div>
      <p data-testid="shortcuts-count">{shortcuts.length}</p>
      <p data-testid="help-open">{isHelpOpen ? 'open' : 'closed'}</p>
      <button onClick={toggleHelp}>Toggle Help</button>
      <button onClick={() => registerShortcut({
        id: 'test',
        keys: ['t'],
        description: 'Test',
        category: 'general',
        action: () => {}
      })}>Add Shortcut</button>
      <button onClick={() => unregisterShortcut('test')}>Remove Shortcut</button>
    </div>
  )
}

const renderWithProviders = () => {
  return render(
    <BrowserRouter>
      <KeyboardShortcutsProvider>
        <TestComponent />
      </KeyboardShortcutsProvider>
    </BrowserRouter>
  )
}

describe('useKeyboardShortcuts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('provides shortcuts array', () => {
      renderWithProviders()
      
      const count = screen.getByTestId('shortcuts-count')
      expect(parseInt(count.textContent || '0')).toBeGreaterThanOrEqual(0)
    })

    it('initializes with help closed', () => {
      renderWithProviders()
      
      expect(screen.getByTestId('help-open')).toHaveTextContent('closed')
    })

    it('toggles help modal', () => {
      renderWithProviders()
      
      const toggleButton = screen.getByText('Toggle Help')
      fireEvent.click(toggleButton)
      
      expect(screen.getByTestId('help-open')).toHaveTextContent('open')
    })

    it('toggles help back to closed', () => {
      renderWithProviders()
      
      const toggleButton = screen.getByText('Toggle Help')
      fireEvent.click(toggleButton)
      expect(screen.getByTestId('help-open')).toHaveTextContent('open')
      
      fireEvent.click(toggleButton)
      expect(screen.getByTestId('help-open')).toHaveTextContent('closed')
    })

    it('can register a shortcut', () => {
      renderWithProviders()
      
      const initialCount = parseInt(screen.getByTestId('shortcuts-count').textContent || '0')
      const addButton = screen.getByText('Add Shortcut')
      fireEvent.click(addButton)
      
      const newCount = parseInt(screen.getByTestId('shortcuts-count').textContent || '0')
      expect(newCount).toBe(initialCount + 1)
    })

    it('can unregister a shortcut', () => {
      renderWithProviders()
      
      const addButton = screen.getByText('Add Shortcut')
      fireEvent.click(addButton)
      const countAfterAdd = parseInt(screen.getByTestId('shortcuts-count').textContent || '0')
      
      const removeButton = screen.getByText('Remove Shortcut')
      fireEvent.click(removeButton)
      
      const countAfterRemove = parseInt(screen.getByTestId('shortcuts-count').textContent || '0')
      expect(countAfterRemove).toBe(countAfterAdd - 1)
    })
  })
})

describe('KeyboardShortcutsProvider', () => {
  it('wraps children correctly', () => {
    render(
      <BrowserRouter>
        <KeyboardShortcutsProvider>
          <div>Child content</div>
        </KeyboardShortcutsProvider>
      </BrowserRouter>
    )
    
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('provides context to nested components', () => {
    renderWithProviders()
    
    expect(screen.getByTestId('shortcuts-count')).toBeInTheDocument()
  })
})

describe('formatKey', () => {
  it('formats ctrl key', () => {
    expect(formatKey('ctrl')).toBe('⌃')
  })

  it('formats shift key', () => {
    expect(formatKey('shift')).toBe('⇧')
  })

  it('formats alt key', () => {
    expect(formatKey('alt')).toBe('⌥')
  })

  it('formats regular keys to uppercase', () => {
    expect(formatKey('a')).toBe('A')
    expect(formatKey('g')).toBe('G')
  })

  it('formats escape key', () => {
    expect(formatKey('escape')).toBe('Esc')
  })

  it('formats arrow keys', () => {
    expect(formatKey('arrowup')).toBe('↑')
    expect(formatKey('arrowdown')).toBe('↓')
  })
})

describe('KeyboardShortcutDisplay', () => {
  it('renders single key', () => {
    render(<KeyboardShortcutDisplay keys={['a']} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders multiple keys', () => {
    render(<KeyboardShortcutDisplay keys={['ctrl', 'k']} />)
    expect(screen.getByText('⌃')).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders key combinations with proper separator', () => {
    render(<KeyboardShortcutDisplay keys={['g', 'd']} />)
    expect(screen.getByText('G')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
  })
})

describe('defaultShortcuts', () => {
  it('is an array of shortcuts', () => {
    expect(Array.isArray(defaultShortcuts)).toBe(true)
    expect(defaultShortcuts.length).toBeGreaterThan(0)
  })

  it('includes navigation shortcuts', () => {
    const navShortcuts = defaultShortcuts.filter(s => s.category === 'navigation')
    expect(navShortcuts.length).toBeGreaterThan(0)
  })

  it('includes trading shortcuts', () => {
    const tradingShortcuts = defaultShortcuts.filter(s => s.category === 'trading')
    expect(tradingShortcuts.length).toBeGreaterThan(0)
  })

  it('includes general shortcuts', () => {
    const generalShortcuts = defaultShortcuts.filter(s => s.category === 'general')
    expect(generalShortcuts.length).toBeGreaterThan(0)
  })

  it('includes chart shortcuts', () => {
    const chartShortcuts = defaultShortcuts.filter(s => s.category === 'chart')
    expect(chartShortcuts.length).toBeGreaterThan(0)
  })

  it('has valid shortcut structure', () => {
    defaultShortcuts.forEach(shortcut => {
      expect(shortcut).toHaveProperty('id')
      expect(shortcut).toHaveProperty('keys')
      expect(shortcut).toHaveProperty('description')
      expect(shortcut).toHaveProperty('category')
      expect(Array.isArray(shortcut.keys)).toBe(true)
    })
  })
})

describe('Keyboard Event Handling', () => {
  it('ignores keyboard events when typing in input', () => {
    const actionMock = vi.fn()
    
    function TestWithInput() {
      const { registerShortcut } = useKeyboardShortcuts()
      
      React.useEffect(() => {
        registerShortcut({
          id: 'test-input',
          keys: ['t'],
          description: 'Test',
          category: 'general',
          action: actionMock,
        })
      }, [registerShortcut])
      
      return <input data-testid="test-input" />
    }
    
    render(
      <BrowserRouter>
        <KeyboardShortcutsProvider>
          <TestWithInput />
        </KeyboardShortcutsProvider>
      </BrowserRouter>
    )
    
    const input = screen.getByTestId('test-input')
    input.focus()
    fireEvent.keyDown(input, { key: 't' })
    
    expect(actionMock).not.toHaveBeenCalled()
  })

  it('triggers single key shortcuts', () => {
    const actionMock = vi.fn()
    
    function TestSingleKey() {
      const { registerShortcut } = useKeyboardShortcuts()
      
      React.useEffect(() => {
        registerShortcut({
          id: 'single-key',
          keys: ['x'],
          description: 'Single Key Test',
          category: 'general',
          action: actionMock,
        })
      }, [registerShortcut])
      
      return <div data-testid="container">Content</div>
    }
    
    render(
      <BrowserRouter>
        <KeyboardShortcutsProvider>
          <TestSingleKey />
        </KeyboardShortcutsProvider>
      </BrowserRouter>
    )
    
    fireEvent.keyDown(document, { key: 'x' })
    
    expect(actionMock).toHaveBeenCalled()
  })

  it('triggers modifier key shortcuts', () => {
    const actionMock = vi.fn()
    
    function TestModifierKey() {
      const { registerShortcut } = useKeyboardShortcuts()
      
      React.useEffect(() => {
        registerShortcut({
          id: 'ctrl-key',
          keys: ['Ctrl', 'j'],
          description: 'Ctrl+J Test',
          category: 'general',
          action: actionMock,
        })
      }, [registerShortcut])
      
      return <div>Content</div>
    }
    
    render(
      <BrowserRouter>
        <KeyboardShortcutsProvider>
          <TestModifierKey />
        </KeyboardShortcutsProvider>
      </BrowserRouter>
    )
    
    fireEvent.keyDown(document, { key: 'j', ctrlKey: true })
    
    expect(actionMock).toHaveBeenCalled()
  })

  it('triggers key sequence shortcuts', async () => {
    vi.useFakeTimers()
    const actionMock = vi.fn()
    
    function TestSequence() {
      const { registerShortcut } = useKeyboardShortcuts()
      
      React.useEffect(() => {
        registerShortcut({
          id: 'sequence',
          keys: ['g', 'h'],
          description: 'Sequence Test',
          category: 'navigation',
          action: actionMock,
        })
      }, [registerShortcut])
      
      return <div>Content</div>
    }
    
    render(
      <BrowserRouter>
        <KeyboardShortcutsProvider>
          <TestSequence />
        </KeyboardShortcutsProvider>
      </BrowserRouter>
    )
    
    fireEvent.keyDown(document, { key: 'g' })
    fireEvent.keyDown(document, { key: 'h' })
    
    expect(actionMock).toHaveBeenCalled()
    
    vi.useRealTimers()
  })

  it('does not trigger disabled shortcuts', () => {
    const actionMock = vi.fn()
    
    function TestDisabled() {
      const { registerShortcut } = useKeyboardShortcuts()
      
      React.useEffect(() => {
        registerShortcut({
          id: 'disabled',
          keys: ['y'],
          description: 'Disabled Test',
          category: 'general',
          action: actionMock,
          enabled: false,
        })
      }, [registerShortcut])
      
      return <div>Content</div>
    }
    
    render(
      <BrowserRouter>
        <KeyboardShortcutsProvider>
          <TestDisabled />
        </KeyboardShortcutsProvider>
      </BrowserRouter>
    )
    
    fireEvent.keyDown(document, { key: 'y' })
    
    expect(actionMock).not.toHaveBeenCalled()
  })

  it('updates existing shortcuts when re-registered', () => {
    renderWithProviders()
    
    const addButton = screen.getByText('Add Shortcut')
    
    // Register same shortcut twice
    fireEvent.click(addButton)
    const countAfterFirst = parseInt(screen.getByTestId('shortcuts-count').textContent || '0')
    
    fireEvent.click(addButton)
    const countAfterSecond = parseInt(screen.getByTestId('shortcuts-count').textContent || '0')
    
    // Count should be same since it's an update
    expect(countAfterSecond).toBe(countAfterFirst)
  })

  it('ignores keyboard events in textarea', () => {
    const actionMock = vi.fn()
    
    function TestWithTextarea() {
      const { registerShortcut } = useKeyboardShortcuts()
      
      React.useEffect(() => {
        registerShortcut({
          id: 'test-textarea',
          keys: ['t'],
          description: 'Test',
          category: 'general',
          action: actionMock,
        })
      }, [registerShortcut])
      
      return <textarea data-testid="test-textarea" />
    }
    
    render(
      <BrowserRouter>
        <KeyboardShortcutsProvider>
          <TestWithTextarea />
        </KeyboardShortcutsProvider>
      </BrowserRouter>
    )
    
    const textarea = screen.getByTestId('test-textarea')
    textarea.focus()
    fireEvent.keyDown(textarea, { key: 't' })
    
    expect(actionMock).not.toHaveBeenCalled()
  })
})

describe('formatKey edge cases', () => {
  it('formats cmd key', () => {
    expect(formatKey('cmd')).toBe('⌘')
  })

  it('formats enter key', () => {
    expect(formatKey('enter')).toBe('↵')
  })

  it('formats left arrow key', () => {
    expect(formatKey('arrowleft')).toBe('←')
  })

  it('formats right arrow key', () => {
    expect(formatKey('arrowright')).toBe('→')
  })

  it('handles uppercase input', () => {
    expect(formatKey('CTRL')).toBe('⌃')
    expect(formatKey('SHIFT')).toBe('⇧')
  })
})

describe('useKeyboardShortcuts error handling', () => {
  it('throws error when used outside provider', () => {
    function InvalidComponent() {
      useKeyboardShortcuts()
      return <div>Invalid</div>
    }
    
    expect(() => {
      render(<InvalidComponent />)
    }).toThrow('useKeyboardShortcuts must be used within KeyboardShortcutsProvider')
  })
})
