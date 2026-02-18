import { cn } from '@/utils/cn'

export function Table({ children, className }) {
  return (
    <div className="rounded-2xl border border-border-dark overflow-hidden">
      <table className={cn('w-full', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-muted-dark/50 border-b border-border-dark">
      {children}
    </thead>
  )
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-border-dark transition-colors',
        onClick && 'cursor-pointer hover:bg-muted-dark/30',
        className
      )}
    >
      {children}
    </tr>
  )
}

export function TableHead({ children, className }) {
  return (
    <th className={cn('px-4 py-3 text-left text-sm font-semibold text-foreground-dark/70', className)}>
      {children}
    </th>
  )
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>
}

export function TableCell({ children, className }) {
  return (
    <td className={cn('px-4 py-3 text-sm text-foreground-dark', className)}>
      {children}
    </td>
  )
}
