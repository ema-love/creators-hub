import { useId } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'

const fieldBase =
  'peer w-full border-0 border-b border-current/25 bg-transparent px-0 pb-3 pt-6 text-lg outline-none transition-colors placeholder:text-transparent focus:border-current focus-visible:outline-none'

type TextFieldProps = {
  label: string
  name: string
  type?: 'text' | 'email'
  required?: boolean
  autoComplete?: string
  multiline?: boolean
}

/** Editorial text field: underline only, with a label that floats on focus. */
export function TextField({ label, name, type = 'text', required, autoComplete, multiline }: TextFieldProps) {
  const id = useId()
  const shared = {
    id,
    name,
    required,
    placeholder: label,
    className: cn(fieldBase, multiline && 'min-h-28 resize-y'),
  }
  return (
    <div className="relative">
      {multiline ? (
        <textarea {...shared} rows={3} />
      ) : (
        <input {...shared} type={type} autoComplete={autoComplete} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-6 origin-left text-lg opacity-60 transition-all duration-300 peer-focus:top-0 peer-focus:text-xs peer-focus:opacity-100 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] peer-focus:scale-x-100"
      />
    </div>
  )
}

type ChoiceFieldProps = {
  legend: string
  name: string
  options: readonly string[]
  required?: boolean
}

/** Single-choice pills (radio inputs) — keyboard navigable with arrow keys. */
export function ChoiceField({ legend, name, options, required }: ChoiceFieldProps) {
  return (
    <fieldset>
      <legend className="mb-4 text-sm opacity-70">
        {legend}
        {required && <span aria-hidden="true"> *</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input type="radio" name={name} value={option} required={required} className="peer sr-only" />
            <span className="inline-block rounded-full border border-current/25 px-4 py-2 text-sm transition-colors duration-300 hover:border-current peer-checked:border-electric peer-checked:bg-electric peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-electric">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Hidden honeypot field for Netlify spam filtering. */
export function Honeypot() {
  return (
    <p className="hidden" aria-hidden="true">
      <label>
        Leave this empty: <input name="bot-field" tabIndex={-1} autoComplete="off" />
      </label>
    </p>
  )
}

type SubmitProps = {
  status: 'idle' | 'submitting' | 'success' | 'error' | 'local'
  label: string
  successMessage: string
  /** Use `forest` on light surfaces. */
  tone?: 'electric' | 'forest'
  className?: string
}

export function SubmitRow({ status, label, successMessage, tone = 'electric', className }: SubmitProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className={cn(
          'group inline-flex shrink-0 items-center justify-center gap-3 self-start whitespace-nowrap rounded-full px-7 py-4 font-display font-medium transition-colors duration-300 disabled:opacity-60',
          tone === 'electric' ? 'bg-electric text-ink hover:bg-cream' : 'bg-forest text-cream hover:bg-ink',
        )}
      >
        {status === 'submitting' ? 'Sending…' : label}
        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true" />
      </button>
      <div aria-live="polite" className="min-h-6 text-sm">
        <AnimatePresence mode="wait">
          {status === 'success' && (
            <motion.p
              key="ok"
              className="inline-flex items-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: ease.out }}
            >
              <Check className="h-4 w-4 text-bright" aria-hidden="true" /> {successMessage}
            </motion.p>
          )}
          {status === 'local' && (
            <motion.p key="local" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              This is a local preview, so nothing was sent. The form works on the live Netlify site.
            </motion.p>
          )}
          {status === 'error' && (
            <motion.p key="err" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Something went wrong. Please try again in a moment.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
