import { deliveryConfig } from '../lib/delivery'
import { renderRegistrationEmail } from '../lib/email'
import { json, registrationUrl } from '../lib/http'
import { blobKv } from '../lib/kv'
import { findByEmail } from '../lib/register'
import { blobRegistrationStore } from '../lib/registrations'

const SENT = { message: 'If that email is registered, we’ve sent the ticket to it again.' }
const NOT_FOUND = { error: 'We couldn’t find a registration with that email and reference. Check both and try again.' }

/**
 * POST /.netlify/functions/find-ticket  Body: { email, reference? }
 *
 * With email set up: re-sends the ticket to that address. The reply is the
 * same whether or not it's registered, so it can't be used to look people up.
 *
 * Without email: the email plus the registration reference (a random code
 * shown when they registered) opens the private ticket page instead.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const email = String(body?.email ?? '').trim().toLowerCase()
  const reference = String(body?.reference ?? '').trim().toUpperCase()
  if (!email) return json({ error: 'Enter the email you registered with.' }, 400)

  const kv = blobKv('tickets')
  const { mailer, siteOrigin } = deliveryConfig(req)
  const found = await findByEmail(kv, blobRegistrationStore(), email)

  if (mailer) {
    if (found) {
      const hour = new Date().toISOString().slice(0, 13)
      await mailer
        .send(renderRegistrationEmail(found.registration, found.ticket, siteOrigin, `registration-find-${found.registration.ref}-${hour}`))
        .catch((err) => console.error('find-ticket email failed', err))
    }
    return json(SENT)
  }

  if (!reference) return json({ error: 'Enter your registration reference too. It starts with CH001-.' }, 400)
  if (!found || found.registration.ref !== reference) return json(NOT_FOUND, 404)
  return json({ url: registrationUrl(siteOrigin, found.registration.ref, found.registration.accessKey) })
}
