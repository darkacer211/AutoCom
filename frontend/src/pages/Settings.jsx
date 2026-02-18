import { useState } from 'react'
import { Save, Key, Mail, MessageSquare, User, Bell, Moon, Sun } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/context/ToastContext'

export function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { addToast } = useToast()
  const [settings, setSettings] = useState({
    email: {
      smtpServer: 'smtp.gmail.com',
      smtpPort: '587',
      email: '',
      password: '',
    },
    whatsapp: {
      enabled: true,
      sessionPath: '',
    },
    api: {
      groqKey: '',
      geminiKey: '',
    },
    notifications: {
      email: true,
      whatsapp: false,
      desktop: true,
    },
  })

  const handleSave = (section) => {
    // TODO: Save settings via API
    addToast(`${section} settings saved successfully`, 'success')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground-dark mb-2">Settings</h1>
        <p className="text-foreground-dark/70">Manage your account and preferences</p>
      </div>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary-dark" />
            <div>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure your email sending settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-dark mb-2">
                SMTP Server
              </label>
              <Input
                value={settings.email.smtpServer}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: { ...settings.email, smtpServer: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-dark mb-2">
                SMTP Port
              </label>
              <Input
                type="number"
                value={settings.email.smtpPort}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email: { ...settings.email, smtpPort: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-dark mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={settings.email.email}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: { ...settings.email, email: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-dark mb-2">
              Password / App Password
            </label>
            <Input
              type="password"
              value={settings.email.password}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: { ...settings.email, password: e.target.value },
                })
              }
              placeholder="Enter your email password or app password"
            />
          </div>
          <Button onClick={() => handleSave('Email')}>
            <Save className="w-4 h-4" />
            Save Email Settings
          </Button>
        </CardContent>
      </Card>

      {/* WhatsApp Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-green-500" />
            <div>
              <CardTitle>WhatsApp Configuration</CardTitle>
              <CardDescription>Configure WhatsApp Web automation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground-dark">Enable WhatsApp</p>
              <p className="text-sm text-foreground-dark/70">
                Allow sending messages via WhatsApp Web
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsapp.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted-dark peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-dark/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-dark"></div>
            </label>
          </div>
          {settings.whatsapp.enabled && (
            <div>
              <label className="block text-sm font-medium text-foreground-dark mb-2">
                Session Path
              </label>
              <Input
                value={settings.whatsapp.sessionPath}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, sessionPath: e.target.value },
                  })
                }
                placeholder="/path/to/session"
              />
            </div>
          )}
          <Button onClick={() => handleSave('WhatsApp')}>
            <Save className="w-4 h-4" />
            Save WhatsApp Settings
          </Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-yellow-500" />
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API credentials</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-dark mb-2">
              Groq API Key
            </label>
            <Input
              type="password"
              value={settings.api.groqKey}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  api: { ...settings.api, groqKey: e.target.value },
                })
              }
              placeholder="Enter your Groq API key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-dark mb-2">
              Gemini API Key
            </label>
            <Input
              type="password"
              value={settings.api.geminiKey}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  api: { ...settings.api, geminiKey: e.target.value },
                })
              }
              placeholder="Enter your Gemini API key"
            />
          </div>
          <Button onClick={() => handleSave('API')}>
            <Save className="w-4 h-4" />
            Save API Keys
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-500" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground-dark">Email Notifications</p>
              <p className="text-sm text-foreground-dark/70">
                Receive notifications via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted-dark peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-dark/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-dark"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground-dark">Desktop Notifications</p>
              <p className="text-sm text-foreground-dark/70">
                Show desktop notifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.desktop}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, desktop: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted-dark peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-dark/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-dark"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-blue-500" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground-dark">Theme</p>
              <p className="text-sm text-foreground-dark/70">
                Switch between light and dark mode
              </p>
            </div>
            <Button onClick={toggleTheme} variant="secondary">
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-purple-500" />
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-dark mb-2">
              Display Name
            </label>
            <Input placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-dark mb-2">
              Email
            </label>
            <Input type="email" placeholder="your@email.com" />
          </div>
          <Button variant="danger">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  )
}
