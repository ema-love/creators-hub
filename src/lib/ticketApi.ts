import type { TicketDesignId } from '../content/ticketDesigns'
import type { TicketTierId } from '../content/tickets'

export type TicketView = {
  id: string
  orderRef: string
  attendeeName: string
  category: TicketTierId
  design: TicketDesignId
  paymentStatus: 'paid'
  status: 'valid' | 'checked_in' | 'void'
  purchasedAt: string
  issuedAt: string
  checkedInAt?: string
}

export type VerifyOutcome = 'valid' | 'admitted' | 'checked_in' | 'invalid' | 'awaiting_payment'

export class StaffAuthError extends Error {}

/** Asks the server about a ticket; with a staff PIN it may also admit it. */
export async function checkTicket(body: { token?: string; ticketId?: string; pin?: string; admit?: boolean }) {
  const res = await fetch('/.netlify/functions/ticket-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as { outcome?: VerifyOutcome; staff?: boolean; ticket?: TicketView | null; error?: string }
  if (res.status === 401 || res.status === 429) throw new StaffAuthError(data.error ?? 'Incorrect staff PIN.')
  if (!res.ok || !data.outcome) throw new Error(data.error ?? 'We couldn’t check this ticket. Check the connection and try again.')
  return { outcome: data.outcome, staff: Boolean(data.staff), ticket: data.ticket ?? null }
}

const PIN_KEY = 'ch:staff-pin'

/** The door PIN is remembered on the staff member's own device only. */
export const staffPin = {
  get(): string {
    try {
      return sessionStorage.getItem(PIN_KEY) ?? ''
    } catch {
      return ''
    }
  },
  set(pin: string) {
    try {
      if (pin) sessionStorage.setItem(PIN_KEY, pin)
      else sessionStorage.removeItem(PIN_KEY)
    } catch {
      /* storage unavailable: staff re-enter the PIN */
    }
  },
}

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
