import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { nav } from '../../content/site'
import { firstRoom } from '../../content/event'
import { ease } from '../../lib/motion'
import { cn } from '../../lib/cn'
import { usePrefersLight } from '../../hooks/useMediaQuery'
import { Wordmark } from '../brand/Wordmark'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const light = usePrefersLight()

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const root = document.documentElement
    root.style.overflow = 'hidden'

    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button') ?? [])
    requestAnimationFrame(() => focusables()[0]?.focus())

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return
      const items = focusables()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn('fixed inset-0 z-[60] flex flex-col', light ? 'bg-cream text-ink' : 'bg-forest text-cream')}
          initial={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 2.5rem) 2rem)' }}
          animate={reduce ? { opacity: 1 } : { clipPath: 'circle(150% at calc(100% - 2.5rem) 2rem)' }}
          exit={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 2.5rem) 2rem)' }}
          transition={{ duration: 0.8, ease: ease.inOut }}
        >
          <div className="container-edge flex h-16 items-center justify-between">
            <Link to="/" onClick={onClose} className="text-lg" aria-label="Creators Hub — home">
              <Wordmark on={light ? 'light' : 'dark'} className="h-[1.05em] w-auto" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Mobile" className="container-edge flex flex-1 flex-col justify-center">
            <ul className="space-y-2">
              {nav.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.div
                    initial={reduce ? false : { y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.8, ease: ease.out, delay: 0.25 + i * 0.06 }}
                  >
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className="group flex items-baseline gap-4 py-1 font-display text-[clamp(2.25rem,10vw,3.5rem)] font-medium tracking-[-0.03em]"
                    >
                      <span className={cn('text-sm tabular-nums', light ? 'text-bright' : 'text-electric')}>0{i + 1}</span>
                      <span className="transition-transform duration-500 group-hover:translate-x-2">{item.label}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>

          <div className={cn('container-edge pb-10 text-sm', light ? 'text-ink/65' : 'text-cream/70')}>
            {firstRoom.fullName} — {firstRoom.dateLabel}, {firstRoom.city}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
