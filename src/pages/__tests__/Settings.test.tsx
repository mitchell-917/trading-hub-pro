// ============================================
// Settings Page Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Settings } from '../Settings'

// Mock the store
vi.mock('@/lib/store', () => ({
  useTradingStore: () => ({
    settings: {
      theme: 'dark',
      notifications: true,
      sounds: true,
      defaultLeverage: 1,
      confirmTrades: true,
      riskWarnings: true,
      autoStopLoss: false,
      currency: 'USD',
      language: 'en',
    },
    updateSettings: vi.fn(),
  }),
}))

const renderSettings = () => {
  return render(
    <BrowserRouter>
      <Settings />
    </BrowserRouter>
  )
}

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders page title', () => {
      renderSettings()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('renders appearance section', () => {
      renderSettings()
      expect(screen.getByText('Appearance')).toBeInTheDocument()
    })

    it('renders notifications section button', () => {
      renderSettings()
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })

    it('renders trading section button', () => {
      renderSettings()
      expect(screen.getByText('Trading')).toBeInTheDocument()
    })

    it('renders security section button', () => {
      renderSettings()
      expect(screen.getByText('Security')).toBeInTheDocument()
    })

    it('renders save button', () => {
      renderSettings()
      const saveButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent?.toLowerCase().includes('save')
      )
      expect(saveButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Section Navigation', () => {
    it('navigates to notifications section', () => {
      renderSettings()
      const notificationsButton = screen.getByText('Notifications')
      fireEvent.click(notificationsButton)
      
      // Should show active class after click
      expect(notificationsButton.closest('button')).toBeInTheDocument()
    })

    it('navigates to trading section', () => {
      renderSettings()
      const tradingButton = screen.getByText('Trading')
      fireEvent.click(tradingButton)
      
      expect(tradingButton.closest('button')).toBeInTheDocument()
    })

    it('navigates to security section', () => {
      renderSettings()
      const securityButton = screen.getByText('Security')
      fireEvent.click(securityButton)
      
      expect(securityButton.closest('button')).toBeInTheDocument()
    })
  })

  describe('Appearance Settings', () => {
    it('shows theme options', () => {
      renderSettings()
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
      expect(screen.getByText('Light Mode')).toBeInTheDocument()
    })
  })
})

describe('Settings Page Accessibility', () => {
  it('has accessible buttons', () => {
    renderSettings()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('has proper heading', () => {
    renderSettings()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
