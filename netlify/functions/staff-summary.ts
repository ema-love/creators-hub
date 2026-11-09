import { clientId, json } from '../lib/http'
import { blobKv } from '../lib/kv'
import { capacityFromEnv } from '../lib/register'
import { checkStaffPin } from '../lib/staffAuth'
import { staffSummary } from '../lib/staffSummary'

/**
 * POST /.netlify/functions/staff-summary  Body: { pin }
 * Registration and check-in numbers for the staff area. Staff PIN required.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const body = (await req.json().catch(() => null)) as { pin?: unknown } | null
  const kv = blobKv('tickets')
  const auth = await checkStaffPin(kv, typeof body?.pin === 'string' ? body.pin : null, {
    staffPin: process.env.CHECKIN_PIN ?? '',
    clientId: clientId(req),
  })
  if (!auth.ok) return json({ error: auth.error }, auth.status)
  return json(await staffSummary(kv, { capacity: capacityFromEnv() }))
}
