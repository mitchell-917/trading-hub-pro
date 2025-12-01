// ============================================
// TradingHub Pro - Main App Component
// Professional Trading Dashboard Application
// ============================================

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { KeyboardShortcutsProvider } from '@/hooks/useKeyboardShortcuts'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { MarketDataProvider } from '@/context/MarketDataContext'
import {
  DashboardSkeleton,
  PortfolioSkeleton,
  MarketScannerSkeleton,
  SettingsSkeleton,
} from '@/components/ui/Skeletons'
import { QUERY_CONFIG } from '@/lib/config'
import './index.css'

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Portfolio = lazy(() => import('@/pages/Portfolio').then(m => ({ default: m.Portfolio })))
const MarketScanner = lazy(() => import('@/pages/MarketScanner').then(m => ({ default: m.MarketScanner })))
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })))

// Create React Query client with centralized config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_CONFIG.STALE_TIME,
      gcTime: QUERY_CONFIG.CACHE_TIME,
      refetchOnWindowFocus: false,
      retry: QUERY_CONFIG.RETRY_ATTEMPTS,
    },
  },
})

function App() {
  return (
    <ErrorBoundary showDetails>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider autoDetect>
          <MarketDataProvider defaultSource="binance">
            <KeyboardShortcutsProvider>
              <ToastProvider position="top-right">
                <BrowserRouter>
                  <div className="app">
                    <Layout>
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <Suspense fallback={<DashboardSkeleton />}>
                              <Dashboard />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/portfolio"
                          element={
                            <Suspense fallback={<PortfolioSkeleton />}>
                              <Portfolio />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/scanner"
                          element={
                            <Suspense fallback={<MarketScannerSkeleton />}>
                              <MarketScanner />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <Suspense fallback={<SettingsSkeleton />}>
                              <Settings />
                            </Suspense>
                          }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Layout>
                  </div>
                </BrowserRouter>
              </ToastProvider>
            </KeyboardShortcutsProvider>
          </MarketDataProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
