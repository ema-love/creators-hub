import { clientId, json } from '../lib/http'
import { blobKv } from '../lib/kv'
import { verifyTicket } from '../lib/verifyTicket'

/**
 * POST /.netlify/functions/ticket-status
 * Body: { token } or, for staff, { ticketId, pin }, plus { admit: true } to check in.
 * Anyone with a ticket's QR link can see its status; only staff (CHECKIN_PIN) can admit.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const str = (v: unknown) => (typeof v === 'string' && v ? v : null)

  const result = await verifyTicket(
    blobKv('tickets'),
    { token: str(body?.token), ticketId: str(body?.ticketId), pin: str(body?.pin), admit: body?.admit === true, clientId: clientId(req) },
    { staffPin: process.env.CHECKIN_PIN ?? '' },
  )
  return result.ok ? json(result) : json({ error: result.error }, result.status)
}
