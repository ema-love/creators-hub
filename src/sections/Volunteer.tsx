import { useId, useState } from 'react'
import { ArrowDown, ArrowRight, Check, ChevronDown, Info, Plus } from 'lucide-react'
import { volunteer } from '../content/site'
import { firstRoom } from '../content/event'
import { formNames } from '../content/forms'
import { disciplineStories } from '../content/disciplineStories'
import {
  allVolunteerRoles,
  experienceLabel,
  volunteerArrangementsNote,
  volunteerDepartments,
  volunteerFaqs,
  volunteerIntro,
  volunteerStages,
  volunteerValues,
  volunteerWhy,
  type ExperienceLevel,
  type VolunteerDepartment,
  type VolunteerRole,
} from '../content/volunteer'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { ArrowLink } from '../components/ui/ArrowLink'
import { ChoiceField, Honeypot, SubmitRow, TextField } from '../components/forms/Fields'
import { useNetlifyForm } from '../hooks/useNetlifyForm'
import { cn } from '../lib/cn'

/** Homepage teaser; the full page lives at /volunteer. */
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
          <ArrowLink to="/volunteer">See volunteer roles</ArrowLink>
          <p className="eyebrow text-silver">
            {firstRoom.fullName} · {firstRoom.dateLabel}
          </p>
        </Reveal>
      </div>
    </Section>
  )
}

const confirmed = volunteerDepartments.filter((d) => d.status === 'confirmed')
const conditional = volunteerDepartments.filter((d) => d.status === 'conditional')
const openRoles = confirmed.reduce((n, d) => n + d.roles.length, 0)
const conditionalRoles = conditional.reduce((n, d) => n + d.roles.length, 0)
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const inWords = (n: number) => words[n] ?? String(n)
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const heroPhotos = [
  disciplineStories.technology.montage[1],
  disciplineStories.film.montage[0],
  disciplineStories.fashion.montage[2],
  disciplineStories.artdesign.montage[0],
]

/** The volunteer opportunities page (/volunteer). */
export function Volunteer() {
  const [role, setRole] = useState('')

  const applyFor = (roleTitle: string) => {
    setRole(roleTitle)
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <VolunteerHero />
      <WhyVolunteer />
      <Values />
      <Roles onApply={applyFor} />
      <Faq />
      <Apply role={role} onRoleChange={setRole} />
    </>
  )
}

function VolunteerHero() {
  return (
    <Section surface="dark" aria-labelledby="volunteer-title" className="grain overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 55% at 85% 15%, rgba(0,229,160,0.16), transparent 70%), radial-gradient(45% 50% at 0% 100%, rgba(26,74,58,0.55), transparent 70%)',
        }}
      />
      <div className="container-edge relative">
        <Eyebrow className="text-electric">{volunteerIntro.eyebrow}</Eyebrow>
        <h1 id="volunteer-title" className="mt-8 text-mega font-medium">
          <MaskText inView={false} lines={volunteerIntro.title} className="[&>span:nth-child(2)]:pl-[8vw]" />
        </h1>

        <div className="mt-14 grid gap-12 md:grid-cols-12 md:items-end">
          <Reveal className="md:col-span-6">
            <p className="text-lede text-cream/90">{volunteerIntro.lede}</p>
            <p className="mt-5 max-w-lg text-cream/65">{volunteerIntro.body}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ArrowLink to="/volunteer#apply">Apply to volunteer</ArrowLink>
              <a href="#roles" className="group inline-flex items-center gap-2 font-display text-[0.9375rem] font-medium">
                <span className="link-draw">See the roles</span>
                <ArrowDown className="h-4 w-4 transition-transform duration-500 group-hover:translate-y-0.5" aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-5 md:col-start-8">
            <div className="grid h-64 grid-cols-4 gap-2 md:h-80" aria-hidden="true">
              {heroPhotos.map((p, i) => (
                <div key={p.src} className={cn('overflow-hidden rounded-sm bg-ink-2', i % 2 ? 'mt-10' : 'mb-10')}>
                  <img src={p.src} alt="" loading="eager" className="h-full w-full object-cover" style={{ objectPosition: p.position }} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <dl className="mt-20 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-cream/15 pt-8 md:grid-cols-4">
          <Fact label="Event" value={`${firstRoom.fullName}`} />
          <Fact label="Date" value={`${firstRoom.dateLabel} · ${firstRoom.city}`} />
          <Fact label="Open roles" value={`${openRoles} across ${confirmed.length} departments`} />
          <Fact label="Experience" value="Not required" accent />
        </dl>
      </div>
    </Section>
  )
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="eyebrow text-[0.6875rem] text-cream/50">{label}</dt>
      <dd className={cn('mt-2 font-display text-lg', accent && 'text-electric')}>{value}</dd>
    </div>
  )
}

