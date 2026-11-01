import { claim, type Kv } from './kv'
import { checkStaffPin } from './staffAuth'
import type { OrderStore } from './orders'
import { findTicketSlot, publicView, withCheckIn, type Ticket, type TicketView } from './tickets'

export type VerifyOutcome = 'valid' | 'admitted' | 'checked_in' | 'invalid' | 'awaiting_payment'

export type VerifyRequest = {
  token?: string | null
  /** Staff-only manual lookup, e.g. CH001-F-0001. */
  ticketId?: string | null
  pin?: string | null
  admit?: boolean
  clientId?: string
}

export type VerifyResult =
  | { ok: true; outcome: VerifyOutcome; staff: boolean; ticket: TicketView | null }
  | { ok: false; status: number; error: string }

/**
 * Checks a ticket. A ticket is valid only if its record exists, it has not
 * been voided, and its order's payment is confirmed. Staff (correct PIN) may
 * admit a valid ticket exactly once; concurrent scans cannot both succeed.
 */
export async function verifyTicket(
  kv: Kv,
  orders: OrderStore,
  req: VerifyRequest,
  { staffPin }: { staffPin: string },
  now = new Date(),
): Promise<VerifyResult> {
  const staff = Boolean(req.pin)
  if (staff) {
    const auth = await checkStaffPin(kv, req.pin, { staffPin, clientId: req.clientId, now })
    if (!auth.ok) return auth
  }
  if (req.ticketId && !staff) return { ok: false, status: 401, error: 'Staff PIN required.' }

  const by = req.token ? { token: req.token } : req.ticketId ? { ticketId: req.ticketId } : null
  const slot = by ? await findTicketSlot(kv, by) : null
  const stored = slot ? await kv.get<Ticket>(slot) : null
  if (!stored || stored.status === 'void') return { ok: true, outcome: 'invalid', staff, ticket: null }

  const ticket = await withCheckIn(kv, stored)
  const order = await orders.get(ticket.orderRef)
  if (!order || order.status !== 'paid') return { ok: true, outcome: 'awaiting_payment', staff, ticket: publicView(ticket) }
  if (ticket.status === 'checked_in') return { ok: true, outcome: 'checked_in', staff, ticket: publicView(ticket) }

  if (staff && req.admit) {
    // Only the first scanner can create the check-in record.
    const at = now.toISOString()
    if (await claim(kv, `checkin/${ticket.id}`, { at })) {
      const admitted: Ticket = { ...ticket, status: 'checked_in', checkedInAt: at }
      await kv.put(slot!, admitted)
      return { ok: true, outcome: 'admitted', staff, ticket: publicView(admitted) }
    }
    return { ok: true, outcome: 'checked_in', staff, ticket: publicView(await withCheckIn(kv, ticket)) }
  }
  return { ok: true, outcome: 'valid', staff, ticket: publicView(ticket) }
}
