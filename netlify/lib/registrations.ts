import { getStore } from '@netlify/blobs'
import type { TicketDesignId } from '../../src/content/ticketDesigns'

/** One person's free registration. Each has exactly one ticket. */
export type Registration = {
  /** Registration reference, e.g. CH001-3F9A0C2B71D45E08. */
  ref: string
  name: string
  /** As entered (trimmed, lower-cased). Tickets are sent here. */
  email: string
  /** Creative arm, which sets the ticket design. */
  design: TicketDesignId
  /** Secret for the private "your ticket" link. */
  accessKey: string
  createdAt: string
  ticketId?: string
  /** Set once the confirmation email has been accepted by the email service. */
  emailSentAt?: string
  /** Set once the row is in the Google Sheet. */
  sheetSavedAt?: string
}

export type RegistrationStore = {
  get(ref: string): Promise<Registration | null>
  save(registration: Registration): Promise<void>
}

/** Registrations live in Netlify Blobs (store "registrations"), keyed by reference. */
export function blobRegistrationStore(): RegistrationStore {
  const store = getStore({ name: 'registrations', consistency: 'strong' })
  return {
    get: async (ref) => (await store.get(ref, { type: 'json' })) as Registration | null,
    save: async (r) => {
      await store.setJSON(r.ref, r)
    },
  }
}

export function memoryRegistrationStore(): RegistrationStore & { data: Map<string, Registration> } {
  const data = new Map<string, Registration>()
  return {
    data,
    get: async (ref) => (data.has(ref) ? structuredClone(data.get(ref)!) : null),
    save: async (r) => void data.set(r.ref, structuredClone(r)),
  }
}
