import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Edit, Trash2, Copy, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/Loader'
import { useToast } from '@/context/ToastContext'

const mockTemplates = [
  {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}',
    body: 'Hi {{name}},\n\nWelcome to {{company}}! We\'re excited to have you on board.\n\nBest regards,\n{{sender}}',
    variables: ['name', 'company', 'sender'],
    category: 'email',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Follow-up',
    subject: 'Following up on {{topic}}',
    body: 'Hello {{name}},\n\nI wanted to follow up on {{topic}}. Let me know if you have any questions.\n\nThanks,\n{{sender}}',
    variables: ['name', 'topic', 'sender'],
    category: 'email',
    createdAt: '2024-01-10',
  },
  {
    id: 3,
    name: 'WhatsApp Welcome',
    body: 'Hi {{name}}! Welcome to {{company}}. How can I help you today?',
    variables: ['name', 'company'],
    category: 'whatsapp',
    createdAt: '2024-01-08',
  },
]

export function Templates() {
  const [templates, setTemplates] = useState(mockTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'email',
  })
  const { addToast } = useToast()

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.body.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({ name: '', subject: '', body: '', category: 'email' })
    setShowModal(true)
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject || '',
      body: template.body,
      category: template.category,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.body) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    if (editingTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id ? { ...t, ...formData } : t
        )
      )
      addToast('Template updated successfully', 'success')
    } else {
      const newTemplate = {
        id: Date.now(),
        ...formData,
        variables: extractVariables(formData.body + formData.subject),
        createdAt: new Date().toISOString().split('T')[0],
      }
      setTemplates([...templates, newTemplate])
      addToast('Template created successfully', 'success')
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter((t) => t.id !== id))
      addToast('Template deleted successfully', 'success')
    }
  }

  const handleDuplicate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now(),
      name: `${template.name} (Copy)`,
    }
    setTemplates([...templates, newTemplate])
    addToast('Template duplicated', 'success')
  }

  const extractVariables = (text) => {
    const matches = text.match(/\{\{(\w+)\}\}/g)
    if (!matches) return []
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground-dark mb-2">Templates</h1>
          <p className="text-foreground-dark/70">Create and manage email and WhatsApp templates</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-5 h-5" />
          New Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-dark/50" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No templates found"
            description="Create your first template to get started"
            action={<Button onClick={handleCreate}>Create Template</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-1">{template.name}</CardTitle>
                      <Badge variant="default">{template.category}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-1.5 rounded-lg hover:bg-muted-dark transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="p-1.5 rounded-lg hover:bg-muted-dark transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 rounded-lg hover:bg-muted-dark transition-colors text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.subject && (
                    <div className="mb-3">
                      <p className="text-xs text-foreground-dark/70 mb-1">Subject:</p>
                      <p className="text-sm font-medium text-foreground-dark">
                        {template.subject}
                      </p>
                    </div>
                  )}
                  <div className="mb-3">
                    <p className="text-xs text-foreground-dark/70 mb-1">Body:</p>
                    <p className="text-sm text-foreground-dark line-clamp-3">
                      {template.body}
                    </p>
                  </div>
                  {template.variables.length > 0 && (
                    <div>
                      <p className="text-xs text-foreground-dark/70 mb-2">Variables:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="info" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-foreground-dark/50 mt-3">
                    Created {template.createdAt}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-dark mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Welcome Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-dark mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-border-dark bg-muted-dark/50 text-sm text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/50"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {formData.category === 'email' && (
            <div>
              <label className="block text-sm font-medium text-foreground-dark mb-2">
                Subject
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject (use {{variable}} for dynamic content)"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground-dark mb-2">
              Body <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Template body (use {{variable}} for dynamic content)"
              rows={8}
            />
            <p className="text-xs text-foreground-dark/70 mt-2">
              Use {'{{variable}}'} syntax for dynamic content
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
