import { useRef } from 'react'
import { firstRoom, firstRoomDetails } from '../content/event'
import { Section } from '../components/layout/Section'
import { ArrowLink } from '../components/ui/ArrowLink'
import { Placeholder } from '../components/ui/Placeholder'
import { useGsapContext } from '../hooks/useGsapContext'
import { gsap } from '../lib/gsap'

/**
 * The First Room — scroll opens a doorway into the event.
 *
 * Desktop with motion: the section pins and a narrow door of light widens
 * into the full room. Mobile and reduced motion: the room is simply open.
 */
export function FirstRoom() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, () => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-room-stage]',
          start: 'top top',
          end: '+=140%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      })
      tl.fromTo(
        '[data-room]',
        { clipPath: 'inset(24% 43% 24% 43% round 999px 999px 0 0)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0 0)', ease: 'power2.inOut', duration: 1 },
      )
        .to('[data-door-left]', { xPercent: -40, opacity: 0, ease: 'power2.in', duration: 0.6 }, 0)
        .to('[data-door-right]', { xPercent: 40, opacity: 0, ease: 'power2.in', duration: 0.6 }, 0)
        .fromTo('[data-room-num]', { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8 }, 0.2)
        .fromTo('[data-room-content] > *', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.5 }, 0.55)
    })
  })

  return (
    <Section ref={ref} id="the-first-room" surface="dark" aria-labelledby="first-room-title">
      <div data-room-stage className="relative min-h-[100svh] overflow-hidden bg-ink md:h-[100svh]">
        {/* Outside the door */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-between px-[6vw] md:flex" aria-hidden="true">
          <span data-door-left className="font-display text-headline font-medium text-cream/80">
            Creators Hub {firstRoom.edition}
          </span>
          <span data-door-right className="font-display text-headline font-medium text-cream/80">
            {firstRoom.name}
          </span>
        </div>

        {/* The room */}
        <div data-room className="relative flex min-h-[100svh] flex-col bg-[#120d0a] md:absolute md:inset-0">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 50% at 75% 20%, rgba(196,98,45,0.35), transparent 70%), radial-gradient(50% 50% at 10% 90%, rgba(0,229,160,0.12), transparent 70%)',
            }}
          />
          <span
            data-room-num
            aria-hidden="true"
            className="pointer-events-none absolute -right-[2vw] -bottom-[6vw] select-none font-display text-[38vw] font-semibold leading-none tracking-[-0.06em] text-transparent md:-bottom-[4vw] md:text-[30vw]"
            style={{ WebkitTextStroke: '1px rgba(196,98,45,0.45)' }}
          >
            {firstRoom.edition}
          </span>

          <div data-room-content className="container-edge relative flex flex-1 flex-col justify-center py-24 md:py-20">
            <p className="eyebrow flex items-center gap-3 text-rust">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-rust" />
              The inaugural Creators Hub event
            </p>
            <h2 id="first-room-title" className="mt-6 max-w-4xl text-display font-medium">
              <span className="block text-cream/60 text-title tracking-[-0.02em]">Creators Hub {firstRoom.edition}:</span>
              {firstRoom.name}
            </h2>
            <p className="mt-6 max-w-xl text-lede text-cream/80">{firstRoom.direction}</p>

            <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-cream/15 pt-8 md:grid-cols-4">
              {firstRoomDetails.map((d) => (
                <div key={d.label}>
                  <dt className="eyebrow text-[0.6875rem] text-cream/50">{d.label}</dt>
                  <dd className="mt-2 font-display text-lg">{d.value ?? <Placeholder className="mt-1" />}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ArrowLink to="/tickets" variant="rust">
                Get tickets
              </ArrowLink>
              <ArrowLink to="/the-first-room" variant="text">
                Explore The First Room
              </ArrowLink>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
