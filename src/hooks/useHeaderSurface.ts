import { useEffect, useState } from 'react'

type Surface = 'dark' | 'light'

/**
 * Tracks the colour surface of whichever section sits under the header,
 * and whether the header should tuck away (scrolling down) or show (scrolling up).
 */
export function useHeaderSurface(probeY = 36) {
  const [surface, setSurface] = useState<Surface>('dark')
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      const sections = document.querySelectorAll<HTMLElement>('[data-surface]')
      for (const el of sections) {
        const r = el.getBoundingClientRect()
        if (r.top <= probeY && r.bottom > probeY) {
          setSurface(el.dataset.surface === 'light' ? 'light' : 'dark')
          break
        }
      }
      const delta = y - lastY
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 240)
        lastY = y
      }
      setScrolled(y > 24)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [probeY])

  return { surface, hidden, scrolled }
}
