# Global State Management

## Overview

Global state management has been implemented to cache data and improve performance, especially for the Inbox which was taking a long time to load.

## Features

### ✅ Caching System
- **5-minute cache duration** - Data is cached for 5 minutes before auto-refresh
- **Smart cache invalidation** - Cache is automatically refreshed when stale
- **Force refresh option** - Manual refresh buttons available on each page

### ✅ State Management
- **Emails** - Cached inbox emails with filter support
- **Dashboard Stats** - Cached dashboard statistics and activity
- **Logs** - Cached activity logs

### ✅ Performance Benefits
- **Instant loading** - Cached data loads instantly
- **Reduced API calls** - Only fetches when cache is stale or forced refresh
- **Better UX** - No loading delays when navigating between pages

## Usage

### In Components

```javascript
import { useApp } from '@/context/AppContext'

function MyComponent() {
  const {
    emails,
    emailsLoading,
    fetchEmails,
    refreshEmails,
    dashboardStats,
    dashboardLoading,
    fetchDashboardStats,
    refreshDashboard,
    logs,
    logsLoading,
    fetchLogs,
    refreshLogs,
  } = useApp()

  useEffect(() => {
    // Load data on mount (uses cache if available)
    fetchEmails()
  }, [fetchEmails])

  return (
    <div>
      {emailsLoading ? <Loader /> : <EmailList emails={emails} />}
      <Button onClick={refreshEmails}>Refresh</Button>
    </div>
  )
}
```

## API Reference

### Email State
- `emails` - Array of email objects
- `emailsLoading` - Boolean loading state
- `emailsFilter` - Current filter ('all', 'unread', 'important')
- `fetchEmails(forceRefresh)` - Fetch emails (uses cache unless forceRefresh=true)
- `refreshEmails()` - Force refresh emails
- `updateEmailsFilter(filter)` - Update filter and refresh
- `emailsLastFetched` - Timestamp of last fetch

### Dashboard State
- `dashboardStats` - Dashboard stats and activity data
- `dashboardLoading` - Boolean loading state
- `fetchDashboardStats(forceRefresh)` - Fetch dashboard data
- `refreshDashboard()` - Force refresh dashboard
- `dashboardLastFetched` - Timestamp of last fetch

### Logs State
- `logs` - Array of log entries
- `logsLoading` - Boolean loading state
- `fetchLogs(forceRefresh)` - Fetch logs
- `refreshLogs()` - Force refresh logs
- `logsLastFetched` - Timestamp of last fetch

## Cache Behavior

1. **First Load**: Fetches from API and caches result
2. **Subsequent Loads**: Returns cached data if < 5 minutes old
3. **Stale Cache**: Auto-refreshes in background when cache expires
4. **Force Refresh**: Manual refresh always fetches fresh data

## Updated Pages

- ✅ **Inbox** - Uses cached emails, instant loading
- ✅ **Dashboard** - Uses cached stats, instant loading
- ✅ **Logs** - Uses cached logs, instant loading

## Benefits

1. **Performance**: Inbox loads instantly on subsequent visits
2. **Reduced Load**: Fewer API calls to backend
3. **Better UX**: No loading spinners on cached data
4. **Smart Refresh**: Auto-refreshes stale data automatically
