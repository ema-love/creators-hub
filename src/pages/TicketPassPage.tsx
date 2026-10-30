import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CheckCircle2, ShieldCheck, TriangleAlert, XCircle } from 'lucide-react'
import { firstRoom } from '../content/event'
import { Section } from '../components/layout/Section'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cn } from '../lib/cn'

const CHECK_IN_URL = '/.netlify/functions/check-in'
const PIN_KEY = 'ch:staff-pin'

type Pass = { reference: string; tier: string; quantity: number; name: string; paid: boolean; checkedInAt: string | null }
type Outcome = 'valid' | 'admitted' | 'already_admitted' | 'unpaid'
type State =
  | { kind: 'loading' }
  | { kind: 'ready'; outcome: Outcome; staff: boolean; pass: Pass }
  | { kind: 'error'; message: string }

const readPin = () => {
  try {
    return localStorage.getItem(PIN_KEY) ?? ''
  } catch {
    return ''
  }
}
const writePin = (pin: string) => {
  try {
    if (pin) localStorage.setItem(PIN_KEY, pin)
    else localStorage.removeItem(PIN_KEY)
  } catch {
    /* storage unavailable: staff re-enter the PIN */
  }
}

const time = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })

/**
 * The page a ticket's QR code opens. Attendees see their pass. On a staff
 * device (PIN saved), the same page becomes the door check-in screen.
 */
