// ============================================
// Portfolio Page Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { BrowserRouter } from 'react-router-dom'
import { Portfolio } from '../Portfolio'

// Mock the store
const mockPositions = [
  {
    id: '1',
    symbol: 'BTC/USD',
    side: 'long' as const,
    quantity: 1.5,
    entryPrice: 45000,
    currentPrice: 48000,
    unrealizedPnL: 4500,
    unrealizedPnLPercent: 6.67,
    leverage: 1,
    stopLoss: undefined,
    takeProfit: undefined,
  },
  {
    id: '2',
    symbol: 'ETH/USD',
    side: 'long' as const,
    quantity: 10,
    entryPrice: 2500,
    currentPrice: 2600,
    unrealizedPnL: 1000,
    unrealizedPnLPercent: 4,
    leverage: 1,
    stopLoss: undefined,
    takeProfit: undefined,
  },
]

const mockGetPortfolioValue = () => ({
  totalValue: 100000,
  dailyPnL: 5500,
  dailyPnLPercent: 5.5,
  unrealizedPnL: 5500,
  positionsCount: 2,
  buyingPower: 50000,
})

vi.mock('@/lib/store', () => ({
  useTradingStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      positions: mockPositions,
      closePosition: vi.fn(),
      getPortfolioValue: mockGetPortfolioValue,
    }
    if (selector) {
      return selector(state)
    }
    return state
  },
}))

// Mock recharts
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
}))

const renderPortfolio = () => {
  return render(
    <BrowserRouter>
      <Portfolio />
    </BrowserRouter>
  )
}

describe('Portfolio Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders page title', () => {
      renderPortfolio()
      expect(screen.getByText('Portfolio Analytics')).toBeInTheDocument()
    })

    it('renders portfolio overview section', () => {
      renderPortfolio()
      // Use getAllByText since there might be multiple "Total" text elements
      const totalValueElements = screen.getAllByText(/Total Portfolio Value/i)
      expect(totalValueElements.length).toBeGreaterThan(0)
    })

    it('renders position symbols', () => {
      renderPortfolio()
      expect(screen.getByText('BTC/USD')).toBeInTheDocument()
      expect(screen.getByText('ETH/USD')).toBeInTheDocument()
    })

    it('renders chart components', () => {
      renderPortfolio()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
  })

  describe('Metric Cards', () => {
    it('renders unrealized P&L card', () => {
      renderPortfolio()
      expect(screen.getByText('Unrealized P&L')).toBeInTheDocument()
    })

    it('renders buying power card', () => {
      renderPortfolio()
      expect(screen.getByText('Buying Power')).toBeInTheDocument()
    })

    it('renders win rate card', () => {
      renderPortfolio()
      expect(screen.getByText('Win Rate')).toBeInTheDocument()
    })
  })

  describe('Charts and Analytics', () => {
    it('renders asset allocation section', () => {
      renderPortfolio()
      expect(screen.getByText('Asset Allocation')).toBeInTheDocument()
    })

    it('renders risk profile section', () => {
      renderPortfolio()
      expect(screen.getByText('Risk Profile')).toBeInTheDocument()
    })

    it('renders risk metrics section', () => {
      renderPortfolio()
      expect(screen.getByText('Risk Metrics')).toBeInTheDocument()
    })

    it('renders monthly returns section', () => {
      renderPortfolio()
      expect(screen.getByText('Monthly Returns')).toBeInTheDocument()
    })
  })

  describe('Risk Metrics', () => {
    it('displays sharpe ratio', () => {
      renderPortfolio()
      expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument()
    })

    it('displays max drawdown', () => {
      renderPortfolio()
      expect(screen.getByText('Max Drawdown')).toBeInTheDocument()
    })

    it('displays volatility', () => {
      renderPortfolio()
      expect(screen.getByText('Volatility')).toBeInTheDocument()
    })
  })
})

describe('Portfolio Page Accessibility', () => {
  it('has accessible buttons', () => {
    renderPortfolio()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
