import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { disciplines, disciplinesSection, type Discipline } from '../content/site'
import { mediaFor } from '../content/media'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { MediaFrame } from '../components/ui/MediaFrame'
import { ease } from '../lib/motion'
import { cn } from '../lib/cn'

/**
 * Four disciplines. Choosing one brings its studio into view; the small map
 * shows it connected to every other discipline through Creators Hub.
 */
export function Disciplines() {
  const [activeId, setActiveId] = useState(disciplines[0]!.id)
  const active = disciplines.find((d) => d.id === activeId) ?? disciplines[0]!
  const reduce = useReducedMotion()

  return (
    <Section id="disciplines" surface="forest" aria-labelledby="disciplines-title" className="overflow-hidden py-28 md:py-40">
      <div className="container-edge">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow className="text-electric">{disciplinesSection.eyebrow}</Eyebrow>
            <h2 id="disciplines-title" className="mt-6 text-headline font-medium">
              <MaskText lines={[disciplinesSection.title]} />
            </h2>
          </div>
          <p className="text-cream/75 md:col-span-4 md:col-start-9">{disciplinesSection.body}</p>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12 md:items-center md:gap-12">
          <ul className="md:col-span-5" aria-label="Disciplines">
            {disciplines.map((d, i) => {
              const isActive = d.id === activeId
              return (
                <li key={d.id} className="border-t border-cream/15 last:border-b">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveId(d.id)}
                    onMouseEnter={() => setActiveId(d.id)}
                    onFocus={() => setActiveId(d.id)}
                    className="group flex w-full items-baseline gap-5 py-5 text-left md:py-6"
                  >
                    <span className={cn('w-6 font-display text-xs tabular-nums transition-colors', isActive ? 'text-electric' : 'text-cream/50')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'font-display text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-none tracking-[-0.03em] transition-all duration-500 ease-[var(--ease-out-expo)]',
                        isActive ? 'translate-x-2 text-cream' : 'text-cream/45 group-hover:text-cream/80',
                      )}
                    >
                      {d.name}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        className="overflow-hidden pl-11 text-cream/75"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: ease.out }}
                      >
                        <span className="block pb-6">{d.line}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>

          <figure className="md:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active.id}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06, clipPath: 'inset(0% 0% 0% 100%)' }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: ease.out }}
                >
                  <MediaFrame item={mediaFor(active.id)} fill className="h-full w-full" />
                </motion.div>
              </AnimatePresence>
            </div>
            <figcaption className="mt-4 flex items-center justify-between gap-4 text-sm text-cream/60">
              <span className="flex items-center gap-4">
                <EcosystemMap active={active} />
                <span>{active.name}</span>
              </span>
              <span className="tabular-nums">
                {String(disciplines.indexOf(active) + 1).padStart(2, '0')} / {String(disciplines.length).padStart(2, '0')}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </Section>
  )
}

const C = 60
const R = 40

function point(angle: number) {
  const a = (angle * Math.PI) / 180
  return { x: C + Math.cos(a) * R, y: C + Math.sin(a) * R }
}

/** Compact ecosystem map: every discipline linked through the centre and to each other. */
function EcosystemMap({ active }: { active: Discipline }) {
  const ap = point(active.angle)
  return (
    <div className="shrink-0">
      <svg viewBox="0 0 120 120" className="h-14 w-14 md:h-16 md:w-16" role="img" aria-label={`${active.name}, connected to every other discipline through Creators Hub`}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(245,240,232,0.2)" />
        {disciplines.map((d) => {
          const p = point(d.angle)
          return <line key={`s-${d.id}`} x1={C} y1={C} x2={p.x} y2={p.y} stroke="rgba(245,240,232,0.25)" />
        })}
        {disciplines
          .filter((d) => d.id !== active.id)
          .map((d) => {
            const p = point(d.angle)
            return (
              <motion.line
                key={`${active.id}-${d.id}`}
                x1={ap.x}
                y1={ap.y}
                x2={p.x}
                y2={p.y}
                stroke="#00E5A0"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: ease.out }}
              />
            )
          })}
        <circle cx={C} cy={C} r={9} fill="#0A0A0A" stroke="#00E5A0" />
        {disciplines.map((d) => {
          const p = point(d.angle)
          const on = d.id === active.id
          return (
            <motion.circle
              key={d.id}
              cx={p.x}
              cy={p.y}
              fill={on ? '#00E5A0' : '#1A4A3A'}
              stroke={on ? '#00E5A0' : 'rgba(245,240,232,0.6)'}
              animate={{ r: on ? 7 : 4.5 }}
              transition={{ duration: 0.4, ease: ease.out }}
            />
          )
        })}
      </svg>
    </div>
  )
}