export default function TicketPassPage() {
  useDocumentTitle('Ticket')
  const [params] = useSearchParams()
  const ref = params.get('ref') ?? ''
  const sig = params.get('sig') ?? ''
  const [pin, setPin] = useState(readPin)
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [busy, setBusy] = useState(false)
  const [pinError, setPinError] = useState('')

  const call = useCallback(
    async (admit: boolean, staffPin: string) => {
      const res = await fetch(CHECK_IN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref, sig, pin: staffPin || null, admit }),
      })
      const body = (await res.json().catch(() => ({}))) as { outcome?: Outcome; staff?: boolean; pass?: Pass; error?: string }
      if (res.status === 401) {
        writePin('')
        setPin('')
        throw new Error(body.error ?? 'Incorrect staff PIN.')
      }
      if (!res.ok || !body.pass || !body.outcome) throw new Error(body.error ?? 'We couldn’t load this ticket.')
      setState({ kind: 'ready', outcome: body.outcome, staff: Boolean(body.staff), pass: body.pass })
    },
    [ref, sig],
  )

  useEffect(() => {
    if (!ref || !sig) {
      setState({ kind: 'error', message: 'This ticket link is incomplete.' })
      return
    }
    call(false, pin).catch((e: Error) => setState({ kind: 'error', message: e.message }))
    // Load once per ticket; PIN changes go through the staff controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, sig, call])

  const admit = async () => {
    setBusy(true)
    try {
      await call(true, pin)
    } catch (e) {
      setState({ kind: 'error', message: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const savePin = async (value: string) => {
    writePin(value)
    setPin(value)
    setPinError('')
    setBusy(true)
    try {
      await call(false, value)
    } catch (e) {
      // Wrong PIN: keep showing the ticket and explain under the PIN field.
      setPinError((e as Error).message)
      await call(false, '').catch((err: Error) => setState({ kind: 'error', message: err.message }))
    } finally {
      setBusy(false)
    }
  }

  const qrSrc = `/.netlify/functions/ticket-qr?${new URLSearchParams({ ref, sig })}`

  return (
    <Section surface="dark" aria-labelledby="pass-title" className="grain min-h-[90svh] bg-[#120d0a] pt-28 pb-20 md:pt-36">
      <div className="container-edge max-w-xl">
        <p className="eyebrow text-rust">Creators Hub {firstRoom.edition}</p>
        <h1 id="pass-title" className="mt-4 text-headline font-medium">
          {firstRoom.name}
        </h1>
        <p className="mt-3 text-cream/70">
          {firstRoom.dateLabel} · {firstRoom.city}, {firstRoom.country}
        </p>

        <div aria-live="polite" className="mt-10">
          {state.kind === 'loading' && <p className="text-cream/60">Loading ticket…</p>}
          {state.kind === 'error' && (
            <Banner tone="bad" icon={<XCircle className="h-6 w-6" />} title={state.message}>
              Check the link, or ask for help at the door.
            </Banner>
          )}
          {state.kind === 'ready' && <PassView state={state} qrSrc={qrSrc} />}
        </div>

        {state.kind === 'ready' && state.staff && state.pass.paid && (
          <button
            type="button"
            onClick={admit}
            disabled={busy || state.pass.checkedInAt !== null}
            className="mt-6 w-full rounded-full bg-electric px-7 py-5 font-display text-lg font-medium text-ink transition-colors hover:bg-cream disabled:bg-cream/15 disabled:text-cream/50"
          >
            {state.pass.checkedInAt
              ? 'Already admitted'
              : busy
                ? 'Admitting…'
                : `Admit ${state.pass.quantity} ${state.pass.quantity === 1 ? 'person' : 'people'}`}
          </button>
        )}

        <StaffControls pin={pin} busy={busy} error={pinError} onSave={savePin} />
      </div>
    </Section>
  )
}

function PassView({ state, qrSrc }: { state: Extract<State, { kind: 'ready' }>; qrSrc: string }) {
  const { pass, outcome, staff } = state
  return (
    <div className="space-y-6">
      {outcome === 'admitted' && (
        <Banner tone="good" icon={<CheckCircle2 className="h-6 w-6" />} title="Admitted">
          {pass.quantity} × {pass.tier} for {pass.name}. Welcome in.
        </Banner>
      )}
      {outcome === 'already_admitted' && pass.checkedInAt && (
        <Banner tone="warn" icon={<TriangleAlert className="h-6 w-6" />} title={`Already checked in at ${time(pass.checkedInAt)}`}>
          {staff ? 'This ticket has been used. Check ID before letting anyone through.' : 'This ticket has been used at the door.'}
        </Banner>
      )}
      {outcome === 'unpaid' && (
        <Banner tone="bad" icon={<XCircle className="h-6 w-6" />} title="Payment not confirmed">
          This order hasn’t been paid, so it can’t be admitted.
        </Banner>
      )}

      <div className="rounded-[20px] border border-cream/15 bg-cream/[0.03] p-6 md:p-8">
        {!staff && pass.paid && !pass.checkedInAt && (
          <div className="mb-6 flex flex-col items-center">
            <div className="rounded-[16px] bg-cream p-3">
              <img src={qrSrc} width={240} height={240} alt={`QR code for ticket ${pass.reference}`} className="block h-60 w-60" />
            </div>
            <p className="mt-4 text-center text-sm text-cream/60">Show this code at the door.</p>
          </div>
        )}
        <dl className="divide-y divide-cream/10">
          {[
            ['Ticket', `${pass.quantity} × ${pass.tier}`],
            ['Admits', `${pass.quantity} ${pass.quantity === 1 ? 'person' : 'people'}`],
            ['Name', pass.name],
            ['Reference', pass.reference],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-wrap justify-between gap-2 py-3">
              <dt className="text-cream/55">{k}</dt>
              <dd className={cn('text-right', k === 'Reference' && 'select-all font-mono')}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

function Banner({
  tone,
  icon,
  title,
  children,
}: {
  tone: 'good' | 'warn' | 'bad'
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex gap-4 rounded-[20px] p-5 md:p-6',
        tone === 'good' && 'bg-electric text-ink',
        tone === 'warn' && 'bg-rust text-ink',
        tone === 'bad' && 'border border-rust/60 bg-rust/10 text-cream',
      )}
    >
      <span className="shrink-0" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="font-display text-xl font-medium">{title}</p>
        <p className="mt-1 opacity-85">{children}</p>
      </div>
    </div>
  )
}

/** Staff enter the door PIN once per device; it is remembered in this browser only. */
function StaffControls({
  pin,
  busy,
  error,
  onSave,
}: {
  pin: string
  busy: boolean
  error: string
  onSave: (pin: string) => void
}) {
  const [open, setOpen] = useState(Boolean(error))
  const [value, setValue] = useState('')

  if (pin) {
    return (
      <p className="mt-10 flex items-center justify-between gap-4 border-t border-cream/10 pt-6 text-sm text-cream/60">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-electric" aria-hidden="true" /> Staff check-in mode
        </span>
        <button type="button" onClick={() => onSave('')} className="link-draw hover:text-cream">
          Sign out
        </button>
      </p>
    )
  }

  return (
    <div className="mt-10 border-t border-cream/10 pt-6 text-sm">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="link-draw text-cream/50 hover:text-cream">
          Staff check-in
        </button>
      ) : (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (value.trim()) onSave(value.trim())
          }}
        >
          <label className="flex flex-1 flex-col gap-2 text-cream/60">
            Staff PIN
            <input
              id="staff-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-full border border-cream/25 bg-transparent px-4 py-3 text-cream outline-none focus:border-cream"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-cream px-5 py-3 font-display font-medium text-ink hover:bg-electric disabled:opacity-60"
          >
            Start check-in
          </button>
          {error && (
            <p role="alert" className="w-full text-rust">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
