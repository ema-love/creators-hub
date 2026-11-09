/**
 * The organiser's Google Sheet. A small Google Apps Script attached to the
 * sheet (integrations/google-sheets/) receives volunteer applications and
 * ticket registrations and adds them as rows.
 *
 * Set privately in Netlify:
 *   GOOGLE_SHEET_URL  the Apps Script web-app URL (ends in /exec)
 *   GOOGLE_SHEET_KEY  the connection key the sheet shows during setup
 * (VOLUNTEER_SHEET_URL / VOLUNTEER_SHEET_KEY are still accepted.)
 */
export type SheetConfig = { url: string; key: string; fetch?: typeof fetch }

export function sheetConfigFromEnv(): SheetConfig | null {
  const url = (process.env.GOOGLE_SHEET_URL || process.env.VOLUNTEER_SHEET_URL || '').trim()
  const key = (process.env.GOOGLE_SHEET_KEY || process.env.VOLUNTEER_SHEET_KEY || '').trim()
  return url && key ? { url, key } : null
}

/** Posts to the sheet's script. Throws unless the sheet confirms it saved the data. */
export async function postToSheet(body: Record<string, unknown>, { url, key, fetch: f = fetch }: SheetConfig) {
  const res = await f(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, ...body }),
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
  })
  const text = await res.text()
  let reply: { ok?: boolean; error?: string } = {}
  try {
    reply = JSON.parse(text)
  } catch {
    // Apps Script answers with an HTML page when the deployment isn't public.
  }
  if (!res.ok || reply.ok !== true) {
    throw new Error(`Google Sheet did not accept the data (${res.status}): ${reply.error ?? text.slice(0, 200)}`)
  }
}
