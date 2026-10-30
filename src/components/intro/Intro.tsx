import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { SkipForward, Volume2, VolumeX } from 'lucide-react'
import { montage } from '../../content/media'
import { gsap } from '../../lib/gsap'
import { useIsMobile, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { useIntro } from './IntroContext'
import { createFieldState, ParticleField, type FieldState } from './ParticleField'
import { IntroSound } from './introSound'
import { MontageLayer, PossibilityLayer, RevealLayer } from './scenes'

/** Mobile plays the same story in roughly 7 seconds with fewer particles. */
const MOBILE_TIME_SCALE = 1.7

/**
 * Cinematic opening — five scenes on one GSAP timeline (~12s desktop).
 *
 *   0–2s   Spark        a point of light pulses; atmosphere and particles arrive
 *   2–4s   Possibility  light becomes ribbons, dimensional planes, brief words
 *   4–7s   Creators     fashion, technology, film & storytelling, arts & design
 *   7–9s   Convergence  the montage gathers into a grid and collapses into the light
 *   9–12s  Reveal       wordmark, then a hand-off to the homepage
 *
 * The site is already rendered underneath. Skip (button or Escape) is always
 * available, and the sequence never autoplays for reduced-motion users.
 */
export function Intro() {
  const { finish, runId } = useIntro()
  const isMobile = useIsMobile()
  const reduce = usePrefersReducedMotion()

  // Freeze the configuration for this run so a resize mid-play does not rebuild it.
  const [config] = useState(() => ({ isMobile, reduce }))
  const frames = montage

  const rootRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const field = useRef<FieldState>(createFieldState())
  const sound = useRef<IntroSound | null>(null)
  const [soundOn, setSoundOn] = useState(false)

  // Keyboard: Escape skips. Focus starts on Skip so it is one keypress away.
  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [finish])

  useEffect(() => () => sound.current?.disable(), [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const state = field.current
    Object.assign(state, createFieldState())

    let tl: gsap.core.Timeline | undefined
    const ctx = gsap.context(() => {
      // Initial states are set here, not with utility classes, so GSAP owns every transform.
      gsap.set('.i-word', { yPercent: 110 })
      gsap.set('.wm-char', { yPercent: 115 })
      gsap.set('.i-line', { scaleX: 0 })
      tl = config.reduce ? buildReducedTimeline(state) : buildTimeline(state, frames.length, sound)
      if (config.isMobile && !config.reduce) tl.timeScale(MOBILE_TIME_SCALE)
      tl.eventCallback('onUpdate', () => {
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${tl?.progress() ?? 0})`
      })
      tl.eventCallback('onComplete', finish)
    }, root)

    // Safety net: if anything stalls, never hold the visitor here.
    const fallback = window.setTimeout(finish, ((tl?.totalDuration() ?? 12) / (tl?.timeScale() ?? 1)) * 1000 + 4000)

    return () => {
      window.clearTimeout(fallback)
      ctx.revert()
    }
  }, [config, frames.length, finish, runId])

  const toggleSound = () => {
    if (!sound.current) sound.current = new IntroSound()
    if (sound.current.enabled) {
      sound.current.disable()
      setSoundOn(false)
    } else {
      sound.current.enable()
      setSoundOn(true)
    }
  }

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Creators Hub introduction"
      className="fixed inset-0 z-[80] overflow-hidden bg-ink text-cream grain"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <ParticleField state={field} count={config.isMobile ? 70 : 170} still={config.reduce} />
      <PossibilityLayer />
      <MontageLayer frames={frames} />
      <RevealLayer />

      <p className="sr-only" aria-live="polite">
        Introduction playing. Press Escape or use the Skip intro button to go straight to the site.
      </p>

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 md:p-6">
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2.5 text-sm text-cream/80 transition-colors hover:border-cream/60 hover:text-cream"
        >
          {soundOn ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          <span>Sound {soundOn ? 'on' : 'off'}</span>
        </button>
        <button
          ref={skipRef}
          type="button"
          onClick={finish}
          className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 font-display text-sm font-medium text-ink transition-colors hover:bg-electric"
        >
          <span>Skip intro</span>
          <SkipForward className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <span
        ref={progressRef}
        aria-hidden="true"
        className="absolute bottom-0 left-0 z-10 h-[2px] w-full origin-left bg-electric/80"
        style={{ transform: 'scaleX(0)' }}
      />
    </motion.div>
  )
}

function buildTimeline(state: FieldState, frameCount: number, sound: React.RefObject<IntroSound | null>) {
  const cue = (kind: Parameters<IntroSound['cue']>[0]) => () => sound.current?.cue(kind)
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

  // ——— Scene 1: The Spark (0–2s) ———
  tl.addLabel('spark', 0.25)
    .call(cue('spark'), [], 'spark')
    .to(state, { spark: 1, duration: 1.1 }, 'spark')
    .to(state, { glow: 0.55, duration: 1.8, ease: 'sine.inOut' }, 'spark+=0.4')
    .to(state, { particles: 0.75, flow: 0.25, duration: 1.4, ease: 'power2.out' }, 'spark+=0.8')

  // ——— Scene 2: Possibility (2–4s) ———
  tl.addLabel('possibility', 2)
    .set('.i-possibility', { opacity: 1 }, 'possibility')
    .to(state, { flow: 1, glow: 0.8, duration: 2, ease: 'sine.inOut' }, 'possibility')
    .to('.i-ribbon', { strokeDashoffset: 0, duration: 1.6, stagger: 0.12, ease: 'power3.inOut' }, 'possibility')
    .fromTo(
      '.i-plane',
      { opacity: 0, scale: 0.55, rotateX: 55, rotateY: -35, z: -200 },
      { opacity: 1, scale: 1, rotateX: 18, rotateY: 24, z: 0, duration: 1.6, stagger: 0.14, ease: 'power3.out' },
      'possibility+=0.1',
    )
    .to('.i-plane', { rotateZ: (i) => (i - 1) * 14, rotateY: -12, duration: 1.4, ease: 'sine.inOut' }, 'possibility+=1.2')

  gsap.utils.toArray<HTMLElement>('.i-word').forEach((word, i) => {
    // Each word fully exits before the next arrives.
    const at = 2.2 + i * 0.55
    tl.to(word, { yPercent: 0, duration: 0.3, ease: 'power3.out' }, at).to(
      word,
      { yPercent: -110, duration: 0.2, ease: 'power3.in' },
      at + 0.33,
    )
  })

  tl.to('.i-possibility', { opacity: 0, scale: 1.12, duration: 0.6, ease: 'power2.in' }, 'possibility+=1.7')
    .to(state, { spark: 0.35, glow: 0.3, particles: 0.35, duration: 0.6 }, 'possibility+=1.7')

  // ——— Scene 3: The Creators (4–7s) ———
  const step = 3 / frameCount
  tl.addLabel('creators', 4).set('.i-montage', { opacity: 1 }, 'creators')
  gsap.utils.toArray<HTMLElement>('.i-frame').forEach((frame, i) => {
    const at = 4 + i * step
    const media = frame.querySelector('.i-frame-media')
    tl.call(cue('cut'), [], at)
      .to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: Math.min(0.55, step * 0.9), ease: 'power4.inOut' }, at)
      .fromTo(media, { scale: 1.06 }, { scale: 1, duration: step + 0.6, ease: 'power2.out' }, at)
  })

  // ——— Scene 4: Convergence (7–9s) ———
  const cols = frameCount > 4 ? 3 : 2
  const rows = Math.ceil(frameCount / cols)
  tl.addLabel('converge', 7)
    .to(
      '.i-frame',
      {
        xPercent: (i) => ((i % cols) - (cols - 1) / 2) * 34,
        yPercent: (i) => (Math.floor(i / cols) - (rows - 1) / 2) * 36,
        scale: 0.31,
        duration: 0.85,
        stagger: 0.03,
        ease: 'power4.inOut',
      },
      'converge',
    )
    .to(state, { particles: 1, glow: 0.9, spark: 0.8, duration: 0.8 }, 'converge')
    .to(
      '.i-frame',
      {
        xPercent: 0,
        yPercent: 0,
        scale: 0.02,
        rotation: (i) => (i % 2 ? 9 : -9),
        opacity: 0,
        duration: 0.8,
        stagger: 0.035,
        ease: 'power3.in',
      },
      'converge+=0.95',
    )
    .to(state, { converge: 1, flow: 1.6, duration: 1.05, ease: 'power2.in' }, 'converge+=0.85')
    .to(state, { flash: 1, duration: 0.9, ease: 'expo.out' }, 'converge+=1.85')
    .to(state, { spark: 0, particles: 0, glow: 0.45, duration: 0.5 }, 'converge+=1.9')

  // ——— Scene 5: Brand reveal (9–12s) ———
  tl.addLabel('reveal', 9)
    .call(cue('reveal'), [], 'reveal')
    .to('.wm-char', { yPercent: 0, duration: 1.2, stagger: 0.035 }, 'reveal')
    .to(state, { flash: 0, duration: 1.2, ease: 'power2.out' }, 'reveal')
    .to('.i-line', { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 'reveal+=0.35')
    .to('.i-meta', { opacity: 1, duration: 0.8 }, 'reveal+=0.9')
    .to('.i-reveal-inner', { y: -24, opacity: 0, duration: 0.7, ease: 'power3.in' }, 'reveal+=2.4')
    .to(state, { glow: 0, duration: 0.7 }, 'reveal+=2.4')

  return tl
}

/** Reduced motion: no travel, no orbiting — gentle cross-fades only (~5s). */
function buildReducedTimeline(state: FieldState) {
  const tl = gsap.timeline({ defaults: { ease: 'sine.inOut' } })
  gsap.set('.i-reveal-inner', { opacity: 0 })
  gsap.set('.i-frame', { clipPath: 'inset(0% 0% 0% 0%)', opacity: 0 })
  tl.to(state, { spark: 1, glow: 0.5, particles: 0.5, duration: 0.6 })
    .set('.i-montage', { opacity: 1 })
    .to(state, { spark: 0, particles: 0.2, duration: 0.4 })
    .to('.i-frame', { opacity: 1, duration: 0.3, stagger: 0.35 }, '<')
    .to('.i-montage', { opacity: 0, duration: 0.4 }, '+=0.3')
    .set('.wm-char', { yPercent: 0 })
    .set('.i-line', { scaleX: 1 })
    .to('.i-reveal-inner', { opacity: 1, duration: 0.5 })
    .to('.i-meta', { opacity: 1, duration: 0.3 }, '<')
    .to('.i-reveal-inner', { opacity: 0, duration: 0.4 }, '+=1')
  return tl
}
