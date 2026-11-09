import { designById } from '../../src/content/ticketDesigns'
import { renderRegistrationEmail, type Mailer } from './email'
import type { Kv } from './kv'
import type { Registration, RegistrationStore } from './registrations'
import { postToSheet, type SheetConfig } from './sheet'
import type { Ticket } from './tickets'

export type Delivery = { mailer: Mailer | null; siteOrigin: string; sheet: SheetConfig | null }

/** Registrations waiting to be written to the Google Sheet. Retried every 10 minutes by retry-pending. */
export const SHEET_PENDING = 'sheet-pending/'
/** Confirmation emails waiting to be sent (cut short, or Gmail's daily limit reached). Retried every 10 minutes. */
export const EMAIL_PENDING = 'email-pending/'

/** The row added to the sheet's Registrations tab. */
export const sheetRow = (r: Registration, t: Ticket) => ({
  ref: r.ref,
  ticketId: t.id,
  name: r.name,
  email: r.email,
  arm: designById(t.design).name,
  registeredAt: r.createdAt,
})

/**
 * Sends the confirmation email and writes the sheet row, each at most once.
 * Neither can undo a registration: an email or row that doesn't go through
 * stays queued and is retried every 10 minutes until it does.
 */
export async function deliverRegistration(
  kv: Kv,
  store: RegistrationStore,
  registration: Registration,
  ticket: Ticket,
  { mailer, siteOrigin, sheet }: Delivery,
  now = new Date(),
): Promise<Registration> {
  const patch: Partial<Registration> = {}

  const email = async () => {
    if (!mailer || registration.emailSentAt) return
    // Marked first, so if this run is cut short the retry still picks it up.
    await kv.put(EMAIL_PENDING + registration.ref, { at: now.toISOString() })
    try {
      await mailer.send(renderRegistrationEmail(registration, ticket, siteOrigin))
      patch.emailSentAt = now.toISOString()
      await kv.delete(EMAIL_PENDING + registration.ref)
    } catch (err) {
      console.error(`confirmation email failed for ${registration.ref}`, err)
    }
  }

  const row = async () => {
    if (registration.sheetSavedAt) return
    // Marked first: if the sheet isn't set up, is unreachable, or this run is
    // cut short, the retry adds the row later.
    await kv.put(SHEET_PENDING + registration.ref, { at: now.toISOString() })
    if (!sheet) return
    try {
      await postToSheet({ kind: 'registration', registration: sheetRow(registration, ticket) }, sheet)
      patch.sheetSavedAt = now.toISOString()
      await kv.delete(SHEET_PENDING + registration.ref)
    } catch (err) {
      console.error(`sheet row failed for ${registration.ref}`, err)
    }
  }

  await Promise.all([email(), row()])
  if (!Object.keys(patch).length) return registration
  const latest = (await store.get(registration.ref)) ?? registration
  const updated = { ...latest, ...patch }
  await store.save(updated)
  return updated
}

/** Writes queued registrations to the sheet. Returns how many were saved. */
export async function flushSheetQueue(
  kv: Kv,
  store: RegistrationStore,
  sheet: SheetConfig,
  ticketFor: (ref: string) => Promise<Ticket | null>,
  { limit = 200, now = new Date() } = {},
): Promise<{ saved: number; failed: number }> {
  const keys = (await kv.list(SHEET_PENDING)).slice(0, limit)
  let saved = 0
  let failed = 0
  for (const key of keys) {
    const ref = key.slice(SHEET_PENDING.length)
    const registration = await store.get(ref)
    const ticket = registration ? await ticketFor(ref) : null
    if (!registration || !ticket || registration.sheetSavedAt) {
      await kv.delete(key)
      continue
    }
    try {
      await postToSheet({ kind: 'registration', registration: sheetRow(registration, ticket) }, sheet)
      await store.save({ ...((await store.get(ref)) ?? registration), sheetSavedAt: now.toISOString() })
      await kv.delete(key)
      saved++
    } catch (err) {
      console.error(`sheet retry failed for ${ref}`, err)
      failed++
      if (failed >= 3) break // the sheet is probably down; try again next hour
    }
  }
  return { saved, failed }
}

/**
 * Sends queued confirmation emails. Stops at the first refusal, which is
 * usually the daily sending limit: the rest wait for the next run.
 */
export async function flushEmailQueue(
  kv: Kv,
  store: RegistrationStore,
  mailer: Mailer,
  siteOrigin: string,
  ticketFor: (ref: string) => Promise<Ticket | null>,
  { limit = 100, now = new Date() } = {},
): Promise<{ sent: number; failed: number }> {
  const keys = (await kv.list(EMAIL_PENDING)).slice(0, limit)
  let sent = 0
  let failed = 0
  for (const key of keys) {
    const ref = key.slice(EMAIL_PENDING.length)
    const registration = await store.get(ref)
    const ticket = registration ? await ticketFor(ref) : null
    if (!registration || !ticket || registration.emailSentAt) {
      await kv.delete(key)
      continue
    }
    try {
      await mailer.send(renderRegistrationEmail(registration, ticket, siteOrigin))
      await store.save({ ...((await store.get(ref)) ?? registration), emailSentAt: now.toISOString() })
      await kv.delete(key)
      sent++
    } catch (err) {
      console.error(`email retry failed for ${ref}`, err)
      failed++
      break
    }
  }
  return { sent, failed }
}
