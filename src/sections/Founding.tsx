import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { mission, oath, philosophy, pillars, problem, roadmap, type PillarIcon } from '../content/founding'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { useGsapContext } from '../hooks/useGsapContext'
import { gsap } from '../lib/gsap'
import { ease } from '../lib/motion'
import { cn } from '../lib/cn'

/*
 * Creators Hub, the organisation: the six parts of the Founding Document,
 * in its order. Words come from src/content/founding.ts.
 */

/** "01 — Mission & vision" over a two-line title whose last word is green. */
function SectionHead({
  n,
  eyebrow,
  title,
  id,
  tone = 'dark',
  className,
}: {
  n: string
  eyebrow: string
  title: string[]
  id: string
  tone?: 'dark' | 'light'
  className?: string
}) {
  return (
    <div className={className}>
      <Eyebrow className={tone === 'light' ? 'text-bright' : 'text-electric'}>
        <span className="tabular-nums">{n}</span>
        <span aria-hidden="true">—</span>
        {eyebrow}
      </Eyebrow>
      <h2 id={id} className="mt-6 text-headline font-medium">
        <MaskText
          lines={[title[0], <span key="a" className={tone === 'light' ? 'text-bright' : 'text-electric'}>{title[1]}</span>]}
        />
      </h2>
    </div>
  )
}

/** Splits a paragraph into words that brighten as the reader scrolls (see Mission). */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, j) => (
        <span key={j} data-word className="inline">
          {word}{' '}
        </span>
      ))}
    </>
  )
}

/* ───────────── 01 Mission & vision ───────────── */