function WhyVolunteer() {
  return (
    <Section surface="light" aria-labelledby="why-volunteer" className="py-28 md:py-36">
      <div className="container-edge">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow className="text-bright">{volunteerWhy.eyebrow}</Eyebrow>
            <h2 id="why-volunteer" className="mt-6 text-headline font-medium">
              <MaskText lines={volunteerWhy.title} />
            </h2>
          </div>
          <Reveal className="md:col-span-6 md:col-start-7 md:pt-14">
            <p className="font-display text-title leading-snug tracking-[-0.02em] text-ink/85">{volunteerWhy.openCall}</p>
          </Reveal>
        </div>

        <ol className="mt-20 grid gap-px overflow-hidden rounded-sm bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {volunteerWhy.points.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.06} className="bg-cream p-8 md:p-10">
              <span className="font-display text-sm tabular-nums text-bright">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-10 font-display text-xl font-medium">{p.title}</h3>
              <p className="mt-3 text-ink/65">{p.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  )
}

function Values() {
  return (
    <Section surface="forest" aria-labelledby="volunteer-values" className="grain py-28 md:py-36">
      <div className="container-edge">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="text-electric">{volunteerValues.eyebrow}</Eyebrow>
            <h2 id="volunteer-values" className="mt-6 max-w-3xl text-headline font-medium">
              <MaskText lines={['Open to everyone.', 'Serious about the work.']} />
            </h2>
          </div>
          <ul className="flex flex-col gap-3" aria-label="Our commitments to volunteers">
            {volunteerValues.commitments.map((c) => (
              <li key={c} className="flex items-center gap-3 text-cream/90">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-electric text-ink">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-16 grid border-t border-cream/15 sm:grid-cols-2 lg:grid-cols-3">
          {volunteerValues.items.map((v, i) => (
            <Reveal as="li" key={v.title} delay={(i % 3) * 0.06} className="border-b border-cream/15 py-8 sm:pr-10">
              <h3 className="font-display text-xl font-medium">{v.title}</h3>
              <p className="mt-2 text-cream/70">{v.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  )
}

function Roles({ onApply }: { onApply: (roleId: string) => void }) {
  return (
    <Section id="roles" surface="dark" aria-labelledby="volunteer-roles" className="scroll-mt-0 py-28 md:py-36">
      <div className="container-edge">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow className="text-electric">Departments & positions</Eyebrow>
            <h2 id="volunteer-roles" className="mt-6 text-headline font-medium">
              <MaskText lines={[`${openRoles} ways in.`]} />
            </h2>
          </div>
          <Reveal className="md:col-span-5">
            <p className="text-cream/70">
              {capital(inWords(confirmed.length))} departments are open now
              {conditionalRoles > 0 &&
                `, plus ${inWords(conditionalRoles)} Creative Marketplace roles that only go ahead if the marketplace is confirmed`}
              . Each role shows whether beginners are welcome or some experience is preferred. Experience is never required.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-10 flex items-start gap-3 rounded-sm border border-cream/15 bg-ink-2 p-5 text-sm text-cream/75">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-electric" aria-hidden="true" />
          <p>{volunteerArrangementsNote}</p>
        </Reveal>

        <div className="mt-16 grid gap-16 lg:grid-cols-12">
          <nav aria-label="Departments" className="hidden lg:col-span-3 lg:block">
            <ol className="sticky top-32 space-y-1">
              {volunteerDepartments.map((d, i) => (
                <li key={d.id}>
                  <a
                    href={`#dept-${d.id}`}
                    className="group flex items-baseline gap-3 py-2 text-cream/60 transition-colors hover:text-cream"
                  >
                    <span className="font-display text-xs tabular-nums text-cream/40">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      {d.title}
                      {d.status === 'conditional' && <span className="ml-2 text-xs text-rust">If confirmed</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-20 lg:col-span-9">
            {volunteerDepartments.map((d, i) => (
              <Department key={d.id} department={d} index={i} onApply={onApply} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function Department({ department: d, index, onApply }: { department: VolunteerDepartment; index: number; onApply: (id: string) => void }) {
  const conditional = d.status === 'conditional'
  return (
    <section id={`dept-${d.id}`} aria-labelledby={`dept-${d.id}-title`} className="scroll-mt-28">
      <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-cream/15 pb-6">
        <div>
          <p className="font-display text-sm tabular-nums text-cream/40">{String(index + 1).padStart(2, '0')}</p>
          <h3 id={`dept-${d.id}-title`} className="mt-3 font-display text-title font-medium tracking-[-0.02em]">
            {d.title}
          </h3>
          <p className="mt-2 text-cream/60">{d.summary}</p>
        </div>
        <p className="eyebrow text-[0.6875rem] text-cream/50">
          {d.roles.length} {d.roles.length === 1 ? 'position' : 'positions'}
        </p>
      </Reveal>

      {conditional && (
        <Reveal className="mt-6 rounded-sm border border-dashed border-rust/60 p-5">
          <p className="eyebrow text-[0.6875rem] text-rust">Optional · Subject to confirmation</p>
          <p className="mt-2 text-sm text-cream/75">{d.note}</p>
        </Reveal>
      )}

      <ul className={cn('mt-6 grid gap-4 md:grid-cols-2', conditional && 'opacity-90')}>
        {d.roles.map((r, i) => (
          <RoleCard key={r.id} role={r} conditional={conditional} delay={(i % 2) * 0.06} onApply={onApply} />
        ))}
      </ul>
    </section>
  )
}

function RoleCard({
  role,
  conditional,
  delay,
  onApply,
}: {
  role: VolunteerRole
  conditional: boolean
  delay: number
  onApply: (id: string) => void
}) {
  return (
    <Reveal
      as="li"
      delay={delay}
      className={cn(
        'group flex flex-col rounded-sm border bg-ink-2 p-7 transition-colors duration-500 hover:border-cream/35',
        conditional ? 'border-dashed border-cream/20' : 'border-cream/12',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ExperienceBadge level={role.experience} />
        {conditional && <span className="rounded-full border border-rust/50 px-3 py-1 text-xs text-rust">If marketplace is confirmed</span>}
      </div>
      <h4 className="mt-6 font-display text-xl font-medium">{role.title}</h4>
      <ul className="mt-4 flex-1 space-y-2.5 text-[0.9375rem] text-cream/70">
        {role.duties.map((duty) => (
          <li key={duty} className="flex gap-3">
            <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-electric/80" />
            {duty}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onApply(role.title)}
        className="mt-8 inline-flex items-center gap-2 self-start font-display text-[0.9375rem] font-medium text-cream"
      >
        <span className="link-draw">{conditional ? 'Register interest' : 'Apply for this role'}</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true" />
        <span className="sr-only">: {role.title}</span>
      </button>
    </Reveal>
  )
}

function ExperienceBadge({ level }: { level: ExperienceLevel }) {
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium',
        level === 'beginners' ? 'bg-electric text-ink' : 'border border-silver/50 text-silver',
      )}
    >
      {experienceLabel[level]}
    </span>
  )
}

function Faq() {
  return (
    <Section surface="light" aria-labelledby="volunteer-faq" className="py-28 md:py-36">
      <div className="container-edge grid gap-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <Eyebrow className="text-bright">Questions</Eyebrow>
            <h2 id="volunteer-faq" className="mt-6 text-headline font-medium">
              <MaskText lines={['Before', 'you apply.']} />
            </h2>
          </div>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          {volunteerFaqs.map((f) => (
            <details key={f.q} className="group border-t border-ink/15 last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-lg font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-7 text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}

function Apply({ role, onRoleChange }: { role: string; onRoleChange: (id: string) => void }) {
  const { status, onSubmit } = useNetlifyForm(formNames.volunteer)
  const [second, setSecond] = useState('')

  return (
    <Section id="apply" surface="dark" aria-labelledby="volunteer-apply" className="grain scroll-mt-0 py-28 md:py-36">
      <div className="container-edge grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <Eyebrow className="text-electric">Apply</Eyebrow>
            <h2 id="volunteer-apply" className="mt-6 text-headline font-medium">
              <MaskText lines={['Join the', 'collective.']} />
            </h2>
            <p className="mt-6 max-w-md text-cream/75">
              It takes a few minutes. Tell us which role you’d like and a little about yourself. No CV, no portfolio, and no
              experience needed.
            </p>
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
            onReset={() => {
              onRoleChange('')
              setSecond('')
            }}
            className="space-y-8"
            noValidate
          >
            <input type="hidden" name="form-name" value={formNames.volunteer} />
            <Honeypot />
            <div className="grid gap-8 sm:grid-cols-2">
              <TextField label="Full name" name="name" required autoComplete="name" />
              <TextField label="Email" name="email" type="email" required autoComplete="email" />
            </div>
            <RoleSelect label="First-choice role" name="role" value={role} onChange={onRoleChange} required />
            <RoleSelect label="Second choice (optional)" name="second_role" value={second} onChange={setSecond} exclude={role} />
            <ChoiceField legend="Which best describes you?" name="stage" options={volunteerStages} />
            <TextField label="Your creative field or course of study (optional)" name="discipline" />
            <TextField label="Any relevant experience? “None yet” is a fine answer." name="experience" multiline />
            <TextField label="Why would you like to volunteer?" name="message" multiline />
            <SubmitRow
              status={status}
              label="Submit application"
              successMessage="Thank you. Your application is in, and we’ll be in touch."
            />
          </form>
        </Reveal>
      </div>
    </Section>
  )
}

function RoleSelect({
  label,
  name,
  value,
  onChange,
  required,
  exclude,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  exclude?: string
}) {
  const id = useId()
  const selected = allVolunteerRoles.find((r) => r.title === value)
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm opacity-70">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border-0 border-b border-current/25 bg-transparent py-3 pr-10 text-lg outline-none transition-colors focus:border-current"
        >
          <option value="" className="bg-ink">
            {required ? 'Choose a role' : 'No second choice'}
          </option>
          {volunteerDepartments.map((d) => (
            <optgroup
              key={d.id}
              label={d.status === 'conditional' ? `${d.title} (subject to confirmation)` : d.title}
              className="bg-ink"
            >
              {d.roles
                .filter((r) => r.title !== exclude)
                .map((r) => (
                  <option key={r.id} value={r.title} className="bg-ink">
                    {r.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 opacity-60" aria-hidden="true" />
      </div>
      {selected && (
        <p className="mt-2 text-xs text-cream/50">
          {selected.department.title} · {experienceLabel[selected.experience]}
          {selected.department.status === 'conditional' && ' · Only goes ahead if the marketplace is confirmed'}
        </p>
      )}
    </div>
  )
}
