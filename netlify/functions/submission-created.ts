import { formNames } from '../../src/content/forms'
import { sheetConfigFromEnv } from '../lib/sheet'
import { applicationFromSubmission, sendToSheet } from '../lib/volunteerSheet'

/**
 * Netlify runs this automatically after every verified (non-spam) form
 * submission. Volunteer applications are passed on to the organiser's
 * Google Sheet, which records the row and emails the organiser.
 *
 * Submissions are always kept in Netlify → Forms as well, so nothing is lost
 * if the sheet is unreachable or not set up yet.
 */
type NetlifyFormEvent = { body?: string | null }

export const handler = async (event: NetlifyFormEvent) => {
  let payload: { form_name?: string; data?: Record<string, unknown>; created_at?: string; id?: string }
  try {
    payload = JSON.parse(event.body ?? '{}').payload ?? {}
  } catch {
    return { statusCode: 400, body: 'Bad payload' }
  }

  if (payload.form_name !== formNames.volunteer) return { statusCode: 200, body: 'Ignored' }

  const config = sheetConfigFromEnv()
  if (!config) {
    console.warn('Volunteer application received, but GOOGLE_SHEET_URL / GOOGLE_SHEET_KEY are not set.')
    return { statusCode: 200, body: 'Sheet not configured' }
  }

  try {
    await sendToSheet(applicationFromSubmission(payload), config)
    return { statusCode: 200, body: 'Sent to sheet' }
  } catch (err) {
    // Logged in Netlify → Logs → Functions. The submission is still in Netlify → Forms.
    console.error(err)
    return { statusCode: 502, body: 'Sheet unavailable' }
  }
}
