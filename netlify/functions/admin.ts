import { createAnnouncement, listAnnouncements, parseMessage, recipients, registrationsCsv, renderAnnouncementEmail, sendAnnouncements } from '../lib/announce'
import { deliveryConfig } from '../lib/delivery'
import { clientId, json } from '../lib/http'
import { blobKv } from '../lib/kv'
import { blobRegistrationStore } from '../lib/registrations'
import { checkStaffPin } from '../lib/staffAuth'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /.netlify/functions/admin  Body: { pin, action, ... }
 * Organisers only (ADMIN_PIN, separate from the door staff's CHECKIN_PIN).
 *   summary   number registered and past messages with their progress
 *   export    everyone registered, as CSV
 *   test      send a message to one address first ({ subject, message, to })
 *   send      send a message to everyone registered ({ subject, message })
 */
export default async (req: Request, context?: { waitUntil?: (p: Promise<unknown>) => void }) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const kv = blobKv('tickets')
  const adminPin = (process.env.ADMIN_PIN ?? '').trim()
  if (!adminPin) return json({ error: 'The organiser area isn’t set up yet: add ADMIN_PIN in Netlify.' }, 503)
  const auth = await checkStaffPin(kv, typeof body?.pin === 'string' ? body.pin : null, { staffPin: adminPin, clientId: `admin:${clientId(req)}` })
  if (!auth.ok) return json({ error: auth.status === 401 ? 'Incorrect organiser PIN.' : auth.error }, auth.status)

  const store = blobRegistrationStore()
  const { mailer, siteOrigin } = deliveryConfig(req)
  const action = body?.action

  if (action === 'summary') {
    return json({ registered: (await recipients(kv, store)).length, emailEnabled: mailer !== null, announcements: await listAnnouncements(kv) })
  }

  if (action === 'export') {
    return new Response(registrationsCsv(await recipients(kv, store)), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="creators-hub-001-registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  if (action === 'test' || action === 'send') {
    if (!mailer) return json({ error: 'Email isn’t set up (GMAIL_MAILER_URL / GMAIL_MAILER_KEY).' }, 503)
    const msg = parseMessage(body)
    if ('error' in msg) return json(msg, 400)

    if (action === 'test') {
      const to = String(body?.to ?? '').trim().toLowerCase()
      if (!EMAIL.test(to)) return json({ error: 'Enter the email address to send the test to.' }, 400)
      const sample = {
        registration: { ref: 'CH001-PREVIEW', name: 'Ada Obi', email: to, design: 'film' as const, accessKey: 'preview', createdAt: new Date().toISOString() },
        ticket: { id: 'CH001-S-0000', ref: 'CH001-PREVIEW', attendeeName: 'Ada Obi', email: to, category: 'free' as const, design: 'film' as const, status: 'valid' as const, token: 'preview', issuedAt: new Date().toISOString() },
      }
      try {
        await mailer.send({ ...renderAnnouncementEmail({ id: `test-${Date.now()}`, ...msg }, sample, siteOrigin), subject: `[Test] ${msg.subject}` })
      } catch (err) {
        console.error('test announcement failed', err)
        return json({ error: 'The test didn’t send. Gmail may have reached today’s limit; try again tomorrow.' }, 502)
      }
      return json({ ok: true })
    }

    const announcement = await createAnnouncement(kv, store, msg)
    const batch = sendAnnouncements(kv, store, mailer, siteOrigin, { budgetMs: 8000 }).catch((err) => console.error('announcement batch failed', err))
    if (context?.waitUntil) context.waitUntil(batch)
    else await batch
    return json({ ok: true, announcement })
  }

  return json({ error: 'Unknown action.' }, 400)
}
