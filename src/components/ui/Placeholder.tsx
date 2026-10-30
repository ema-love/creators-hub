import { cn } from '../../lib/cn'

type PlaceholderProps = {
  children?: React.ReactNode
  className?: string
}

/**
 * Clearly labelled stand-in for information that has not been confirmed.
 * Never replace this with invented details.
 */
export function Placeholder({ children = 'To be announced', className }: PlaceholderProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-dashed border-current/40 px-3 py-1 text-[0.8125rem] font-medium opacity-80',
        className,
      )}
      data-placeholder="true"
    >
      <span className="eyebrow text-[0.625rem] tracking-[0.14em]">TBC</span>
      <span>{children}</span>
    </span>
  )
}
