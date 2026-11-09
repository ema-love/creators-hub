import { allVolunteerRoles, experienceLabel } from '../../src/content/volunteer'
import { postToSheet, type SheetConfig } from './sheet'

/**
 * Sends each volunteer application to the organiser's Google Sheet, which
 * adds the row and emails the sheet's owner. See integrations/google-sheets/.
 */

/** Field names posted by the volunteer form (keep in sync with index.html). */
const FIELDS = ['name', 'email', 'role', 'second_role', 'stage', 'discipline', 'experience', 'message'] as const
type Field = (typeof FIELDS)[number]

export type VolunteerApplication = Record<Field, string> & {
  department: string
  secondDepartment: string
  roleLevel: string
  conditional: boolean
  submittedAt: string
  submissionId: string
}

const MAX_LEN = 4000

const clean = (value: unknown) =>
  typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim().slice(0, MAX_LEN) : ''

const roleInfo = (title: string) => allVolunteerRoles.find((r) => r.title === title)

/** Netlify `submission-created` payload → a tidy application record. */
export function applicationFromSubmission(payload: {
  data?: Record<string, unknown>
  created_at?: string
  id?: string
}): VolunteerApplication {
  const data = payload.data ?? {}
  const fields = Object.fromEntries(FIELDS.map((f) => [f, clean(data[f])])) as Record<Field, string>
  const first = roleInfo(fields.role)
  const second = roleInfo(fields.second_role)
  return {
    ...fields,
    department: first?.department.title ?? '',
    secondDepartment: second?.department.title ?? '',
    roleLevel: first ? experienceLabel[first.experience] : '',
    conditional: first?.department.status === 'conditional',
    submittedAt: payload.created_at ?? new Date().toISOString(),
    submissionId: clean(payload.id),
  }
}

/** Posts the application to the sheet. Throws if the sheet doesn't confirm it. */
export const sendToSheet = (application: VolunteerApplication, config: SheetConfig) => postToSheet({ application }, config)
