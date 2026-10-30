import { partnership } from '../content/site'
import { formNames } from '../content/forms'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { Honeypot, SubmitRow, TextField, ChoiceField } from '../components/forms/Fields'
import { useNetlifyForm } from '../hooks/useNetlifyForm'

export function Partnership() {
  const { status, onSubmit } = useNetlifyForm(formNames.partnership)

  return (
    <Section id="partner" surface="forest" aria-labelledby="partner-title" className="py-28 md:py-40">
      <div className="container-edge">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow className="text-electric">{partnership.eyebrow}</Eyebrow>
            <h2 id="partner-title" className="mt-6 text-display font-medium">
              <MaskText lines={[partnership.title]} />
            </h2>
          </div>
          <p className="max-w-md text-cream/75 md:col-span-4 md:col-start-9">{partnership.body}</p>
        </div>

        <ul className="mt-16 grid border-t border-cream/15 sm:grid-cols-2 lg:grid-cols-4 md:mt-24">
          {partnership.types.map((t, i) => (
            <Reveal
              as="li"
              key={t.title}
              delay={i * 0.06}
              className="group relative border-b border-cream/15 py-8 sm:pr-8 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0"
            >
              <span className="font-display text-sm text-electric tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 text-xl font-medium">{t.title}</h3>
              <p className="mt-2 text-cream/70">{t.body}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-20 grid gap-12 md:mt-28 md:grid-cols-12">
          <h3 className="text-title font-medium md:col-span-4">Start a conversation</h3>
          <form
            name={formNames.partnership}
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={onSubmit}
            className="space-y-8 md:col-span-7 md:col-start-6"
            noValidate
          >
            <input type="hidden" name="form-name" value={formNames.partnership} />
            <Honeypot />
            <div className="grid gap-8 sm:grid-cols-2">
              <TextField label="Your name" name="name" required autoComplete="name" />
              <TextField label="Organisation" name="organisation" required autoComplete="organization" />
            </div>
            <TextField label="Work email" name="email" type="email" required autoComplete="email" />
            <ChoiceField legend="Type of partnership" name="type" options={partnership.types.map((t) => t.title)} />
            <TextField label="What do you have in mind?" name="message" multiline required />
            <SubmitRow status={status} label="Send enquiry" successMessage="Thank you — the team will reply soon." />
          </form>
        </Reveal>
      </div>
    </Section>
  )
}
