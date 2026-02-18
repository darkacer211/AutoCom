import { motion } from 'framer-motion'
import { Mail, MessageSquare, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Loader } from '@/components/ui/Loader'

const stats = [
  {
    label: 'Emails Sent Today',
    value: '127',
    change: '+12%',
    trend: 'up',
    icon: Mail,
    color: 'text-blue-500',
  },
  {
    label: 'WhatsApp Messages',
    value: '43',
    change: '+8%',
    trend: 'up',
    icon: MessageSquare,
    color: 'text-green-500',
  },
  {
    label: 'Pending Automations',
    value: '8',
    change: '-3',
    trend: 'down',
    icon: Clock,
    color: 'text-yellow-500',
  },
  {
    label: 'Failed Tasks',
    value: '2',
    change: '-1',
    trend: 'down',
    icon: AlertCircle,
    color: 'text-red-500',
  },
]

const recentActivity = [
  {
    id: 1,
    type: 'email',
    action: 'Sent email',
    recipient: 'john@example.com',
    subject: 'Welcome to AutoComm',
    status: 'success',
    time: '2 minutes ago',
  },
  {
    id: 2,
    type: 'whatsapp',
    action: 'Sent message',
    recipient: '+1234567890',
    subject: 'Hello!',
    status: 'success',
    time: '15 minutes ago',
  },
  {
    id: 3,
    type: 'email',
    action: 'Auto-replied',
    recipient: 'support@example.com',
    subject: 'Re: Inquiry',
    status: 'success',
    time: '1 hour ago',
  },
  {
    id: 4,
    type: 'email',
    action: 'Failed to send',
    recipient: 'invalid@email',
    subject: 'Test',
    status: 'error',
    time: '2 hours ago',
  },
]

export function Dashboard() {
  const navigate = useNavigate()
  const {
    dashboardStats,
    dashboardLoading,
    fetchDashboardStats,
    refreshDashboard,
  } = useApp()

  useEffect(() => {
    // Load dashboard data on mount (will use cache if available)
    fetchDashboardStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-dark mb-2">Dashboard</h1>
          <p className="text-foreground-dark/70">Welcome back! Here's what's happening.</p>
        </div>
        <Button
          variant="secondary"
          onClick={refreshDashboard}
          isLoading={dashboardLoading}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      {dashboardLoading && !dashboardStats ? (
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(dashboardStats?.stats || stats).map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-muted-dark ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground-dark mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-foreground-dark/70">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
          })}
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-foreground-dark/70 mt-1">
                Latest actions and events
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/logs')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(dashboardStats?.activity || recentActivity).map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Badge variant={activity.type === 'email' ? 'info' : 'success'}>
                      {activity.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{activity.action}</TableCell>
                  <TableCell className="text-foreground-dark/70">
                    {activity.recipient}
                  </TableCell>
                  <TableCell>{activity.subject}</TableCell>
                  <TableCell>
                    <Badge variant={activity.status === 'success' ? 'success' : 'error'}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground-dark/70">
                    {activity.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover={false}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground-dark mb-2">Send Email</h3>
            <p className="text-sm text-foreground-dark/70 mb-4">
              Compose and send a new email
            </p>
              <Button className="w-full" onClick={() => window.location.href = '/send-email'}>Compose Email</Button>
          </CardContent>
        </Card>
        <Card hover={false}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground-dark mb-2">WhatsApp Message</h3>
            <p className="text-sm text-foreground-dark/70 mb-4">
              Send a WhatsApp message
            </p>
            <Button className="w-full" variant="secondary" onClick={() => window.location.href = '/whatsapp'}>Send Message</Button>
          </CardContent>
        </Card>
        <Card hover={false}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground-dark mb-2">Create Template</h3>
            <p className="text-sm text-foreground-dark/70 mb-4">
              Build a reusable email template
            </p>
            <Button className="w-full" variant="secondary" onClick={() => window.location.href = '/templates'}>New Template</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
