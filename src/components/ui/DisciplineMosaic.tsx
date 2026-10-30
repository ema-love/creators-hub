import { motion, useReducedMotion } from 'motion/react'
import type { DisciplineStory, Photo } from '../../content/disciplineStories'
import { ease } from '../../lib/motion'
import { cn } from '../../lib/cn'

/*
 * Mosaic grid. Phone: 4 × 5 square cells. Desktop: 6 × 4 square cells (3:2).
 * Slot order matches DisciplineStory.mosaic: hero, square, tall, tall, wide.
 */
const SLOTS = [
  'col-[1/3] row-[1/4] md:col-[1/4] md:row-[1/5] rounded-[20px] rounded-tl-[72px] md:rounded-tl-[120px]',
  'col-[3/5] row-[1/3] md:col-[4/6] md:row-[1/3] rounded-[20px]',
  'col-[3/5] row-[3/4] md:col-[6/7] md:row-[1/3] rounded-[999px]',
  'col-[1/3] row-[4/6] md:col-[4/5] md:row-[3/5] rounded-[20px] rounded-br-[64px]',
  'col-[3/5] row-[4/5] md:col-[5/7] md:row-[3/4] rounded-[20px]',
] as const

const QUOTE_SLOT = 'col-[3/5] row-[5/6] md:col-[5/7] md:row-[4/5] rounded-[20px]'

type DisciplineMosaicProps = {
  story: DisciplineStory
  name: string
  className?: string
}

/** A discipline's photographs recomposed as an editorial mosaic. */
export function DisciplineMosaic({ story, name, className }: DisciplineMosaicProps) {
  const reduce = useReducedMotion()
  const tile = (i: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }
      : {
          initial: { opacity: 0, scale: 0.94, y: 16 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.8, ease: ease.out, delay: i * 0.06 },
        }

  return (
    <div
      className={cn(
        'grid aspect-[4/5] grid-cols-4 grid-rows-5 gap-2 md:aspect-[3/2] md:grid-cols-6 md:grid-rows-4 md:gap-3',
        className,
      )}
    >
      {story.mosaic.map((p, i) => (
        <motion.div key={p.src} className={cn('relative overflow-hidden bg-ink', SLOTS[i])} {...tile(i)}>
          <MosaicPhoto photo={p} />
        </motion.div>
      ))}
      <motion.div
        className={cn('flex flex-col justify-end bg-cream p-3 text-ink md:justify-between md:p-5', QUOTE_SLOT)}
        {...tile(5)}
      >
        <span className="eyebrow hidden text-[0.625rem] text-forest/70 md:block">Creators Hub · {name}</span>
        <p className="font-display text-[clamp(1rem,1.6vw,1.5rem)] font-medium leading-tight tracking-[-0.02em] text-forest">
          {story.quote}
        </p>
      </motion.div>
    </div>
  )
}

function MosaicPhoto({ photo }: { photo: Photo }) {
  return (
    <img
      src={photo.src}
      alt={photo.alt}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] hover:scale-[1.04]"
      style={photo.position ? { objectPosition: photo.position } : undefined}
    />
  )
}
