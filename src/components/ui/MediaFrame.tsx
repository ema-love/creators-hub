import type { MediaItem, MediaKind } from '../../content/media'
import { cn } from '../../lib/cn'
import { DisciplineGlyph } from './DisciplineGlyph'

type MediaFrameProps = {
  item: MediaItem
  className?: string
  /** Above-the-fold media should load eagerly. */
  priority?: boolean
  /** Hide the placeholder caption (e.g. inside the intro montage). */
  bare?: boolean
  /** Fill the parent instead of keeping the media's own aspect ratio. */
  fill?: boolean
}

const tones: Record<MediaKind, string> = {
  technology: 'bg-[#0f1c18] text-electric',
  fashion: 'bg-[#2a160c] text-rust',
  film: 'bg-[#141618] text-silver',
  art: 'bg-forest text-cream',
  design: 'bg-offwhite text-forest',
  entrepreneurship: 'bg-[#16241d] text-bright',
  community: 'bg-ink-2 text-electric',
}

/**
 * Renders supplied photography, or — until it exists — an abstract,
 * clearly labelled placeholder. Fixed aspect ratio prevents layout shift.
 */
export function MediaFrame({ item, className, priority = false, bare = false, fill = false }: MediaFrameProps) {
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
    <div
      role="img"
      aria-label={`Image placeholder: ${item.alt}`}
      title={`Art direction: ${item.direction}`}
      className={cn('relative grid place-items-center overflow-hidden', tones[item.kind], className)}
      style={ratio}
      data-placeholder="media"
    >
      <DisciplineGlyph kind={item.kind} className="h-[62%] w-[62%] opacity-90" />
      {!bare && (
        <span className="eyebrow absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[0.625rem] text-cream backdrop-blur-sm">
          Image placeholder · {item.label}
        </span>
      )}
    </div>
  )
}
