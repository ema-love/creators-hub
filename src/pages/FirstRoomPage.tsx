import { CalendarPlus } from 'lucide-react'
import { firstRoom, firstRoomDetails } from '../content/event'
import { Section } from '../components/layout/Section'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { ArrowLink } from '../components/ui/ArrowLink'
import { Placeholder } from '../components/ui/Placeholder'
import { Eyebrow } from '../components/ui/Eyebrow'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { firstRoomCalendarHref } from '../lib/calendar'
import { daysUntil } from '../lib/date'

export default function FirstRoomPage() {
  useDocumentTitle(firstRoom.fullName)
  const days = daysUntil(firstRoom.dateISO)

  return (
    <>
      <Section surface="dark" aria-labelledby="event-title" className="grain overflow-hidden bg-[#120d0a] pt-36 pb-20 md:pt-44">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'radial-gradient(55% 60% at 80% 10%, rgba(196,98,45,0.35), transparent 70%)' }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-[3vw] top-24 select-none font-display text-[42vw] font-semibold leading-[0.8] tracking-[-0.06em] text-transparent md:text-[32vw]"
          style={{ WebkitTextStroke: '1px rgba(196,98,45,0.4)' }}
        >
          {firstRoom.edition}
        </span>

        <div className="container-edge relative">
          <Eyebrow className="text-rust">Creators Hub {firstRoom.edition} · The inaugural event</Eyebrow>
          <h1 id="event-title" className="mt-8 text-mega font-medium">
            <MaskText inView={false} lines={['The First', 'Room']} className="[&>span:nth-child(2)]:pl-[10vw]" />
          </h1>

          <div className="mt-16 grid gap-10 md:grid-cols-12 md:items-end">
            <Reveal className="md:col-span-6">
              <p className="text-lede text-cream/85">{firstRoom.direction}</p>
              <p className="mt-4 text-cream/65">{firstRoom.intro}</p>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-wrap gap-4 md:col-span-5 md:col-start-8 md:justify-end">
              <a
                href={firstRoomCalendarHref()}
                download="creators-hub-001-the-first-room.ics"
                className="group inline-flex items-center gap-3 rounded-full border border-cream/30 px-6 py-3.5 font-display text-[0.9375rem] font-medium transition-colors hover:border-cream"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Save the date
              </a>
              <ArrowLink to="/tickets" variant="rust">
                Get tickets
              </ArrowLink>
            </Reveal>
          </div>

          <dl className="mt-20 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-cream/15 pt-8 md:grid-cols-5">
            {firstRoomDetails.map((d) => (
              <div key={d.label}>
                <dt className="eyebrow text-[0.6875rem] text-cream/50">{d.label}</dt>
                <dd className="mt-2 font-display text-xl">{d.value ?? <Placeholder className="mt-1" />}</dd>
              </div>
            ))}
            <div>
              <dt className="eyebrow text-[0.6875rem] text-cream/50">Countdown</dt>
              <dd className="mt-2 font-display text-xl tabular-nums">{days > 0 ? `${days} days` : days === 0 ? 'Today' : 'Concluded'}</dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section surface="light" aria-labelledby="event-programme" className="py-28 md:py-36">
        <div className="container-edge grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <Eyebrow className="text-bright">In the room</Eyebrow>
            <h2 id="event-programme" className="mt-6 text-headline font-medium">
              <MaskText lines={['Details arrive', 'as they’re confirmed.']} />
            </h2>
            <p className="mt-6 text-ink/70">
              We are only publishing what is final. Speakers, programme, partners and registration will appear here as
              soon as they are announced.
            </p>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <EventBlock title="Speakers">
              {firstRoom.speakers.length ? (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {firstRoom.speakers.map((s) => (
                    <li key={s.name}>
                      <p className="font-display text-xl">{s.name}</p>
                      <p className="text-ink/60">{s.role}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <Placeholder>Speakers to be announced</Placeholder>
              )}
            </EventBlock>
            <EventBlock title="Programme">
              {firstRoom.programme.length ? (
                <ol className="divide-y divide-ink/10">
                  {firstRoom.programme.map((p) => (
                    <li key={p.time} className="flex gap-6 py-3">
                      <span className="w-16 tabular-nums text-ink/60">{p.time}</span>
                      <span>{p.title}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <Placeholder>Programme to be announced</Placeholder>
              )}
            </EventBlock>
            <EventBlock title="Tickets">
              <ArrowLink to="/tickets" variant="text">
                Regular and Premium tickets
              </ArrowLink>
            </EventBlock>
            <EventBlock title="Partners">
              {firstRoom.partners.length ? (
                <ul className="flex flex-wrap gap-6">
                  {firstRoom.partners.map((p) => (
                    <li key={p.name}>{p.name}</li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  <Placeholder>Partners to be announced</Placeholder>
                  <ArrowLink to="/#partner" variant="text">
                    Become a partner
                  </ArrowLink>
                </div>
              )}
            </EventBlock>
          </div>
        </div>
      </Section>
    </>
  )
}

function EventBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid gap-4 border-t border-ink/15 py-8 sm:grid-cols-[10rem_1fr]">
      <h3 className="eyebrow pt-1 text-ink/60">{title}</h3>
      <div>{children}</div>
    </Reveal>
  )
}
