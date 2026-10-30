import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { firstRoom } from '../content/event'
import { formatNaira } from '../content/tickets'
import { Section } from '../components/layout/Section'
import { ArrowLink } from '../components/ui/ArrowLink'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const VERIFY_URL = '/.netlify/functions/verify-payment'
const RETRY_MS = 4000
const MAX_TRIES = 8

type Ticket = {
  reference: string
  tier: string
  quantity: number
  amount: number
  currency: string
  name: string
  email: string
}

type View =
  | { kind: 'checking' }
  | { kind: 'paid'; ticket: Ticket }
  | { kind: 'pending'; ticket?: Ticket }
  | { kind: 'failed'; reason: string }
  | { kind: 'cancelled' }
  | { kind: 'missing' }

/** Where Flutterwave sends buyers back. The payment is verified on the server before showing a ticket. */
export default function TicketConfirmationPage() {
  useDocumentTitle('Your tickets')
  const [params] = useSearchParams()
  const txRef = params.get('tx_ref')
  const transactionId = params.get('transaction_id')
  const flwStatus = params.get('status')

  const [view, setView] = useState<View>(() =>
    !txRef ? { kind: 'missing' } : flwStatus === 'cancelled' ? { kind: 'cancelled' } : { kind: 'checking' },
  )

  useEffect(() => {
    if (!txRef || flwStatus === 'cancelled') return
    let tries = 0
    let timer = 0
    let stopped = false

    const check = async () => {
      tries += 1
      try {
        const q = new URLSearchParams({ tx_ref: txRef, ...(transactionId ? { transaction_id: transactionId } : {}) })
        const res = await fetch(`${VERIFY_URL}?${q}`)
        const body = (await res.json()) as { state?: string; ticket?: Ticket; reason?: string }
        if (stopped) return
        if (body.state === 'paid' && body.ticket) return setView({ kind: 'paid', ticket: body.ticket })
        if (body.state === 'failed') return setView({ kind: 'failed', reason: body.reason ?? 'The payment did not go through.' })
        if (body.state === 'not_found') return setView({ kind: 'missing' })
        setView({ kind: 'pending', ticket: body.ticket })
      } catch {
        if (stopped) return
        setView({ kind: 'pending' })
      }
      if (tries < MAX_TRIES) timer = window.setTimeout(check, RETRY_MS)
    }

    void check()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [txRef, transactionId, flwStatus])

  return (
    <Section surface="dark" aria-labelledby="confirm-title" className="grain flex min-h-[85svh] items-center bg-[#120d0a] pt-32 pb-20">
      <div className="container-edge max-w-3xl">
        <div aria-live="polite">{renderView(view, txRef)}</div>
      </div>
    </Section>
  )
}

function renderView(view: View, txRef: string | null) {
  switch (view.kind) {
    case 'checking':
      return (
        <Status icon={<Clock className="h-8 w-8 animate-pulse text-electric" />} title="Confirming your payment…">
          <p>This usually takes a few seconds. Please keep this page open.</p>
        </Status>
      )
    case 'paid':
      return (
        <Status icon={<CheckCircle2 className="h-8 w-8 text-electric" />} title="You’re in the room.">
          <p>
            Your payment is confirmed. Keep your reference: you’ll need it at the door for {firstRoom.fullName} on{' '}
            {firstRoom.dateLabel} in {firstRoom.city}.
          </p>
          <TicketSummary ticket={view.ticket} />
          <div className="mt-10 flex flex-wrap gap-6">
            <ArrowLink to="/the-first-room">Back to The First Room</ArrowLink>
          </div>
        </Status>
      )
    case 'pending':
      return (
        <Status icon={<Clock className="h-8 w-8 text-rust" />} title="Still confirming your payment.">
          <p>
            Flutterwave hasn’t confirmed this payment yet. Bank transfers can take a few minutes. You don’t need to pay
            again: once it clears, your ticket is recorded automatically.
          </p>
          {txRef && <Reference value={txRef} />}
          <p className="mt-6 text-cream/60">If you were charged and this doesn’t update, contact us with your reference.</p>
        </Status>
      )
    case 'failed':
      return (
        <Status icon={<XCircle className="h-8 w-8 text-rust" />} title="The payment didn’t go through.">
          <p>{view.reason} You haven’t been given a ticket for this attempt.</p>
          {txRef && <Reference value={txRef} />}
          <div className="mt-10">
            <ArrowLink to="/the-first-room#tickets" variant="rust">
              Try again
            </ArrowLink>
          </div>
        </Status>
      )
    case 'cancelled':
      return (
        <Status icon={<XCircle className="h-8 w-8 text-silver" />} title="Payment cancelled.">
          <p>No money was taken. Your tickets are still available whenever you’re ready.</p>
          <div className="mt-10">
            <ArrowLink to="/the-first-room#tickets">Back to tickets</ArrowLink>
          </div>
        </Status>
      )
    case 'missing':
      return (
        <Status icon={<XCircle className="h-8 w-8 text-silver" />} title="We couldn’t find that order.">
          <p>This link doesn’t match a ticket order. If you were charged, contact us with the reference from your receipt.</p>
          <div className="mt-10">
            <ArrowLink to="/the-first-room#tickets">Go to tickets</ArrowLink>
          </div>
        </Status>
      )
  }
}

function Status({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      {icon}
      <h1 id="confirm-title" className="mt-6 text-headline font-medium">
        {title}
      </h1>
      <div className="mt-6 max-w-xl text-lede text-cream/80">{children}</div>
    </div>
  )
}

function Reference({ value }: { value: string }) {
  return (
    <p className="mt-6 text-base">
      <span className="eyebrow text-cream/50">Reference</span>
      <span className="mt-1 block select-all font-mono text-lg text-cream">{value}</span>
    </p>
  )
}

function TicketSummary({ ticket }: { ticket: Ticket }) {
  const rows: Array<[string, string]> = [
    ['Reference', ticket.reference],
    ['Ticket', `${ticket.quantity} × ${ticket.tier}`],
    ['Paid', ticket.currency === 'NGN' ? formatNaira(ticket.amount) : `${ticket.amount} ${ticket.currency}`],
    ['Name', ticket.name],
    ['Email', ticket.email],
  ]
  return (
    <dl className="mt-8 divide-y divide-cream/10 rounded-[16px] border border-cream/15 text-base">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-wrap justify-between gap-2 px-5 py-4">
          <dt className="text-cream/55">{k}</dt>
          <dd className={k === 'Reference' ? 'select-all font-mono' : undefined}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}
