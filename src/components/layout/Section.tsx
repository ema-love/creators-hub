import { cn } from '../../lib/cn'

type Surface = 'dark' | 'light' | 'forest'

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  surface?: Surface
  ref?: React.Ref<HTMLElement>
}

const surfaces: Record<Surface, string> = {
  dark: 'bg-ink text-cream',
  light: 'bg-cream text-ink',
  forest: 'bg-forest text-cream',
}

/**
 * Page section. `surface` sets the colour scheme and tells the header which
 * treatment to use while this section is beneath it.
 */
export function Section({ surface = 'dark', className, children, ref, ...rest }: SectionProps) {
  return (
    <section
      ref={ref}
      data-surface={surface === 'light' ? 'light' : 'dark'}
      className={cn('relative', surfaces[surface], className)}
      {...rest}
    >
      {children}
    </section>
  )
}
