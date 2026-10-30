import { useRef } from 'react'
import { manifesto } from '../content/site'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { useGsapContext } from '../hooks/useGsapContext'
import { gsap } from '../lib/gsap'

/**
 * Words brighten one by one as the reader scrolls — reading pace, not a show.
 * Without motion (or JS) the text is simply fully visible.
 */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-manifesto-paragraph]').forEach((p) => {
        gsap.fromTo(
          p.querySelectorAll('[data-word]'),
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: p, start: 'top 78%', end: 'bottom 48%', scrub: 0.6 },
          },
        )
      })
    })
  })

  return (
    <Section ref={ref} id="manifesto" surface="light" aria-labelledby="manifesto-title" className="py-28 md:py-44">
      <div className="container-edge grid gap-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <Eyebrow className="text-bright md:sticky md:top-28">
            <span id="manifesto-title">{manifesto.eyebrow}</span>
          </Eyebrow>
        </div>
        <div className="space-y-10 md:col-span-9">
          {manifesto.paragraphs.map((paragraph, i) => (
            <p
              key={i}
              data-manifesto-paragraph
              className={
                i === 0
                  ? 'font-display text-headline font-medium'
                  : 'font-display text-title font-normal text-ink/90 md:max-w-[80%] md:pl-[12%]'
              }
            >
              {paragraph.split(' ').map((word, j) => (
                <span key={j} data-word className="inline">
                  {word}{' '}
                </span>
              ))}
            </p>
          ))}
          <p className="flex items-center gap-4 pt-6 md:pl-[12%]">
            <span aria-hidden="true" className="h-px w-16 bg-rust" />
            <span className="eyebrow text-ink/70">{manifesto.signature}</span>
          </p>
        </div>
      </div>
    </Section>
  )
}
