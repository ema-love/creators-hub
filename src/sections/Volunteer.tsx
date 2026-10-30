import { volunteer } from '../content/site'
import { firstRoom } from '../content/event'
import { formNames } from '../content/forms'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { ChoiceField, Honeypot, SubmitRow, TextField } from '../components/forms/Fields'
import { useNetlifyForm } from '../hooks/useNetlifyForm'

export function Volunteer() {
  const { status, onSubmit } = useNetlifyForm(formNames.volunteer)

  return (
    <Section id="volunteer" surface="dark" aria-labelledby="volunteer-title" className="py-28 md:py-40">
      <div className="container-edge grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <Eyebrow className="text-electric">{volunteer.eyebrow}</Eyebrow>
            <h2 id="volunteer-title" className="mt-6 text-headline font-medium">
              <MaskText lines={[volunteer.title]} />
            </h2>
            <p className="mt-6 max-w-md text-cream/75">{volunteer.body}</p>
            <p className="mt-8 eyebrow text-silver">
              For {firstRoom.fullName} · {firstRoom.dateLabel}
            </p>
          </div>
        </div>

        <Reveal className="md:col-span-6 md:col-start-7">
          <form
            name={formNames.volunteer}
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={onSubmit}
            className="space-y-8"
            noValidate
          >
            <input type="hidden" name="form-name" value={formNames.volunteer} />
            <Honeypot />
            <div className="grid gap-8 sm:grid-cols-2">
              <TextField label="Full name" name="name" required autoComplete="name" />
              <TextField label="Email" name="email" type="email" required autoComplete="email" />
            </div>
            <TextField label="Your discipline (e.g. film, engineering)" name="discipline" />
            <ChoiceField legend="How would you like to help?" name="interest" options={volunteer.interests} required />
            <TextField label="Anything else we should know?" name="message" multiline />
            <SubmitRow status={status} label="Register interest" successMessage="Thank you — we’ll be in touch as roles are confirmed." />
          </form>
        </Reveal>
      </div>
    </Section>
  )
}
