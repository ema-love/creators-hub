import { cn } from '../../lib/cn'

/** Decorative, endlessly drifting line of words. Pauses on hover and for reduced motion. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center gap-10">
          <span>{item}</span>
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current opacity-40" />
        </span>
      ))}
    </div>
  )
  return (
    <div className={cn('group flex overflow-hidden', className)} aria-hidden="true">
      <div className="flex animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row}
        {row}
      </div>
    </div>
  )
}
