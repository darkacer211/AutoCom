import { cn } from '@/utils/cn'
import { forwardRef } from 'react'

export const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-xl border border-border-dark bg-muted-dark/50',
        'px-4 py-2 text-sm text-foreground-dark',
        'placeholder:text-foreground-dark/50',
        'focus:outline-none focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark/50',
        'transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-xl border border-border-dark bg-muted-dark/50',
        'px-4 py-2 text-sm text-foreground-dark',
        'placeholder:text-foreground-dark/50',
        'focus:outline-none focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark/50',
        'transition-all duration-200 resize-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'
