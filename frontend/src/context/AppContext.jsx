import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { Mail, MessageSquare, Clock, AlertCircle } from 'lucide-react'
import api from '@/utils/api'

const AppContext = createContext()

// Create a toast helper that works without hook dependency
let toastHelper = null
export const setToastHelper = (helper) => {
  toastHelper = helper
}

const addToast = (message, type = 'info') => {
  if (toastHelper) {
    toastHelper(message, type)
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`)
  }
}

export function AppProvider({ children }) {
  
  // Email state
  const [emails, setEmails] = useState([])
  const [emailsLoading, setEmailsLoading] = useState(false)
  const [emailsLastFetched, setEmailsLastFetched] = useState(null)
  const [emailsFilter, setEmailsFilter] = useState('all')
  
  // Use refs to track cache without causing re-renders
  const emailsCacheRef = useRef({ emails: [], lastFetched: null })
  
  // Keep refs in sync with state
  useEffect(() => {
    emailsCacheRef.current = { emails, lastFetched: emailsLastFetched }
  }, [emails, emailsLastFetched])
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardLastFetched, setDashboardLastFetched] = useState(null)
  
  // Activity logs
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsLastFetched, setLogsLastFetched] = useState(null)
  
  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  // Check if cache is stale
  const isCacheStale = (lastFetched) => {
    if (!lastFetched) return true
    return Date.now() - lastFetched > CACHE_DURATION
  }

  // Fetch emails - stable function that doesn't change
  const fetchEmails = useCallback(async (forceRefresh = false) => {
    // Use ref to check cache without depending on state
    const { emails: cachedEmails, lastFetched } = emailsCacheRef.current
    
    // Use cache if available and not stale
    if (!forceRefresh && !isCacheStale(lastFetched) && cachedEmails.length > 0) {
      console.log('[Cache] Using cached emails')
      return cachedEmails
    }

    setEmailsLoading(true)
    try {
      // Fetch all emails, filtering is done client-side
      const response = await api.get('/email/inbox?limit=50')
      
      if (response.data.error) {
        addToast(response.data.error || 'Failed to load emails', 'error')
        return cachedEmails // Return cached emails on error
      }
      
      if (response.data.emails) {
        const transformedEmails = response.data.emails.map((email, index) => ({
          id: email.id || index,
          from: email.from || 'Unknown',
          subject: email.subject || 'No Subject',
          preview: email.preview || email.body?.substring(0, 200) || '',
          body: email.body || '',
          date: email.date ? new Date(email.date).toLocaleString() : 'Unknown',
          unread: email.unread !== false,
          important: email.important || false,
          category: email.category || 'UNCERTAIN',
        }))
        
        setEmails(transformedEmails)
        setEmailsLastFetched(Date.now())
        return transformedEmails
      }
      
      setEmails([])
      setEmailsLastFetched(Date.now())
      return []
    } catch (error) {
      console.error('Failed to fetch emails:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to load emails'
      addToast(errorMessage, 'error')
      return cachedEmails // Return cached emails on error
    } finally {
      setEmailsLoading(false)
    }
  }, []) // Empty dependency array - function is now stable

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async (forceRefresh = false) => {
    // Use cache if available and not stale
    if (!forceRefresh && !isCacheStale(dashboardLastFetched) && dashboardStats) {
      console.log('[Cache] Using cached dashboard stats')
      return dashboardStats
    }

    setDashboardLoading(true)
    try {
      const [dashboardRes, logsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/logs?limit=5')
      ])
      
      const stats = dashboardRes.data.stats
      const activityLogs = logsRes.data.logs || []
      
      const transformedStats = [
        {
          label: 'Emails Sent Today',
          value: stats.completed_jobs?.toString() || '0',
          change: '+12%',
          trend: 'up',
          icon: Mail,
          color: 'text-blue-500',
        },
        {
          label: 'WhatsApp Messages',
          value: '0',
          change: '+8%',
          trend: 'up',
          icon: MessageSquare,
          color: 'text-green-500',
        },
        {
          label: 'Pending Automations',
          value: stats.active_jobs?.toString() || '0',
          change: '-3',
          trend: 'down',
          icon: Clock,
          color: 'text-yellow-500',
        },
        {
          label: 'Failed Tasks',
          value: stats.failed_jobs?.toString() || '0',
          change: '-1',
          trend: 'down',
          icon: AlertCircle,
          color: 'text-red-500',
        },
      ]
      
      const transformedActivity = activityLogs.map((log, index) => ({
        id: index + 1,
        type: log.type || 'email',
        action: log.action || 'sent',
        recipient: log.recipient || 'N/A',
        subject: log.subject || 'N/A',
        status: log.status || 'success',
        time: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown',
      }))
      
      const dashboardData = {
        stats: transformedStats,
        activity: transformedActivity
      }
      
      setDashboardStats(dashboardData)
      setDashboardLastFetched(Date.now())
      return dashboardData
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      return dashboardStats // Return cached data on error
    } finally {
      setDashboardLoading(false)
    }
  }, [dashboardStats, dashboardLastFetched])

  // Fetch logs
  const fetchLogs = useCallback(async (forceRefresh = false) => {
    // Use cache if available and not stale
    if (!forceRefresh && !isCacheStale(logsLastFetched) && logs.length > 0) {
      console.log('[Cache] Using cached logs')
      return logs
    }

    setLogsLoading(true)
    try {
      const response = await api.get('/logs?limit=100')
      if (response.data.logs) {
        const transformedLogs = response.data.logs.map((log, index) => ({
          id: log.id || index,
          timestamp: log.timestamp || new Date().toISOString(),
          type: log.type || 'email',
          action: log.action || 'unknown',
          recipient: log.recipient || 'N/A',
          status: log.status || 'success',
          message: log.message || 'No message',
        }))
        setLogs(transformedLogs)
        setLogsLastFetched(Date.now())
        return transformedLogs
      }
      setLogs([])
      setLogsLastFetched(Date.now())
      return []
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      addToast('Failed to load logs', 'error')
      return logs // Return cached logs on error
    } finally {
      setLogsLoading(false)
    }
  }, [logs, logsLastFetched, addToast])

  // Update email filter (no refresh needed - filtering happens client-side)
  const updateEmailsFilter = useCallback((filter) => {
    setEmailsFilter(filter)
    // No need to re-fetch - filtering is done client-side on cached emails
  }, [])

  // Refresh emails (force)
  const refreshEmails = useCallback(() => {
    return fetchEmails(true)
  }, [fetchEmails])

  // Refresh dashboard (force)
  const refreshDashboard = useCallback(async () => {
    setDashboardLoading(true)
    try {
      const [dashboardRes, logsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/logs?limit=5')
      ])
      
      const stats = dashboardRes.data.stats
      const activityLogs = logsRes.data.logs || []
      
      const transformedStats = [
        {
          label: 'Emails Sent Today',
          value: stats.completed_jobs?.toString() || '0',
          change: '+12%',
          trend: 'up',
          icon: Mail,
          color: 'text-blue-500',
        },
        {
          label: 'WhatsApp Messages',
          value: '0',
          change: '+8%',
          trend: 'up',
          icon: MessageSquare,
          color: 'text-green-500',
        },
        {
          label: 'Pending Automations',
          value: stats.active_jobs?.toString() || '0',
          change: '-3',
          trend: 'down',
          icon: Clock,
          color: 'text-yellow-500',
        },
        {
          label: 'Failed Tasks',
          value: stats.failed_jobs?.toString() || '0',
          change: '-1',
          trend: 'down',
          icon: AlertCircle,
          color: 'text-red-500',
        },
      ]
      
      const transformedActivity = activityLogs.map((log, index) => ({
        id: index + 1,
        type: log.type || 'email',
        action: log.action || 'sent',
        recipient: log.recipient || 'N/A',
        subject: log.subject || 'N/A',
        status: log.status || 'success',
        time: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown',
      }))
      
      const dashboardData = {
        stats: transformedStats,
        activity: transformedActivity
      }
      
      setDashboardStats(dashboardData)
      setDashboardLastFetched(Date.now())
      return dashboardData
    } catch (error) {
      console.error('Failed to refresh dashboard:', error)
      throw error
    } finally {
      setDashboardLoading(false)
    }
  }, [])

  // Refresh logs (force)
  const refreshLogs = useCallback(() => {
    return fetchLogs(true)
  }, [fetchLogs])

  // Auto-refresh stale cache on mount
  useEffect(() => {
    // Refresh stale caches when component mounts
    if (isCacheStale(emailsLastFetched) && emails.length > 0) {
      console.log('[Cache] Auto-refreshing stale email cache')
      fetchEmails(true)
    }
  }, []) // Only run on mount

  const value = {
    // Email state
    emails,
    emailsLoading,
    emailsFilter,
    fetchEmails,
    refreshEmails,
    updateEmailsFilter,
    emailsLastFetched,
    
    // Dashboard state
    dashboardStats,
    dashboardLoading,
    fetchDashboardStats,
    refreshDashboard,
    dashboardLastFetched,
    
    // Logs state
    logs,
    logsLoading,
    fetchLogs,
    refreshLogs,
    logsLastFetched,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
