import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Globe, Info, MapPin } from 'lucide-react'
import { firstRoom } from '../content/event'
import { attendanceOptions, registrationCopy, TICKET_CATEGORY, type Attendance } from '../content/tickets'
import { ticketDesigns, type TicketDesignId } from '../content/ticketDesigns'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { TextField } from '../components/forms/Fields'
import { TicketDesign } from '../components/tickets/TicketDesign'
import { OnlinePass } from '../components/tickets/OnlinePass'
import { ease } from '../lib/motion'
import { cn } from '../lib/cn'

const REGISTER_URL = '/.netlify/functions/register'
const STATUS_URL = '/.netlify/functions/registration-status'

type Availability = 'loading' | 'open' | 'full' | 'closed'
type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'already'; resent: boolean }

/** Free registration, in person or online: one person, one registration per email. */
export function Tickets({ asPage = false }: { asPage?: boolean }) {
  const Heading = asPage ? 'h1' : 'h2'
  const [availability, setAvailability] = useState<Availability>('loading')

  useEffect(() => {
    let live = true
    fetch(STATUS_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      // `full` means in-person places are taken; online stays open.
      .then((s: { open?: boolean; full?: boolean }) => live && setAvailability(s.open === false ? 'closed' : s.full ? 'full' : 'open'))
      // If the check fails, show the form: the server still enforces capacity.
      .catch(() => live && setAvailability('open'))
    return () => {
      live = false
    }
  }, [])

  return (
    <Section
      id="tickets"
      surface="dark"
      aria-labelledby="tickets-title"
      className={cn('bg-[#120d0a] pb-28 md:pb-36', asPage ? 'min-h-[90svh] pt-36 md:pt-44' : 'pt-28 md:pt-36')}
    >
      <div className="container-edge">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow className="text-electric">
              {registrationCopy.eyebrow} · {firstRoom.fullName}
            </Eyebrow>
            <Heading id="tickets-title" className="mt-6 text-headline font-medium">
              <MaskText inView={!asPage} lines={registrationCopy.title} />
            </Heading>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="text-cream/75">{registrationCopy.lede}</p>
            <p className="eyebrow mt-4 text-silver">
              {firstRoom.dateLabel} · {firstRoom.timeRange}
            </p>
          </div>
        </div>

        <Reveal>
          <ul className="mt-12 flex flex-wrap gap-3" aria-label="How registration works">
            {registrationCopy.points.map((p) => (
              <li key={p} className="inline-flex items-center gap-2.5 rounded-full border border-cream/15 bg-cream/[0.03] px-4 py-2 text-sm text-cream/85">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-electric text-ink">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-10">
          {availability === 'closed' ? <Unavailable /> : <RegistrationForm inPersonFull={availability === 'full'} />}
        </div>
      </div>
    </Section>
  )
}

function Unavailable() {
  return (
    <div className="rounded-[20px] border border-cream/15 p-8 md:p-10">
      <p className="font-display text-title font-medium">Registration is closed.</p>
      <p className="mt-3 max-w-xl text-cream/70">{registrationCopy.closed}</p>
      <p className="mt-6 text-sm text-cream/60">
        Already registered?{' '}
        <Link to="/tickets/find" className="link-draw text-cream">
          Find your ticket
        </Link>
      </p>
    </div>
  )
}

function RegistrationForm({ inPersonFull: initiallyFull }: { inPersonFull: boolean }) {
  const [name, setName] = useState('')
  const [design, setDesign] = useState<TicketDesignId | null>(null)
  const [attendance, setAttendance] = useState<Attendance | null>(initiallyFull ? 'online' : null)
  const [location, setLocation] = useState('')
  const [inPersonFull, setInPersonFull] = useState(initiallyFull)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [closed, setClosed] = useState(false)
  const online = attendance === 'online'

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    if (!attendance) {
      setStatus({ kind: 'error', message: 'Choose how you’ll attend: in person or online.' })
      document.getElementById('attendance-choice')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    if (!design) {
      setStatus({ kind: 'error', message: 'Choose the creative arm you’re under.' })
      document.getElementById('arm-choice')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    const data = new FormData(form)
    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          design,
          attendance,
          location: online ? location : '',
          company: data.get('company'),
        }),
      })
      const body = (await res.json().catch(() => ({}))) as { state?: string; url?: string; resent?: boolean; error?: string }
      if (body.state === 'registered' && body.url) {
        const target = new URL(body.url, window.location.origin)
        window.location.assign(`${target.pathname}${target.search}&welcome=1`)
        return
      }
      if (body.state === 'already_registered') return setStatus({ kind: 'already', resent: Boolean(body.resent) })
      if (body.state === 'closed') return setClosed(true)
      if (body.state === 'full') {
        // In-person places ran out while they were filling in the form.
        setInPersonFull(true)
        setAttendance(null)
        return setStatus({ kind: 'error', message: registrationCopy.full })
      }
      throw new Error(body.error ?? 'We couldn’t complete your registration. Please try again.')
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }

  if (closed) return <Unavailable />

  const letter = ticketDesigns.find((d) => d.id === design)?.letter

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 rounded-[20px] border border-cream/15 p-6 md:grid-cols-12 md:p-10">
      <div className="space-y-8 md:col-span-7">
        <h3 className="text-title font-medium">Your details</h3>
        <div onInput={(e) => (e.target as HTMLInputElement).name === 'name' && setName((e.target as HTMLInputElement).value)}>
          <TextField label="Full name (as it should appear on your ticket)" name="name" required autoComplete="name" />
        </div>
        <div>
          <TextField label="Email" name="email" type="email" required autoComplete="email" />
          <p className="mt-2 text-xs text-cream/50">Your confirmation is sent here. Each email address can register once.</p>
        </div>

        <fieldset id="attendance-choice">
          <legend className="text-sm text-cream/60">
            How will you attend? <span aria-hidden="true">*</span>
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {attendanceOptions.map((o) => {
              const on = attendance === o.id
              const disabled = o.id === 'in_person' && inPersonFull
              const Icon = o.id === 'online' ? Globe : MapPin
              return (
                <label
                  key={o.id}
                  className={cn(
                    'relative flex cursor-pointer gap-3 rounded-[14px] border p-4 transition-colors duration-300',
                    on ? 'border-electric bg-electric/10' : 'border-cream/20 hover:border-cream/50',
                    disabled && 'cursor-not-allowed opacity-50 hover:border-cream/20',
                  )}
                >
                  <input
                    type="radio"
                    name="attendance"
                    value={o.id}
                    checked={on}
                    disabled={disabled}
                    required
                    onChange={() => {
                      setAttendance(o.id)
                      if (status.kind === 'error') setStatus({ kind: 'idle' })
                    }}
                    className="peer sr-only"
                  />
                  <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', on ? 'text-electric' : 'text-cream/60')} aria-hidden="true" />
                  <span>
                    <span className="block font-medium">{o.label}</span>
                    <span className="mt-0.5 block text-xs text-cream/55">{disabled ? 'In-person places are full' : o.hint}</span>
                  </span>
                  <span className="pointer-events-none absolute inset-0 rounded-[14px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-electric" />
                </label>
              )
            })}
          </div>
        </fieldset>

        {online && (
          <div>
            <label className="block text-sm text-cream/60" htmlFor="reg-location">
              City / country <span className="text-cream/40">(optional)</span>
            </label>
            <input
              id="reg-location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={80}
              autoComplete="address-level2"
              placeholder="e.g. Accra, Ghana"
              className="mt-2 w-full border-0 border-b border-cream/25 bg-transparent px-0 py-2 text-lg text-cream outline-none placeholder:text-cream/30 focus:border-cream"
            />
          </div>
        )}
        {/* Hidden from people; bots fill it in. */}
        <p className="hidden" aria-hidden="true">
          <label>
            Company <input name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <div id="arm-choice" role="radiogroup" aria-label="Which creative arm are you under?">
          <p className="text-sm text-cream/60">Which creative arm are you under?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ticketDesigns.map((d) => {
              const on = design === d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setDesign(d.id)
                    if (status.kind === 'error') setStatus({ kind: 'idle' })
                  }}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm transition-colors duration-300',
                    on ? 'border-electric bg-electric font-medium text-ink' : 'border-cream/25 text-cream/80 hover:border-cream',
                  )}
                >
                  {d.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-[14px] border border-cream/10 bg-cream/[0.03] p-4 text-sm text-cream/70">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-electric" aria-hidden="true" />
          <p>
            Registration is free and limited to <strong className="font-medium text-cream">one registration per person</strong>.
            Everyone coming, in person or online, should register with their own email.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:col-span-5 md:border-l md:border-cream/10 md:pl-10">
        <div className="mx-auto w-full max-w-[240px]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {design && online ? (
              <motion.div
                key={`online-${design}`}
                initial={{ opacity: 0, y: 16, rotate: -1.5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: ease.out }}
              >
                <OnlinePass attendeeName={name.trim() || 'Your name'} design={design} passId="CH001-O-····" location={location.trim() || null} />
                <p className="mt-2 text-center text-xs text-cream/45">
                  Your online pass preview. No QR code is needed to join online.
                </p>
              </motion.div>
            ) : design ? (
              <motion.div
                key={design}
                initial={{ opacity: 0, y: 16, rotate: -1.5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: ease.out }}
              >
                <TicketDesign
                  design={design}
                  category={TICKET_CATEGORY}
                  attendeeName={name.trim() || 'Your name'}
                  ticketId={`CH001-${letter}-····`}
                  qrValue={null}
                />
                <p className="mt-2 text-center text-xs text-cream/45">
                  Your ticket preview. The ticket ID and QR code are issued when you register.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid aspect-[264/455] w-full place-items-center rounded-[11px] border border-dashed border-cream/20 p-6 text-center"
              >
                <p className="text-sm text-cream/55">
                  {attendance ? 'Choose your creative arm to see your ' + (online ? 'online pass.' : 'ticket.') : 'Choose how you’ll attend and your creative arm to see your ticket.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-baseline justify-between border-t border-cream/10 pt-6">
          <span className="text-cream/70">{online ? '1 online pass · Join from anywhere' : '1 ticket · Admits one'}</span>
          <span className="font-display text-3xl font-medium">Free</span>
        </div>

        <button
          type="submit"
          disabled={status.kind === 'submitting'}
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-electric px-7 py-4 font-display font-medium text-ink transition-colors hover:bg-cream disabled:opacity-60"
        >
          {status.kind === 'submitting' ? 'Registering…' : 'Register for free'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>

        <div aria-live="polite" className="min-h-5 text-sm">
          {status.kind === 'error' && (
            <p role="alert" className="text-rust">
              {status.message}
            </p>
          )}
          {status.kind === 'already' && (
            <p role="alert" className="text-cream/85">
              This email is already registered. It’s one registration per person.{' '}
              {status.resent ? (
                'We’ve sent the confirmation to that email again.'
              ) : (
                <>
                  <Link to="/tickets/find" className="link-draw text-electric">
                    Find your ticket
                  </Link>
                  .
                </>
              )}
            </p>
          )}
          {(status.kind === 'idle' || status.kind === 'submitting') && (
            <p className="text-cream/50">
              It takes a minute, and you’ll see your {online ? 'online pass' : 'ticket'} straight away.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
