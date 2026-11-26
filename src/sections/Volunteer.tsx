import { useId, useState } from 'react'
import { ArrowDown, ArrowRight, Check, ChevronDown, Info, Laptop, Plus } from 'lucide-react'
import { volunteer } from '../content/site'
import { firstRoom } from '../content/event'
import { formNames } from '../content/forms'
import { disciplineStories } from '../content/disciplineStories'
import {
  briefingOptions,
  conditionalNote,
  experienceLabel,
  experienceText,
  teamByTitle,
  volunteerAttendance,
  volunteerBenefits,
  volunteerFaqs,
  volunteerIntro,
  volunteerSuccess,
  volunteerTeams,
  volunteerValues,
  type ExperienceTag,
  type VolunteerTeam,
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
          <ArrowLink to="/volunteer">See the volunteer teams</ArrowLink>
          <p className="eyebrow text-silver">
            {firstRoom.fullName} · {firstRoom.dateLabel}
          </p>
        </Reveal>
      </div>
    </Section>
  )
}


const ONLINE_HOST = volunteerTeams.find((t) => t.remote)!

const heroPhotos = [
  disciplineStories.technology.montage[1],
  disciplineStories.film.montage[0],
  disciplineStories.fashion.montage[2],
  disciplineStories.artdesign.montage[0],
]

