import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { isTicketDesignId, type TicketDesignId } from '../../src/content/ticketDesigns'
import { claim, type Kv } from './kv'
import type { Registration, RegistrationStore } from './registrations'
import { issueTicket, ticketForRegistration, type Ticket } from './tickets'

export type RegistrationInput = { name: string; email: string; design: TicketDesignId }

export type Result<T> = { ok: true; value: T } | { ok: false; status: number; error: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validates a registration. There is no quantity: one person, one ticket. */
export function parseRegistration(body: unknown): Result<RegistrationInput> {
  const b = (body ?? {}) as Record<string, unknown>
  const fail = (error: string) => ({ ok: false as const, status: 400, error })
  // Hidden field that people never see; bots fill it in.
  if (typeof b.company === 'string' && b.company.trim()) return fail('We couldn’t complete your registration.')

  const name = String(b.name ?? '').trim().replace(/\s+/g, ' ')
  const email = String(b.email ?? '').trim().toLowerCase()
  if (name.length < 2 || name.length > 80) return fail('Enter your full name.')
  if (!EMAIL.test(email) || email.length > 200) return fail('Enter a valid email address.')
  if (!isTicketDesignId(b.design)) return fail('Choose the creative arm you’re under.')
  return { ok: true, value: { name, email, design: b.design } }
}

/**
 * The address an email really delivers to, so one inbox can't register
 * twice: case-insensitive, "+tags" removed, and for Gmail the dots too
 * (a.b+x@gmail.com and ab@googlemail.com are the same inbox).
 */
export function canonicalEmail(email: string): string {
  const [rawLocal = '', rawDomain = ''] = email.trim().toLowerCase().split(/@(?=[^@]*$)/)
  let local = rawLocal.split('+')[0] ?? ''
  let domain = rawDomain
  if (domain === 'googlemail.com') domain = 'gmail.com'
  if (domain === 'gmail.com') local = local.replace(/\./g, '')
  return `${local}@${domain}`
}

const emailKey = (email: string) => `email/${createHash('sha256').update(canonicalEmail(email)).digest('hex').slice(0, 40)}`

export const newRef = () => `CH001-${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`

/** Capacity from EVENT_CAPACITY: a whole number, or null for no limit. */
export function capacityFromEnv(value = process.env.EVENT_CAPACITY): number | null {
  const v = (value ?? '').trim()
  if (!v) return null
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 ? n : null
}

/** Places taken so far. */
export async function seatsTaken(kv: Kv): Promise<number> {
  return (await kv.list('seat/')).length
}

export type RegisterOutcome =
  | { state: 'registered'; registration: Registration; ticket: Ticket }
  | { state: 'already_registered'; registration: Registration | null }
  | { state: 'full' }
  | { state: 'closed' }

type EmailClaim = { ref: string; at: number; owner?: string }

/** A claim older than this with no finished registration is from a request that died midway. */
const STALE_CLAIM_MS = 60_000

/** Takes the next free place, or returns null when the event is full. */
async function claimSeat(kv: Kv, ref: string, capacity: number): Promise<number | null> {
  let n = (await kv.get<{ next: number }>('seatcounter'))?.next ?? 1
  for (; n <= capacity; n++) {
    if (await claim(kv, `seat/${n}`, { ref })) {
      await kv.put('seatcounter', { next: n + 1 })
      return n
    }
  }
  return null
}

/**
 * Registers one person for one free ticket.
 *
 * Exactly one registration per inbox, even when the same email is submitted
 * many times at once: the first request to claim the email's key wins, and
 * every other request is told the email is already registered. With a
 * capacity set, each registration also claims one numbered place.
 */
export async function registerAttendee(
  kv: Kv,
  store: RegistrationStore,
  input: RegistrationInput,
  { capacity, now = new Date() }: { capacity: number | null; now?: Date },
): Promise<RegisterOutcome> {
  if (capacity === 0) return { state: 'closed' }
  const key = emailKey(input.email)
  const ref = newRef()

  if (!(await claim<EmailClaim>(kv, key, { ref, at: now.getTime() }))) {
    const existing = await kv.get<EmailClaim>(key)
    const registration = existing ? await store.get(existing.ref) : null
    if (registration?.ticketId || !existing || now.getTime() - existing.at < STALE_CLAIM_MS) {
      return { state: 'already_registered', registration }
    }
    // The earlier attempt never finished: clear it and try once more.
    await kv.delete(key)
    if (!(await claim<EmailClaim>(kv, key, { ref, at: now.getTime() }))) {
      return { state: 'already_registered', registration: null }
    }
  }

  if (capacity !== null && (await claimSeat(kv, ref, capacity)) === null) {
    await kv.delete(key) // free the email so they can register if places open up
    return { state: 'full' }
  }

  let registration: Registration = {
    ref,
    name: input.name,
    email: input.email,
    design: input.design,
    accessKey: randomBytes(18).toString('base64url'),
    createdAt: now.toISOString(),
  }
  await store.save(registration)
  const ticket = await issueTicket(kv, registration, now)
  registration = { ...registration, ticketId: ticket.id }
  await store.save(registration)
  return { state: 'registered', registration, ticket }
}

/** The registration (and its ticket) for an email address, if there is one. */
export async function findByEmail(kv: Kv, store: RegistrationStore, email: string) {
  const existing = await kv.get<EmailClaim>(emailKey(email))
  const registration = existing ? await store.get(existing.ref) : null
  if (!registration?.ticketId) return null
  const ticket = await ticketForRegistration(kv, registration.ref)
  return ticket ? { registration, ticket } : null
}
