import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { firstRoom } from '../content/event'
import { formatNaira } from '../content/tickets'
import { Section } from '../components/layout/Section'
import { ArrowLink } from '../components/ui/ArrowLink'
import { TicketList, type OwnedTicket } from '../components/tickets/TicketCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cn } from '../lib/cn'

const VERIFY_URL = '/.netlify/functions/verify-payment'
const RETRY_MS = 4000
const MAX_TRIES = 8

type OrderSummary = {
  reference: string
  tier: string
  quantity: number
  amount: number
  currency: string
  name: string
  email: string
  emailSent?: boolean
  url?: string
}

type View =
  | { kind: 'checking' }
  | { kind: 'paid'; order: OrderSummary; tickets: OwnedTicket[] }
  | { kind: 'pending' }
  | { kind: 'failed'; reason: string }
  | { kind: 'cancelled' }
  | { kind: 'missing' }

/**
 * Where Flutterwave sends buyers back. Tickets appear only after the server
 * has verified the payment with Flutterwave; until then the page waits.
 */
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
        const body = (await res.json()) as { state?: string; order?: OrderSummary; tickets?: OwnedTicket[]; reason?: string }
        if (stopped) return
        if (body.state === 'paid' && body.order && body.tickets) {
          return setView({ kind: 'paid', order: body.order, tickets: body.tickets })
        }
        if (body.state === 'failed') return setView({ kind: 'failed', reason: body.reason ?? 'The payment did not go through.' })
        if (body.state === 'not_found') return setView({ kind: 'missing' })
        setView({ kind: 'pending' })
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

  const wide = view.kind === 'paid'
  return (
    <Section surface="dark" aria-labelledby="confirm-title" className="grain min-h-[85svh] bg-[#0c0b0a] pt-32 pb-24">
      <div className={cn('container-edge', wide ? 'max-w-6xl' : 'max-w-3xl')}>
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
          <p>We’re checking with Flutterwave. This usually takes a few seconds. Please keep this page open.</p>
        </Status>
      )
    case 'paid': {
      const { order, tickets } = view
      const paid = order.currency === 'NGN' ? formatNaira(order.amount) : `${order.amount} ${order.currency}`
      return (
        <div>
          <div className="print:hidden">
            <Status icon={<CheckCircle2 className="h-8 w-8 text-electric" />} title="You’re in the room.">
              <p>
                Payment confirmed for {firstRoom.fullName}, {firstRoom.dateLabel}, {firstRoom.city}. Each ticket below admits
                one person: show its QR code at the door, on your phone or printed.
              </p>
            </Status>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-sm text-cream/70">
              <div>
                <dt className="inline text-cream/45">Order </dt>
                <dd className="inline select-all font-mono text-cream">{order.reference}</dd>
              </div>
              <div>
                <dt className="inline text-cream/45">Paid </dt>
                <dd className="inline text-cream">{paid}</dd>
              </div>
              <div>
                <dt className="inline text-cream/45">Tickets </dt>
                <dd className="inline text-cream">
                  {order.quantity} × {order.tier}
                </dd>
              </div>
            </dl>
            <p className="mt-4 max-w-2xl text-sm text-cream/60">
              {order.emailSent
                ? `We’ve also emailed your tickets to ${order.email}.`
                : `Your tickets are being emailed to ${order.email}. Until it arrives, download them below.`}{' '}
              {order.url && (
                <>
                  You can always get back to them from{' '}
                  <a href={order.url} className="link-draw text-cream">
                    this private link
                  </a>{' '}
                  (bookmark it), or the link in the email.
                </>
              )}
            </p>
          </div>
          <div className="mt-14">
            <TicketList tickets={tickets} />
          </div>
        </div>
      )
    }
    case 'pending':
      return (
        <Status icon={<Clock className="h-8 w-8 text-rust" />} title="Still confirming your payment.">
          <p>
            Flutterwave hasn’t confirmed this payment yet. Bank transfers can take a few minutes. You don’t need to pay
            again: your tickets are issued and emailed automatically as soon as it clears.
          </p>
          {txRef && <Reference value={txRef} />}
          <p className="mt-6 text-cream/60">If you were charged and nothing arrives, contact us with your reference.</p>
        </Status>
      )
    case 'failed':
      return (
        <Status icon={<XCircle className="h-8 w-8 text-rust" />} title="The payment didn’t go through.">
          <p>{view.reason} No tickets were issued for this attempt.</p>
          {txRef && <Reference value={txRef} />}
          <div className="mt-10">
            <ArrowLink to="/tickets" variant="rust">
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
            <ArrowLink to="/tickets">Back to tickets</ArrowLink>
          </div>
        </Status>
      )
    case 'missing':
      return (
        <Status icon={<XCircle className="h-8 w-8 text-silver" />} title="We couldn’t find that order.">
          <p>This link doesn’t match a ticket order. If you’ve already paid, you can get your tickets sent again.</p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <ArrowLink to="/tickets/find">Find my tickets</ArrowLink>
            <ArrowLink to="/tickets" variant="text">
              Go to tickets
            </ArrowLink>
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
      <div className="mt-6 max-w-2xl text-lede text-cream/80">{children}</div>
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
