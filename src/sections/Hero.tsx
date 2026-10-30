import { useRef } from 'react'
import { Link } from 'react-router'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowDown, RotateCcw } from 'lucide-react'
import { hero } from '../content/site'
import { firstRoom } from '../content/event'
import { useIntro } from '../components/intro/IntroContext'
import { MaskText } from '../components/ui/MaskText'
import { ArrowLink } from '../components/ui/ArrowLink'
import { Section } from '../components/layout/Section'
import { useFinePointer } from '../hooks/useMediaQuery'
import { daysUntil } from '../lib/date'
import { ease } from '../lib/motion'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { status, play } = useIntro()
  const ready = status === 'done'
  const reduce = useReducedMotion()
  const finePointer = useFinePointer()

  // Gentle scroll-away: the headline drifts up and dims as the manifesto arrives.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%'])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15])

  // Ambient light that follows the pointer (fine pointers only).
  const px = useMotionValue(0.7)
  const py = useMotionValue(0.35)
  const sx = useSpring(px, { stiffness: 40, damping: 20 })
  const sy = useSpring(py, { stiffness: 40, damping: 20 })
  // The wrapper is the size of the hero, so translating it by a percentage of
  // itself moves the light across the hero using transforms only.
  const lightX = useTransform(sx, (v) => `${(v - 0.5) * 100}%`)
  const lightY = useTransform(sy, (v) => `${(v - 0.5) * 100}%`)

  const onPointerMove = (e: React.PointerEvent) => {
    if (!finePointer || reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }

  const days = daysUntil(firstRoom.dateISO)

  return (
    <Section
      ref={ref}
      surface="dark"
      aria-labelledby="hero-title"
      className="grain flex min-h-[100svh] flex-col overflow-hidden"
      onPointerMove={onPointerMove}
    >
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center" style={{ x: lightX, y: lightY }}>
        <div
          className="h-[70vmax] w-[70vmax] shrink-0 rounded-full opacity-60"
          style={{ background: 'radial-gradient(closest-side, rgba(26,74,58,0.55), rgba(26,74,58,0) 70%)' }}
        />
      </motion.div>

      <motion.div style={{ y, opacity }} className="container-edge relative flex flex-1 flex-col pt-28 md:pt-36">
        <motion.p
          className="eyebrow max-w-xs text-silver md:max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1, ease: ease.out, delay: 0.1 }}
        >
          {hero.eyebrow}
        </motion.p>

        <h1 id="hero-title" className="mt-8 text-display font-medium md:mt-12">
          <span className="sr-only">Creators Hub — </span>
          <MaskText
            inView={false}
            play={ready}
            delay={0.15}
            lines={hero.headline}
            className="[&>span:nth-child(2)]:pl-[8vw] [&>span:nth-child(3)]:pl-[3vw] [&>span:nth-child(4)]:pl-[14vw] [&>span:nth-child(4)]:text-electric"
          />
        </h1>

        <div className="mt-auto grid gap-10 pb-10 pt-16 md:grid-cols-12 md:items-end md:pb-14">
          <motion.p
            className="text-lede text-cream/80 md:col-span-6 lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1, ease: ease.out, delay: 0.6 }}
          >
            {hero.statement}
          </motion.p>

          <motion.div
            className="flex flex-col gap-6 md:col-span-6 md:items-end lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1, ease: ease.out, delay: 0.75 }}
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <ArrowLink to="/the-first-room">Enter The First Room</ArrowLink>
              <ArrowLink to="/#manifesto" variant="text">
                Read the manifesto
              </ArrowLink>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="relative z-10 border-t hairline bg-ink">
        <div className="container-edge flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-5 text-sm">
          <Link to="/the-first-room" className="group flex items-center gap-3">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rust opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rust" />
            </span>
            <span className="link-draw">
              {firstRoom.fullName} · {firstRoom.dateLabel} · {firstRoom.city}
            </span>
            {days > 0 && <span className="hidden text-silver tabular-nums md:inline">— {days} days</span>}
          </Link>
          <div className="flex items-center gap-6 text-silver">
            <button type="button" onClick={play} className="group inline-flex items-center gap-2 hover:text-cream">
              <RotateCcw className="h-4 w-4 transition-transform duration-700 group-hover:-rotate-[360deg]" aria-hidden="true" />
              <span className="link-draw">Replay intro</span>
            </button>
            <a href="#manifesto" className="hidden items-center gap-2 hover:text-cream sm:inline-flex">
              <span>Scroll</span>
              <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </Section>
  )
}
