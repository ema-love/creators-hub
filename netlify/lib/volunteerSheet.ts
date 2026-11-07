import { allVolunteerRoles, experienceLabel } from '../../src/content/volunteer'

/**
 * Sends each volunteer application to the organiser's Google Sheet.
 *
 * The sheet runs a small Google Apps Script (integrations/google-sheets/) that
 * adds the row and emails the sheet's owner. The script's web-app URL and a
 * shared key are set privately in Netlify:
 *   VOLUNTEER_SHEET_URL  the Apps Script web-app URL (ends in /exec)
 *   VOLUNTEER_SHEET_KEY  the connection key the sheet shows during setup
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

type SheetConfig = { url: string; key: string; fetch?: typeof fetch }

/** Posts the application to the sheet. Throws if the sheet doesn't confirm it. */
export async function sendToSheet(application: VolunteerApplication, { url, key, fetch: f = fetch }: SheetConfig) {
  const res = await f(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, application }),
    redirect: 'follow',
  })
  const text = await res.text()
  let body: { ok?: boolean; error?: string } = {}
  try {
    body = JSON.parse(text)
  } catch {
    // Apps Script answers with an HTML page when the deployment isn't public.
  }
  if (!res.ok || body.ok !== true) {
    throw new Error(`Google Sheet did not accept the application (${res.status}): ${body.error ?? text.slice(0, 200)}`)
  }
}

export function sheetConfigFromEnv(): SheetConfig | null {
  const url = (process.env.VOLUNTEER_SHEET_URL ?? '').trim()
  const key = (process.env.VOLUNTEER_SHEET_KEY ?? '').trim()
  return url && key ? { url, key } : null
}
