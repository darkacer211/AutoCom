import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Phone, Save, AlertCircle, CheckCircle, Copy, MessageSquare, Info, Code } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'

export function WhatsApp() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [alertStatus, setAlertStatus] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const { addToast } = useToast()

  // Load alert configuration on mount
  useEffect(() => {
    loadAlertConfig()
    checkWhatsappStatus()
  }, [])

  const checkWhatsappStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status')
      if (response.ok) {
        const data = await response.json()
        setWhatsappConnected(data.connected)
        setConnectionError(data.error)
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error)
    }
  }

  const handleWhatsappConnect = async () => {
    setIsConnecting(true)
    setConnectionError(null)
    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      
      if (response.ok) {
        setWhatsappConnected(true)
        addToast('WhatsApp connected successfully!', 'success')
      } else {
        setConnectionError(data.error)
        addToast(`Connection failed: ${data.error}`, 'error')
      }
    } catch (error) {
      setConnectionError(error.message)
      addToast('Failed to connect WhatsApp', 'error')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleWhatsappDisconnect = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setWhatsappConnected(false)
        setConnectionError(null)
        addToast('WhatsApp disconnected', 'success')
      } else {
        addToast('Failed to disconnect WhatsApp', 'error')
      }
    } catch (error) {
      addToast('Error disconnecting WhatsApp', 'error')
    } finally {
      setIsConnecting(false)
    }
  }

  const loadAlertConfig = async () => {
    setIsLoading(true)
    try {
      // Try to get alert service status from backend
      const response = await fetch('/api/whatsapp/alerts/status')
      if (response.ok) {
        const data = await response.json()
        setPhoneNumber(data.phone_number || '')
        setAlertsEnabled(data.enabled !== false)
        setAlertStatus(data)
      }
    } catch (error) {
      console.error('Error loading alert config:', error)
      // Set defaults if endpoint fails
      setPhoneNumber('')
      setAlertsEnabled(true)
    } finally {
      setIsLoading(false)
    }
  }

  const validatePhoneNumber = (number) => {
    // Phone number should start with + and contain 10-15 digits
    const phoneRegex = /^\+\d{10,15}$/
    return phoneRegex.test(number)
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    setPhoneNumber(value)
    setHasChanges(true)
  }

  const handleToggleAlerts = () => {
    setAlertsEnabled(!alertsEnabled)
    setHasChanges(true)
  }

  const handleSaveConfig = async () => {
    if (!phoneNumber.trim()) {
      setMessage('Phone number is required')
      setMessageType('error')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setMessage('Invalid phone format. Use +countrycode (e.g., +1234567890)')
      setMessageType('error')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/whatsapp/alerts/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          enabled: alertsEnabled
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAlertStatus(data)
        setHasChanges(false)
        setMessage('✓ Alert configuration saved successfully!')
        setMessageType('success')
      } else if (response.status === 404) {
        // Endpoint not implemented, use localStorage
        localStorage.setItem('whatsapp_phone', phoneNumber)
        localStorage.setItem('whatsapp_alerts_enabled', String(alertsEnabled))
        setHasChanges(false)
        setMessage('Configuration saved locally (backend endpoint pending)')
        setMessageType('info')
      } else {
        const data = await response.json()
        setMessage(data.error || 'Failed to save configuration')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage('Failed to save configuration: ' + error.message)
      setMessageType('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyPhone = () => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber)
      setMessage('Phone number copied to clipboard')
      setMessageType('success')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground-dark mb-2">WhatsApp Alerts</h1>
        <p className="text-foreground-dark/70">Configure automated alert notifications for important and critical emails</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-muted-dark border-t-primary-dark rounded-full mx-auto mb-4"
            />
            <p className="text-foreground-dark/70">Loading configuration...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-4">
            {/* Connection Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                    <div>
                      <CardTitle>WhatsApp Connection</CardTitle>
                      <CardDescription>Login to send WhatsApp alerts</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${whatsappConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className={`text-sm font-medium ${whatsappConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {whatsappConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectionError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
                    <p className="text-red-600 font-medium">❌ Error</p>
                    <p className="text-red-600/80 text-xs mt-1">{connectionError}</p>
                  </div>
                )}
                
                {whatsappConnected ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">✓ WhatsApp is connected</p>
                      <p className="text-xs text-green-600/80 mt-2">You can now send messages and receive alerts</p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={handleWhatsappDisconnect}
                      isLoading={isConnecting}
                      className="w-full"
                    >
                      Disconnect WhatsApp
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">ℹ️ How to login</p>
                      <ol className="text-xs text-blue-600/80 mt-2 space-y-1 ml-4 list-decimal">
                        <li>Click "Connect WhatsApp" below</li>
                        <li>A browser window will open with WhatsApp Web</li>
                        <li>Scan the QR code with your phone</li>
                        <li>Wait for the connection to complete</li>
                      </ol>
                    </div>
                    <Button
                      onClick={handleWhatsappConnect}
                      isLoading={isConnecting}
                      className="w-full"
                    >
                      <Phone className="w-4 h-4" />
                      {isConnecting ? 'Connecting...' : 'Connect WhatsApp'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuration Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <div>
                    <CardTitle>Alert Configuration</CardTitle>
                    <CardDescription>Set up WhatsApp notifications for important emails</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* How it Works */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm mb-2 text-foreground-dark">How it works:</p>
                      <ul className="text-sm space-y-1 text-foreground-dark/80">
                        <li>✓ <strong>CRITICAL</strong> emails trigger instant WhatsApp alerts</li>
                        <li>✓ <strong>IMPORTANT</strong> emails get notified via WhatsApp</li>
                        <li>✓ Normal emails stay quiet (zero spam)</li>
                        <li>✓ Messages include sender, subject & dashboard link only</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground-dark">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4" />
                      Alert Phone Number
                    </div>
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="font-mono"
                  />
                  <p className="text-xs text-foreground-dark/70">
                    Format: <code className="bg-muted-dark px-2 py-1 rounded">+countrycode (10-15 digits)</code>
                  </p>
                  <div className="text-xs space-y-1 text-foreground-dark/70">
                    <p className="font-medium">Examples:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>🇺🇸 USA: +12025551234</div>
                      <div>🇮🇳 India: +919876543210</div>
                      <div>🇬🇧 UK: +442071838750</div>
                      <div>🇩🇪 Germany: +491234567890</div>
                    </div>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted-dark/50 rounded-lg border border-border-dark">
                  <div>
                    <p className="font-medium text-foreground-dark">
                      Alerts are <span className={alertsEnabled ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                        {alertsEnabled ? '● ENABLED' : '● DISABLED'}
                      </span>
                    </p>
                    <p className="text-xs text-foreground-dark/70 mt-1">
                      {alertsEnabled 
                        ? '✓ Receiving WhatsApp notifications'
                        : '✗ No notifications will be sent'}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleAlerts}
                    className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${
                      alertsEnabled ? 'bg-green-600' : 'bg-muted-dark'
                    }`}
                  >
                    <motion.span
                      animate={{ x: alertsEnabled ? 28 : 4 }}
                      className="inline-block h-6 w-6 rounded-full bg-white"
                    />
                  </motion.button>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3 pt-4 border-t border-border-dark">
                  <Button
                    onClick={handleSaveConfig}
                    disabled={!hasChanges || isSaving}
                    isLoading={isSaving}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </Button>
                  {hasChanges && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-yellow-600 font-medium flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Unsaved changes
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Examples Sidebar */}
          <div className="space-y-4">
            {/* Critical Alert Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Critical Alert</CardTitle>
                <CardDescription>Real-time notification example</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 font-mono text-xs space-y-1">
                  <p className="text-red-600 font-bold">🚨 CRITICAL EMAIL</p>
                  <p className="text-foreground-dark/80">From: Security Team</p>
                  <p className="text-foreground-dark/80">Subject: Urgent...</p>
                  <p className="text-foreground-dark/80 text-yellow-600 text-xs mt-2">→ Check dashboard</p>
                </div>
              </CardContent>
            </Card>

            {/* Important Alert Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important Alert</CardTitle>
                <CardDescription>Notification example</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 font-mono text-xs space-y-1">
                  <p className="text-yellow-600 font-bold">⚠️ IMPORTANT EMAIL</p>
                  <p className="text-foreground-dark/80">From: CEO</p>
                  <p className="text-foreground-dark/80">Subject: Q4 Results...</p>
                  <p className="text-foreground-dark/80 text-yellow-600 text-xs mt-2">→ View details</p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Privacy First
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-foreground-dark/80">
                <p className="font-medium text-foreground-dark mb-2">What's NOT sent:</p>
                <ul className="space-y-1">
                  <li>❌ Full email body</li>
                  <li>❌ Attachments</li>
                  <li>❌ Sensitive data</li>
                  <li>❌ Authentication details</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
