import { json } from '../lib/http'
import { blobKv } from '../lib/kv'
import { capacityFromEnv, seatsTaken } from '../lib/register'

/**
 * GET /.netlify/functions/registration-status
 * Whether registration is open. Capacity is EVENT_CAPACITY (empty = no limit, 0 = closed).
 */
export default async () => {
  const capacity = capacityFromEnv()
  if (capacity === null) return json({ open: true, full: false })
  if (capacity === 0) return json({ open: false, full: false })
  const full = (await seatsTaken(blobKv('tickets'))) >= capacity
  return json({ open: !full, full })
}
