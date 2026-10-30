import { useEffect, useRef } from 'react'

/**
 * Values the intro timeline tweens. The canvas reads them every frame,
 * so GSAP stays the single source of timing.
 */
export type FieldState = {
  /** Core point of light, 0–1. */
  spark: number
  /** Ambient illumination around the spark, 0–1. */
  glow: number
  /** Particle visibility, 0–1. */
  particles: number
  /** Orbital flow speed multiplier, 0–1. */
  flow: number
  /** Pull towards the centre, 0–1. */
  converge: number
  /** Bloom at the moment of convergence, 0–1. */
  flash: number
}

export const createFieldState = (): FieldState => ({
  spark: 0,
  glow: 0,
  particles: 0,
  flow: 0,
  converge: 0,
  flash: 0,
})

type Particle = {
  angle: number
  radius: number
  depth: number
  speed: number
  size: number
  hue: 0 | 1 | 2
}

const COLOURS = ['0, 229, 160', '245, 240, 232', '45, 122, 95'] as const

type ParticleFieldProps = {
  state: React.RefObject<FieldState>
  count: number
  /** Disable continuous motion (reduced-motion replay). */
  still?: boolean
}

export function ParticleField({ state, count, still = false }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = Array.from({ length: count }, () => {
      const depth = 0.2 + Math.random() * 0.8
      return {
        angle: Math.random() * Math.PI * 2,
        radius: 0.08 + Math.pow(Math.random(), 0.7) * 0.62,
        depth,
        speed: (0.04 + Math.random() * 0.1) * (Math.random() < 0.5 ? -1 : 1),
        size: 0.4 + depth * 1.6,
        hue: (Math.random() < 0.7 ? 0 : Math.random() < 0.6 ? 1 : 2) as Particle['hue'],
      }
    })

    let last = performance.now()
    const start = last

    const draw = (now: number) => {
      const s = state.current
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const t = (now - start) / 1000
      const cx = width / 2
      const cy = height / 2
      const span = Math.max(width, height)

      ctx.clearRect(0, 0, width, height)

      // Ambient illumination.
      if (s.glow > 0.001) {
        const r = span * (0.15 + s.glow * 0.55)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        g.addColorStop(0, `rgba(0, 229, 160, ${0.22 * s.glow})`)
        g.addColorStop(0.35, `rgba(26, 74, 58, ${0.28 * s.glow})`)
        g.addColorStop(1, 'rgba(10, 10, 10, 0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, width, height)
      }

      // Particles: orbit with depth, then converge on the centre.
      if (s.particles > 0.001) {
        const pull = 1 - easeInCubic(s.converge)
        for (const p of particles) {
          if (!still) p.angle += p.speed * dt * (0.4 + s.flow * 3.2) * (1.4 - p.depth * 0.6)
          const wobble = still ? 0 : Math.sin(t * 0.8 + p.angle * 3) * 0.015 * s.flow
          const r = (p.radius + wobble) * span * 0.62 * pull
          const x = cx + Math.cos(p.angle) * r
          const y = cy + Math.sin(p.angle) * r * 0.62
          const alpha = s.particles * (0.25 + p.depth * 0.75)
          ctx.fillStyle = `rgba(${COLOURS[p.hue]}, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, p.size * (1 + s.converge * 0.4), 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // The spark.
      if (s.spark > 0.001) {
        const pulse = still ? 1 : 1 + Math.sin(t * 5.2) * 0.22
        const core = 2.2 * s.spark * pulse
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 36 * s.spark * pulse)
        halo.addColorStop(0, `rgba(0, 229, 160, ${0.85 * s.spark})`)
        halo.addColorStop(1, 'rgba(0, 229, 160, 0)')
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(cx, cy, 36 * s.spark * pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(245, 240, 232, ${s.spark})`
        ctx.beginPath()
        ctx.arc(cx, cy, core, 0, Math.PI * 2)
        ctx.fill()
      }

      // Convergence bloom.
      if (s.flash > 0.001) {
        const r = span * 0.6 * s.flash
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        g.addColorStop(0, `rgba(0, 229, 160, ${0.55 * (1 - s.flash * 0.6)})`)
        g.addColorStop(1, 'rgba(0, 229, 160, 0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, width, height)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [state, count, still])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}

function easeInCubic(x: number) {
  return x * x * x
}
