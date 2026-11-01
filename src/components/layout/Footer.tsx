import { Link } from 'react-router'
import { RotateCcw } from 'lucide-react'
import { nav, contact } from '../../content/site'
import { firstRoom } from '../../content/event'
import { Wordmark } from '../brand/Wordmark'
import { Placeholder } from '../ui/Placeholder'
import { useIntro } from '../intro/IntroContext'

export function Footer() {
  const { play } = useIntro()

  return (
    <footer data-surface="dark" className="relative overflow-hidden bg-ink pt-24 pb-10 text-cream">
      <div className="container-edge">
        <div className="grid gap-12 border-t hairline pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-silver">Next</p>
            <Link to="/the-first-room" className="group mt-4 block">
              <span className="font-display text-title font-medium">{firstRoom.fullName}</span>
              <span className="mt-2 block text-silver">
                {firstRoom.dateLabel} · {firstRoom.city}, {firstRoom.country}
              </span>
            </Link>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className="eyebrow text-silver">Explore</p>
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
            <p className="eyebrow text-silver">Elsewhere</p>
            <ul className="mt-4 space-y-3">
              {contact.socials.map((s) => (
                <li key={s.label} className="flex items-center gap-3">
                  {s.href ? (
                    <a href={s.href} className="link-draw" rel="noopener noreferrer" target="_blank">
                      {s.label}
                    </a>
                  ) : (
                    <>
                      <span>{s.label}</span>
                      <Placeholder>Handle to be confirmed</Placeholder>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 select-none text-mega text-cream/95" aria-hidden="true">
          <Wordmark stacked className="sm:hidden" />
          <Wordmark className="hidden sm:inline-flex" />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t hairline pt-6 text-sm text-silver sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Creators Hub. All rights reserved.</p>
          <span className="flex items-center gap-6">
          <Link to="/staff" className="link-draw hover:text-cream">
            Staff
          </Link>
          <button type="button" onClick={play} className="group inline-flex items-center gap-2 self-start hover:text-cream">
            <RotateCcw className="h-4 w-4 transition-transform duration-700 group-hover:-rotate-[360deg]" aria-hidden="true" />
            <span className="link-draw">Replay intro</span>
          </button>
          </span>
        </div>
      </div>
    </footer>
  )
}
