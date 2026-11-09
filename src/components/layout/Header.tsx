import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { motion } from 'motion/react'
import { Menu } from 'lucide-react'
import { nav } from '../../content/site'
import { firstRoom } from '../../content/event'
import { useHeaderSurface } from '../../hooks/useHeaderSurface'
import { usePrefersLight } from '../../hooks/useMediaQuery'
import { ease } from '../../lib/motion'
import { cn } from '../../lib/cn'
import { Wordmark } from '../brand/Wordmark'
import { MobileMenu } from './MobileMenu'

export function Header() {
  const { surface, hidden, scrolled } = useHeaderSurface()
  const [menuOpen, setMenuOpen] = useState(false)
  // Light mode on the device: a cream bar with the black logo. Dark mode: follow the section beneath.
  const systemLight = usePrefersLight()
  const light = systemLight || surface === 'light'
  const { pathname } = useLocation()

  return (
    <>
      <motion.header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
          light ? 'text-ink' : 'text-cream',
        )}
        animate={{ y: hidden && !menuOpen ? '-110%' : '0%' }}
        transition={{ duration: 0.6, ease: ease.out }}
      >
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 -z-10 transition-opacity duration-500',
            light ? (systemLight ? 'bg-cream/95' : 'bg-cream/85') : 'bg-ink/75',
            'backdrop-blur-md',
            scrolled || systemLight ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div className="container-edge flex h-16 items-center justify-between gap-6 md:h-20">
          <Link to="/" className="text-lg md:text-xl" aria-label="Creators Hub — home">
            <Wordmark on={light ? 'light' : 'dark'} className="h-[1.05em] w-auto md:h-[1.1em]" />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8 text-[0.9375rem]">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className="link-draw py-1 opacity-80 transition-opacity hover:opacity-100 aria-[current=page]:bg-[length:100%_1px] aria-[current=page]:opacity-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/tickets"
              className={cn(
                'hidden items-center gap-2.5 rounded-full border px-4 py-2 font-display text-sm transition-colors sm:inline-flex',
                light ? 'border-ink/20 hover:border-ink' : 'border-cream/20 hover:border-cream',
              )}
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-rust" />
              <span>
                Register free · {firstRoom.dateShort}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
