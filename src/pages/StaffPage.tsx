import { useCallback, useEffect, useRef, useState } from 'react'
import { BarChart3, Keyboard, LogOut, RefreshCw, ScanLine } from 'lucide-react'
import { firstRoom } from '../content/event'
import { designById } from '../content/ticketDesigns'
import { Section } from '../components/layout/Section'
import { QrScanner } from '../components/staff/QrScanner'
import { TicketVerdict } from '../components/tickets/TicketVerdict'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cn } from '../lib/cn'
import {
  StaffAuthError,
  checkTicket,
  fetchStaffSummary,
  formatTime,
  parseScan,
  staffPin,
  type StaffSummary,
  type TicketView,
  type VerifyOutcome,
} from '../lib/ticketApi'

type Tab = 'scan' | 'lookup' | 'overview'
type Result = { outcome: VerifyOutcome; ticket: TicketView | null }

const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* not supported */
  }
}

/**
 * Creators Hub staff area (/staff): sign in with the staff PIN, then scan
 * tickets with the camera, look them up by ID, and watch the door numbers.
 */
export default function StaffPage() {
  useDocumentTitle('Staff')
  const [pin, setPin] = useState(staffPin.get)
  const [tab, setTab] = useState<Tab>('scan')

  const signOut = () => {
    staffPin.set('')
    setPin('')
  }
  // Any request that comes back "wrong PIN" signs the device out.
  const onAuthError = useCallback(() => {
    staffPin.set('')
    setPin('')
  }, [])

  return (
    <Section surface="dark" aria-labelledby="staff-title" className="min-h-[100svh] bg-[#0c0b0a] pt-24 pb-16 md:pt-32">
      <div className="container-edge max-w-xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-rust">Creators Hub {firstRoom.edition} · Staff</p>
            <h1 id="staff-title" className="mt-3 text-title font-medium">
              Staff area
            </h1>
          </div>
          {pin && (
            <button type="button" onClick={signOut} className="inline-flex items-center gap-2 text-sm text-cream/60 hover:text-cream">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </button>
          )}
        </div>

        {!pin ? (
          <SignIn onSignedIn={(p) => setPin(p)} />
        ) : (
          <>
            <div role="tablist" aria-label="Staff tools" className="mt-6 grid grid-cols-3 gap-1 rounded-full border border-cream/15 p-1">
              {(
                [
                  ['scan', 'Scan', ScanLine],
                  ['lookup', 'Look up', Keyboard],
                  ['overview', 'Overview', BarChart3],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium transition-colors',
                    tab === id ? 'bg-cream text-ink' : 'text-cream/70 hover:text-cream',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
            <div className="mt-6">
              {tab === 'scan' && <ScanTab pin={pin} onAuthError={onAuthError} />}
              {tab === 'lookup' && <LookupTab pin={pin} onAuthError={onAuthError} />}
              {tab === 'overview' && <OverviewTab pin={pin} onAuthError={onAuthError} />}
            </div>
          </>
        )}
      </div>
    </Section>
  )
}

function SignIn({ onSignedIn }: { onSignedIn: (pin: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="mt-10 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!value.trim()) return
        setBusy(true)
        setError('')
        try {
          await fetchStaffSummary(value.trim())
          staffPin.set(value.trim())
          onSignedIn(value.trim())
        } catch (err) {
          setError((err as Error).message)
        } finally {
          setBusy(false)
        }
      }}
    >
      <label htmlFor="staff-pin-input" className="block text-cream/70">
        Enter the staff PIN to open the door tools.
      </label>
      <input
        id="staff-pin-input"
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-full border border-cream/25 bg-transparent px-5 py-4 text-lg text-cream outline-none focus:border-cream"
      />
      <button type="submit" disabled={busy} className="w-full rounded-full bg-electric px-6 py-4 font-display text-lg font-medium text-ink hover:bg-cream disabled:opacity-60">
        {busy ? 'Checking…' : 'Sign in'}
      </button>
      {error && (
        <p role="alert" className="text-rust">
          {error}
        </p>
      )}
    </form>
  )
}

type TabProps = { pin: string; onAuthError: () => void }

function ScanTab({ pin, onAuthError }: TabProps) {
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [autoAdmit, setAutoAdmit] = useState(false)
  const [admittedCount, setAdmittedCount] = useState(0)
  const resultRef = useRef<HTMLDivElement>(null)

  // Bring each verdict (and its Admit button) into view on small screens.
  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [result])

  const handle = async (fn: () => Promise<Result>) => {
    setBusy(true)
    setError('')
    try {
      const r = await fn()
      setResult(r)
      if (r.outcome === 'admitted') setAdmittedCount((n) => n + 1)
      buzz(r.outcome === 'valid' || r.outcome === 'admitted' ? 60 : [120, 80, 120])
    } catch (e) {
      if (e instanceof StaffAuthError) onAuthError()
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const onScan = (text: string) => {
    if (result || busy) return
    const parsed = parseScan(text)
    if (!parsed) {
      setResult({ outcome: 'invalid', ticket: null })
      buzz([120, 80, 120])
      return
    }
    void handle(() => checkTicket({ ...parsed, pin, admit: autoAdmit }))
  }

  const admit = () => result?.ticket && handle(() => checkTicket({ ticketId: result.ticket!.id, pin, admit: true }))
  const next = () => {
    setResult(null)
    setError('')
  }

  return (
    <div className="space-y-4">
      <QrScanner onScan={onScan} paused={Boolean(result) || busy} />
      <div className="flex items-center justify-between gap-4 text-sm text-cream/70">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input id="auto-admit" type="checkbox" checked={autoAdmit} onChange={(e) => setAutoAdmit(e.target.checked)} className="h-4 w-4 accent-[#00E5A0]" />
          Admit automatically on scan
        </label>
        <span className="tabular-nums">Admitted here: {admittedCount}</span>
      </div>

      <div ref={resultRef} aria-live="assertive" className="scroll-mb-6 space-y-3">
        {busy && !result && <p className="text-cream/70">Checking ticket…</p>}
        {error && (
          <p role="alert" className="text-rust">
            {error}
          </p>
        )}
        {result && (
          <>
            <TicketVerdict outcome={result.outcome} ticket={result.ticket} staff />
            {result.outcome === 'valid' && result.ticket && (
              <button
                type="button"
                onClick={() => void admit()}
                disabled={busy}
                className="w-full rounded-full bg-electric px-7 py-5 font-display text-xl font-medium text-ink hover:bg-cream disabled:opacity-60"
              >
                {busy ? 'Admitting…' : `Admit ${result.ticket.attendeeName}`}
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className={cn(
                'w-full rounded-full px-7 py-4 font-display text-lg font-medium',
                result.outcome === 'valid' ? 'border border-cream/25 text-cream' : 'bg-cream text-ink hover:bg-electric',
              )}
            >
              Scan next ticket
            </button>
          </>
        )}
        {!result && !busy && <p className="text-center text-sm text-cream/50">Point the camera at a ticket’s QR code.</p>}
      </div>
    </div>
  )
}

function LookupTab({ pin, onAuthError }: TabProps) {
  const [ticketId, setTicketId] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (admit: boolean) => {
    setBusy(true)
    setError('')
    try {
      const r = await checkTicket({ ticketId: ticketId.trim(), pin, admit })
      setResult(r)
    } catch (e) {
      if (e instanceof StaffAuthError) onAuthError()
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (ticketId.trim()) void run(false)
        }}
        className="space-y-3"
      >
        <label htmlFor="ticket-id" className="block text-sm text-cream/70">
          Ticket ID (printed under the attendee’s name)
        </label>
        <div className="flex gap-2">
          <input
            id="ticket-id"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value.toUpperCase())}
            placeholder="CH001-F-0001"
            autoCapitalize="characters"
            className="min-w-0 flex-1 rounded-full border border-cream/25 bg-transparent px-5 py-3.5 font-mono text-cream outline-none placeholder:text-cream/30 focus:border-cream"
          />
          <button type="submit" disabled={busy} className="rounded-full bg-cream px-5 font-display font-medium text-ink hover:bg-electric disabled:opacity-60">
            Check
          </button>
        </div>
      </form>
      <div aria-live="polite" className="space-y-3">
        {error && (
          <p role="alert" className="text-rust">
            {error}
          </p>
        )}
        {result && <TicketVerdict outcome={result.outcome} ticket={result.ticket} staff />}
        {result?.outcome === 'valid' && result.ticket && (
          <button
            type="button"
            onClick={() => void run(true)}
            disabled={busy}
            className="w-full rounded-full bg-electric px-7 py-5 font-display text-xl font-medium text-ink hover:bg-cream disabled:opacity-60"
          >
            {busy ? 'Admitting…' : `Admit ${result.ticket.attendeeName}`}
          </button>
        )}
      </div>
    </div>
  )
}

function OverviewTab({ pin, onAuthError }: TabProps) {
  const [data, setData] = useState<StaffSummary | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fetchStaffSummary(pin))
      setError('')
    } catch (e) {
      if (e instanceof StaffAuthError) onAuthError()
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [pin, onAuthError])

  useEffect(() => {
    void load()
    const t = window.setInterval(() => void load(), 20_000)
    return () => window.clearInterval(t)
  }, [load])

  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-cream/55">
        <span>{data ? `Updated ${formatTime(data.generatedAt)} · refreshes every 20 s` : 'Loading…'}</span>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-1.5 hover:text-cream">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden="true" /> Refresh
        </button>
      </div>
      {error && (
        <p role="alert" className="text-rust">
          {error}
        </p>
      )}
      {data && (
        <>
          <div className="rounded-[20px] border border-cream/15 p-6">
            <p className="eyebrow text-cream/50">Checked in</p>
            <p className="mt-2 font-display text-5xl font-medium tabular-nums">
              {data.totals.checkedIn}
              <span className="text-2xl text-cream/45"> / {data.totals.issued}</span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream/10" role="progressbar" aria-valuenow={pct(data.totals.checkedIn, data.totals.issued)} aria-valuemin={0} aria-valuemax={100} aria-label="Share of ticket holders checked in">
              <div className="h-full rounded-full bg-electric transition-[width] duration-700" style={{ width: `${pct(data.totals.checkedIn, data.totals.issued)}%` }} />
            </div>
            <p className="mt-2 text-sm text-cream/55">{data.totals.issued - data.totals.checkedIn} still to arrive</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['regular', 'premium'] as const).map((c) => (
              <div key={c} className="rounded-[16px] border border-cream/15 p-4">
                <p className={cn('eyebrow', c === 'premium' ? 'text-[#E2AE47]' : 'text-[#DCC583]')}>{c}</p>
                <p className="mt-2 font-display text-2xl tabular-nums">
                  {data.byCategory[c].checkedIn}
                  <span className="text-base text-cream/45"> / {data.byCategory[c].issued}</span>
                </p>
                <p className="text-xs text-cream/50">checked in / sold</p>
              </div>
            ))}
          </div>

          <div className="rounded-[16px] border border-cream/15 p-5">
            <p className="eyebrow text-cream/50">By creative arm</p>
            <ul className="mt-4 space-y-3">
              {data.byDesign.map((d) => (
                <li key={d.id}>
                  <div className="flex justify-between text-sm">
                    <span>{d.name}</span>
                    <span className="tabular-nums text-cream/70">
                      {d.checkedIn} / {d.issued}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream/10">
                    <div className="h-full rounded-full" style={{ width: `${pct(d.checkedIn, d.issued)}%`, background: designById(d.id).rule }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[16px] border border-cream/15 p-5">
            <p className="eyebrow text-cream/50">Latest arrivals</p>
            {data.recent.length === 0 ? (
              <p className="mt-3 text-sm text-cream/55">No one checked in yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-cream/10">
                {data.recent.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate">{r.attendeeName}</span>
                      <span className="block font-mono text-xs text-cream/50">
                        {r.id} · {designById(r.design).name}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums text-cream/60">{formatTime(r.checkedInAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
