import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

interface AllProvidersProps {
  children: React.ReactNode
}

function AllProviders({ children }: AllProvidersProps) {
  const testQueryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library
export { screen, fireEvent, waitFor, within, act } from '@testing-library/react'
export { customRender as render }
