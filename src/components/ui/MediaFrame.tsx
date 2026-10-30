import type { MediaItem } from '../../content/media'
import { cn } from '../../lib/cn'
import { DisciplineArt } from '../art/DisciplineArt'

type MediaFrameProps = {
  item: MediaItem
  className?: string
  /** Above-the-fold media should load eagerly. */
  priority?: boolean
  /** Fill the parent instead of keeping the media's own aspect ratio. */
  fill?: boolean
}

/**
 * Renders supplied photography, or the discipline's illustration when no
 * photograph is set. A fixed aspect ratio prevents layout shift.
 */
export function MediaFrame({ item, className, priority = false, fill = false }: MediaFrameProps) {
  const ratio = fill ? undefined : { aspectRatio: `${item.width} / ${item.height}` }

  if (item.src) {
    return (
      <picture className={cn('block overflow-hidden', className)} style={ratio}>
        {item.srcMobile && <source media="(max-width: 767px)" srcSet={item.srcMobile} />}
        <img
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>
    )
  }

  return (
    <div role="img" aria-label={item.alt} className={cn('relative overflow-hidden bg-ink', className)} style={ratio}>
      <DisciplineArt kind={item.kind} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
