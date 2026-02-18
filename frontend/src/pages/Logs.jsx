import { useState, useEffect } from 'react'
import { History, Filter, Download, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Loader } from '@/components/ui/Loader'
import { useToast } from '@/context/ToastContext'
import api from '@/utils/api'

export function Logs() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/logs?limit=100')
      if (response.data.logs) {
        // Transform logs to match frontend format
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
      } else {
        // If no logs from backend, try to parse bot.log file format
        // For now, use empty array
        setLogs([])
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      addToast('Failed to load logs', 'error')
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-dark mb-2">Logs & History</h1>
          <p className="text-foreground-dark/70">View all system activities and events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchLogs} isLoading={isLoading}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="secondary">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-foreground-dark/70">
              No logs available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-foreground-dark/70">{log.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant={log.type === 'email' ? 'info' : 'success'}>
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell className="text-foreground-dark/70">{log.recipient}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground-dark/70">{log.message}</TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
