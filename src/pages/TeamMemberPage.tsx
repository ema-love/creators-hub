import { useEffect } from 'react'
import { useParams } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { profilePages, socialLinksOf, type TeamMember } from '../content/team'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { ArrowLink } from '../components/ui/ArrowLink'
import { Oath } from '../sections/Founding'
import NotFoundPage from './NotFoundPage'

/** A team member's own page, e.g. /team/erioluwa-akintayo. Content comes from src/content/team.ts. */
export default function TeamMemberPage() {
  const { id } = useParams()
  const member = profilePages.find((m) => m.id === id)
  if (!member) return <NotFoundPage />
  return <Profile member={member} />
}

function Profile({ member: m }: { member: TeamMember }) {
  const profile = m.profile!
  useEffect(() => {
    document.title = profile.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = profile.description
  }, [profile])

  return (
    <>
      <Section surface="light" aria-labelledby="profile-title" className="pb-24 pt-28 md:pb-32 md:pt-44">
        <div className="container-edge grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
          <Reveal className="md:col-span-5">
            <div
              className="w-48 overflow-hidden rounded-sm bg-[#E6DFD3] sm:w-64 md:w-full"
              style={{ aspectRatio: profile.photo ? `${profile.photo.width} / ${profile.photo.height}` : '1 / 1' }}
            >
              {(profile.photo?.src ?? m.photo) && (
                <img
                  src={profile.photo?.src ?? m.photo!}
                  alt={`${m.name}, ${m.role} of Creator’s Hub`}
                  width={profile.photo?.width ?? 720}
                  height={profile.photo?.height ?? 720}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </Reveal>

          <div className="md:col-span-6 md:col-start-7">
            <Eyebrow className="text-bright">
              {m.role} · Creator’s Hub
            </Eyebrow>
            <h1 id="profile-title" className="mt-6 text-headline font-medium">
              <MaskText inView={false} lines={[m.name]} />
            </h1>
            <Reveal delay={0.1}>
              <p className="mt-8 text-lede text-ink/85">{profile.about}</p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {socialLinksOf(m).map((l, i) => (
                  <a
                    key={l.label}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className={
                      i === 0
                        ? 'group inline-flex items-center gap-3 rounded-full bg-forest px-6 py-3.5 font-display text-[0.9375rem] font-medium text-cream transition-colors hover:bg-ink'
                        : 'group inline-flex items-center gap-3 rounded-full border border-forest/40 px-6 py-3.5 font-display text-[0.9375rem] font-medium text-forest transition-colors hover:border-forest'
                    }
                  >
                    {l.label}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
                <ArrowLink to="/team" variant="text">
                  Meet the team
                </ArrowLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
      {profile.story?.length ? <Story member={m} /> : null}
      {m.founder && <Oath />}
    </>
  )
}

/** The person's story in their own words, with quick facts. */
function Story({ member: m }: { member: TeamMember }) {
  const p = m.profile!
  return (
    <Section surface="dark" aria-labelledby="story-title" className="py-24 md:py-36">
      <div className="container-edge grid gap-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <Eyebrow className="text-electric">About {m.shortName}</Eyebrow>
            <h2 id="story-title" className="mt-6 text-headline font-medium">
              <MaskText lines={['In ' + m.shortName + '’s', <span key="w" className="text-electric">words</span>]} />
            </h2>
            {p.facts?.length ? (
              <dl className="mt-12 space-y-5 border-t border-cream/15 pt-8">
                {p.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="eyebrow text-[0.6875rem] text-cream/50">{f.label}</dt>
                    <dd className="mt-1.5 text-cream/90">{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
        <div className="space-y-8 md:col-span-7 md:col-start-6 md:pt-14">
          {p.story!.map((para, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <p
                className={
                  i === 0
                    ? 'font-display text-[clamp(1.4rem,2.4vw,2.1rem)] font-medium leading-[1.3] tracking-[-0.01em]'
                    : 'text-lede leading-relaxed text-cream/80'
                }
              >
                {para}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
