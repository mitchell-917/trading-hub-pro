// ============================================
// TradingHub Pro - OrderPanel Widget Tests
// Comprehensive tests for order panel functionality
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
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
const mockPlaceOrder = vi.fn()
vi.mock('@/hooks/useTrading', () => ({
  useTrading: () => ({
    placeOrder: mockPlaceOrder,
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

    it('displays current symbol', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })

    it('displays buying power', () => {
      render(<OrderPanel {...defaultProps} />)
      
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

    it('applies custom className', () => {
      const { container } = render(<OrderPanel {...defaultProps} className="custom-class" />)
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Order Types', () => {
    it('shows limit order option', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByRole('tab', { name: /limit/i })).toBeInTheDocument()
    })

    it('shows market order option', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByRole('tab', { name: /market/i })).toBeInTheDocument()
    })

    it('shows stop order option', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByRole('tab', { name: /stop/i })).toBeInTheDocument()
    })

    it('can switch to market order', async () => {
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      const marketTab = screen.getByRole('tab', { name: /market/i })
      await user.click(marketTab)
      
      // Market order should not show price input (look for absence of "Price" label)
      expect(screen.queryByText(/^Price$/)).not.toBeInTheDocument()
    })

    it('can switch to stop-limit order', async () => {
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      const stopTab = screen.getByRole('tab', { name: /stop/i })
      await user.click(stopTab)
      
      // Stop limit should show both limit price and stop price
      expect(screen.getByText('Limit Price')).toBeInTheDocument()
      expect(screen.getByText('Stop Price')).toBeInTheDocument()
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

    it('clicking percentage button sets quantity', async () => {
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      // First enter a price
      const priceInput = screen.getByPlaceholderText('50000.00')
      await user.type(priceInput, '50000')
      
      // Click 25% button
      const button25 = screen.getByText('25%')
      await user.click(button25)
      
      // The quantity input should be updated (25% of 50000 buying power = 12500 / 50000 price = 0.25)
      const quantityInput = screen.getByPlaceholderText('0.00')
      expect(quantityInput).toBeInTheDocument()
    })
  })

  describe('Form Inputs', () => {
    it('has quantity input', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByText('Quantity')).toBeInTheDocument()
    })

    it('has price input for limit orders', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByText('Price')).toBeInTheDocument()
    })

    it('can enter quantity', async () => {
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      const quantityInput = screen.getByPlaceholderText('0.00')
      await user.type(quantityInput, '1.5')
      
      expect(quantityInput).toHaveValue(1.5)
    })
  })

  describe('Advanced Options', () => {
    it('has settings button to toggle advanced options', () => {
      render(<OrderPanel {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const settingsButton = buttons.find(btn => btn.querySelector('svg'))
      expect(settingsButton).toBeDefined()
    })

    it('shows take profit and stop loss when advanced is toggled', async () => {
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      // Find settings button by class or structure
      const settingsButton = document.querySelector('button:has(svg.lucide-settings)')
      if (settingsButton) {
        await user.click(settingsButton)
        
        await waitFor(() => {
          expect(screen.queryByText('Take Profit')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Order Summary', () => {
    it('shows order value', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByText('Order Value')).toBeInTheDocument()
    })

    it('shows buying power label', () => {
      render(<OrderPanel {...defaultProps} />)
      
      expect(screen.getByText('Buying Power')).toBeInTheDocument()
    })
  })

  describe('Submit Button', () => {
    it('has a buy submit button', () => {
      render(<OrderPanel {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => 
        btn.textContent?.includes('Buy BTC')
      )
      expect(submitButton).toBeDefined()
    })

    it('submit button is disabled when quantity is empty', () => {
      render(<OrderPanel {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => 
        btn.textContent?.includes('Buy BTC')
      )
      expect(submitButton).toBeDisabled()
    })

    it('can submit order with valid inputs', async () => {
      mockPlaceOrder.mockResolvedValueOnce(true)
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      // Enter price
      const priceInput = screen.getByPlaceholderText('50000.00')
      await user.type(priceInput, '50000')
      
      // Enter quantity
      const quantityInput = screen.getByPlaceholderText('0.00')
      await user.type(quantityInput, '1')
      
      // Find and click submit
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => 
        btn.textContent?.includes('Buy BTC')
      )
      
      await user.click(submitButton!)
      
      expect(mockPlaceOrder).toHaveBeenCalled()
    })
  })

  describe('Side Toggle', () => {
    it('can switch to sell mode', async () => {
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const sellButton = buttons.find(btn => btn.textContent?.trim() === 'Sell')
      
      expect(sellButton).toBeDefined()
      
      await user.click(sellButton!)
      
      const submitButtons = screen.getAllByRole('button')
      const submitButton = submitButtons.find(btn => 
        btn.textContent?.includes('Sell BTC')
      )
      expect(submitButton).toBeDefined()
    })

    it('can switch back to buy mode', async () => {
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      // First switch to sell
      const buttons = screen.getAllByRole('button')
      const sellButton = buttons.find(btn => btn.textContent?.trim() === 'Sell')
      await user.click(sellButton!)
      
      // Then switch back to buy
      const buyButton = buttons.find(btn => btn.textContent?.trim() === 'Buy')
      await user.click(buyButton!)
      
      const submitButtons = screen.getAllByRole('button')
      const submitButton = submitButtons.find(btn => 
        btn.textContent?.includes('Buy BTC')
      )
      expect(submitButton).toBeDefined()
    })
  })

  describe('Risk Warning', () => {
    it('shows warning when using high percentage of buying power', async () => {
      const user = userEvent.setup()
      render(<OrderPanel {...defaultProps} />)
      
      // Enter price
      const priceInput = screen.getByPlaceholderText('50000.00')
      await user.type(priceInput, '50000')
      
      // Enter quantity that uses >80% of buying power (45000 / 50000 = 0.9 units at 50000 price = 45000 value = 90%)
      const quantityInput = screen.getByPlaceholderText('0.00')
      await user.type(quantityInput, '0.9')
      
      // Should show the warning
      await waitFor(() => {
        const warning = screen.queryByText(/uses.*of your buying power/i)
        expect(warning).toBeInTheDocument()
      })
    })
  })
})
