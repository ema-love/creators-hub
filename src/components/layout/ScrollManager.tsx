import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { ScrollTrigger } from '../../lib/gsap'

/**
 * Scrolls to the hash target on navigation, or to the top for new pages.
 * Pinned ScrollTrigger sections change the page height, so triggers are
 * refreshed before measuring. Same-page hash links glide; arrivals from
 * another page (or a fresh load) jump straight to the target.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    const samePage = lastPath.current === pathname
    lastPath.current = pathname

    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      if (!hash) {
        if (!samePage) window.scrollTo({ top: 0, behavior: 'instant' })
        return
      }
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      target?.scrollIntoView({ behavior: samePage ? 'smooth' : 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  // Web fonts change text metrics; re-measure scroll positions once they land.
  useEffect(() => {
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return null
}
