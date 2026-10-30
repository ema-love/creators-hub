import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { disciplines, disciplinesSection, type Discipline } from '../content/site'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { DisciplineGlyph } from '../components/ui/DisciplineGlyph'
import type { MediaKind } from '../content/media'
import { ease } from '../lib/motion'
import { cn } from '../lib/cn'

const C = 300
const R = 205

function point(angle: number, radius = R) {
  const a = (angle * Math.PI) / 180
  return { x: C + Math.cos(a) * radius, y: C + Math.sin(a) * radius }
}

/**
 * Ecosystem map. Choosing a discipline shows that it connects to every other
 * one through the centre — the idea of Creators Hub as a diagram.
 */
export function Disciplines() {
  const [activeId, setActiveId] = useState(disciplines[0]!.id)
  const active = disciplines.find((d) => d.id === activeId) ?? disciplines[0]!

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

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:items-center">
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
                    className="group flex w-full items-baseline gap-5 py-4 text-left md:py-5"
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
                        <span className="block pb-5">{d.line}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>

          <div className="md:col-span-7">
            <EcosystemMap active={active} />
          </div>
        </div>
      </div>
    </Section>
  )
}

function EcosystemMap({ active }: { active: Discipline }) {
  const reduce = useReducedMotion()
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true, margin: '-15%' },
          transition: { duration: 1.4, ease: ease.out, delay },
        }

  const activePoint = point(active.angle)

  return (
    <figure className="relative mx-auto aspect-square w-full max-w-[38rem]">
      <svg viewBox="0 0 600 600" className="h-full w-full overflow-visible" role="img" aria-labelledby="eco-desc">
        <desc id="eco-desc">
          Diagram: six disciplines arranged in a circle around Creators Hub, each connected to the centre and to one
          another. Currently highlighted: {active.name}.
        </desc>

        <motion.circle cx={C} cy={C} r={R} fill="none" stroke="rgba(245,240,232,0.18)" {...draw(0)} />
        <motion.circle cx={C} cy={C} r={R * 0.48} fill="none" stroke="rgba(245,240,232,0.1)" strokeDasharray="2 6" {...draw(0.2)} />

        {/* Spokes */}
        {disciplines.map((d, i) => {
          const p = point(d.angle)
          return (
            <motion.line
              key={`spoke-${d.id}`}
              x1={C}
              y1={C}
              x2={p.x}
              y2={p.y}
              stroke="rgba(245,240,232,0.22)"
              {...draw(0.3 + i * 0.06)}
            />
          )
        })}

        {/* Cross-connections from the active discipline to every other */}
        {disciplines
          .filter((d) => d.id !== active.id)
          .map((d) => {
            const p = point(d.angle)
            return (
              <motion.line
                key={`${active.id}-${d.id}`}
                x1={activePoint.x}
                y1={activePoint.y}
                x2={p.x}
                y2={p.y}
                stroke="#00E5A0"
                strokeWidth={1}
                initial={reduce ? { opacity: 0.55 } : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.55 }}
                transition={{ duration: 0.7, ease: ease.out }}
              />
            )
          })}

        {/* Centre */}
        <circle cx={C} cy={C} r={46} fill="#0A0A0A" stroke="#00E5A0" strokeOpacity={0.6} />
        <text x={C} y={C - 4} textAnchor="middle" className="fill-cream font-display text-[13px] font-semibold tracking-[-0.02em]">
          Creators
        </text>
        <text x={C} y={C + 13} textAnchor="middle" className="fill-cream font-display text-[13px] font-semibold tracking-[-0.02em]">
          Hub
        </text>

        {/* Nodes */}
        {disciplines.map((d) => {
          const p = point(d.angle)
          const label = point(d.angle, R + 44)
          const isActive = d.id === active.id
          return (
            <g key={d.id}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                fill={isActive ? '#00E5A0' : '#1A4A3A'}
                stroke={isActive ? '#00E5A0' : 'rgba(245,240,232,0.5)'}
                animate={{ r: isActive ? 11 : 6 }}
                transition={{ duration: 0.5, ease: ease.out }}
              />
              <text
                x={label.x}
                y={label.y + 4}
                textAnchor="middle"
                className={cn(
                  'font-display text-[19px] transition-[fill] duration-500 md:text-[14px]',
                  isActive ? 'fill-cream' : 'fill-cream/50',
                )}
              >
                {d.name}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="pointer-events-none absolute right-0 bottom-0 h-24 w-36 text-electric/70 md:h-28 md:w-44" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            className="h-full w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: ease.out }}
          >
            <DisciplineGlyph kind={active.id as MediaKind} className="h-full w-full" />
          </motion.div>
        </AnimatePresence>
      </div>
    </figure>
  )
}
