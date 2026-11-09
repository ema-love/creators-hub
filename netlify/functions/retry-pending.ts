import { mailerFromEnv } from '../lib/delivery'
import { blobKv } from '../lib/kv'
import { flushEmailQueue, flushSheetQueue } from '../lib/registrationDelivery'
import { blobRegistrationStore } from '../lib/registrations'
import { sheetConfigFromEnv } from '../lib/sheet'
import { ticketForRegistration } from '../lib/tickets'

/**
 * Runs every hour. Sends confirmation emails that couldn't go out at the time
 * (for example, the Gmail account's daily limit was reached) and writes
 * registrations the Google Sheet didn't receive.
 */
export default async () => {
  const kv = blobKv('tickets')
  const store = blobRegistrationStore()
  const ticketFor = (ref: string) => ticketForRegistration(kv, ref)
  const site = (process.env.URL ?? '').replace(/\/+$/, '')

  const mailer = mailerFromEnv()
  const email = mailer && site ? await flushEmailQueue(kv, store, mailer, site, ticketFor) : null
  const sheet = sheetConfigFromEnv()
  const rows = sheet ? await flushSheetQueue(kv, store, sheet, ticketFor) : null

  const result = { email, sheet: rows }
  console.log('retry-pending', JSON.stringify(result))
  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
}

export const config = { schedule: '@hourly' }
