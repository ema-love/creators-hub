import { useCallback, useEffect, useState } from 'react'
import { Download, LogOut, RefreshCw, Send } from 'lucide-react'
import { firstRoom } from '../content/event'
import { Section } from '../components/layout/Section'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cn } from '../lib/cn'
import { formatTime } from '../lib/ticketApi'

const API = '/.netlify/functions/admin'
const PIN_KEY = 'ch:admin-pin'

type Announcement = { id: string; subject: string; createdAt: string; total: number; sent: number; status: 'sending' | 'done' }
type Summary = { registered: number; emailEnabled: boolean; announcements: Announcement[] }

class AuthError extends Error {}

async function call(pin: string, body: Record<string, unknown>) {
  const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin, ...body }) })
  if (res.status === 401 || res.status === 429) throw new AuthError((await res.json().catch(() => ({}))).error ?? 'Incorrect organiser PIN.')
  return res
}

const store = {
  get: () => {
    try {
      return sessionStorage.getItem(PIN_KEY) ?? ''
    } catch {
      return ''
    }
  },
  set: (v: string) => {
    try {
      if (v) sessionStorage.setItem(PIN_KEY, v)
      else sessionStorage.removeItem(PIN_KEY)
    } catch {
      /* storage unavailable */
    }
  },
}

const VENUE_TEMPLATE = {
  subject: `Venue confirmed: ${firstRoom.name}, ${firstRoom.dateLabel}`,
  message: `Good news: the venue for ${firstRoom.fullName} is confirmed.

Venue: [venue name]
Address: [full address]
Date: ${firstRoom.dateLabel}
Doors open: ${firstRoom.time}

[Directions, parking or anything else people should know.]

Bring your ticket on your phone or printed. We'll scan its QR code at the door.

See you in the room,
Creators Hub`,
}

/**
 * Organiser area (/admin), separate from the door staff tools: download the
 * list of everyone registered, and send a message to all of them.
 */
export default function AdminPage() {
  useDocumentTitle('Organisers')
  const [pin, setPin] = useState(store.get)
  const signOut = useCallback(() => {
    store.set('')
    setPin('')
  }, [])

  return (
    <Section surface="dark" aria-labelledby="admin-title" className="min-h-[100svh] bg-[#0c0b0a] pt-24 pb-16 md:pt-32">
      <div className="container-edge max-w-2xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-electric">Creators Hub {firstRoom.edition} · Organisers</p>
            <h1 id="admin-title" className="mt-3 text-title font-medium">
              Attendees and messages
            </h1>
          </div>
          {pin && (
            <button type="button" onClick={signOut} className="inline-flex items-center gap-2 text-sm text-cream/60 hover:text-cream">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </button>
          )}
        </div>
        {pin ? <Dashboard pin={pin} onAuthError={signOut} /> : <SignIn onSignedIn={setPin} />}
      </div>
    </Section>
  )
}

function SignIn({ onSignedIn }: { onSignedIn: (pin: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="mt-10 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!value.trim()) return
        setBusy(true)
        setError('')
        try {
          const res = await call(value.trim(), { action: 'summary' })
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Couldn’t sign in.')
          store.set(value.trim())
          onSignedIn(value.trim())
        } catch (err) {
          setError((err as Error).message)
        } finally {
          setBusy(false)
        }
      }}
    >
      <label className="block text-sm text-cream/70" htmlFor="admin-pin">
        Organiser PIN
      </label>
      <input
        id="admin-pin"
        type="password"
        autoComplete="current-password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-[14px] border border-cream/20 bg-transparent px-4 py-3 text-lg outline-none focus:border-cream"
      />
      <button type="submit" disabled={busy} className="rounded-full bg-electric px-6 py-3 font-display font-medium text-ink hover:bg-cream disabled:opacity-60">
        {busy ? 'Checking…' : 'Sign in'}
      </button>
      {error && (
        <p role="alert" className="text-rust">
          {error}
        </p>
      )}
      <p className="text-sm text-cream/50">This is the organiser PIN (ADMIN_PIN), not the door staff PIN.</p>
    </form>
  )
}

