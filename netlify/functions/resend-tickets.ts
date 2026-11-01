import { deliveryConfig } from '../lib/delivery'
import { renderTicketEmail } from '../lib/email'
import { json } from '../lib/http'
import { blobKv } from '../lib/kv'
import { blobOrderStore } from '../lib/orders'
import { ticketsForOrder } from '../lib/tickets'

const DONE = { message: 'If that matches a paid order, we’ve sent the tickets to its email address.' }

/**
 * POST /.netlify/functions/resend-tickets  Body: { email, reference }
 * Re-sends tickets to the address on the order. The response is the same
 * whether or not the order exists, so it can't be used to look people up.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const email = String(body?.email ?? '').trim().toLowerCase()
  const ref = String(body?.reference ?? '').trim().toUpperCase()
  if (!email || !ref) return json({ error: 'Enter your email and order reference.' }, 400)

  const order = await blobOrderStore().get(ref)
  if (!order || order.status !== 'paid' || order.email !== email) return json(DONE)

  const { mailer, siteOrigin } = deliveryConfig(req)
  const tickets = await ticketsForOrder(blobKv('tickets'), order)
  if (mailer && tickets.length) {
    // At most one resend per order per hour.
    const hour = new Date().toISOString().slice(0, 13)
    await mailer.send(renderTicketEmail(order, tickets, siteOrigin, `ticket-resend-${order.txRef}-${hour}`)).catch((err) => {
      console.error('resend failed', err)
    })
  }
  return json(DONE)
}
