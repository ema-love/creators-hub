import type { TicketDesignId } from '../content/ticketDesigns'
import type { TicketTierId } from '../content/tickets'

export type TicketView = {
  id: string
  ref: string
  attendeeName: string
  category: TicketTierId
  design: TicketDesignId
  status: 'valid' | 'checked_in' | 'void'
  issuedAt: string
  checkedInAt?: string
}

export type VerifyOutcome = 'valid' | 'admitted' | 'checked_in' | 'invalid'

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

export type StaffSummary = {
  totals: { issued: number; checkedIn: number }
  /** EVENT_CAPACITY, or null for no limit. */
  capacity: number | null
  byDesign: Array<{ id: TicketDesignId; name: string; issued: number; checkedIn: number }>
  recent: Array<{ id: string; attendeeName: string; design: TicketDesignId; checkedInAt: string }>
  generatedAt: string
}

export async function fetchStaffSummary(pin: string): Promise<StaffSummary> {
  const res = await fetch('/.netlify/functions/staff-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 || res.status === 429) throw new StaffAuthError(data.error ?? 'Incorrect staff PIN.')
  if (!res.ok) throw new Error(data.error ?? 'Couldn’t load the numbers.')
  return data as StaffSummary
}

/** Reads what a scanned QR contains: a ticket link (…/v/<token>) or a typed ticket ID. */
export function parseScan(text: string): { token: string } | { ticketId: string } | null {
  const trimmed = text.trim()
  const link = trimmed.match(/\/v\/([A-Za-z0-9_-]{16,64})(?:[?#].*)?$/)
  if (link) return { token: link[1]! }
  if (/^CH001-[FATS]-\d{4}$/i.test(trimmed)) return { ticketId: trimmed.toUpperCase() }
  return null
}
