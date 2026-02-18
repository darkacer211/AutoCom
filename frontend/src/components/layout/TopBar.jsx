import { Search, Bell, User, Moon, Sun, LogOut } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/utils/cn'

export function TopBar({ sidebarWidth = 256 }) {
  const { theme, toggleTheme } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <header
      style={{ marginLeft: `${sidebarWidth}px` }}
      className="fixed top-0 right-0 left-0 h-16 bg-card-dark border-b border-border-dark z-30"
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dark/50" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-dark bg-muted-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/50"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-500">Online</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted-dark transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-foreground-dark" />
            ) : (
              <Moon className="w-5 h-5 text-foreground-dark" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-muted-dark transition-colors relative">
            <Bell className="w-5 h-5 text-foreground-dark" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted-dark transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </button>

            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-card-dark border border-border-dark shadow-soft-dark overflow-hidden"
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-sm font-medium text-foreground-dark">
                    User Name
                  </div>
                  <div className="px-3 py-1 text-xs text-foreground-dark/70">
                    user@example.com
                  </div>
                  <div className="border-t border-border-dark mt-2 pt-2">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground-dark hover:bg-muted-dark rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