/** The volunteer opportunities page (/volunteer). */
export function Volunteer() {
  const [team, setTeam] = useState('')

  const applyFor = (teamTitle: string) => {
    setTeam(teamTitle)
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (window.location.hash !== '#apply') window.history.replaceState(null, '', '#apply')
  }

  return (
    <>
      <VolunteerHero />
      <Benefits />
      <Teams onApply={applyFor} />
      <Values />
      <Faq />
      <Apply team={team} onTeamChange={setTeam} />
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
              <a href="#teams" className="group inline-flex items-center gap-2 font-display text-[0.9375rem] font-medium">
                <span className="link-draw">See the teams</span>
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
          <Fact label="Event" value={firstRoom.fullName} />
          <Fact label="Date" value={`${firstRoom.dateCompact} · ${firstRoom.timeCompact}`} />
          <Fact label="Teams" value={`${volunteerTeams.length} core teams, in Lagos and online`} />
          <Fact label="Experience" value="Beginners welcome" accent />
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

function Benefits() {
  return (
    <Section surface="light" aria-labelledby="volunteer-benefits" className="py-28 md:py-36">
      <div className="container-edge">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <Eyebrow className="text-bright">{volunteerBenefits.eyebrow}</Eyebrow>
            <h2 id="volunteer-benefits" className="mt-6 text-headline font-medium">
              <MaskText lines={volunteerBenefits.title} />
            </h2>
          </div>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-sm bg-ink/10 md:grid-cols-3">
          {volunteerBenefits.items.map((p, i) => (
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

function Teams({ onApply }: { onApply: (teamTitle: string) => void }) {
  return (
    <Section id="teams" surface="dark" aria-labelledby="volunteer-teams" className="scroll-mt-0 py-28 md:py-36">
      <div className="container-edge">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow className="text-electric">The teams</Eyebrow>
            <h2 id="volunteer-teams" className="mt-6 text-headline font-medium">
              <MaskText lines={['Six teams.', 'One room.']} />
            </h2>
          </div>
          <Reveal className="md:col-span-5">
            <p className="text-cream/70">
              Every team welcomes beginners. Each card shows what you’ll do and any experience that helps. All teams are in
              person in Lagos, except Online Host, which you can do from anywhere.
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {volunteerTeams.map((t, i) => (
            <TeamCard key={t.id} team={t} delay={(i % 3) * 0.06} onApply={onApply} />
          ))}
        </ul>
      </div>
    </Section>
  )
}

function TeamCard({ team, delay, onApply }: { team: VolunteerTeam; delay: number; onApply: (title: string) => void }) {
  const conditional = team.status === 'conditional'
  return (
    <Reveal
      as="li"
      delay={delay}
      className={cn(
        'group flex flex-col rounded-sm border bg-ink-2 p-7 transition-colors duration-500 hover:border-cream/35',
        conditional ? 'border-dashed border-rust/50' : 'border-cream/12',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-2xl text-electric" aria-hidden="true">
          {team.number}
        </span>
        {conditional && (
          <span className="rounded-full border border-rust/60 px-3 py-1 text-xs font-medium text-rust">{conditionalNote}</span>
        )}
      </div>
      <h3 className="mt-6 font-display text-xl font-medium">{team.title}</h3>
      <p className="mt-2 text-cream/85">{team.summary}</p>

      <p className="eyebrow mt-6 text-[0.6875rem] text-cream/45">What you’ll do</p>
      <ul className="mt-3 flex-1 space-y-2.5 text-[0.9375rem] text-cream/70">
        {team.duties.map((duty) => (
          <li key={duty} className="flex gap-3">
            <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-electric/80" />
            {duty}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        {team.experience.map((e) => (
          <ExperienceBadge key={e.level + (e.for ?? '')} tag={e} />
        ))}
        {team.notes?.map((n) => (
          <span key={n} className="inline-flex items-center gap-1.5 rounded-full border border-cream/25 px-3 py-1 text-xs text-cream/80">
            {n.includes('laptop') && <Laptop className="h-3.5 w-3.5" aria-hidden="true" />}
            {n}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onApply(team.title)}
        className="mt-8 inline-flex items-center gap-2 self-start font-display text-[0.9375rem] font-medium text-cream"
      >
        <span className="link-draw">Apply for this team</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true" />
        <span className="sr-only">: {team.title}</span>
      </button>
    </Reveal>
  )
}

function ExperienceBadge({ tag }: { tag: ExperienceTag }) {
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium',
        tag.level === 'beginners' ? 'bg-electric text-ink' : 'border border-silver/50 text-silver',
      )}
    >
      {tag.for ? `${tag.for}: ${experienceLabel[tag.level].toLowerCase()}` : experienceLabel[tag.level]}
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

function Apply({ team, onTeamChange }: { team: string; onTeamChange: (title: string) => void }) {
  const { status, onSubmit, reset } = useNetlifyForm(formNames.volunteer)
  const [second, setSecond] = useState('')
  const [attendance, setAttendance] = useState('')
  const [onlineError, setOnlineError] = useState(false)

  const online = attendance === volunteerAttendance.online
  const hasOnlineHost = team === ONLINE_HOST.title || second === ONLINE_HOST.title
  const onlineMismatch = online && !hasOnlineHost

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    if (onlineMismatch && e.currentTarget.checkValidity()) {
      e.preventDefault()
      setOnlineError(true)
      return
    }
    setOnlineError(false)
    void onSubmit(e)
  }

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
              It takes two minutes. Pick a team, tell us how to reach you, and share anything relevant. No CV and no
              portfolio needed.
            </p>
            <p className="mt-8 eyebrow text-silver">
              For {firstRoom.fullName} · {firstRoom.dateCompact} · {firstRoom.timeCompact}
            </p>
          </div>
        </div>

        <Reveal className="md:col-span-6 md:col-start-7">
          <form
            name={formNames.volunteer}
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={submit}
            onChange={() => status === 'error' && reset()}
            onReset={() => {
              onTeamChange('')
              setSecond('')
              setAttendance('')
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
            <TextField
              label="Phone / WhatsApp"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              pattern="[\+0-9][0-9 \(\)\-]{6,}"
              patternMessage="Enter a phone number we can reach you on WhatsApp, e.g. +234 801 234 5678."
            />
            <TeamSelect label="First-choice team" name="team" value={team} onChange={onTeamChange} required />
            <TeamSelect label="Second-choice team (optional)" name="second_team" value={second} onChange={setSecond} exclude={team} />
            <ChoiceField
              legend="In person or online?"
              name="attendance"
              options={[volunteerAttendance.inPerson, volunteerAttendance.online]}
              required
              value={attendance}
              onChange={(v) => {
                setAttendance(v)
                setOnlineError(false)
              }}
              hint={
                online && (
                  <span role={onlineError ? 'alert' : undefined} className={cn(onlineMismatch && onlineError && 'text-rust opacity-100')}>
                    {hasOnlineHost
                      ? 'You’ll host from home: you need good internet and a laptop.'
                      : 'Online volunteering is for the Online Host team. Choose Online Host as your first or second choice, or pick In person.'}
                  </span>
                )
              }
            />
            <TextField label="Relevant experience or links (optional)" name="experience" multiline />
            <ChoiceField legend="Can you attend a short volunteer briefing before the event?" name="briefing" options={briefingOptions} required />
            <SubmitRow status={status} label="Submit application" successMessage={volunteerSuccess} />
          </form>
        </Reveal>
      </div>
    </Section>
  )
}

function TeamSelect({
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
  const selected = teamByTitle(value)
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
            {required ? 'Choose a team' : 'No second choice'}
          </option>
          {volunteerTeams
            .filter((t) => t.title !== exclude)
            .map((t) => (
              <option key={t.id} value={t.title} className="bg-ink">
                {t.number} {t.title}
                {t.status === 'conditional' ? ` (${conditionalNote.toLowerCase()})` : ''}
              </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 opacity-60" aria-hidden="true" />
      </div>
      {selected && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-cream/50">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            {experienceText(selected)}
            {selected.notes?.length ? ` · ${selected.notes.join(' · ')}` : ''}
            {selected.status === 'conditional' ? ` · ${conditionalNote}` : ''}
          </span>
        </p>
      )}
    </div>
  )
}
