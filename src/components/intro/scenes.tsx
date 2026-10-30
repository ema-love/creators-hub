import type { MediaItem } from '../../content/media'
import { firstRoom } from '../../content/event'
import { Wordmark } from '../brand/Wordmark'
import { MediaFrame } from '../ui/MediaFrame'

/*
 * Presentational layers for each intro scene. They render in their starting
 * (hidden) state; the choreography lives entirely in Intro.tsx so timing can
 * be read and tuned in one place. Class names prefixed `i-` are animation hooks.
 */

export const POSSIBILITY_WORDS = ['Imagine.', 'Make.', 'Share.']

const RIBBONS = [
  { d: 'M-50 620 C 260 380, 520 760, 820 470 S 1320 260, 1700 420', stroke: '#00E5A0', width: 1.4 },
  { d: 'M-50 700 C 300 520, 560 860, 860 560 S 1340 380, 1700 520', stroke: '#2D7A5F', width: 1 },
  { d: 'M-50 300 C 340 180, 620 520, 960 330 S 1380 140, 1700 240', stroke: '#F5F0E8', width: 0.8 },
  { d: 'M-50 820 C 380 760, 700 640, 980 720 S 1420 860, 1700 760', stroke: '#C4622D', width: 0.9 },
]

/** Scene 2 — Possibility: light becomes flowing form, planes and words. */
export function PossibilityLayer() {
  return (
    <div className="i-possibility absolute inset-0 opacity-0" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {RIBBONS.map((r, i) => (
          <path
            key={i}
            className="i-ribbon"
            d={r.d}
            pathLength={1}
            fill="none"
            stroke={r.stroke}
            strokeWidth={r.width}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        ))}
      </svg>

      <div className="absolute inset-0 grid place-items-center [perspective:1200px]">
        <div className="relative h-[46vmin] w-[46vmin] [transform-style:preserve-3d]">
          <div className="i-plane absolute inset-0 rounded-[2px] border border-electric/40 bg-forest/30" />
          <div className="i-plane absolute inset-[12%] rounded-full border border-cream/25" />
          <div className="i-plane absolute inset-[24%] rounded-[2px] border border-rust/50 bg-rust/10" />
        </div>
      </div>

      <div className="absolute inset-0 grid place-items-center">
        {POSSIBILITY_WORDS.map((w) => (
          <span key={w} className="absolute overflow-hidden">
            <span className="i-word block font-display text-display font-medium text-cream">{w}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Scene 3 — The Creators: the four discipline moodboards, shown whole at
 * their own 3:2 ratio (they carry their own titles, so no overlay text).
 */
export function MontageLayer({ frames }: { frames: MediaItem[] }) {
  return (
    <div className="i-montage absolute inset-0 grid place-items-center opacity-0" aria-hidden="true">
      <div className="relative aspect-[3/2] w-[min(90vw,calc(76svh*1.5))]">
        {frames.map((item, i) => (
          <div
            key={item.id}
            className="i-frame absolute inset-0 overflow-hidden rounded-[6px] will-change-transform"
            style={{ zIndex: i + 1, clipPath: 'inset(50% 0% 50% 0%)' }}
          >
            <div className="i-frame-media absolute inset-0">
              <MediaFrame item={item} fill priority sizes="90vw" className="h-full w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Scene 5 — Brand reveal. */
export function RevealLayer() {
  return (
    <div className="i-reveal absolute inset-0 grid place-items-center px-6" aria-hidden="true">
      <div className="i-reveal-inner flex flex-col items-center text-center">
        <Wordmark split className="text-[clamp(3rem,12vw,10rem)] text-cream" />
        <span className="i-line mt-6 block h-px w-[min(60vw,28rem)] origin-left bg-electric" />
        <p className="i-meta eyebrow mt-6 text-silver opacity-0">
          {firstRoom.fullName} · {firstRoom.dateLabel} · {firstRoom.city}
        </p>
      </div>
    </div>
  )
}
