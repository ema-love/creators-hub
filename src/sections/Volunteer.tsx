import { volunteer } from '../content/site'
import { firstRoom } from '../content/event'
import { formNames } from '../content/forms'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { ArrowLink } from '../components/ui/ArrowLink'
import { ChoiceField, Honeypot, SubmitRow, TextField } from '../components/forms/Fields'
import { useNetlifyForm } from '../hooks/useNetlifyForm'

/** Homepage teaser; the form lives on its own page (/volunteer). */
export function VolunteerTeaser() {
  return (
    <Section id="volunteer" surface="dark" aria-labelledby="volunteer-title" className="py-28 md:py-40">
      <div className="container-edge grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <Eyebrow className="text-electric">{volunteer.eyebrow}</Eyebrow>
          <h2 id="volunteer-title" className="mt-6 text-headline font-medium">
            <MaskText lines={[volunteer.title]} />
          </h2>
          <p className="mt-6 max-w-xl text-cream/75">{volunteer.body}</p>
        </div>
        <Reveal className="flex flex-col gap-4 md:col-span-4 md:col-start-9 md:items-end">
          <ArrowLink to="/volunteer">Volunteer for The First Room</ArrowLink>
          <p className="eyebrow text-silver">
            {firstRoom.fullName} · {firstRoom.dateLabel}
          </p>
        </Reveal>
      </div>
    </Section>
  )
}

/** The volunteer page (/volunteer) with the sign-up form. */
export function Volunteer() {
  const { status, onSubmit } = useNetlifyForm(formNames.volunteer)

  return (
    <Section id="volunteer" surface="dark" aria-labelledby="volunteer-title" className="min-h-[90svh] pt-36 pb-28 md:pt-44 md:pb-40">
      <div className="container-edge grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <Eyebrow className="text-electric">{volunteer.eyebrow}</Eyebrow>
            <h1 id="volunteer-title" className="mt-6 text-headline font-medium">
              <MaskText inView={false} lines={[volunteer.title]} />
            </h1>
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
