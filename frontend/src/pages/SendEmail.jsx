import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Calendar, FileText, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'
import api from '@/utils/api'

export function SendEmail() {
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    template: null,
  })

  // Check for reply/forward data from Inbox
  useEffect(() => {
    const replyData = sessionStorage.getItem('emailReply')
    if (replyData) {
      try {
        const { to, subject, body } = JSON.parse(replyData)
        setFormData(prev => ({
          ...prev,
          to: to || '',
          subject: subject || '',
          body: body || '',
        }))
        // Clear the data after using it
        sessionStorage.removeItem('emailReply')
      } catch (e) {
        console.error('Failed to parse reply data:', e)
      }
    }
  }, [])
  const [attachments, setAttachments] = useState([])
  const [isSending, setIsSending] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const { addToast } = useToast()

  const templates = [
    { id: 1, name: 'Welcome Email', subject: 'Welcome to {{company}}', body: 'Hi {{name}}...' },
    { id: 2, name: 'Follow-up', subject: 'Following up on {{topic}}', body: 'Hello {{name}}...' },
  ]

  const handleSend = async () => {
    console.log('[SendEmail] handleSend called with:', formData)
    
    if (!formData.to || !formData.subject || !formData.body) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    setIsSending(true)
    try {
      console.log('[SendEmail] Sending request to /email/send')
      const response = await api.post('/email/send', {
        to: formData.to,
        subject: formData.subject,
        body: formData.body,
        cc: formData.cc || '',
        bcc: formData.bcc || '',
      })
      
      console.log('[SendEmail] Response:', response.data)
      
      if (response.data.success) {
        addToast('Email sent successfully', 'success')
        // Reset form
        setFormData({ to: '', cc: '', bcc: '', subject: '', body: '', template: null })
        setAttachments([])
      } else {
        addToast(response.data.error || 'Failed to send email', 'error')
      }
    } catch (error) {
      console.error('[SendEmail] Error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send email'
      addToast(errorMessage, 'error')
    } finally {
      setIsSending(false)
    }
  }

  const handleSchedule = () => {
    addToast('Scheduling feature coming soon', 'info')
  }

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      subject: template.subject,
      body: template.body,
      template: template.id,
    })
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setAttachments([...attachments, ...files])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground-dark mb-2">Send Email</h1>
        <p className="text-foreground-dark/70">Compose and send emails with ease</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Templates */}
              {templates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground-dark mb-2">
                    Templates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((template) => (
                      <Badge
                        key={template.id}
                        variant={formData.template === template.id ? 'info' : 'default'}
                        className="cursor-pointer"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        {template.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* To */}
              <div>
                <label className="block text-sm font-medium text-foreground-dark mb-2">
                  To <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                />
              </div>

              {/* CC */}
              <div>
                <label className="block text-sm font-medium text-foreground-dark mb-2">
                  CC
                </label>
                <Input
                  type="email"
                  placeholder="cc@example.com"
                  value={formData.cc}
                  onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                />
              </div>

              {/* BCC */}
              <div>
                <label className="block text-sm font-medium text-foreground-dark mb-2">
                  BCC
                </label>
                <Input
                  type="email"
                  placeholder="bcc@example.com"
                  value={formData.bcc}
                  onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground-dark mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Email subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-foreground-dark mb-2">
                  Body <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Write your email here..."
                  rows={12}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-foreground-dark mb-2">
                  Attachments
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((file, index) => (
                    <Badge key={index} variant="default" className="flex items-center gap-2">
                      <Paperclip className="w-3 h-3" />
                      {file.name}
                      <button
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-dark bg-muted-dark/50 cursor-pointer hover:bg-muted-dark transition-colors">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">Attach files</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleSend}
                  isLoading={isSending}
                  size="lg"
                  className="flex-1"
                >
                  <Send className="w-5 h-5" />
                  Send Now
                </Button>
                <Button
                  type="button"
                  onClick={handleSchedule}
                  variant="secondary"
                  size="lg"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview</CardTitle>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-1 hover:bg-muted-dark rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-foreground-dark/70 mb-1">To:</p>
                    <p className="text-foreground-dark">{formData.to || '—'}</p>
                  </div>
                  {formData.cc && (
                    <div>
                      <p className="text-foreground-dark/70 mb-1">CC:</p>
                      <p className="text-foreground-dark">{formData.cc}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-foreground-dark/70 mb-1">Subject:</p>
                    <p className="text-foreground-dark font-semibold">
                      {formData.subject || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground-dark/70 mb-2">Body:</p>
                    <div className="p-4 rounded-xl bg-muted-dark/50 border border-border-dark whitespace-pre-wrap">
                      {formData.body || '—'}
                    </div>
                  </div>
                  {attachments.length > 0 && (
                    <div>
                      <p className="text-foreground-dark/70 mb-2">Attachments:</p>
                      <div className="space-y-1">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <FileText className="w-3 h-3" />
                            {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
