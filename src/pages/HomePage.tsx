import { Hero } from '../sections/Hero'
import { HowWeWork, Manifesto, Oath, WhoWeAre } from '../sections/Founding'
import { FirstRoom } from '../sections/FirstRoom'
import { VolunteerTeaser } from '../sections/Volunteer'
import { Partnership } from '../sections/Partnership'
import { Contact } from '../sections/Contact'
import { usePageMeta } from '../hooks/useDocumentTitle'

/**
 * Creator’s Hub, the organisation (who we are, the manifesto, how we work,
 * the founder’s oath), then its first event, The First Room, and ways to
 * get involved.
 */
export function HomePage() {
  usePageMeta('/')
  return (
    <>
      <Hero />
      <WhoWeAre />
      <Manifesto />
      <HowWeWork />
      <Oath />
      <FirstRoom />
      <VolunteerTeaser />
      <Partnership />
      <Contact />
    </>
  )
}
