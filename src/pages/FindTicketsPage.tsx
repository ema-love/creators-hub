import { useState } from 'react'
import { Section } from '../components/layout/Section'
import { TextField } from '../components/forms/Fields'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/** Lost your ticket? Re-sends it by email, or opens it directly with the registration reference (/tickets/find). */
export default function FindTicketsPage() {
  useDocumentTitle('Find my ticket')
  const [status, setStatus] = useState<{ kind: 'idle' | 'sending' } | { kind: 'done' | 'error'; message: string }>({ kind: 'idle' })

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) return form.reportValidity()
    const data = new FormData(form)
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch('/.netlify/functions/find-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), reference: data.get('reference') }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Something went wrong.')
      if (typeof body.url === 'string') {
        // Stay on this site whatever address the server used.
        const target = new URL(body.url, window.location.origin)
        if (target.pathname === '/tickets/order') {
          setStatus({ kind: 'done', message: 'Found it. Opening your ticket…' })
          window.location.assign(target.pathname + target.search)
          return
        }
      }
      setStatus({ kind: 'done', message: body.message })
    } catch (err) {
      setStatus({ kind: 'error', message: (err as Error).message })
    }
  }

  return (
    <Section surface="dark" aria-labelledby="find-title" className="min-h-[85svh] bg-[#0c0b0a] pt-32 pb-24">
      <div className="container-edge max-w-xl">
        <h1 id="find-title" className="text-headline font-medium">
          Find my ticket
        </h1>
        <p className="mt-4 text-lede text-cream/75">
          Enter the email you registered with. We’ll send your ticket to it again. If you have your registration
          reference (it starts with CH001- and was shown when you registered), add it to open your ticket straight away.
        </p>
        <form onSubmit={submit} noValidate className="mt-10 space-y-8">
          <TextField label="Email" name="email" type="email" required autoComplete="email" />
          <TextField label="Registration reference (optional, CH001-…)" name="reference" />
          <button
            type="submit"
            disabled={status.kind === 'sending'}
            className="rounded-full bg-electric px-7 py-4 font-display font-medium text-ink hover:bg-cream disabled:opacity-60"
          >
            {status.kind === 'sending' ? 'Looking…' : 'Find my ticket'}
          </button>
          <div aria-live="polite">
            {status.kind === 'done' && <p className="text-cream/80">{status.message}</p>}
            {status.kind === 'error' && <p role="alert" className="text-rust">{status.message}</p>}
          </div>
        </form>
      </div>
    </Section>
  )
}
