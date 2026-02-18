import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function Loader({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={`${sizes[size]} text-primary-dark`} />
      </motion.div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-muted-dark flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-foreground-dark/50" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground-dark mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-foreground-dark/70 mb-4 text-center max-w-md">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
