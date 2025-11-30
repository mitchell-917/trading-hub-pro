// ============================================
// TradingHub Pro - Main App Component
// Professional Trading Dashboard Application
// ============================================

import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout'
import { Dashboard } from '@/pages/Dashboard'
import { useTradingStore } from '@/lib/store'
import './index.css'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const addPosition = useTradingStore((s) => s.addPosition)
  const addOrder = useTradingStore((s) => s.addOrder)

  // Initialize with some mock data for demo
  useEffect(() => {
    // Add some initial positions
    const positions = [
      {
        id: 'pos-1',
        symbol: 'BTCUSD',
        side: 'long' as const,
        quantity: 0.5,
        entryPrice: 48500,
        currentPrice: 51234,
        unrealizedPnL: 1367,
        unrealizedPnLPercent: 5.64,
        leverage: 2,
        margin: 12125,
        liquidationPrice: 38800,
        stopLoss: 46000,
        takeProfit: 55000,
        openedAt: Date.now() - 1000 * 60 * 60 * 24,
      },
      {
        id: 'pos-2',
        symbol: 'ETHUSD',
        side: 'long' as const,
        quantity: 2.5,
        entryPrice: 3200,
        currentPrice: 3145,
        unrealizedPnL: -137.5,
        unrealizedPnLPercent: -1.72,
        leverage: 1,
        margin: 8000,
        liquidationPrice: 2560,
        openedAt: Date.now() - 1000 * 60 * 60 * 12,
      },
    ]

    positions.forEach((pos) => addPosition(pos))

    // Add some historical orders
    const orders = [
      {
        id: 'ord-1',
        symbol: 'BTCUSD',
        side: 'buy' as const,
        type: 'limit' as const,
        quantity: 0.5,
        price: 48500,
        status: 'filled' as const,
        filledPrice: 48500,
        filledQuantity: 0.5,
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24,
      },
      {
        id: 'ord-2',
        symbol: 'ETHUSD',
        side: 'buy' as const,
        type: 'market' as const,
        quantity: 2.5,
        price: 3200,
        status: 'filled' as const,
        filledPrice: 3200,
        filledQuantity: 2.5,
        createdAt: Date.now() - 1000 * 60 * 60 * 12,
        updatedAt: Date.now() - 1000 * 60 * 60 * 12,
      },
      {
        id: 'ord-3',
        symbol: 'SOLUSD',
        side: 'sell' as const,
        type: 'limit' as const,
        quantity: 10,
        price: 145,
        status: 'cancelled' as const,
        createdAt: Date.now() - 1000 * 60 * 60 * 6,
        updatedAt: Date.now() - 1000 * 60 * 60 * 5,
      },
      {
        id: 'ord-4',
        symbol: 'BTCUSD',
        side: 'buy' as const,
        type: 'stop-limit' as const,
        quantity: 0.25,
        price: 49000,
        stopPrice: 48500,
        status: 'pending' as const,
        createdAt: Date.now() - 1000 * 60 * 30,
        updatedAt: Date.now() - 1000 * 60 * 30,
      },
    ]

    orders.forEach((order) => addOrder(order))
  }, [addPosition, addOrder])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Layout>
          <Dashboard />
        </Layout>
      </div>
    </QueryClientProvider>
  )
}

export default App
