import { useState } from 'react'
import type { FormName } from '../content/forms'

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'local'

/** Netlify Forms only exists on the deployed site; local copies have nothing to post to. */
const isLocalPreview = () =>
  import.meta.env.DEV || ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)

/**
 * Submits a form to Netlify Forms via AJAX. Field names must match the
 * static form stub of the same name in index.html.
 */
export function useNetlifyForm(name: FormName) {
  const [status, setStatus] = useState<Status>('idle')

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    setStatus('submitting')
    const data = new FormData(form)
    data.set('form-name', name)
    const body = new URLSearchParams()
    data.forEach((value, key) => body.append(key, String(value)))
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setStatus('success')
    } catch {
      setStatus(isLocalPreview() ? 'local' : 'error')
    }
  }

  return { status, onSubmit, reset: () => setStatus('idle') }
}
