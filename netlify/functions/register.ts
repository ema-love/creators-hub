import { deliveryConfig } from '../lib/delivery'
import { renderRegistrationEmail } from '../lib/email'
import { clientId, json, registrationUrl } from '../lib/http'
import { blobKv, type Kv } from '../lib/kv'
import { capacityFromEnv, parseRegistration, registerAttendee } from '../lib/register'
import { deliverRegistration } from '../lib/registrationDelivery'
import { blobRegistrationStore } from '../lib/registrations'
import { sheetConfigFromEnv } from '../lib/sheet'
import { ownerView, ticketForRegistration } from '../lib/tickets'

/** Registrations allowed from one network per hour (shared Wi-Fi counts as one). */
const PER_HOUR = 40

async function rateLimited(kv: Kv, ip: string, now = new Date()) {
  const key = `rl/register/${ip}/${now.toISOString().slice(0, 13)}`
  const n = (await kv.get<{ n: number }>(key))?.n ?? 0
  if (n >= PER_HOUR) return true
  await kv.put(key, { n: n + 1 })
  return false
}

/**
 * POST /.netlify/functions/register  Body: { name, email, design }
 * Free registration: one person, one ticket, one registration per email.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const parsed = parseRegistration(await req.json().catch(() => null))
  if (!parsed.ok) return json({ error: parsed.error }, parsed.status)

  const kv = blobKv('tickets')
  if (await rateLimited(kv, clientId(req))) {
    return json({ error: 'Too many registrations from this network. Please try again in an hour.' }, 429)
  }

  try {
    const store = blobRegistrationStore()
    const { mailer, siteOrigin } = deliveryConfig(req)
    const outcome = await registerAttendee(kv, store, parsed.value, { capacity: capacityFromEnv() })

    if (outcome.state === 'full' || outcome.state === 'closed') return json({ state: outcome.state }, 409)

    if (outcome.state === 'already_registered') {
      // Send their ticket again (at most once an hour), so a lost email is easy to recover.
      let resent = false
      const existing = outcome.registration
      if (mailer && existing?.ticketId) {
        const ticket = await ticketForRegistration(kv, existing.ref)
        if (ticket) {
          const hour = new Date().toISOString().slice(0, 13)
          resent = await mailer
            .send(renderRegistrationEmail(existing, ticket, siteOrigin, `registration-resend-${existing.ref}-${hour}`))
            .then(() => true)
            .catch((err) => (console.error('resend failed', err), false))
        }
      }
      return json({ state: 'already_registered', resent }, 409)
    }

    const registration = await deliverRegistration(kv, store, outcome.registration, outcome.ticket, {
      mailer,
      siteOrigin,
      sheet: sheetConfigFromEnv(),
    })
    return json({
      state: 'registered',
      url: registrationUrl(siteOrigin, registration.ref, registration.accessKey),
      emailSent: Boolean(registration.emailSentAt),
      ticket: ownerView(outcome.ticket),
    })
  } catch (err) {
    console.error('registration failed', err)
    return json({ error: 'We couldn’t complete your registration. Please try again.' }, 500)
  }
}
