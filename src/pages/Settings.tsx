// ============================================
// TradingHub Pro - Settings Page
// Comprehensive application settings and preferences
// ============================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Palette,
  Shield,
  Key,
  Monitor,
  Save,
  RefreshCw,
  ChevronRight,
  User,
  Mail,
  Lock,
  CreditCard,
  Database,
  Trash2,
  Download,
  Check,
  Globe,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { CurrencySelector } from '@/components/ui/CurrencySelector'
import { useTradingStore } from '@/lib/store'
import { useCurrency } from '@/context/CurrencyContext'
import { cn } from '@/lib/utils'

// Settings section types
type SettingsSection = 'appearance' | 'notifications' | 'trading' | 'security' | 'account' | 'data'

interface ToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label: string
  description?: string
}

const Toggle = ({ enabled, onChange, label, description }: ToggleProps) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="font-medium">{label}</p>
      {description && <p className="text-sm text-gray-400">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors",
        enabled ? "bg-indigo-500" : "bg-gray-700"
      )}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 bg-white rounded-full"
        animate={{ left: enabled ? 28 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
)

export function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance')
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  
  const settings = useTradingStore((s) => s.settings)
  const updateSettings = useTradingStore((s) => s.updateSettings)
  const { currency, isAutoDetected } = useCurrency()
  
  // Local state for unsaved changes
  const [localSettings, setLocalSettings] = useState({
    ...settings,
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',
    defaultLeverage: 10,
    riskLimit: 2,
    confirmOrders: true,
    showPnlInHeader: true,
    compactMode: false,
    animationsEnabled: true,
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
    priceAlerts: true,
    orderFills: true,
    newsAlerts: false,
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateSettings({ 
      theme: localSettings.theme,
      notifications: localSettings.notifications,
      sound: localSettings.sound,
    })
    setIsSaving(false)
    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), 3000)
  }

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'trading', label: 'Trading', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: User },
    { id: 'data', label: 'Data & Privacy', icon: Database },
  ] as const

  const renderSection = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLocalSettings({ ...localSettings, theme: 'dark' })}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-colors",
                    localSettings.theme === 'dark' 
                      ? "border-indigo-500 bg-gray-800" 
                      : "border-gray-700 bg-gray-800/50"
                  )}
                >
                  <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-xs text-gray-400">Easier on the eyes</p>
                </button>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, theme: 'light' })}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-colors",
                    localSettings.theme === 'light' 
                      ? "border-indigo-500 bg-gray-800" 
                      : "border-gray-700 bg-gray-800/50"
                  )}
                >
                  <Sun className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                  <p className="font-medium">Light Mode</p>
                  <p className="text-xs text-gray-400">Classic bright theme</p>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Display</h3>
              <div className="space-y-1">
                <Toggle
                  enabled={localSettings.animationsEnabled}
                  onChange={(v) => setLocalSettings({ ...localSettings, animationsEnabled: v })}
                  label="Animations"
                  description="Enable smooth transitions and animations"
                />
                <Toggle
                  enabled={localSettings.compactMode}
                  onChange={(v) => setLocalSettings({ ...localSettings, compactMode: v })}
                  label="Compact Mode"
                  description="Show more content with less spacing"
                />
                <Toggle
                  enabled={localSettings.showPnlInHeader}
                  onChange={(v) => setLocalSettings({ ...localSettings, showPnlInHeader: v })}
                  label="Show P&L in Header"
                  description="Display portfolio value in navigation"
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Localization</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Language</label>
                  <select 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                    value={localSettings.language}
                    onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Currency
                    {isAutoDetected && (
                      <Badge color="blue" size="sm">Auto-detected</Badge>
                    )}
                  </label>
                  <CurrencySelector showLabel={false} />
                  <p className="text-xs text-gray-500 mt-2">
                    Current: {currency.name} ({currency.code}) - {currency.symbol}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">General</h3>
              <div className="space-y-1">
                <Toggle
                  enabled={localSettings.notifications}
                  onChange={(v) => setLocalSettings({ ...localSettings, notifications: v })}
                  label="Enable Notifications"
                  description="Receive alerts and updates"
                />
                <Toggle
                  enabled={localSettings.sound}
                  onChange={(v) => setLocalSettings({ ...localSettings, sound: v })}
                  label="Sound Effects"
                  description="Play sounds for trades and alerts"
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Alert Types</h3>
              <div className="space-y-1">
                <Toggle
                  enabled={localSettings.priceAlerts}
                  onChange={(v) => setLocalSettings({ ...localSettings, priceAlerts: v })}
                  label="Price Alerts"
                  description="Get notified when price targets are hit"
                />
                <Toggle
                  enabled={localSettings.orderFills}
                  onChange={(v) => setLocalSettings({ ...localSettings, orderFills: v })}
                  label="Order Fills"
                  description="Notifications when orders are executed"
                />
                <Toggle
                  enabled={localSettings.newsAlerts}
                  onChange={(v) => setLocalSettings({ ...localSettings, newsAlerts: v })}
                  label="News Alerts"
                  description="Breaking news for watched assets"
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Methods</h3>
              <div className="space-y-1">
                <Toggle
                  enabled={localSettings.emailNotifications}
                  onChange={(v) => setLocalSettings({ ...localSettings, emailNotifications: v })}
                  label="Email Notifications"
                  description="Receive alerts via email"
                />
                <Toggle
                  enabled={localSettings.pushNotifications}
                  onChange={(v) => setLocalSettings({ ...localSettings, pushNotifications: v })}
                  label="Push Notifications"
                  description="Browser push notifications"
                />
              </div>
            </div>
          </div>
        )

      case 'trading':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Defaults</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Default Leverage</label>
                  <Input
                    type="number"
                    value={localSettings.defaultLeverage}
                    onChange={(e) => setLocalSettings({ ...localSettings, defaultLeverage: Number(e.target.value) })}
                    min={1}
                    max={100}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Risk Limit (%)</label>
                  <Input
                    type="number"
                    value={localSettings.riskLimit}
                    onChange={(e) => setLocalSettings({ ...localSettings, riskLimit: Number(e.target.value) })}
                    min={0.1}
                    max={10}
                    step={0.1}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Order Confirmation</h3>
              <Toggle
                enabled={localSettings.confirmOrders}
                onChange={(v) => setLocalSettings({ ...localSettings, confirmOrders: v })}
                label="Confirm Before Placing Orders"
                description="Show confirmation dialog before executing trades"
              />
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Card className="p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Configure Hotkeys</p>
                      <p className="text-sm text-gray-400">Set keyboard shortcuts for trading</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
                <Card className="p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-Trading Rules</p>
                      <p className="text-sm text-gray-400">Set up automated trading strategies</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
              <Card className={cn(
                "p-4",
                localSettings.twoFactorEnabled ? "border-green-500/50 bg-green-500/10" : "bg-gray-800/50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      localSettings.twoFactorEnabled ? "bg-green-500/20" : "bg-gray-700"
                    )}>
                      <Shield className={cn(
                        "w-5 h-5",
                        localSettings.twoFactorEnabled ? "text-green-400" : "text-gray-400"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">2FA {localSettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                      <p className="text-sm text-gray-400">
                        {localSettings.twoFactorEnabled 
                          ? 'Your account is protected' 
                          : 'Add an extra layer of security'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant={localSettings.twoFactorEnabled ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => setLocalSettings({ 
                      ...localSettings, 
                      twoFactorEnabled: !localSettings.twoFactorEnabled 
                    })}
                  >
                    {localSettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </Card>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Password</h3>
              <Card className="p-4 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-700">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-gray-400">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </Card>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Sessions</h3>
              <Card className="p-4 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-700">
                      <Monitor className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-gray-400">3 devices currently logged in</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </Card>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">API Keys</h3>
              <Card className="p-4 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-700">
                      <Key className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">API Access</p>
                      <p className="text-sm text-gray-400">Manage API keys for integrations</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Display Name</label>
                  <Input defaultValue="Trader Pro" leftIcon={<User className="w-4 h-4" />} />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
                  <Input defaultValue="trader@example.com" leftIcon={<Mail className="w-4 h-4" />} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Subscription</h3>
              <Card className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge color="purple" className="mb-2">PRO</Badge>
                    <p className="font-medium">Professional Plan</p>
                    <p className="text-sm text-gray-400">Next billing: Jan 1, 2026</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </Card>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              <Card className="p-4 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-700">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-400">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Export Data</h3>
              <Card className="p-4 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-700">
                      <Download className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Download Your Data</p>
                      <p className="text-sm text-gray-400">Get a copy of all your trading data</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </Card>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold mb-4">Cache</h3>
              <Card className="p-4 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-700">
                      <RefreshCw className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Clear Cache</p>
                      <p className="text-sm text-gray-400">Free up storage space</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
              </Card>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
              <Card className="p-4 border-red-500/30 bg-red-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-red-400">Delete Account</p>
                      <p className="text-sm text-gray-400">Permanently delete your account and data</p>
                    </div>
                  </div>
                  <Button variant="danger" size="sm">
                    Delete
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-400 mt-1">Customize your trading experience</p>
          </div>
          <div className="flex items-center gap-3">
            {showSaveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-green-400"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm">Settings saved!</span>
              </motion.div>
            )}
            <Button 
              variant="primary" 
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="p-2 h-fit lg:sticky lg:top-6">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as SettingsSection)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-indigo-500/20 text-indigo-400" 
                        : "hover:bg-gray-800 text-gray-400 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </Card>

          {/* Content */}
          <Card className="p-6 lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings
