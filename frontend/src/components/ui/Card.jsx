import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

export function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      className={cn(
        'rounded-2xl bg-card-dark border border-border-dark',
        'shadow-soft-dark p-6 transition-all duration-200',
        hover && 'hover:shadow-lg hover:shadow-black/20',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-xl font-semibold text-foreground-dark', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-foreground-dark/70 mt-1', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}
