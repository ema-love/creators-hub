import { afterEach, describe, expect, it, vi } from 'vitest'
import { applicationFromSubmission, sendToSheet } from './volunteerSheet'
import { handler } from '../functions/submission-created'

const submission = (form_name: string, data: Record<string, unknown>) => ({
  body: JSON.stringify({ payload: { form_name, data, created_at: '2026-11-07T10:00:00.000Z', id: 'sub_1' } }),
})

const volunteerData = {
  name: '  Ada Obi ',
  email: 'ada@example.com',
  role: 'Vendor Relations Assistant',
  second_role: 'Photography Assistant',
  stage: 'Student',
  discipline: 'Fashion',
  experience: 'None yet',
  message: 'I want to learn.',
  'bot-field': '',
  extra: 'ignored',
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('volunteer applications → Google Sheet', () => {
  it('keeps only the form fields and adds department and level', () => {
    const app = applicationFromSubmission({ data: volunteerData, created_at: '2026-11-07T10:00:00.000Z', id: 'sub_1' })
    expect(app.name).toBe('Ada Obi')
    expect(app.department).toBe('Creative Marketplace')
    expect(app.conditional).toBe(true)
    expect(app.roleLevel).toBe('Beginners welcome')
    expect(app.secondDepartment).toBe('Marketing, Media & Communications')
    expect(app.submissionId).toBe('sub_1')
    expect(app).not.toHaveProperty('extra')
    expect(app).not.toHaveProperty('bot-field')
  })

  it('handles an unknown role and missing fields without failing', () => {
    const app = applicationFromSubmission({ data: { name: 'X', role: 'Not a role', experience: 42 } })
    expect(app.department).toBe('')
    expect(app.roleLevel).toBe('')
    expect(app.experience).toBe('')
    expect(app.email).toBe('')
  })

  it('posts the key and application, and accepts only an ok reply', async () => {
    const app = applicationFromSubmission({ data: volunteerData })
    const ok = vi.fn(async () => new Response('{"ok":true}'))
    await sendToSheet(app, { url: 'https://sheet.test/exec', key: 'k1', fetch: ok as unknown as typeof fetch })
    const [, init] = ok.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(String(init.body))).toMatchObject({ key: 'k1', application: { role: 'Vendor Relations Assistant' } })

    const refused = vi.fn(async () => new Response('{"ok":false,"error":"Wrong or missing connection key"}'))
    await expect(sendToSheet(app, { url: 'u', key: 'bad', fetch: refused as unknown as typeof fetch })).rejects.toThrow(/connection key/)

    const html = vi.fn(async () => new Response('<html>Sign in</html>'))
    await expect(sendToSheet(app, { url: 'u', key: 'k', fetch: html as unknown as typeof fetch })).rejects.toThrow(/did not accept/)
  })

  it('forwards volunteer submissions only', async () => {
    vi.stubEnv('VOLUNTEER_SHEET_URL', 'https://sheet.test/exec')
    vi.stubEnv('VOLUNTEER_SHEET_KEY', 'k1')
    const f = vi.fn(async () => new Response('{"ok":true}'))
    vi.stubGlobal('fetch', f)

    expect((await handler(submission('contact', { name: 'A' }))).statusCode).toBe(200)
    expect(f).not.toHaveBeenCalled()

    expect(await handler(submission('volunteer', volunteerData))).toMatchObject({ statusCode: 200, body: 'Sent to sheet' })
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('does nothing when the sheet is not configured, and reports a sheet failure', async () => {
    vi.stubEnv('VOLUNTEER_SHEET_URL', '')
    vi.stubEnv('VOLUNTEER_SHEET_KEY', '')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await handler(submission('volunteer', volunteerData))).toMatchObject({ body: 'Sheet not configured' })

    vi.stubEnv('VOLUNTEER_SHEET_URL', 'https://sheet.test/exec')
    vi.stubEnv('VOLUNTEER_SHEET_KEY', 'k1')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"ok":false,"error":"boom"}')))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await handler(submission('volunteer', volunteerData))).statusCode).toBe(502)
  })
})
