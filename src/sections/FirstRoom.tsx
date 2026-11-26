import { useRef } from 'react'
import { firstRoom } from '../content/event'
import { BRAND, firstRoomSection } from '../content/founding'
import { disciplineStories } from '../content/disciplineStories'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { Section } from '../components/layout/Section'
import { ArrowLink } from '../components/ui/ArrowLink'
import { useGsapContext } from '../hooks/useGsapContext'
import { gsap } from '../lib/gsap'

/**
 * Creator’s Hub 001: The First Room — scroll opens a doorway into the event,
 * then its four arms. The arms belong to this event only, not to Creator’s Hub.
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
            {BRAND} {firstRoom.edition}
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
              {firstRoomSection.eyebrow}
            </p>
            <h2 id="first-room-title" className="mt-6 max-w-5xl text-display font-medium">
              <span className="block">{firstRoomSection.title[0]}</span>
              <span className="block text-rust">{firstRoomSection.title[1]}</span>
            </h2>
            <p className="mt-8 max-w-2xl text-lede text-cream/85">{firstRoomSection.body}</p>
          </div>
        </div>
      </div>

      {/* The four arms of the event */}
      <div className="relative bg-[#120d0a] pb-28 pt-4 md:pb-36 md:pt-20">
        <div className="container-edge">
          <Eyebrow className="text-rust">{firstRoomSection.armsLabel}</Eyebrow>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {firstRoomSection.arms.map((arm, i) => {
              const photo = disciplineStories[arm.id].montage[0]
              return (
                <Reveal
                  as="li"
                  key={arm.id}
                  delay={i * 0.07}
                  className="group flex flex-col overflow-hidden rounded-sm border border-cream/12 bg-ink/40 transition-colors duration-500 hover:border-rust/60"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-ink-2">
                    <img
                      src={photo.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                      style={photo.position ? { objectPosition: photo.position } : undefined}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <span className="font-display text-sm tabular-nums text-rust">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-3 font-display text-title font-medium tracking-[-0.02em]">{arm.name}</h3>
                    <p className="mt-3 text-cream/75">{arm.body}</p>
                  </div>
                </Reveal>
              )
            })}
          </ul>

          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:items-end">
            <h3 className="font-display text-headline font-medium md:col-span-8">
              <MaskText lines={[firstRoomSection.after]} />
            </h3>
            <Reveal className="flex flex-col items-start gap-5 md:col-span-4 md:items-end">
              <ArrowLink to={firstRoomSection.cta.to} variant="rust">
                {firstRoomSection.cta.label}
              </ArrowLink>
              <p className="eyebrow text-cream/55">{firstRoomSection.small}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  )
}
