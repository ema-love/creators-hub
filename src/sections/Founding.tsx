import { Fragment, useRef } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { founderLine, howWeWork, manifesto, oath, whoWeAre, type StepId } from '../content/founding'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { useGsapContext } from '../hooks/useGsapContext'
import { gsap } from '../lib/gsap'

/*
 * Creator’s Hub, the organisation: who we are, the manifesto, how we work and
 * the founder’s oath. Words come from src/content/founding.ts.
 */

/** Eyebrow over a two-line title whose second line is green. */
function SectionHead({
  eyebrow,
  title,
  id,
  tone = 'dark',
  className,
}: {
  eyebrow: string
  title: string[]
  id: string
  tone?: 'dark' | 'light'
  className?: string
}) {
  const accent = tone === 'light' ? 'text-bright' : 'text-electric'
  return (
    <div className={className}>
      <Eyebrow className={accent}>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-6 text-headline font-medium">
        <MaskText lines={title.length > 1 ? [title[0], <span key="a" className={accent}>{title[1]}</span>] : title} />
      </h2>
    </div>
  )
}

/** Splits a paragraph into words that brighten as the reader scrolls. */
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

/** Words inside [data-reveal-words] brighten from faint to full as they scroll through. */
function useWordReveal(ref: React.RefObject<HTMLElement | null>) {
  useGsapContext(ref, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal-words]').forEach((p) => {
        gsap.fromTo(
          p.querySelectorAll('[data-word]'),
          { opacity: 0.14 },
          { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 55%', scrub: 0.6 } },
        )
      })
    })
  })
}

/* ───────────── Who we are ───────────── */

export function WhoWeAre() {
  const ref = useRef<HTMLElement>(null)
  useWordReveal(ref)
  return (
    <Section ref={ref} id="about" surface="light" aria-labelledby="about-title" className="scroll-mt-0 py-28 md:py-44">
      <div className="container-edge grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <SectionHead eyebrow={whoWeAre.eyebrow} title={whoWeAre.title} id="about-title" tone="light" className="md:sticky md:top-28" />
        </div>
        <div className="md:col-span-7 md:pt-16">
          <p data-reveal-words className="font-display text-title font-medium leading-[1.2] tracking-[-0.02em] md:text-[clamp(1.6rem,2.6vw,2.4rem)]">
            <Words text={whoWeAre.body} />
          </p>
        </div>
      </div>
    </Section>
  )
}

/* ───────────── The manifesto (#manifesto) ───────────── */

export function Manifesto() {
  const ref = useRef<HTMLElement>(null)
  useWordReveal(ref)
  const last = manifesto.lines.length - 1
  return (
    <Section ref={ref} id="manifesto" surface="dark" aria-labelledby="manifesto-title" className="scroll-mt-0 py-28 md:py-40">
      <div className="container-edge grid gap-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionHead eyebrow={manifesto.eyebrow} title={manifesto.title} id="manifesto-title" className="md:sticky md:top-32" />
        </div>
        <ol className="md:col-span-8">
          {manifesto.lines.map((line, i) => (
            <li key={line} className="grid grid-cols-[2.75rem_1fr] gap-x-3 border-t hairline py-7 last:border-b md:grid-cols-[4.5rem_1fr] md:py-9">
              <span className="pt-2 font-display text-sm tabular-nums text-electric md:pt-3">{String(i + 1).padStart(2, '0')}.</span>
              <p
                data-reveal-words
                className={
                  'font-display text-[clamp(1.5rem,3.4vw,3rem)] font-medium leading-[1.12] tracking-[-0.02em]' + (i === last ? ' text-electric' : '')
                }
              >
                <Words text={line} />
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

/* ───────────── How we work ───────────── */

/** A small mark for each step. */
function StepMark({ id }: { id: StepId }) {
  const c = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-electric" aria-hidden="true">
      {id === 'imagine' && (
        <>
          <circle cx="16" cy="16" r="3" fill="currentColor" />
          <circle cx="16" cy="16" r="9" {...c} strokeDasharray="2 3" />
        </>
      )}
      {id === 'gather' && (
        <>
          <circle cx="10" cy="16" r="5" {...c} />
          <circle cx="22" cy="16" r="5" {...c} />
          <circle cx="16" cy="9" r="5" {...c} />
        </>
      )}
      {id === 'connect' && (
        <>
          <circle cx="8" cy="16" r="4" {...c} />
          <circle cx="24" cy="16" r="4" {...c} />
          <path d="M12 16h8" {...c} />
        </>
      )}
      {id === 'build' && (
        <>
          <rect x="6" y="18" width="20" height="8" {...c} />
          <rect x="10" y="10" width="12" height="8" {...c} />
          <rect x="13" y="4" width="6" height="6" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

export function HowWeWork() {
  return (
    <Section id="how-we-work" surface="forest" aria-labelledby="how-title" className="grain py-28 md:py-40">
      <div className="container-edge">
        <h2 id="how-title" className="text-headline font-medium">
          <MaskText lines={[howWeWork.eyebrow]} />
        </h2>

        <ol className="mt-16 flex flex-col items-stretch gap-3 md:mt-20 lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-4">
          {howWeWork.steps.map((s, i) => (
            <Fragment key={s.id}>
              <Reveal
                as="li"
                delay={i * 0.08}
                className="group relative flex flex-col overflow-hidden rounded-sm border border-cream/12 bg-ink/25 p-7 transition-colors duration-500 hover:border-electric/50 md:p-8"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left scale-x-[0.25] bg-electric transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                <div className="flex items-center justify-between">
                  <StepMark id={s.id} />
                  <span className="font-display text-sm tabular-nums text-cream/40">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-10 font-display text-title font-medium tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-3 text-cream/75">{s.body}</p>
              </Reveal>
              {i < howWeWork.steps.length - 1 && (
                <li aria-hidden="true" className="grid place-items-center py-1 text-electric/80 lg:py-0">
                  <ArrowDown className="h-5 w-5 lg:hidden" />
                  <ArrowRight className="hidden h-6 w-6 lg:block" />
                </li>
              )}
            </Fragment>
          ))}
        </ol>
      </div>
    </Section>
  )
}

/* ───────────── The founder's oath (words unchanged) ───────────── */

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
          <p className="mt-8 font-display text-lg text-cream/90 md:text-xl">{founderLine}</p>
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
