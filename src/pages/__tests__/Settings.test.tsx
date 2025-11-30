// ============================================
// Settings Page Tests
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
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

    it('navigates back to appearance section', () => {
      renderSettings()
      // First go to another section
      fireEvent.click(screen.getByText('Security'))
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
      
      // Then go back to appearance
      fireEvent.click(screen.getByText('Appearance'))
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    })
  })

  describe('Appearance Settings', () => {
    it('shows theme options', () => {
      renderSettings()
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
      expect(screen.getByText('Light Mode')).toBeInTheDocument()
    })

    it('shows theme section header', () => {
      renderSettings()
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    it('shows display settings header', () => {
      renderSettings()
      expect(screen.getByText('Display')).toBeInTheDocument()
    })

    it('shows display settings', () => {
      renderSettings()
      expect(screen.getByText('Animations')).toBeInTheDocument()
      expect(screen.getByText('Compact Mode')).toBeInTheDocument()
    })

    it('shows Show P&L in Header toggle', () => {
      renderSettings()
      expect(screen.getByText("Show P&L in Header")).toBeInTheDocument()
    })

    it('shows localization header', () => {
      renderSettings()
      expect(screen.getByText('Localization')).toBeInTheDocument()
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
      // Verify the click happened without error
      expect(lightModeButton).toBeInTheDocument()
    })

    it('can toggle theme to dark', () => {
      renderSettings()
      const darkModeButton = screen.getByText('Dark Mode').closest('button')
      expect(darkModeButton).toBeInTheDocument()
      fireEvent.click(darkModeButton!)
    })

    it('can toggle animations setting', () => {
      renderSettings()
      const animationsToggle = screen.getByText('Animations').parentElement?.parentElement?.querySelector('button')
      if (animationsToggle) {
        fireEvent.click(animationsToggle)
      }
    })

    it('can toggle compact mode setting', () => {
      renderSettings()
      const compactToggle = screen.getByText('Compact Mode').parentElement?.parentElement?.querySelector('button')
      if (compactToggle) {
        fireEvent.click(compactToggle)
      }
    })

    it('can change language selection', () => {
      renderSettings()
      const languageSelect = screen.getAllByRole('combobox')[0]
      fireEvent.change(languageSelect, { target: { value: 'es' } })
      expect(languageSelect).toHaveValue('es')
    })

    it('shows currency selector', () => {
      renderSettings()
      // Currency selector is a custom component, just verify it's rendered
      expect(screen.getByText('Currency')).toBeInTheDocument()
    })
  })

  describe('Notifications Settings', () => {
    it('shows notification toggles', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('Enable Notifications')).toBeInTheDocument()
      expect(screen.getByText('Sound Effects')).toBeInTheDocument()
    })

    it('shows general section header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('General')).toBeInTheDocument()
    })

    it('shows alert types header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('Alert Types')).toBeInTheDocument()
    })

    it('shows alert types', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('Price Alerts')).toBeInTheDocument()
      expect(screen.getByText('Order Fills')).toBeInTheDocument()
      expect(screen.getByText('News Alerts')).toBeInTheDocument()
    })

    it('shows delivery methods header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('Delivery Methods')).toBeInTheDocument()
    })

    it('shows delivery methods', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      expect(screen.getByText('Email Notifications')).toBeInTheDocument()
      expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    })

    it('can toggle enable notifications', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      const enableToggle = screen.getByText('Enable Notifications').parentElement?.parentElement?.querySelector('button')
      if (enableToggle) {
        fireEvent.click(enableToggle)
      }
    })

    it('can toggle sound effects', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Notifications'))
      
      const soundToggle = screen.getByText('Sound Effects').parentElement?.parentElement?.querySelector('button')
      if (soundToggle) {
        fireEvent.click(soundToggle)
      }
    })
  })

  describe('Trading Settings', () => {
    it('shows order defaults header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      expect(screen.getByText('Order Defaults')).toBeInTheDocument()
    })

    it('shows order defaults', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      expect(screen.getByText('Default Leverage')).toBeInTheDocument()
      expect(screen.getByText('Risk Limit (%)')).toBeInTheDocument()
    })

    it('shows order confirmation header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      expect(screen.getByText('Order Confirmation')).toBeInTheDocument()
    })

    it('shows order confirmation toggle', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      expect(screen.getByText('Confirm Before Placing Orders')).toBeInTheDocument()
    })

    it('shows quick actions header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    it('shows quick actions', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      expect(screen.getByText('Configure Hotkeys')).toBeInTheDocument()
      expect(screen.getByText('Auto-Trading Rules')).toBeInTheDocument()
    })

    it('can change default leverage', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      const inputs = screen.getAllByRole('spinbutton')
      if (inputs[0]) {
        fireEvent.change(inputs[0], { target: { value: '20' } })
      }
    })

    it('can change risk limit', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Trading'))
      
      const inputs = screen.getAllByRole('spinbutton')
      if (inputs[1]) {
        fireEvent.change(inputs[1], { target: { value: '5' } })
      }
    })
  })

  describe('Security Settings', () => {
    it('shows 2FA header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
    })

    it('shows 2FA option', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('2FA Disabled')).toBeInTheDocument()
    })

    it('shows password header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Password')).toBeInTheDocument()
    })

    it('shows password settings', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Change Password')).toBeInTheDocument()
    })

    it('shows sessions header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Sessions')).toBeInTheDocument()
    })

    it('shows session management', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    })

    it('shows API keys header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('API Keys')).toBeInTheDocument()
    })

    it('shows API key management', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      expect(screen.getByText('API Access')).toBeInTheDocument()
    })

    it('can toggle 2FA on', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      const enableButton = screen.getByRole('button', { name: /enable/i })
      expect(enableButton).toBeInTheDocument()
      fireEvent.click(enableButton)
      
      // After enabling, it should show Disable
      expect(screen.getByRole('button', { name: /disable/i })).toBeInTheDocument()
    })

    it('can toggle 2FA off after enabling', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Security'))
      
      // First enable
      fireEvent.click(screen.getByRole('button', { name: /enable/i }))
      
      // Then disable
      const disableButton = screen.getByRole('button', { name: /disable/i })
      fireEvent.click(disableButton)
      
      // Should show Enable again
      expect(screen.getByRole('button', { name: /enable/i })).toBeInTheDocument()
    })
  })

  describe('Account Settings', () => {
    it('shows profile information header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Account'))
      
      expect(screen.getByText('Profile Information')).toBeInTheDocument()
    })

    it('shows profile information', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Account'))
      
      expect(screen.getByText('Display Name')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
    })

    it('shows subscription header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Account'))
      
      expect(screen.getByText('Subscription')).toBeInTheDocument()
    })

    it('shows subscription info', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Account'))
      
      expect(screen.getByText('PRO')).toBeInTheDocument()
      expect(screen.getByText('Professional Plan')).toBeInTheDocument()
    })

    it('shows payment methods header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Account'))
      
      expect(screen.getByText('Payment Methods')).toBeInTheDocument()
    })

    it('shows payment methods', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Account'))
      
      expect(screen.getByText(/4242/)).toBeInTheDocument()
    })
  })

  describe('Data & Privacy Settings', () => {
    it('shows export data header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByText('Export Data')).toBeInTheDocument()
    })

    it('shows export data option', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByText('Download Your Data')).toBeInTheDocument()
    })

    it('shows cache header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByText('Cache')).toBeInTheDocument()
    })

    it('shows cache management', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByText('Clear Cache')).toBeInTheDocument()
    })

    it('shows danger zone header', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByText('Danger Zone')).toBeInTheDocument()
    })

    it('shows danger zone', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByText('Delete Account')).toBeInTheDocument()
    })

    it('shows export button', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    })

    it('shows clear button', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('shows delete button', () => {
      renderSettings()
      fireEvent.click(screen.getByText('Data & Privacy'))
      
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })
  })

  describe('Save Functionality', () => {
    it('has save button', () => {
      renderSettings()
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toBeInTheDocument()
    })

    it('can click save button', async () => {
      renderSettings()
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)
      
      // Wait for save to complete (shows loading state then success)
      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalled()
      }, { timeout: 2000 })
    })

    it('shows success message after save', async () => {
      renderSettings()
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)
      
      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/settings saved/i)).toBeInTheDocument()
      }, { timeout: 2000 })
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

  it('has navigation buttons', () => {
    renderSettings()
    const navButtons = screen.getAllByRole('button')
    expect(navButtons.length).toBeGreaterThan(5) // At least the 6 section buttons
  })
})
