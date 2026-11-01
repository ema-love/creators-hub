import { timingSafeEqual } from 'node:crypto'
import type { Kv } from './kv'

const MAX_PIN_FAILURES = 8
const WINDOW_MS = 15 * 60 * 1000

export type StaffAuthResult = { ok: true } | { ok: false; status: 401 | 429; error: string }

function pinMatches(pin: string, staffPin: string) {
  const a = Buffer.from(pin)
  const b = Buffer.from(staffPin)
  return staffPin.length > 0 && a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Checks the door-staff PIN (CHECKIN_PIN). After repeated wrong attempts the
 * caller is locked out for 15 minutes, even if it then guesses right.
 */
export async function checkStaffPin(
  kv: Kv,
  pin: string | null | undefined,
  { staffPin, clientId = 'unknown', now = new Date() }: { staffPin: string; clientId?: string; now?: Date },
): Promise<StaffAuthResult> {
  const bucket = `pinfail/${clientId}/${Math.floor(now.getTime() / WINDOW_MS)}`
  const fails = (await kv.get<{ n: number }>(bucket))?.n ?? 0
  if (fails >= MAX_PIN_FAILURES) return { ok: false, status: 429, error: 'Too many attempts. Try again in 15 minutes.' }
  if (!pin || !pinMatches(pin, staffPin)) {
    await kv.put(bucket, { n: fails + 1 })
    return { ok: false, status: 401, error: 'Incorrect staff PIN.' }
  }
  return { ok: true }
}
