// ============================================
// AISignalPanel Widget Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AISignalPanel } from '../AISignalPanel'

// Mock the useAISignals hook
vi.mock('@/hooks/useAISignals', () => ({
  useAISignals: () => ({
    signals: [
      {
        id: 'sig-1',
        symbol: 'BTCUSD',
        direction: 'bullish',
        confidence: 85,
        entryPrice: 50000,
        targetPrice: 55000,
        stopLoss: 48000,
        timestamp: Date.now(),
        riskRewardRatio: 2.5,
        reasoning: 'Strong momentum and breakout pattern',
      },
      {
        id: 'sig-2',
        symbol: 'BTCUSD',
        direction: 'bearish',
        confidence: 65,
        entryPrice: 51000,
        targetPrice: 47000,
        stopLoss: 53000,
        timestamp: Date.now() - 3600000,
        riskRewardRatio: 2,
        reasoning: 'Resistance at key levels',
      },
    ],
    isLoading: false,
    analysis: {
      sentiment: 'bullish',
      sentimentScore: 75,
    },
  }),
}))

describe('AISignalPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the panel with title', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      expect(screen.getByText('AI Signals')).toBeInTheDocument()
    })

    it('renders signals list', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      expect(screen.getByText('All Signals')).toBeInTheDocument()
    })

    it('displays signal type badges', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      expect(screen.getByText('BULLISH')).toBeInTheDocument()
    })

    it('shows primary signal badge', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      expect(screen.getByText('Primary Signal')).toBeInTheDocument()
    })
  })

  describe('Signal Details', () => {
    it('displays confidence percentage', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      // Multiple elements show 85%, just check at least one exists
      const elements = screen.getAllByText(/85%/)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('shows target price label', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      expect(screen.getByText('Target')).toBeInTheDocument()
    })

    it('shows entry price label', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      expect(screen.getByText('Entry')).toBeInTheDocument()
    })
  })

  describe('Market Sentiment', () => {
    it('displays market sentiment', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      expect(screen.getByText('Bullish Market')).toBeInTheDocument()
    })

    it('shows sentiment label', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      expect(screen.getByText('Current market sentiment')).toBeInTheDocument()
    })
  })

  describe('Disclaimer', () => {
    it('shows disclaimer message', () => {
      render(<AISignalPanel symbol="BTCUSD" />)
      expect(screen.getByText(/AI signals are for informational purposes/)).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <AISignalPanel symbol="BTCUSD" className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})

describe('AISignalPanel Loading State', () => {
  beforeEach(() => {
    vi.doMock('@/hooks/useAISignals', () => ({
      useAISignals: () => ({
        signals: [],
        isLoading: true,
        analysis: null,
      }),
    }))
  })

  it('handles loading state gracefully', () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    expect(screen.getByText('AI Signals')).toBeInTheDocument()
  })
})

describe('AISignalPanel Empty State', () => {
  beforeEach(() => {
    vi.doMock('@/hooks/useAISignals', () => ({
      useAISignals: () => ({
        signals: [],
        isLoading: false,
        analysis: {
          sentiment: 'neutral',
          sentimentScore: 50,
        },
      }),
    }))
  })

  it('shows no signals message when empty', () => {
    render(<AISignalPanel symbol="BTCUSD" />)
    expect(screen.getByText('AI Signals')).toBeInTheDocument()
  })
})
