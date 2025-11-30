// ============================================
// TradingHub Pro - Keyboard Shortcuts Hook
// Power user keyboard shortcuts system
// ============================================

import { useEffect, useCallback, useState, createContext, useContext, type ReactNode } from 'react'

export interface KeyboardShortcut {
  id: string
  keys: string[]
  description: string
  category: 'navigation' | 'trading' | 'general' | 'chart'
  action: () => void
  enabled?: boolean
}

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[]
  registerShortcut: (shortcut: KeyboardShortcut) => void
  unregisterShortcut: (id: string) => void
  isHelpOpen: boolean
  toggleHelp: () => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined)

// Default shortcuts configuration
const defaultShortcuts: Omit<KeyboardShortcut, 'action'>[] = [
  // Navigation
  { id: 'nav-dashboard', keys: ['g', 'd'], description: 'Go to Dashboard', category: 'navigation' },
  { id: 'nav-portfolio', keys: ['g', 'p'], description: 'Go to Portfolio', category: 'navigation' },
  { id: 'nav-scanner', keys: ['g', 's'], description: 'Go to Scanner', category: 'navigation' },
  { id: 'nav-settings', keys: ['g', ','], description: 'Go to Settings', category: 'navigation' },
  
  // Trading
  { id: 'trade-buy', keys: ['b'], description: 'Quick Buy', category: 'trading' },
  { id: 'trade-sell', keys: ['s'], description: 'Quick Sell', category: 'trading' },
  { id: 'trade-close-all', keys: ['Shift', 'c'], description: 'Close All Positions', category: 'trading' },
  { id: 'trade-cancel-orders', keys: ['Shift', 'x'], description: 'Cancel All Orders', category: 'trading' },
  
  // Chart
  { id: 'chart-zoom-in', keys: ['+'], description: 'Zoom In', category: 'chart' },
  { id: 'chart-zoom-out', keys: ['-'], description: 'Zoom Out', category: 'chart' },
  { id: 'chart-reset', keys: ['r'], description: 'Reset Chart', category: 'chart' },
  { id: 'chart-crosshair', keys: ['c'], description: 'Toggle Crosshair', category: 'chart' },
  
  // General
  { id: 'general-help', keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'general' },
  { id: 'general-search', keys: ['Ctrl', 'k'], description: 'Quick Search', category: 'general' },
  { id: 'general-notifications', keys: ['n'], description: 'Toggle Notifications', category: 'general' },
  { id: 'general-fullscreen', keys: ['f'], description: 'Toggle Fullscreen', category: 'general' },
]

interface KeyboardShortcutsProviderProps {
  children: ReactNode
}

function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([])
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [keySequence, setKeySequence] = useState<string[]>([])

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      const existing = prev.find(s => s.id === shortcut.id)
      if (existing) {
        return prev.map(s => s.id === shortcut.id ? shortcut : s)
      }
      return [...prev, shortcut]
    })
  }, [])

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id))
  }, [])

  const toggleHelp = useCallback(() => {
    setIsHelpOpen(prev => !prev)
  }, [])

  // Handle keyboard events
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return
      }

      // Build key identifier
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key

      // Clear previous sequence after timeout
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setKeySequence([]), 1000)

      // Add key to sequence
      const newSequence = [...keySequence, key]
      setKeySequence(newSequence)

      // Check for matching shortcuts
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue

        const requiredKeys = shortcut.keys.map(k => k.toLowerCase())
        
        // Check for modifier + key combinations
        if (requiredKeys.includes('ctrl') || requiredKeys.includes('shift') || requiredKeys.includes('alt')) {
          const modifiersMatch = 
            requiredKeys.includes('ctrl') === event.ctrlKey &&
            requiredKeys.includes('shift') === event.shiftKey &&
            requiredKeys.includes('alt') === event.altKey
          
          const nonModifierKeys = requiredKeys.filter(k => !['ctrl', 'shift', 'alt'].includes(k))
          if (modifiersMatch && nonModifierKeys.includes(key)) {
            event.preventDefault()
            shortcut.action()
            setKeySequence([])
            return
          }
        }
        // Check for key sequences (g then d, etc.)
        else if (requiredKeys.length > 1) {
          if (newSequence.length >= requiredKeys.length) {
            const matches = requiredKeys.every(
              (k, i) => newSequence[newSequence.length - requiredKeys.length + i] === k
            )
            if (matches) {
              event.preventDefault()
              shortcut.action()
              setKeySequence([])
              return
            }
          }
        }
        // Check for single key
        else if (requiredKeys.length === 1 && requiredKeys[0] === key) {
          event.preventDefault()
          shortcut.action()
          setKeySequence([])
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timeoutId)
    }
  }, [shortcuts, keySequence])

  return (
    <KeyboardShortcutsContext.Provider value={{
      shortcuts,
      registerShortcut,
      unregisterShortcut,
      isHelpOpen,
      toggleHelp,
    }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}

function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext)
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider')
  }
  return context
}

// Hook for registering shortcuts with auto-cleanup
function useShortcut(
  id: string,
  keys: string[],
  action: () => void,
  options?: {
    description?: string
    category?: KeyboardShortcut['category']
    enabled?: boolean
  }
) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts()

  useEffect(() => {
    registerShortcut({
      id,
      keys,
      action,
      description: options?.description ?? id,
      category: options?.category ?? 'general',
      enabled: options?.enabled ?? true,
    })

    return () => unregisterShortcut(id)
  }, [id, keys, action, options?.description, options?.category, options?.enabled, registerShortcut, unregisterShortcut])
}

// Key display helper
function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    ctrl: '⌃',
    alt: '⌥',
    shift: '⇧',
    cmd: '⌘',
    enter: '↵',
    escape: 'Esc',
    arrowup: '↑',
    arrowdown: '↓',
    arrowleft: '←',
    arrowright: '→',
  }
  return keyMap[key.toLowerCase()] ?? key.toUpperCase()
}

function KeyboardShortcutDisplay({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <span key={index}>
          <kbd className="px-2 py-1 text-xs font-mono bg-gray-800 border border-gray-700 rounded">
            {formatKey(key)}
          </kbd>
          {index < keys.length - 1 && (
            <span className="mx-1 text-gray-500">+</span>
          )}
        </span>
      ))}
    </div>
  )
}

export { 
  KeyboardShortcutsProvider, 
  useKeyboardShortcuts, 
  useShortcut, 
  formatKey, 
  KeyboardShortcutDisplay, 
  defaultShortcuts 
}
