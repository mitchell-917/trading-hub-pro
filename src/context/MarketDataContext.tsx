// ============================================
// TradingHub Pro - Market Data Context
// Provides market data throughout the app
// ============================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

type DataSource = 'mock' | 'binance' | 'coingecko'

interface MarketDataContextValue {
  dataSource: DataSource
  setDataSource: (source: DataSource) => void
  isLiveData: boolean
  availableSources: Array<{ id: DataSource; name: string; description: string }>
}

const MarketDataContext = createContext<MarketDataContextValue | null>(null)

const DATA_SOURCES: Array<{ id: DataSource; name: string; description: string }> = [
  { id: 'binance', name: 'Binance', description: 'Real-time crypto data from Binance' },
  { id: 'coingecko', name: 'CoinGecko', description: 'Comprehensive crypto market data' },
  { id: 'mock', name: 'Demo Mode', description: 'Simulated data for testing' },
]

interface MarketDataProviderProps {
  children: ReactNode
  defaultSource?: DataSource
}

export function MarketDataProvider({
  children,
  defaultSource = 'binance',
}: MarketDataProviderProps) {
  const [dataSource, setDataSourceState] = useState<DataSource>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('market-data-source') as DataSource) || defaultSource
    }
    return defaultSource
  })

  const setDataSource = useCallback((source: DataSource) => {
    setDataSourceState(source)
    if (typeof window !== 'undefined') {
      localStorage.setItem('market-data-source', source)
    }
  }, [])

  const value: MarketDataContextValue = {
    dataSource,
    setDataSource,
    isLiveData: dataSource !== 'mock',
    availableSources: DATA_SOURCES,
  }

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  )
}

export function useMarketDataSource(): MarketDataContextValue {
  const context = useContext(MarketDataContext)
  if (!context) {
    throw new Error('useMarketDataSource must be used within a MarketDataProvider')
  }
  return context
}
