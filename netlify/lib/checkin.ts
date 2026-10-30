import { timingSafeEqual } from 'node:crypto'
import { tierById } from '../../src/content/tickets'
import type { Order, OrderStore } from './orders'
import { isValidTicketSignature } from './ticketLinks'

export type CheckInRequest = { ref: string; sig: string | null; pin?: string | null; admit?: boolean }

export type PassInfo = {
  reference: string
  tier: string
  quantity: number
  name: string
  paid: boolean
  checkedInAt: string | null
}

export type CheckInResult =
  | { ok: true; outcome: 'valid' | 'admitted' | 'already_admitted' | 'unpaid'; staff: boolean; pass: PassInfo }
  | { ok: false; status: number; error: string }

const pass = (o: Order): PassInfo => ({
  reference: o.txRef,
  tier: tierById(o.tier).name,
  quantity: o.quantity,
  name: o.name,
  paid: o.status === 'paid',
  checkedInAt: o.checkedInAt ?? null,
})

function pinMatches(pin: string | null | undefined, staffPin: string) {
  if (!pin || !staffPin) return false
  const a = Buffer.from(pin)
  const b = Buffer.from(staffPin)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Looks up a ticket from its signed link. Anyone with the link sees the
 * pass; only staff (correct CHECKIN_PIN) can admit it, and only once.
 */
export async function checkIn(
  store: OrderStore,
  req: CheckInRequest,
  { signingSecret, staffPin }: { signingSecret: string; staffPin: string },
  now = new Date(),
): Promise<CheckInResult> {
  if (!isValidTicketSignature(req.ref, req.sig, signingSecret)) {
    return { ok: false, status: 404, error: 'This is not a valid Creators Hub ticket.' }
  }
  const staff = req.pin != null && req.pin !== ''
  if (staff && !pinMatches(req.pin, staffPin)) return { ok: false, status: 401, error: 'Incorrect staff PIN.' }

  const order = await store.get(req.ref)
  if (!order) return { ok: false, status: 404, error: 'This is not a valid Creators Hub ticket.' }
  if (order.status !== 'paid') return { ok: true, outcome: 'unpaid', staff, pass: pass(order) }

  if (staff && req.admit) {
    if (order.checkedInAt) return { ok: true, outcome: 'already_admitted', staff, pass: pass(order) }
    const admitted: Order = { ...order, checkedInAt: now.toISOString() }
    await store.save(admitted)
    return { ok: true, outcome: 'admitted', staff, pass: pass(admitted) }
  }
  return { ok: true, outcome: order.checkedInAt ? 'already_admitted' : 'valid', staff, pass: pass(order) }
}
