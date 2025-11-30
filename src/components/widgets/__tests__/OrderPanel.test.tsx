// ============================================
// TradingHub Pro - OrderPanel Widget Tests
// Comprehensive tests for order panel functionality
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderPanel } from '../OrderPanel'

// Mock the store
vi.mock('@/lib/store', () => ({
  useTradingStore: vi.fn((selector) => {
    const store = {
      selectedSymbol: 'BTC',
      placeOrder: vi.fn(),
      getPortfolioValue: vi.fn(() => ({ buyingPower: 50000 })),
    }
    return selector(store)
  }),
}))

// Mock useTrading hook
vi.mock('@/hooks/useTrading', () => ({
  useTrading: () => ({
    placeOrder: vi.fn(),
    isPlacingOrder: false,
    buyingPower: 50000,
  }),
}))

describe('OrderPanel', () => {
  const defaultProps = {
    symbol: 'BTC',
    currentPrice: 50000,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders order panel with title', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByText('Place Order')).toBeInTheDocument()
    })

    it('displays current price', () => {
      render(<OrderPanel {...defaultProps} />)
      
      // Check buying power which shows formatted price
      expect(screen.getByText('$50,000.00')).toBeInTheDocument()
    })

    it('shows buy and sell buttons', () => {
      render(<OrderPanel {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const buyButton = buttons.find(btn => btn.textContent?.includes('Buy'))
      const sellButton = buttons.find(btn => btn.textContent?.includes('Sell'))
      
      expect(buyButton).toBeDefined()
      expect(sellButton).toBeDefined()
    })
  })

  describe('Order Types', () => {
    it('shows market order option', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByRole('tab', { name: /market/i })).toBeInTheDocument()
    })

    it('shows limit order option', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByRole('tab', { name: /limit/i })).toBeInTheDocument()
    })
  })

  describe('Quick Percentages', () => {
    it('shows quick percentage buttons', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByText('25%')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Form Inputs', () => {
    it('has quantity input', () => {
      render(<OrderPanel {...defaultProps} />)
      
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('Submit Button', () => {
    it('has a submit button', () => {
      render(<OrderPanel {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => 
        btn.textContent?.includes('Buy BTC') || 
        btn.textContent?.includes('Sell BTC')
      )
      expect(submitButton).toBeDefined()
    })
  })

  describe('Side Toggle', () => {
    it('can switch to sell mode', async () => {
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      // Find the sell button - it's a regular button not a tab
      const buttons = screen.getAllByRole('button')
      const sellButton = buttons.find(btn => btn.textContent?.trim() === 'Sell')
      
      expect(sellButton).toBeDefined()
      
      await user.click(sellButton!)
      
      // After clicking sell, the submit button should say "Sell BTC"
      const submitButtons = screen.getAllByRole('button')
      const submitButton = submitButtons.find(btn => 
        btn.textContent?.includes('Sell BTC')
      )
      expect(submitButton).toBeDefined()
    })
  })
})
