import { useEffect, useState } from 'react'

let ctx: CanvasRenderingContext2D | null = null

/** Text width in px for an SVG <text> with the given font and letter-spacing (em). */
export function measureText(text: string, family: string, weight: number, size: number, trackingEm = 0) {
  ctx ??= document.createElement('canvas').getContext('2d')
  if (!ctx) return text.length * size * 0.55
  ctx.font = `${weight} ${size}px "${family}"`
  return ctx.measureText(text).width + trackingEm * size * Math.max(0, text.length - 1)
}

/** Re-renders once web fonts have loaded, so measurements use the real fonts. */
export function useFontsReady() {
  const [, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    const bump = () => alive && setTick((n) => n + 1)
    void document.fonts?.ready.then(bump)
    document.fonts?.addEventListener('loadingdone', bump)
    return () => {
      alive = false
      document.fonts?.removeEventListener('loadingdone', bump)
    }
  }, [])
}

/** Largest font size (up to `base`, down to `min`) at which the text fits `maxWidth`. */
export function fitFontSize(text: string, family: string, weight: number, base: number, maxWidth: number, min: number, trackingEm = 0) {
  const width = measureText(text, family, weight, base, trackingEm)
  return width <= maxWidth ? base : Math.max(min, (base * maxWidth) / width)
}
