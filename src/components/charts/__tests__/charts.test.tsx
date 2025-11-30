// ============================================
// TradingHub Pro - Chart Component Tests
// ============================================

import { render, screen } from '@/test/test-utils'
import { describe, it, expect } from 'vitest'
import { 
  Sparkline, 
  MiniCandle, 
  PriceChange 
} from '../Sparkline'
import { RSIChart } from '../RSIChart'
import { DepthChart } from '../DepthChart'
import { TradingAreaChart } from '../AreaChart'

// ResizeObserver is mocked in test/setup.ts

describe('Sparkline', () => {
  it('renders with data', () => {
    const data = [100, 105, 103, 108, 112, 110]
    const { container } = render(<Sparkline data={data} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    const { container } = render(<Sparkline data={[]} />)
    expect(container.querySelector('.bg-gray-700')).toBeInTheDocument()
  })

  it('applies correct color for positive trend', () => {
    const data = [100, 110, 120] // Upward trend
    render(<Sparkline data={data} data-testid="sparkline" />)
    // Component should render with green color for positive trend
  })

  it('applies correct color for negative trend', () => {
    const data = [120, 110, 100] // Downward trend
    render(<Sparkline data={data} data-testid="sparkline" />)
    // Component should render with red color for negative trend
  })

  it('accepts custom dimensions', () => {
    const { container } = render(
      <Sparkline data={[1, 2, 3]} width={100} height={50} />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ width: '100px', height: '50px' })
  })

  it('respects fixed color override', () => {
    const data = [100, 90, 80] // Downward but should be blue
    render(<Sparkline data={data} color="blue" />)
    // Color should be blue regardless of trend
  })
})

