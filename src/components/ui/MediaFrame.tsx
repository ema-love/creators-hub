import type { MediaItem } from '../../content/media'
import { cn } from '../../lib/cn'

type MediaFrameProps = {
  item: MediaItem
  className?: string
  /** Above-the-fold media should load eagerly. */
  priority?: boolean
  /** Fill the parent instead of keeping the media's own aspect ratio. */
  fill?: boolean
  /** Rendered width hint so the browser downloads the right file. */
  sizes?: string
}

/**
 * Responsive image with a reserved aspect ratio (no layout shift). The
 * browser picks the phone or full-size file from `sizes`.
 */
export function MediaFrame({ item, className, priority = false, fill = false, sizes = '100vw' }: MediaFrameProps) {
  const ratio = fill ? undefined : { aspectRatio: `${item.width} / ${item.height}` }

  if (!item.src) {
    return (
      <div
        role="img"
        aria-label={`Image to come: ${item.label}`}
        className={cn('grid place-items-center bg-ink-2 text-silver', className)}
        style={ratio}
      >
        <span className="eyebrow">{item.label}</span>
      </div>
    )
  }

  const srcSet = item.srcMobile ? `${item.srcMobile} 960w, ${item.src} ${item.width}w` : undefined

  return (
    <img
      src={item.src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={item.alt}
      width={item.width}
      height={item.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={cn('block h-full w-full object-cover', className)}
      style={ratio}
    />
  )
}