function Dashboard({ pin, onAuthError }: { pin: string; onAuthError: () => void }) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await call(pin, { action: 'summary' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Couldn’t load.')
      setSummary(body)
      setError('')
    } catch (err) {
      if (err instanceof AuthError) return onAuthError()
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [pin, onAuthError])

  useEffect(() => {
    void load()
    const t = window.setInterval(() => void load(), 20000)
    return () => window.clearInterval(t)
  }, [load])

  const download = async () => {
    try {
      const res = await call(pin, { action: 'export' })
      if (!res.ok) throw new Error('Couldn’t download the list.')
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `creators-hub-001-registrations-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      if (err instanceof AuthError) return onAuthError()
      setError((err as Error).message)
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {error && (
        <p role="alert" className="text-rust">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-cream/15 p-6">
        <div>
          <p className="eyebrow text-cream/50">Registered</p>
          <p className="mt-2 font-display text-5xl font-medium tabular-nums">{summary?.registered ?? '…'}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button
            type="button"
            onClick={() => void download()}
            className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 text-sm hover:border-cream"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Download list (CSV)
          </button>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-1.5 text-sm text-cream/55 hover:text-cream">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden="true" /> Refresh
          </button>
        </div>
      </div>

      {summary && !summary.emailEnabled && (
        <p className="rounded-[14px] border border-rust/50 p-4 text-sm text-cream/80">
          Email isn’t set up, so messages can’t be sent. Add GMAIL_MAILER_URL and GMAIL_MAILER_KEY in Netlify.
        </p>
      )}

      <Compose pin={pin} registered={summary?.registered ?? 0} onSent={load} onAuthError={onAuthError} />

      {summary && summary.announcements.length > 0 && (
        <div className="rounded-[16px] border border-cream/15 p-5">
          <p className="eyebrow text-cream/50">Messages sent</p>
          <ul className="mt-3 divide-y divide-cream/10">
            {summary.announcements.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate">{a.subject}</span>
                  <span className="shrink-0 text-sm text-cream/55">{formatTime(a.createdAt)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream/10">
                  <div className="h-full rounded-full bg-electric" style={{ width: `${a.total ? Math.round((a.sent / a.total) * 100) : 100}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-cream/55">
                  {a.status === 'done'
                    ? `Sent to all ${a.total}.`
                    : `${a.sent} of ${a.total} sent. The rest go out automatically as Gmail allows (about 100 a day).`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Compose({ pin, registered, onSent, onAuthError }: { pin: string; registered: number; onSent: () => void; onAuthError: () => void }) {
  const [subject, setSubject] = useState(VENUE_TEMPLATE.subject)
  const [message, setMessage] = useState(VENUE_TEMPLATE.message)
  const [testTo, setTestTo] = useState('')
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' } | { kind: 'ok' | 'error'; text: string }>({ kind: 'idle' })
  const hasPlaceholders = /\[[^\]]+\]/.test(subject + message)

  const run = async (action: 'test' | 'send') => {
    if (action === 'send') {
      if (hasPlaceholders) return setStatus({ kind: 'error', text: 'Replace the parts in [square brackets] before sending.' })
      if (!window.confirm(`Send “${subject}” to all ${registered} registered attendees? This can’t be undone.`)) return
    }
    setStatus({ kind: 'busy' })
    try {
      const res = await call(pin, { action, subject, message, to: testTo })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? 'Couldn’t send.')
      setStatus({
        kind: 'ok',
        text: action === 'test' ? `Test sent to ${testTo}. Check that inbox (and Spam).` : 'Sending has started. Progress shows below.',
      })
      if (action === 'send') onSent()
    } catch (err) {
      if (err instanceof AuthError) return onAuthError()
      setStatus({ kind: 'error', text: (err as Error).message })
    }
  }

  const field = 'w-full rounded-[14px] border border-cream/20 bg-transparent px-4 py-3 outline-none focus:border-cream'
  return (
    <div className="space-y-4 rounded-[20px] border border-cream/15 p-6">
      <div>
        <h2 className="font-display text-xl font-medium">Message everyone</h2>
        <p className="mt-1 text-sm text-cream/60">
          Goes to every registered attendee from Creators Hub, with a button to their ticket. Ready for the venue
          announcement: fill in the parts in [square brackets].
        </p>
      </div>
      <label className="block text-sm text-cream/70">
        Subject
        <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} className={cn(field, 'mt-1.5')} />
      </label>
      <label className="block text-sm text-cream/70">
        Message <span className="text-cream/45">(each person’s email starts “Hi [their first name],”)</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={14} maxLength={5000} className={cn(field, 'mt-1.5 font-sans leading-relaxed')} />
      </label>

      <div className="flex flex-col gap-3 border-t border-cream/10 pt-4 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm text-cream/70">
          Send a test to
          <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" className={cn(field, 'mt-1.5')} />
        </label>
        <button
          type="button"
          disabled={status.kind === 'busy'}
          onClick={() => void run('test')}
          className="rounded-full border border-cream/30 px-5 py-3 text-sm hover:border-cream disabled:opacity-50"
        >
          Send test
        </button>
      </div>
      <button
        type="button"
        disabled={status.kind === 'busy' || registered === 0}
        onClick={() => void run('send')}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-4 font-display font-medium text-ink hover:bg-cream disabled:opacity-50"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {status.kind === 'busy' ? 'Sending…' : `Send to all ${registered} attendees`}
      </button>
      <div aria-live="polite" className="min-h-5 text-sm">
        {status.kind === 'ok' && <p className="text-electric">{status.text}</p>}
        {status.kind === 'error' && (
          <p role="alert" className="text-rust">
            {status.text}
          </p>
        )}
        {status.kind === 'idle' && (
          <p className="text-cream/50">Gmail sends about 100 a day; larger lists finish over a few days, automatically.</p>
        )}
      </div>
    </div>
  )
}