export function Mission() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal-words]').forEach((p) => {
        gsap.fromTo(
          p.querySelectorAll('[data-word]'),
          { opacity: 0.14 },
          { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 50%', scrub: 0.6 } },
        )
      })
    })
  })

  return (
    <Section ref={ref} id="mission" surface="light" aria-labelledby="mission-title" className="scroll-mt-0 py-28 md:py-44">
      <div className="container-edge grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionHead n={mission.n} eyebrow={mission.eyebrow} title={mission.title} id="mission-title" tone="light" className="md:sticky md:top-28" />
        </div>
        <div className="space-y-16 md:col-span-8">
          <div>
            <p className="eyebrow text-ink/50">Our mission</p>
            <p data-reveal-words className="mt-5 font-display text-title font-medium leading-[1.15] tracking-[-0.02em] md:text-[clamp(1.75rem,3.2vw,3rem)]">
              <Words text={mission.mission} />
            </p>
          </div>
          <div className="md:pl-[12%]">
            <p className="eyebrow text-ink/50">Our vision</p>
            <p data-reveal-words className="mt-5 font-display text-title font-normal text-ink/85">
              <Words text={mission.vision} />
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ───────────── 02 The problem ───────────── */

export function Problem() {
  return (
    <Section id="problem" surface="dark" aria-labelledby="problem-title" className="py-28 md:py-40">
      <div className="container-edge">
        <SectionHead n={problem.n} eyebrow={problem.eyebrow} title={problem.title} id="problem-title" />

        <ol className="mt-16 grid gap-px overflow-hidden rounded-sm bg-cream/10 md:mt-20 md:grid-cols-2">
          {problem.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={(i % 2) * 0.06} className="group relative overflow-hidden bg-ink p-8 md:p-12">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[8rem] font-semibold leading-none text-transparent transition-colors duration-700 md:text-[10rem]"
                style={{ WebkitTextStroke: '1px rgba(245,240,232,0.12)' }}
              >
                {i + 1}
              </span>
              <h3 className="eyebrow relative text-electric">{item.title}</h3>
              <p className="relative mt-5 max-w-md text-lg leading-relaxed text-cream/75">{item.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  )
}

/* ───────────── 03 The four pillars ───────────── */

/** Small marks for the four pillars, after the founding document's ◎ ◈ ◇ ◉. */
function PillarMark({ icon }: { icon: PillarIcon }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-electric" aria-hidden="true">
      {icon === 'recognition' && (
        <>
          <circle cx="16" cy="16" r="12" {...common} />
          <circle cx="16" cy="16" r="5" {...common} />
        </>
      )}
      {icon === 'space' && (
        <>
          <path d="M16 3 29 16 16 29 3 16Z" {...common} />
          <path d="M16 10 22 16 16 22 10 16Z" fill="currentColor" />
        </>
      )}
      {icon === 'education' && <path d="M16 3 29 16 16 29 3 16Z" {...common} />}
      {icon === 'guidance' && (
        <>
          <circle cx="16" cy="16" r="12" {...common} />
          <circle cx="16" cy="16" r="6" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

export function Pillars() {
  return (
    <Section id="pillars" surface="forest" aria-labelledby="pillars-title" className="grain py-28 md:py-40">
      <div className="container-edge">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <SectionHead n={pillars.n} eyebrow={pillars.eyebrow} title={pillars.title} id="pillars-title" className="md:col-span-7" />
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {pillars.items.map((p, i) => (
            <Reveal
              as="li"
              key={p.title}
              delay={i * 0.07}
              className="group relative flex flex-col overflow-hidden rounded-sm border border-cream/12 bg-ink/25 p-7 transition-colors duration-500 hover:border-electric/50 md:p-8"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-electric transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100 sm:scale-x-[0.25]" />
              <div className="flex items-center justify-between">
                <PillarMark icon={p.icon} />
                <span className="font-display text-sm tabular-nums text-cream/40">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-12 font-display text-title font-medium tracking-[-0.02em]">{p.title}</h3>
              <p className="mt-3 text-cream/75">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* ───────────── 04 The philosophy ───────────── */

export function Philosophy() {
  const reduce = useReducedMotion()
  return (
    <Section id="philosophy" surface="light" aria-labelledby="philosophy-title" className="py-28 md:py-40">
      <div className="container-edge">
        <SectionHead n={philosophy.n} eyebrow={philosophy.eyebrow} title={philosophy.title} id="philosophy-title" tone="light" />

        <ol className="mt-16 md:mt-20">
          {philosophy.shifts.map((s, i) => (
            <motion.li
              key={s.from}
              className="grid gap-3 border-t border-ink/15 py-7 last:border-b md:grid-cols-[minmax(0,5fr)_3rem_minmax(0,6fr)] md:items-center md:gap-6 md:py-9"
              initial={reduce ? false : 'hide'}
              whileInView="show"
              viewport={{ once: true, margin: '0px 0px -15% 0px' }}
              transition={{ staggerChildren: 0.25, delayChildren: i * 0.04 }}
            >
              <p className="relative w-fit text-lg text-ink/45 md:text-xl">
                <span className="sr-only">Not: </span>“{s.from}”
                <motion.span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-px w-full origin-left bg-rust"
                  variants={{ hide: { scaleX: 0 }, show: { scaleX: 1 } }}
                  transition={{ duration: 0.7, ease: ease.out }}
                />
              </p>
              <motion.span
                aria-hidden="true"
                className="hidden text-bright md:block"
                variants={{ hide: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.5, ease: ease.out }}
              >
                <ArrowRight className="h-6 w-6" />
              </motion.span>
              <motion.p
                className="font-display text-title font-medium tracking-[-0.02em]"
                variants={{ hide: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.7, ease: ease.out }}
              >
                <span className="sr-only">But: </span>
                {s.to}
              </motion.p>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

/* ───────────── 05 The roadmap ───────────── */

export function Roadmap() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] })
  const progress = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0, 1])

  return (
    <Section id="roadmap" surface="dark" aria-labelledby="roadmap-title" className="scroll-mt-0 py-28 md:py-40">
      <div className="container-edge grid gap-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <SectionHead n={roadmap.n} eyebrow={roadmap.eyebrow} title={roadmap.title} id="roadmap-title" />
          </div>
        </div>

        <ol ref={listRef} className="relative md:col-span-7 md:col-start-6">
          {/* The track, and the part already travelled */}
          <span aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-cream/15" />
          <motion.span aria-hidden="true" className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-electric" style={{ scaleY: progress }} />

          {roadmap.phases.map((p, i) => {
            const now = i === 0
            return (
              <Reveal as="li" key={p.phase} className="relative pb-14 pl-12 last:pb-0 md:pb-16 md:pl-16">
                <span aria-hidden="true" className="absolute left-0 top-1 grid h-[15px] w-[15px] place-items-center">
                  {now && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-electric opacity-50" />}
                  <span className={cn('relative h-[15px] w-[15px] rounded-full border-2', now ? 'border-electric bg-electric' : 'border-electric/70 bg-ink')} />
                </span>
                <p className="eyebrow flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-electric">
                  <span>{p.phase}</span>
                  <span aria-hidden="true">·</span>
                  <span>{p.when}</span>
                  <span aria-hidden="true">·</span>
                  <span>{p.where}</span>
                  {now && <span className="ml-1 rounded-full bg-electric px-2 py-0.5 text-ink">We are here</span>}
                </p>
                <h3 className="mt-4 font-display text-title font-medium tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-3 max-w-xl text-cream/70">{p.body}</p>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}

/* ───────────── 06 The founder's oath ───────────── */

export function Oath() {
  return (
    <Section id="oath" surface="forest" aria-labelledby="oath-title" className="grain overflow-hidden py-28 md:py-44">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(50% 60% at 50% 0%, rgba(0,229,160,0.12), transparent 70%)' }}
      />
      <div className="container-edge relative mx-auto max-w-5xl text-center">
        <Eyebrow className="justify-center text-electric">
          <span className="tabular-nums">{oath.n}</span>
          <span aria-hidden="true">—</span>
          <span id="oath-title">{oath.eyebrow}</span>
        </Eyebrow>
        <Reveal>
          <blockquote className="mt-10 font-display text-[clamp(1.5rem,3.4vw,2.75rem)] font-medium leading-[1.25] tracking-[-0.02em]">
            <p>
              {oath.before} <span className="text-electric">{oath.highlight}</span> {oath.after}
            </p>
          </blockquote>
        </Reveal>
        <p className="mt-12 flex items-center justify-center gap-4">
          <span aria-hidden="true" className="h-px w-12 bg-electric/60" />
          <span className="eyebrow text-cream/70">{oath.signature}</span>
          <span aria-hidden="true" className="h-px w-12 bg-electric/60" />
        </p>
      </div>
    </Section>
  )
}
