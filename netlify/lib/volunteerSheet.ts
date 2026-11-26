import { experienceText, teamByTitle } from '../../src/content/volunteer'
import { postToSheet, type SheetConfig } from './sheet'

/**
 * Sends each volunteer application to the organiser's Google Sheet, which
 * adds the row and emails the sheet's owner. See integrations/google-sheets/.
 */

/** Field names posted by the volunteer form (keep in sync with index.html). */
const FIELDS = ['name', 'email', 'phone', 'team', 'second_team', 'attendance', 'experience', 'briefing'] as const
type Field = (typeof FIELDS)[number]

export type VolunteerApplication = Record<Field, string> & {
  /** "Beginners welcome", "Photo & video: Experience preferred · …" */
  teamLevel: string
  /** The first-choice team is subject to confirmation (the Marketplace). */
  conditional: boolean
  submittedAt: string
  submissionId: string
}

const MAX_LEN = 4000

const clean = (value: unknown) =>
  typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim().slice(0, MAX_LEN) : ''

/** Netlify `submission-created` payload → a tidy application record. */
export function applicationFromSubmission(payload: {
  data?: Record<string, unknown>
  created_at?: string
  id?: string
}): VolunteerApplication {
  const data = payload.data ?? {}
  const fields = Object.fromEntries(FIELDS.map((f) => [f, clean(data[f])])) as Record<Field, string>
  const first = teamByTitle(fields.team)
  return {
    ...fields,
    teamLevel: first ? experienceText(first) : '',
    conditional: first?.status === 'conditional',
    submittedAt: payload.created_at ?? new Date().toISOString(),
    submissionId: clean(payload.id),
  }
}

/** Posts the application to the sheet. Throws if the sheet doesn't confirm it. */
export const sendToSheet = (application: VolunteerApplication, config: SheetConfig) => postToSheet({ application }, config)
