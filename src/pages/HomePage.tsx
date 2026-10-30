import { Hero } from '../sections/Hero'
import { Manifesto } from '../sections/Manifesto'
import { Represents } from '../sections/Represents'
import { Disciplines } from '../sections/Disciplines'
import { FirstRoom } from '../sections/FirstRoom'
import { Community } from '../sections/Community'
import { Volunteer } from '../sections/Volunteer'
import { Partnership } from '../sections/Partnership'
import { Contact } from '../sections/Contact'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function HomePage() {
  useDocumentTitle()
  return (
    <>
      <Hero />
      <Manifesto />
      <Represents />
      <Disciplines />
      <FirstRoom />
      <Community />
      <Volunteer />
      <Partnership />
      <Contact />
    </>
  )
}
