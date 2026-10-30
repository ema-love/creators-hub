import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'

type Variant = 'solid' | 'rust' | 'outline' | 'text'

type ArrowLinkProps = {
  to: string
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const variants: Record<Variant, string> = {
  solid: 'bg-electric text-ink hover:bg-cream px-6 py-3.5 rounded-full',
  rust: 'bg-rust text-ink hover:bg-cream px-6 py-3.5 rounded-full',
  outline: 'border border-current/30 hover:border-current px-6 py-3.5 rounded-full',
  text: 'py-1',
}

/** Primary call-to-action. The arrow travels on hover — a small "spark" of motion. */
export function ArrowLink({ to, children, variant = 'solid', className }: ArrowLinkProps) {
  const isInternal = to.startsWith('/')
  const classes = cn(
    'group inline-flex items-center gap-3 font-display text-[0.9375rem] font-medium transition-colors duration-300',
    variants[variant],
    className,
  )
  const content = (
    <>
      <span className={variant === 'text' ? 'link-draw' : undefined}>{children}</span>
      <span className="relative inline-flex h-4 w-4 overflow-hidden" aria-hidden="true">
        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-4 group-hover:-translate-y-4" />
        <ArrowUpRight className="absolute h-4 w-4 -translate-x-4 translate-y-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0" />
      </span>
    </>
  )
  return isInternal ? (
    <Link to={to} className={classes}>
      {content}
    </Link>
  ) : (
    <a href={to} className={classes}>
      {content}
    </a>
  )
}
