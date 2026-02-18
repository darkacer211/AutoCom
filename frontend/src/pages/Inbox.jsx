import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Mail, MailOpen, Trash2, Archive, RefreshCw, Reply, Forward } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, Loader } from '@/components/ui/Loader'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'

// Helper function to decode MIME encoded strings (e.g., =?utf-8?Q?...?=)
const decodeMimeString = (str) => {
  if (!str) return str
  
  // Check if it's a MIME encoded string
  const mimeRegex = /=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g
  
  return str.replace(mimeRegex, (match, charset, encoding, encodedText) => {
    try {
      if (encoding.toUpperCase() === 'Q') {
        // Quoted-printable encoding
        const decoded = encodedText
          .replace(/_/g, ' ')
          .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => 
            String.fromCharCode(parseInt(hex, 16))
          )
        return decoded
      } else if (encoding.toUpperCase() === 'B') {
        // Base64 encoding
        return atob(encodedText)
      }
    } catch (e) {
      console.error('Failed to decode MIME string:', e)
    }
    return match
  })
}

const mockEmails = [
  {
    id: 1,
    from: 'john@example.com',
    subject: 'Welcome to AutoComm',
    preview: 'Thank you for signing up...',
    date: '2 hours ago',
    unread: true,
    important: true,
    category: 'SAFE',
  },
  {
    id: 2,
    from: 'support@company.com',
    subject: 'Your request has been processed',
    preview: 'We have successfully processed your request...',
    date: '5 hours ago',
    unread: true,
    important: false,
    category: 'OFFICIAL',
  },
  {
    id: 3,
    from: 'noreply@spam.com',
    subject: 'You won a prize!',
    preview: 'Congratulations! You have won...',
    date: '1 day ago',
    unread: false,
    important: false,
    category: 'SPAM',
  },
]

const categoryColors = {
  CRITICAL: 'error',
  OFFICIAL: 'info',
  SAFE: 'success',
  SPAM: 'warning',
  UNCERTAIN: 'default',
}

