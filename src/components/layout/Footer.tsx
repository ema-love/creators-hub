import { Link } from 'react-router'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { nav } from '../../content/site'
import { firstRoom } from '../../content/event'
import { Wordmark } from '../brand/Wordmark'
import { useIntro } from '../intro/IntroContext'
import { usePrefersLight } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/cn'

export function Footer() {
  const { play } = useIntro()
  // Light mode on the device: cream footer with the black logo. Dark mode: black footer, white logo.
  const light = usePrefersLight()
  const muted = light ? 'text-ink/55' : 'text-silver'
  const hoverStrong = light ? 'hover:text-ink' : 'hover:text-cream'

  return (
    <footer
      data-surface={light ? 'light' : 'dark'}
      className={cn('relative overflow-hidden pt-24 pb-10', light ? 'bg-cream text-ink' : 'bg-ink text-cream')}
    >
      <div className="container-edge">
        <div className="grid gap-12 border-t hairline pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className={cn('eyebrow', muted)}>Next</p>
            <Link to="/the-first-room" className="group mt-4 block">
              <span className="font-display text-title font-medium">{firstRoom.fullName}</span>
              <span className={cn('mt-2 block', muted)}>
                {firstRoom.dateLabel} · {firstRoom.city}, {firstRoom.country}
              </span>
            </Link>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className={cn('eyebrow', muted)}>Explore</p>
            <ul className="mt-4 space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="link-draw">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className={cn('eyebrow', muted)}>Get in touch</p>
            <Link to="/#contact" className="group mt-4 inline-flex items-center gap-2">
              <span className="link-draw">Send us a message</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-24 select-none" aria-hidden="true">
          <Wordmark on={light ? 'light' : 'dark'} className="h-auto w-full max-w-[68rem]" />
        </div>

        <div className={cn('mt-10 flex flex-col gap-4 border-t hairline pt-6 text-sm sm:flex-row sm:items-center sm:justify-between', muted)}>
          <p>© {new Date().getFullYear()} Creators Hub. All rights reserved.</p>
          <span className="flex items-center gap-6">
          <Link to="/staff" className={cn('link-draw', hoverStrong)}>
            Staff
          </Link>
          <button type="button" onClick={play} className={cn('group inline-flex items-center gap-2 self-start', hoverStrong)}>
            <RotateCcw className="h-4 w-4 transition-transform duration-700 group-hover:-rotate-[360deg]" aria-hidden="true" />
            <span className="link-draw">Replay intro</span>
          </button>
          </span>
        </div>
      </div>
    </footer>
  )
}
