import { timingSafeEqual } from 'node:crypto'
import { mailerFromEnv } from '../lib/delivery'
import { json } from '../lib/http'
import { blobKv } from '../lib/kv'
import { blobRegistrationStore } from '../lib/registrations'
import { ownerView, ticketForRegistration } from '../lib/tickets'

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/**
 * GET /.netlify/functions/get-registration?ref=…&k=…
 * The attendee's private "your ticket" link. `k` is the registration's secret access key.
 */
export default async (req: Request) => {
  const params = new URL(req.url).searchParams
  const ref = params.get('ref') ?? ''
  const key = params.get('k') ?? ''
  const registration = ref ? await blobRegistrationStore().get(ref) : null
  if (!registration || !key || !same(key, registration.accessKey)) return json({ error: 'We couldn’t find that ticket.' }, 404)

  const ticket = await ticketForRegistration(blobKv('tickets'), registration.ref)
  if (!ticket) return json({ error: 'We couldn’t find that ticket.' }, 404)
  return json({
    registration: {
      reference: registration.ref,
      name: registration.name,
      emailSent: Boolean(registration.emailSentAt),
      emailEnabled: mailerFromEnv() !== null,
    },
    ticket: ownerView(ticket),
  })
}