export function Inbox() {
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  const {
    emails,
    emailsLoading,
    emailsFilter,
    fetchEmails,
    refreshEmails,
    updateEmailsFilter,
  } = useApp()

  useEffect(() => {
    // Load emails on mount (will use cache if available)
    fetchEmails()
  }, [fetchEmails])

  const handleFilterChange = (newFilter) => {
    updateEmailsFilter(newFilter)
  }

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      emailsFilter === 'all' ||
      (emailsFilter === 'unread' && email.unread) ||
      (emailsFilter === 'important' && email.important) ||
      (emailsFilter === 'category' && email.category === emailsFilter)

    return matchesSearch && matchesFilter
  })

  const handleEmailClick = (email) => {
    setSelectedEmail(email)
  }

  const handleReply = () => {
    if (!selectedEmail) return
    
    // Navigate to send email page with reply data
    const replySubject = selectedEmail.subject.startsWith('Re:') 
      ? selectedEmail.subject 
      : `Re: ${decodeMimeString(selectedEmail.subject)}`
    
    const replyBody = `\n\n---\nOn ${selectedEmail.date}, ${selectedEmail.from} wrote:\n> ${selectedEmail.body || selectedEmail.preview}`
    
    // Store reply data in sessionStorage for the SendEmail page to pick up
    sessionStorage.setItem('emailReply', JSON.stringify({
      to: selectedEmail.from,
      subject: replySubject,
      body: replyBody,
    }))
    
    navigate('/send-email')
    addToast('Composing reply...', 'info')
  }

  const handleForward = () => {
    if (!selectedEmail) return
    
    const forwardSubject = selectedEmail.subject.startsWith('Fwd:') 
      ? selectedEmail.subject 
      : `Fwd: ${decodeMimeString(selectedEmail.subject)}`
    
    const forwardBody = `\n\n---\nForwarded message:\nFrom: ${selectedEmail.from}\nDate: ${selectedEmail.date}\nSubject: ${decodeMimeString(selectedEmail.subject)}\n\n${selectedEmail.body || selectedEmail.preview}`
    
    sessionStorage.setItem('emailReply', JSON.stringify({
      to: '',
      subject: forwardSubject,
      body: forwardBody,
    }))
    
    navigate('/send-email')
    addToast('Forwarding email...', 'info')
  }

  const handleMarkImportant = () => {
    if (!selectedEmail) return
    
    // Toggle important status
    const newImportantStatus = !selectedEmail.important
    setSelectedEmail({ ...selectedEmail, important: newImportantStatus })
    
    addToast(
      newImportantStatus ? 'Marked as important' : 'Removed from important',
      'success'
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-dark mb-2">Inbox</h1>
          <p className="text-foreground-dark/70">Manage your emails</p>
        </div>
        <Button
          variant="secondary"
          onClick={refreshEmails}
          isLoading={emailsLoading}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Email List */}
        <div className="lg:col-span-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardContent className="p-4 flex flex-col flex-1">
              {/* Search and Filters */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-dark/50" />
                  <Input
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={emailsFilter === 'all' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleFilterChange('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={emailsFilter === 'unread' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleFilterChange('unread')}
                  >
                    Unread
                  </Button>
                  <Button
                    variant={emailsFilter === 'important' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleFilterChange('important')}
                  >
                    Important
                  </Button>
                </div>
              </div>

              {/* Email List */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin" style={{ maxHeight: 'calc(100vh - 340px)' }}>
                {emailsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader />
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <EmptyState
                    icon={Mail}
                    title="No emails found"
                    description="Try adjusting your search or filters"
                  />
                ) : (
                  filteredEmails.map((email) => (
                    <motion.div
                      key={email.id}
                      whileHover={{ x: 4 }}
                      onClick={() => handleEmailClick(email)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedEmail?.id === email.id
                          ? 'bg-primary-dark/10 border border-primary-dark/20'
                          : 'hover:bg-muted-dark border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {email.unread ? (
                            <Mail className="w-5 h-5 text-primary-dark" />
                          ) : (
                            <MailOpen className="w-5 h-5 text-foreground-dark/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-foreground-dark truncate">
                              {email.from}
                            </p>
                            {email.important && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-foreground-dark mb-1 truncate">
                            {decodeMimeString(email.subject)}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-foreground-dark/70 truncate">
                              {email.preview}
                            </p>
                            <Badge variant={categoryColors[email.category]} className="ml-2">
                              {email.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground-dark/50 mt-1">
                            {email.date}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email View */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            <Card className="h-full flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-foreground-dark break-words">
                        {decodeMimeString(selectedEmail.subject)}
                      </h2>
                      {selectedEmail.important && (
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-foreground-dark/70">
                      <p>
                        <span className="font-medium">From:</span> {selectedEmail.from}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span> {selectedEmail.date}
                      </p>
                      <Badge variant={categoryColors[selectedEmail.category]} className="mt-2">
                        {selectedEmail.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div 
                  className="flex-1 min-h-0 overflow-y-auto border-t border-border-dark pt-6 pr-2 scrollbar-thin"
                  style={{ maxHeight: 'calc(100vh - 420px)' }}
                >
                  <div className="prose prose-invert max-w-none">
                    <p className="text-foreground-dark whitespace-pre-wrap break-words">
                      {selectedEmail.body || selectedEmail.preview}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-border-dark">
                  <Button onClick={handleReply}>
                    <Reply className="w-4 h-4" />
                    Reply
                  </Button>
                  <Button variant="secondary" onClick={handleForward}>
                    <Forward className="w-4 h-4" />
                    Forward
                  </Button>
                  <Button 
                    variant={selectedEmail.important ? 'primary' : 'ghost'} 
                    onClick={handleMarkImportant}
                  >
                    <Star className={`w-4 h-4 ${selectedEmail.important ? 'fill-current' : ''}`} />
                    {selectedEmail.important ? 'Important' : 'Mark Important'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <EmptyState
                icon={MailOpen}
                title="Select an email"
                description="Choose an email from the list to view its contents"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
