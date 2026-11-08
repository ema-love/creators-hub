import { deliveryConfig } from '../lib/delivery'
import { renderTicketEmail } from '../lib/email'
import { json, orderUrl } from '../lib/http'
import { blobKv } from '../lib/kv'
import { blobOrderStore } from '../lib/orders'
import { ticketsForOrder } from '../lib/tickets'

const DONE = { message: 'If that matches a paid order, we’ve sent the tickets to its email address.' }
const NOT_FOUND = { error: 'We couldn’t find a paid order with that email and reference. Check both and try again.' }

/**
 * POST /.netlify/functions/resend-tickets  Body: { email, reference }
 * Re-sends tickets to the address on the order. The response is the same
 * whether or not the order exists, so it can't be used to look people up.
 *
 * When ticket email isn't set up (no Resend key), there is nothing to send, so
 * a matching email + reference returns the order's private link instead. The
 * reference is a random 16-character code from the payment receipt, so the
 * pair can't be guessed.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const email = String(body?.email ?? '').trim().toLowerCase()
  const ref = String(body?.reference ?? '').trim().toUpperCase()
  if (!email || !ref) return json({ error: 'Enter your email and order reference.' }, 400)

  const { mailer, siteOrigin } = deliveryConfig(req)
  const order = await blobOrderStore().get(ref)
  const matches = Boolean(order && order.status === 'paid' && order.email === email)

  if (!mailer) {
    return matches ? json({ url: orderUrl(siteOrigin, order!.txRef, order!.accessKey) }) : json(NOT_FOUND, 404)
  }
  if (!matches) return json(DONE)

  const tickets = await ticketsForOrder(blobKv('tickets'), order!)
  if (tickets.length) {
    // At most one resend per order per hour.
    const hour = new Date().toISOString().slice(0, 13)
    await mailer.send(renderTicketEmail(order!, tickets, siteOrigin, `ticket-resend-${order!.txRef}-${hour}`)).catch((err) => {
      console.error('resend failed', err)
    })
  }
  return json(DONE)
}
