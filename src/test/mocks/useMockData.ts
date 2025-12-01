// ============================================
// TradingHub Pro - useMockData Hook
// Hook to access mock data settings
// ============================================

import { useContext } from 'react'
import { MockDataContext, type MockDataContextValue } from './MockDataContext'
import { DEFAULT_FLAGS } from './utils'

/**
 * Hook to access mock data settings
 * 
 * @example
 * ```tsx
 * function MarketData() {
 *   const { isMockEnabled, simulateDelay } = useMockData()
 *   
 *   useEffect(() => {
 *     async function fetchData() {
 *       await simulateDelay()
 *       if (isMockEnabled('useMockMarketData')) {
 *         // Use mock generator
 *       } else {
 *         // Fetch from API
 *       }
 *     }
 *     fetchData()
 *   }, [])
 * }
 * ```
 */
export function useMockData(): MockDataContextValue {
  const context = useContext(MockDataContext)
  
  if (!context) {
    // Return default implementation if not in provider
    // This allows hooks to work outside provider for backward compatibility
    return {
      flags: DEFAULT_FLAGS,
      isMockEnabled: () => true,
      setFlag: () => {},
      enableAllMocks: () => {},
      disableAllMocks: () => {},
      simulateDelay: () => Promise.resolve(),
      resetFlags: () => {},
    }
  }
  
  return context
}
