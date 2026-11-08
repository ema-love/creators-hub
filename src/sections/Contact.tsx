import { contact } from '../content/site'
import { formNames } from '../content/forms'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Honeypot, SubmitRow, TextField } from '../components/forms/Fields'
import { useNetlifyForm } from '../hooks/useNetlifyForm'

export function Contact() {
  const { status, onSubmit } = useNetlifyForm(formNames.contact)

  return (
    <Section id="contact" surface="light" aria-labelledby="contact-title" className="py-28 md:py-40">
      <div className="container-edge grid gap-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <Eyebrow className="text-bright">{contact.eyebrow}</Eyebrow>
          <h2 id="contact-title" className="mt-6 text-mega font-medium">
            <MaskText lines={[contact.title]} />
          </h2>
          <p className="mt-10 max-w-md text-lede text-ink/70">{contact.body}</p>
        </div>

        <form
          name={formNames.contact}
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={onSubmit}
          className="space-y-8 md:col-span-5 md:col-start-8 md:self-end"
          noValidate
        >
          <input type="hidden" name="form-name" value={formNames.contact} />
          <Honeypot />
          <TextField label="Name" name="name" required autoComplete="name" />
          <TextField label="Email" name="email" type="email" required autoComplete="email" />
          <TextField label="Message" name="message" multiline required />
          <SubmitRow status={status} label="Send message" successMessage="Thank you — message received." tone="forest" />
        </form>
      </div>
    </Section>
  )
}
