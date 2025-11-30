// ============================================
// TradingHub Pro - Main App Component
// Professional Trading Dashboard Application
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout'
import { Dashboard } from '@/pages/Dashboard'
import { Portfolio } from '@/pages/Portfolio'
import { MarketScanner } from '@/pages/MarketScanner'
import { Settings } from '@/pages/Settings'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { KeyboardShortcutsProvider } from '@/hooks/useKeyboardShortcuts'
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
  return (
    <ErrorBoundary showDetails>
      <QueryClientProvider client={queryClient}>
        <KeyboardShortcutsProvider>
          <ToastProvider position="top-right">
            <BrowserRouter>
              <div className="app">
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/scanner" element={<MarketScanner />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </div>
            </BrowserRouter>
          </ToastProvider>
        </KeyboardShortcutsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
