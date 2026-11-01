import { useState } from 'react'
import { Camera, ShieldCheck } from 'lucide-react'
import { firstRoom } from '../content/event'
import { Section } from '../components/layout/Section'
import { TicketVerdict } from '../components/tickets/TicketVerdict'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { StaffAuthError, checkTicket, staffPin, type TicketView, type VerifyOutcome } from '../lib/ticketApi'

type Result = { outcome: VerifyOutcome; ticket: TicketView | null }

/**
 * Door staff home (/tickets/check-in): sign in with the PIN, then scan
 * tickets with the phone camera, or type a ticket ID when a code won't scan.
 */
export default function StaffCheckInPage() {
  useDocumentTitle('Door check-in')
  const [pin, setPin] = useState(staffPin.get)
  const [pinInput, setPinInput] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (e) {
      if (e instanceof StaffAuthError) {
        staffPin.set('')
        setPin('')
      }
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const signIn = (e: React.FormEvent) => {
    e.preventDefault()
    const value = pinInput.trim()
    if (!value) return
    void run(async () => {
      // Probe with an ID that can't exist: a wrong PIN fails, a right one returns "invalid".
      await checkTicket({ ticketId: 'CH001-X-0000', pin: value })
      staffPin.set(value)
      setPin(value)
      setPinInput('')
    })
  }

  const lookup = (admit: boolean) =>
    run(async () => {
      const r = await checkTicket({ ticketId: ticketId.trim(), pin, admit })
      setResult({ outcome: r.outcome, ticket: r.ticket })
    })

  return (
    <Section surface="dark" aria-labelledby="checkin-title" className="min-h-[90svh] bg-[#0c0b0a] pt-28 pb-20 md:pt-36">
      <div className="container-edge max-w-md">
        <p className="eyebrow text-rust">Creators Hub {firstRoom.edition} · Staff</p>
        <h1 id="checkin-title" className="mt-4 text-headline font-medium">
          Door check-in
        </h1>

        {!pin ? (
          <form onSubmit={signIn} className="mt-10 space-y-4">
            <label htmlFor="checkin-pin" className="block text-cream/70">
              Enter the staff PIN to start.
            </label>
            <input
              id="checkin-pin"
              type="password"
              autoComplete="off"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full rounded-full border border-cream/25 bg-transparent px-5 py-4 text-lg text-cream outline-none focus:border-cream"
            />
            <button type="submit" disabled={busy} className="w-full rounded-full bg-electric px-6 py-4 font-display text-lg font-medium text-ink hover:bg-cream disabled:opacity-60">
              {busy ? 'Checking…' : 'Sign in'}
            </button>
            {error && <p role="alert" className="text-rust">{error}</p>}
          </form>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="flex gap-4 rounded-[20px] border border-cream/15 p-5">
              <Camera className="mt-0.5 h-6 w-6 shrink-0 text-electric" aria-hidden="true" />
              <p className="text-cream/80">
                Scan each ticket’s QR code with this phone’s camera. It opens the ticket here with an <strong>Admit</strong>{' '}
                button. Each ticket admits one person, once.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (ticketId.trim()) void lookup(false)
              }}
              className="space-y-3"
            >
              <label htmlFor="ticket-id" className="block text-sm text-cream/70">
                Code won’t scan? Enter the ticket ID
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

            <div aria-live="polite" className="space-y-4">
              {error && <p role="alert" className="text-rust">{error}</p>}
              {result && <TicketVerdict outcome={result.outcome} ticket={result.ticket} staff />}
              {result?.outcome === 'valid' && result.ticket && (
                <button
                  type="button"
                  onClick={() => void lookup(true)}
                  disabled={busy}
                  className="w-full rounded-full bg-electric px-7 py-5 font-display text-xl font-medium text-ink hover:bg-cream disabled:opacity-60"
                >
                  {busy ? 'Admitting…' : `Admit ${result.ticket.attendeeName}`}
                </button>
              )}
            </div>

            <p className="flex items-center justify-between border-t border-cream/10 pt-6 text-sm text-cream/60">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-electric" aria-hidden="true" /> Signed in on this device
              </span>
              <button type="button" onClick={() => { staffPin.set(''); setPin(''); setResult(null) }} className="link-draw hover:text-cream">
                Sign out
              </button>
            </p>
          </div>
        )}
      </div>
    </Section>
  )
}
