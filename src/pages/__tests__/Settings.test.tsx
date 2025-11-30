// ============================================
// Settings Page Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Settings } from '../Settings'

// Mock the store
const mockUpdateSettings = vi.fn()
vi.mock('@/lib/store', () => ({
  useTradingStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      settings: {
        theme: 'dark',
        notifications: true,
        sound: true,
        defaultLeverage: 1,
        confirmTrades: true,
        riskWarnings: true,
        autoStopLoss: false,
        currency: 'USD',
        language: 'en',
      },
      updateSettings: mockUpdateSettings,
    }
    if (selector) {
      return selector(state)
    }
    return state
  },
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

    it('renders page subtitle', () => {
      renderSettings()
      expect(screen.getByText('Customize your trading experience')).toBeInTheDocument()
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

    it('renders account section button', () => {
      renderSettings()
      expect(screen.getByText('Account')).toBeInTheDocument()
    })

    it('renders data privacy section button', () => {
      renderSettings()
      expect(screen.getByText('Data & Privacy')).toBeInTheDocument()
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
      
      // Should show notifications content
      expect(screen.getByText('Enable Notifications')).toBeInTheDocument()
    })

    it('navigates to trading section', () => {
      renderSettings()
      const tradingButton = screen.getByText('Trading')
      fireEvent.click(tradingButton)
      
      expect(screen.getByText('Order Defaults')).toBeInTheDocument()
    })

    it('navigates to security section', () => {
      renderSettings()
      const securityButton = screen.getByText('Security')
      fireEvent.click(securityButton)
      
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
    })

    it('navigates to account section', () => {
      renderSettings()
      const accountButton = screen.getByText('Account')
      fireEvent.click(accountButton)
      
      expect(screen.getByText('Profile Information')).toBeInTheDocument()
    })

    it('navigates to data privacy section', () => {
      renderSettings()
      const dataButton = screen.getByText('Data & Privacy')
      fireEvent.click(dataButton)
      
      expect(screen.getByText('Export Data')).toBeInTheDocument()
    })
  })

  describe('Appearance Settings', () => {
    it('shows theme options', () => {
      renderSettings()
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
      expect(screen.getByText('Light Mode')).toBeInTheDocument()
    })

    it('shows display settings', () => {
      renderSettings()
      expect(screen.getByText('Animations')).toBeInTheDocument()
      expect(screen.getByText('Compact Mode')).toBeInTheDocument()
    })

    it('shows localization options', () => {
      renderSettings()
      expect(screen.getByText('Language')).toBeInTheDocument()
      expect(screen.getByText('Currency')).toBeInTheDocument()
    })

    it('can toggle theme to light', () => {
      renderSettings()
      const lightModeButton = screen.getByText('Light Mode').closest('button')
      expect(lightModeButton).toBeInTheDocument()
      fireEvent.click(lightModeButton!)
    })
  })

  describe('Notifications Settings', () => {
    it('shows notification toggles', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('Enable Notifications')).toBeInTheDocument()
      expect(screen.getByText('Sound Effects')).toBeInTheDocument()
    })

    it('shows alert types', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('Price Alerts')).toBeInTheDocument()
      expect(screen.getByText('Order Fills')).toBeInTheDocument()
      expect(screen.getByText('News Alerts')).toBeInTheDocument()
    })

    it('shows delivery methods', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('Email Notifications')).toBeInTheDocument()
      expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    })
  })

  describe('Trading Settings', () => {
    it('shows order defaults', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      expect(screen.getByText('Default Leverage')).toBeInTheDocument()
      expect(screen.getByText('Risk Limit (%)')).toBeInTheDocument()
    })

    it('shows order confirmation toggle', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      expect(screen.getByText('Confirm Before Placing Orders')).toBeInTheDocument()
    })

    it('shows quick actions', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      expect(screen.getByText('Configure Hotkeys')).toBeInTheDocument()
      expect(screen.getByText('Auto-Trading Rules')).toBeInTheDocument()
    })
  })

  describe('Security Settings', () => {
    it('shows 2FA option', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
    })

    it('shows password settings', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Change Password')).toBeInTheDocument()
    })

    it('shows session management', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    })

    it('shows API key management', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('API Access')).toBeInTheDocument()
    })

    it('can toggle 2FA', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      const enableButton = screen.getByRole('button', { name: /enable/i })
      expect(enableButton).toBeInTheDocument()
      fireEvent.click(enableButton)
    })
  })

  describe('Account Settings', () => {
    it('shows profile information', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Account'))
      
      expect(screen.getByText('Profile Information')).toBeInTheDocument()
      expect(screen.getByText('Display Name')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
    })

    it('shows subscription info', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Account'))
      
      expect(screen.getByText('Subscription')).toBeInTheDocument()
      expect(screen.getByText('Professional Plan')).toBeInTheDocument()
    })

    it('shows payment methods', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Account'))
      
      expect(screen.getByText('Payment Methods')).toBeInTheDocument()
    })
  })

  describe('Data & Privacy Settings', () => {
    it('shows export data option', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByText('Download Your Data')).toBeInTheDocument()
    })

    it('shows cache management', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByText('Clear Cache')).toBeInTheDocument()
    })

    it('shows danger zone', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByText('Danger Zone')).toBeInTheDocument()
      expect(screen.getByText('Delete Account')).toBeInTheDocument()
    })
  })

  describe('Save Functionality', () => {
    it('has save button', () => {
      renderSettings()
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toBeInTheDocument()
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

  it('has labeled form fields', () => {
    renderSettings()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Currency')).toBeInTheDocument()
  })
})
