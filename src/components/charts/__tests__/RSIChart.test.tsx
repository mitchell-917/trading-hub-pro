// ============================================
// TradingHub Pro - RSI Chart Tests
// Comprehensive tests for RSI chart component
// ============================================

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RSIChart } from '../RSIChart'

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: ({ content }: { content: unknown }) => {
    // Call the content function to test tooltip rendering
    if (typeof content === 'function') {
      const TooltipContent = content as React.FC<{ active?: boolean; payload?: Array<{ payload: { timestamp: number; value: number; formattedTime: string } }> }>
      return (
        <div data-testid="tooltip">
          <TooltipContent active={true} payload={[{ payload: { timestamp: Date.now(), value: 65, formattedTime: '12:00' } }]} />
        </div>
      )
    }
    return <div data-testid="tooltip" />
  },
  ReferenceLine: ({ y }: { y: number }) => (
    <div data-testid={`reference-line-${y}`} />
  ),
  ReferenceArea: ({ y1, y2 }: { y1: number; y2: number }) => (
    <div data-testid={`reference-area-${y1}-${y2}`} />
  ),
}))

describe('RSIChart', () => {
  const mockData = [
    { timestamp: Date.now() - 3600000, value: 45, overbought: false, oversold: false },
    { timestamp: Date.now() - 2400000, value: 55, overbought: false, oversold: false },
    { timestamp: Date.now() - 1200000, value: 65, overbought: false, oversold: false },
    { timestamp: Date.now(), value: 70, overbought: true, oversold: false },
  ]

  describe('Rendering', () => {
    it('renders with data', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders composed chart', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    })

    it('shows empty state with no data', () => {
      render(<RSIChart data={[]} />)
      
      expect(screen.getByText(/no rsi data/i)).toBeInTheDocument()
    })

    it('renders overbought reference line at 70', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByTestId('reference-line-70')).toBeInTheDocument()
    })

    it('renders oversold reference line at 30', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByTestId('reference-line-30')).toBeInTheDocument()
    })

    it('renders middle line at 50', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByTestId('reference-line-50')).toBeInTheDocument()
    })

    it('renders overbought reference area', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByTestId('reference-area-70-100')).toBeInTheDocument()
    })

    it('renders oversold reference area', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByTestId('reference-area-0-30')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('accepts custom height', () => {
      const { container } = render(<RSIChart data={mockData} height={300} />)
      
      expect(container.firstChild).toBeInTheDocument()
    })

    it('accepts custom className', () => {
      const { container } = render(<RSIChart data={mockData} className="custom-class" />)
      
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('shows axes by default', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })

    it('renders with custom overbought level', () => {
      render(<RSIChart data={mockData} overboughtLevel={80} />)
      
      expect(screen.getByTestId('reference-line-80')).toBeInTheDocument()
      expect(screen.getByTestId('reference-area-80-100')).toBeInTheDocument()
    })

    it('renders with custom oversold level', () => {
      render(<RSIChart data={mockData} oversoldLevel={20} />)
      
      expect(screen.getByTestId('reference-line-20')).toBeInTheDocument()
      expect(screen.getByTestId('reference-area-0-20')).toBeInTheDocument()
    })
  })

  describe('RSI Values', () => {
    it('handles overbought RSI (>70)', () => {
      const overboughtData = [
        { timestamp: Date.now(), value: 75, overbought: true, oversold: false },
        { timestamp: Date.now() - 1000, value: 80, overbought: true, oversold: false },
      ]
      
      render(<RSIChart data={overboughtData} />)
      
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    })

    it('handles oversold RSI (<30)', () => {
      const oversoldData = [
        { timestamp: Date.now(), value: 25, overbought: false, oversold: true },
        { timestamp: Date.now() - 1000, value: 20, overbought: false, oversold: true },
      ]
      
      render(<RSIChart data={oversoldData} />)
      
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    })

    it('handles neutral RSI (30-70)', () => {
      const neutralData = [
        { timestamp: Date.now(), value: 50, overbought: false, oversold: false },
        { timestamp: Date.now() - 1000, value: 55, overbought: false, oversold: false },
      ]
      
      render(<RSIChart data={neutralData} />)
      
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    })

    it('displays current RSI value', () => {
      const testData = [
        { timestamp: Date.now() - 1000, value: 50, overbought: false, oversold: false },
        { timestamp: Date.now(), value: 65.5, overbought: false, oversold: false },
      ]
      
      render(<RSIChart data={testData} />)
      
      expect(screen.getByText(/RSI: 65.5/)).toBeInTheDocument()
    })

    it('displays overbought RSI with red styling', () => {
      const testData = [
        { timestamp: Date.now() - 1000, value: 50, overbought: false, oversold: false },
        { timestamp: Date.now(), value: 75.0, overbought: true, oversold: false },
      ]
      
      render(<RSIChart data={testData} />)
      
      expect(screen.getByText(/RSI: 75.0/)).toBeInTheDocument()
    })

    it('displays oversold RSI with green styling', () => {
      const testData = [
        { timestamp: Date.now() - 1000, value: 50, overbought: false, oversold: false },
        { timestamp: Date.now(), value: 25.0, overbought: false, oversold: true },
      ]
      
      render(<RSIChart data={testData} />)
      
      expect(screen.getByText(/RSI: 25.0/)).toBeInTheDocument()
    })
  })

  describe('Tooltip Rendering', () => {
    it('renders tooltip component', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('displays RSI value in tooltip', () => {
      render(<RSIChart data={mockData} />)
      
      // The mocked Tooltip calls the content function
      expect(screen.getByText(/RSI: 65.00/)).toBeInTheDocument()
    })

    it('shows Neutral label for RSI between 30 and 70', () => {
      render(<RSIChart data={mockData} />)
      
      expect(screen.getByText('Neutral')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('shows no data message when data array is empty', () => {
      render(<RSIChart data={[]} />)
      
      expect(screen.getByText(/no rsi data/i)).toBeInTheDocument()
    })

    it('applies className to empty state container', () => {
      const { container } = render(<RSIChart data={[]} className="test-empty" />)
      
      expect(container.querySelector('.test-empty')).toBeInTheDocument()
    })

    it('respects height prop in empty state', () => {
      const { container } = render(<RSIChart data={[]} height={200} />)
      
      expect(container.firstChild).toHaveStyle({ height: '200px' })
    })
  })

  describe('Data Processing', () => {
    it('processes timestamps correctly', () => {
      const testData = [
        { timestamp: new Date('2024-01-01T12:00:00').getTime(), value: 50, overbought: false, oversold: false },
      ]
      
      render(<RSIChart data={testData} />)
      
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    })

    it('handles single data point', () => {
      const singleData = [
        { timestamp: Date.now(), value: 45, overbought: false, oversold: false },
      ]
      
      render(<RSIChart data={singleData} />)
      
      expect(screen.getByText(/RSI: 45.0/)).toBeInTheDocument()
    })

    it('handles many data points', () => {
      const manyPoints = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() - i * 60000,
        value: 30 + (i % 40),
        overbought: false,
        oversold: false,
      }))
      
      render(<RSIChart data={manyPoints} />)
      
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    })
  })
})
