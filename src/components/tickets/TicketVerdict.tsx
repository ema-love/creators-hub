import { CheckCircle2, Clock, TriangleAlert, XCircle } from 'lucide-react'
import { designById } from '../../content/ticketDesigns'
import { formatTime, type TicketView, type VerifyOutcome } from '../../lib/ticketApi'
import { cn } from '../../lib/cn'

/** Large, unmistakable result for the door: valid, admitted, already used, invalid, unpaid. */
export function TicketVerdict({ outcome, ticket, staff }: { outcome: VerifyOutcome; ticket: TicketView | null; staff: boolean }) {
  const who = ticket ? `${ticket.attendeeName} · ${designById(ticket.design).name} · ${ticket.category === 'premium' ? 'Premium' : 'Regular'}` : ''
  const v = {
    valid: {
      tone: 'good',
      icon: <CheckCircle2 className="h-7 w-7" />,
      title: 'Valid ticket',
      body: staff ? `${who}. Not yet checked in.` : 'Paid and ready. Show this QR code at the door.',
    },
    admitted: { tone: 'good', icon: <CheckCircle2 className="h-7 w-7" />, title: 'Admitted', body: `${who}. Welcome in.` },
    checked_in: {
      tone: 'warn',
      icon: <TriangleAlert className="h-7 w-7" />,
      title: `Already checked in${ticket?.checkedInAt ? ` at ${formatTime(ticket.checkedInAt)}` : ''}`,
      body: staff ? `${who}. This ticket has been used. Do not admit again.` : 'This ticket has already been used at the door.',
    },
    invalid: {
      tone: 'bad',
      icon: <XCircle className="h-7 w-7" />,
      title: 'Invalid ticket',
      body: 'This code doesn’t match a Creators Hub 001 ticket. Do not admit.',
    },
    awaiting_payment: {
      tone: 'bad',
      icon: <Clock className="h-7 w-7" />,
      title: 'Awaiting payment confirmation',
      body: 'Payment for this ticket hasn’t been confirmed, so it can’t be admitted yet.',
    },
  }[outcome]

  return (
    <div
      role="status"
      className={cn(
        'flex gap-4 rounded-[20px] p-5 md:p-6',
        v.tone === 'good' && 'bg-electric text-ink',
        v.tone === 'warn' && 'bg-rust text-ink',
        v.tone === 'bad' && 'border-2 border-rust bg-rust/10 text-cream',
      )}
    >
      <span className="shrink-0" aria-hidden="true">
        {v.icon}
      </span>
      <div>
        <p className="font-display text-2xl font-medium leading-tight">{v.title}</p>
        <p className="mt-1 opacity-90">{v.body}</p>
        {ticket && <p className="mt-2 font-mono text-sm opacity-80">{ticket.id}</p>}
      </div>
    </div>
  )
}
