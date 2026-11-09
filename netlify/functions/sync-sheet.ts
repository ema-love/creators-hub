import { blobKv } from '../lib/kv'
import { flushSheetQueue } from '../lib/registrationDelivery'
import { blobRegistrationStore } from '../lib/registrations'
import { sheetConfigFromEnv } from '../lib/sheet'
import { ticketForRegistration } from '../lib/tickets'

/**
 * Runs every hour: writes any registrations the Google Sheet didn't receive
 * at the time (sheet not set up yet, or briefly unreachable).
 */
export default async () => {
  const sheet = sheetConfigFromEnv()
  if (!sheet) return new Response('Sheet not configured')
  const kv = blobKv('tickets')
  const result = await flushSheetQueue(kv, blobRegistrationStore(), sheet, (ref) => ticketForRegistration(kv, ref))
  console.log(`sync-sheet: ${result.saved} saved, ${result.failed} failed`)
  return new Response(JSON.stringify(result))
}

export const config = { schedule: '@hourly' }