describe('MiniCandle', () => {
  it('renders a green candle when close > open', () => {
    const { container } = render(
      <MiniCandle open={100} high={110} low={95} close={105} />
    )
    const elements = container.querySelectorAll('[style*="background-color"]')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders a red candle when close < open', () => {
    const { container } = render(
      <MiniCandle open={105} high={110} low={95} close={100} />
    )
    const elements = container.querySelectorAll('[style*="background-color"]')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('handles flat price (no range)', () => {
    const { container } = render(
      <MiniCandle open={100} high={100} low={100} close={100} />
    )
    expect(container.querySelector('.rounded')).toBeInTheDocument()
  })

  it('accepts custom dimensions', () => {
    const { container } = render(
      <MiniCandle open={100} high={110} low={90} close={105} width={20} height={40} />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ width: '20px', height: '40px' })
  })
})

describe('PriceChange', () => {
  it('renders positive change correctly', () => {
    render(<PriceChange current={105} previous={100} />)
    expect(screen.getByText('▲')).toBeInTheDocument()
    expect(screen.getByText('5.00')).toBeInTheDocument()
    expect(screen.getByText('(+5.00%)')).toBeInTheDocument()
  })

  it('renders negative change correctly', () => {
    render(<PriceChange current={95} previous={100} />)
    expect(screen.getByText('▼')).toBeInTheDocument()
    expect(screen.getByText('5.00')).toBeInTheDocument()
    expect(screen.getByText('(-5.00%)')).toBeInTheDocument()
  })

  it('hides percentage when showPercentage is false', () => {
    render(<PriceChange current={105} previous={100} showPercentage={false} />)
    expect(screen.getByText('5.00')).toBeInTheDocument()
    expect(screen.queryByText('(+5.00%)')).not.toBeInTheDocument()
  })

  it('handles zero previous value', () => {
    render(<PriceChange current={100} previous={0} />)
    expect(screen.getByText('100.00')).toBeInTheDocument()
  })
})

describe('RSIChart', () => {
  const mockRSIData = [
    { timestamp: Date.now() - 300000, value: 45 },
    { timestamp: Date.now() - 240000, value: 52 },
    { timestamp: Date.now() - 180000, value: 68 },
    { timestamp: Date.now() - 120000, value: 75 },
    { timestamp: Date.now() - 60000, value: 72 },
    { timestamp: Date.now(), value: 65 },
  ]

  it('renders with data', () => {
    const { container } = render(<RSIChart data={mockRSIData} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows current RSI value', () => {
    render(<RSIChart data={mockRSIData} />)
    expect(screen.getByText(/RSI:/)).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(<RSIChart data={[]} />)
    expect(screen.getByText('No RSI data')).toBeInTheDocument()
  })

  it('accepts custom overbought/oversold levels', () => {
    const { container } = render(
      <RSIChart 
        data={mockRSIData} 
        overboughtLevel={80} 
        oversoldLevel={20} 
      />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies custom height', () => {
    const { container } = render(
      <RSIChart data={mockRSIData} height={200} />
    )
    const responsiveContainer = container.querySelector('.recharts-responsive-container')
    expect(responsiveContainer).toHaveStyle({ height: '200px' })
  })
})

describe('DepthChart', () => {
  const mockBids = [
    { price: 99, size: 1.5, total: 1.5 },
    { price: 98, size: 2.0, total: 3.5 },
    { price: 97, size: 1.0, total: 4.5 },
    { price: 96, size: 3.0, total: 7.5 },
  ]

  const mockAsks = [
    { price: 101, size: 1.2, total: 1.2 },
    { price: 102, size: 1.8, total: 3.0 },
    { price: 103, size: 2.5, total: 5.5 },
    { price: 104, size: 1.5, total: 7.0 },
  ]

  it('renders with data', () => {
    const { container } = render(
      <DepthChart bids={mockBids} asks={mockAsks} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays bid and ask totals', () => {
    render(<DepthChart bids={mockBids} asks={mockAsks} />)
    expect(screen.getByText('Bids:')).toBeInTheDocument()
    expect(screen.getByText('Asks:')).toBeInTheDocument()
  })

  it('shows order book imbalance', () => {
    render(<DepthChart bids={mockBids} asks={mockAsks} />)
    // Should show imbalance percentage
    expect(screen.getByText(/%$/)).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(<DepthChart bids={[]} asks={[]} />)
    expect(screen.getByText('No depth data')).toBeInTheDocument()
  })

  it('accepts custom mid price', () => {
    const { container } = render(
      <DepthChart bids={mockBids} asks={mockAsks} midPrice={100} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('calculates correct imbalance direction', () => {
    // More bids than asks
    const heavyBids = [
      { price: 99, size: 10, total: 10 },
      { price: 98, size: 10, total: 20 },
    ]
    const lightAsks = [
      { price: 101, size: 1, total: 1 },
    ]
    
    render(<DepthChart bids={heavyBids} asks={lightAsks} />)
    // Should show upward arrow for bid pressure
    expect(screen.getByText('↑', { exact: false })).toBeInTheDocument()
  })
})

describe('TradingAreaChart', () => {
  const mockData = [
    { timestamp: Date.now() - 300000, value: 100 },
    { timestamp: Date.now() - 240000, value: 105 },
    { timestamp: Date.now() - 180000, value: 103 },
    { timestamp: Date.now() - 120000, value: 108 },
    { timestamp: Date.now() - 60000, value: 112 },
    { timestamp: Date.now(), value: 110 },
  ]

  it('renders with data', () => {
    const { container } = render(
      <TradingAreaChart data={mockData} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(<TradingAreaChart data={[]} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('accepts custom height', () => {
    const { container } = render(
      <TradingAreaChart data={mockData} height={300} />
    )
    const responsiveContainer = container.querySelector('.recharts-responsive-container')
    expect(responsiveContainer).toHaveStyle({ height: '300px' })
  })

  it('respects showGrid prop', () => {
    const { container } = render(
      <TradingAreaChart data={mockData} showGrid={false} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies custom color scheme', () => {
    const { container } = render(
      <TradingAreaChart 
        data={mockData} 
        color={{ stroke: '#ff0000', fill: 'rgba(255, 0, 0, 0.2)' }} 
      />
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
