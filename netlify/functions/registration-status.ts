import { json } from '../lib/http'
import { blobKv } from '../lib/kv'
import { capacityFromEnv, seatsTaken } from '../lib/register'

/**
 * GET /.netlify/functions/registration-status
 * { open, full }: `open` is false only when registration is closed
 * (EVENT_CAPACITY = 0). `full` means the in-person places are taken; online
 * registration stays open. EVENT_CAPACITY limits in-person places only.
 */
export default async () => {
  const capacity = capacityFromEnv()
  if (capacity === null) return json({ open: true, full: false })
  if (capacity === 0) return json({ open: false, full: false })
  const full = (await seatsTaken(blobKv('tickets'))) >= capacity
  return json({ open: true, full })
}
