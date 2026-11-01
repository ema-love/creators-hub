import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ShieldCheck } from 'lucide-react'
import { firstRoom } from '../content/event'
import { Section } from '../components/layout/Section'
import { TicketDesign } from '../components/tickets/TicketDesign'
import { TicketVerdict } from '../components/tickets/TicketVerdict'
import { verifyUrlFor } from '../components/tickets/TicketCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { StaffAuthError, checkTicket, staffPin, type TicketView, type VerifyOutcome } from '../lib/ticketApi'

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; outcome: VerifyOutcome; staff: boolean; ticket: TicketView | null }
  | { kind: 'error'; message: string }

/**
 * Opened by scanning a ticket's QR code (/v/<token>).
 * Attendees see their ticket and its status. On a staff device (PIN
 * entered), the same page shows the verdict and an Admit button.
 */
export default function TicketVerifyPage() {
  useDocumentTitle('Ticket')
  const { token = '' } = useParams()
  const [pin, setPin] = useState(staffPin.get)
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [busy, setBusy] = useState(false)
  const [pinError, setPinError] = useState('')

  const load = useCallback(
    async (admit: boolean, withPin: string) => {
      const r = await checkTicket({ token, pin: withPin || undefined, admit })
      setState({ kind: 'ready', ...r })
    },
    [token],
  )

  useEffect(() => {
    load(false, staffPin.get()).catch(async (e: Error) => {
      if (e instanceof StaffAuthError) {
        staffPin.set('')
        setPin('')
        setPinError(e.message)
        await load(false, '').catch((err: Error) => setState({ kind: 'error', message: err.message }))
      } else setState({ kind: 'error', message: e.message })
    })
  }, [load])

  const admit = async () => {
    setBusy(true)
    try {
      await load(true, pin)
    } catch (e) {
      setState({ kind: 'error', message: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const signIn = async (value: string) => {
    setBusy(true)
    setPinError('')
    try {
      await load(false, value)
      staffPin.set(value)
      setPin(value)
    } catch (e) {
      setPinError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const ready = state.kind === 'ready' ? state : null
  const staff = Boolean(ready?.staff)

  return (
    <Section surface="dark" aria-labelledby="verify-title" className="min-h-[90svh] bg-[#0c0b0a] pt-24 pb-20 md:pt-32">
      <div className="container-edge max-w-md">
        <p className="eyebrow text-rust">
          {staff ? 'Door check-in' : 'Your ticket'} · Creators Hub {firstRoom.edition}
        </p>
        <h1 id="verify-title" className="sr-only">
          Ticket verification
        </h1>

        <div aria-live="polite" className="mt-6 space-y-6">
          {state.kind === 'loading' && <p className="text-cream/60">Checking ticket…</p>}
          {state.kind === 'error' && <p role="alert" className="rounded-[16px] border border-rust p-5 text-cream">{state.message}</p>}
          {ready && (staff || ready.outcome !== 'valid') && <TicketVerdict outcome={ready.outcome} ticket={ready.ticket} staff={staff} />}

          {staff && ready?.ticket && ready.outcome === 'valid' && (
            <button
              type="button"
              onClick={admit}
              disabled={busy}
              className="w-full rounded-full bg-electric px-7 py-5 font-display text-xl font-medium text-ink hover:bg-cream disabled:opacity-60"
            >
              {busy ? 'Admitting…' : `Admit ${ready.ticket.attendeeName}`}
            </button>
          )}

          {ready?.ticket && (
            <div className={staff ? 'mx-auto max-w-[240px]' : 'mx-auto max-w-[360px]'}>
              <TicketDesign
                design={ready.ticket.design}
                category={ready.ticket.category}
                attendeeName={ready.ticket.attendeeName}
                ticketId={ready.ticket.id}
                qrValue={verifyUrlFor(token)}
              />
            </div>
          )}
          {ready?.ticket && !staff && ready.outcome === 'valid' && (
            <p className="text-center text-sm text-cream/60">
              Show this at the door. To download or print your tickets, use the link in your ticket email.
            </p>
          )}
        </div>

        <StaffPanel pin={pin} busy={busy} error={pinError} onSignIn={signIn} onSignOut={() => { staffPin.set(''); setPin(''); void load(false, '') }} />
      </div>
    </Section>
  )
}

export function StaffPanel({
  pin,
  busy,
  error,
  onSignIn,
  onSignOut,
}: {
  pin: string
  busy: boolean
  error: string
  onSignIn: (pin: string) => void
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(Boolean(error))
  const [value, setValue] = useState('')

  if (pin) {
    return (
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-cream/10 pt-6 text-sm text-cream/60">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-electric" aria-hidden="true" /> Staff check-in mode
        </span>
        <span className="flex gap-5">
          <Link to="/tickets/check-in" className="link-draw hover:text-cream">
            Look up by ID
          </Link>
          <button type="button" onClick={onSignOut} className="link-draw hover:text-cream">
            Sign out
          </button>
        </span>
      </div>
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
            if (value.trim()) onSignIn(value.trim())
          }}
        >
          <label className="flex min-w-0 flex-1 flex-col gap-2 text-cream/60">
            Staff PIN
            <input
              id="staff-pin"
              type="password"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-full border border-cream/25 bg-transparent px-4 py-3 text-cream outline-none focus:border-cream"
            />
          </label>
          <button type="submit" disabled={busy} className="rounded-full bg-cream px-5 py-3 font-display font-medium text-ink hover:bg-electric disabled:opacity-60">
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
