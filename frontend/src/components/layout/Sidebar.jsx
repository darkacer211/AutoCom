import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Send,
  Inbox,
  MessageSquare,
  FileText,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utils/cn'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Send, label: 'Send Email', path: '/send-email' },
  { icon: Inbox, label: 'Inbox', path: '/inbox' },
  { icon: MessageSquare, label: 'WhatsApp', path: '/whatsapp' },
  { icon: FileText, label: 'Templates', path: '/templates' },
  { icon: History, label: 'Logs', path: '/logs' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? '80px' : '256px' }}
      className="fixed left-0 top-0 h-full bg-card-dark border-r border-border-dark flex flex-col z-40"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border-dark">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-dark flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground-dark">AutoComm</span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-muted-dark transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    'hover:bg-muted-dark',
                    isActive
                      ? 'bg-primary-dark/10 text-primary-dark border border-primary-dark/20'
                      : 'text-foreground-dark/70 hover:text-foreground-dark'
                  )
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </motion.aside>
  )
}
