import { checkIn } from '../lib/checkin'
import { blobOrderStore } from '../lib/orders'
import { json, ticketConfig } from '../lib/http'

/**
 * POST /.netlify/functions/check-in
 * Body: { ref, sig, pin?, admit? }
 * Without a PIN: returns the ticket pass. With the staff PIN (CHECKIN_PIN): may admit it once.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const ref = typeof body?.ref === 'string' ? body.ref : ''
  const result = await checkIn(
    blobOrderStore(),
    {
      ref,
      sig: typeof body?.sig === 'string' ? body.sig : null,
      pin: typeof body?.pin === 'string' ? body.pin : null,
      admit: body?.admit === true,
    },
    { signingSecret: ticketConfig().signingSecret, staffPin: process.env.CHECKIN_PIN ?? '' },
  )
  return result.ok ? json(result) : json({ error: result.error }, result.status)
}
