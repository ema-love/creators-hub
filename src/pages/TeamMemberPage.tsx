import { useEffect } from 'react'
import { useParams } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { profilePages, type TeamMember } from '../content/team'
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
            <div className="aspect-square w-48 overflow-hidden rounded-sm bg-[#E6DFD3] sm:w-64 md:w-full">
              {m.photo && (
                <img
                  src={m.photo}
                  alt={`${m.name}, ${m.role} of Creator’s Hub`}
                  width={720}
                  height={720}
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
              <p className="mt-5 text-ink/65">{m.bio}</p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {m.linkedin && (
                  <a
                    href={m.linkedin}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="group inline-flex items-center gap-3 rounded-full bg-forest px-6 py-3.5 font-display text-[0.9375rem] font-medium text-cream transition-colors hover:bg-ink"
                  >
                    LinkedIn
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                <ArrowLink to="/team" variant="text">
                  Meet the team
                </ArrowLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
      {m.founder && <Oath />}
    </>
  )
}
