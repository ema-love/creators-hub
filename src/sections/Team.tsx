import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { initialsOf, socialLinksOf, teamMembers, teamSection, type TeamMember } from '../content/team'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'

/**
 * The team behind Creator’s Hub: on the homepage, and as the /team page.
 * Cards come from src/content/team.ts; the grid takes any number of people.
 */
export function Team({ asPage = false }: { asPage?: boolean }) {
  const Heading = asPage ? 'h1' : 'h2'
  return (
    <Section
      id="team"
      surface="light"
      aria-labelledby="team-title"
      className={asPage ? 'min-h-[80svh] pb-28 pt-36 md:pb-36 md:pt-44' : 'py-28 md:py-40'}
    >
      <div className="container-edge">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow className="text-bright">{teamSection.eyebrow}</Eyebrow>
            <Heading id="team-title" className={asPage ? 'mt-6 text-display font-medium' : 'mt-6 text-headline font-medium'}>
              <MaskText
                inView={!asPage}
                lines={[teamSection.title[0], <span key="a" className="text-bright">{teamSection.title[1]}</span>]}
              />
            </Heading>
          </div>
          <p className="text-lede text-ink/75 md:col-span-4 md:col-start-9">{teamSection.intro}</p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
          {teamMembers.map((m, i) => (
            <TeamCard key={m.id} member={m} delay={(i % 3) * 0.07} />
          ))}
        </ul>
      </div>
    </Section>
  )
}

function TeamCard({ member: m, delay }: { member: TeamMember; delay: number }) {
  return (
    <Reveal as="li" delay={delay} className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-[#E6DFD3]">
        {m.photo ? (
          <img
            src={m.photo}
            alt={`${m.shortName}, ${m.role} of Creator’s Hub`}
            loading="lazy"
            decoding="async"
            width={720}
            height={720}
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
        ) : (
          // Neutral placeholder until a photo is added in src/content/team.ts.
          <div
            role="img"
            aria-label={`Photo of ${m.shortName} coming soon`}
            className="grid h-full w-full place-items-center"
            style={{ background: 'radial-gradient(70% 70% at 30% 20%, #EFE9DF, #DCD3C4)' }}
          >
            <span aria-hidden="true" className="font-display text-[clamp(3.5rem,9vw,6rem)] font-medium tracking-[-0.04em] text-forest/35">
              {initialsOf(m)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col border-t border-ink/15 pt-6 mt-6">
        <p className="eyebrow text-bright">{m.role}</p>
        <h3 className="mt-3 font-display text-title font-medium leading-tight tracking-[-0.02em]">
          {m.profile ? (
            <Link to={m.profile.path} className="link-draw">
              {m.name}
            </Link>
          ) : (
            m.name
          )}
        </h3>
        <p className="mt-3 text-ink/70">{m.bio}</p>
        {socialLinksOf(m).length > 0 && (
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {socialLinksOf(m).map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-display text-[0.9375rem] font-medium text-forest"
              >
                <span className="link-draw">{l.label}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only"> profile of {m.shortName} (opens in a new tab)</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  )
}
