import { Hero } from '../sections/Hero'
import { Mission, Oath, Philosophy, Pillars, Problem, Roadmap } from '../sections/Founding'
import { FirstRoom } from '../sections/FirstRoom'
import { VolunteerTeaser } from '../sections/Volunteer'
import { Partnership } from '../sections/Partnership'
import { Contact } from '../sections/Contact'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/**
 * Creators Hub, the organisation (its founding document, in order), then
 * its first event, The First Room, and ways to get involved.
 */
export function HomePage() {
  useDocumentTitle()
  return (
    <>
      <Hero />
      <Mission />
      <Problem />
      <Pillars />
      <Philosophy />
      <Roadmap />
      <Oath />
      <FirstRoom />
      <VolunteerTeaser />
      <Partnership />
      <Contact />
    </>
  )
}
