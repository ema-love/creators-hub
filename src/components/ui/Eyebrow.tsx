import { cn } from '../../lib/cn'

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('eyebrow flex items-center gap-3', className)}>
      <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </p>
  )
}
