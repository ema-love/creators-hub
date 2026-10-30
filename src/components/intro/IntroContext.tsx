import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type IntroStatus = 'playing' | 'done'

type IntroContextValue = {
  status: IntroStatus
  /** Increments on every play so the sequence remounts cleanly on replay. */
  runId: number
  play: () => void
  finish: () => void
}

const IntroContext = createContext<IntroContextValue | null>(null)

const SEEN_KEY = 'ch:intro-seen'

function shouldAutoplay(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  // Allow ?intro to force it during review.
  if (new URLSearchParams(window.location.search).has('intro')) return true
  // Only on the homepage, and only once per browser session.
  if (window.location.pathname !== '/' || window.location.hash) return false
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<IntroStatus>(() => (shouldAutoplay() ? 'playing' : 'done'))
  const [runId, setRunId] = useState(0)

  const play = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setRunId((n) => n + 1)
    setStatus('playing')
  }, [])

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* storage unavailable: intro simply may replay next visit */
    }
    setStatus('done')
  }, [])

  useEffect(() => {
    document.documentElement.dataset.intro = status
  }, [status])

  const value = useMemo(() => ({ status, runId, play, finish }), [status, runId, play, finish])
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}

export function useIntro() {
  const ctx = useContext(IntroContext)
  if (!ctx) throw new Error('useIntro must be used inside <IntroProvider>')
  return ctx
}
