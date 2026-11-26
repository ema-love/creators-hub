/**
 * Site copy.
 *
 * Everything here is WORKING COPY written for the build. None of it is an
 * approved organisational tagline. Replace with approved copy when available.
 */

export const nav = [
  { label: 'About', href: '/#about' },
  { label: 'Manifesto', href: '/#manifesto' },
  { label: 'The First Room', href: '/the-first-room' },
  { label: 'Tickets', href: '/tickets' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Partner', href: '/#partner' },
] as const

/*
 * What Creator’s Hub is (who we are, manifesto, how we work, oath) lives in
 * ./founding.ts. The four creative arms below belong ONLY to The First Room,
 * the first Creator’s Hub event, never to Creator’s Hub as a whole.
 */

export type DisciplineId = 'fashion' | 'technology' | 'film' | 'artdesign'

export type Discipline = {
  id: DisciplineId
  name: string
  line: string
  /** Angle (degrees) on the ecosystem diagram. */
  angle: number
}

export const disciplines: Discipline[] = [
  { id: 'fashion', name: 'Fashion', line: 'Textiles, tailoring, pattern-making and the language of what we wear.', angle: -90 },
  { id: 'technology', name: 'Technology', line: 'Software, hardware and the products that shape everyday life.', angle: 0 },
  { id: 'film', name: 'Film & Storytelling', line: 'Moving image, sound and writing — the craft of telling stories that travel.', angle: 90 },
  { id: 'artdesign', name: 'Arts & Design', line: 'Painting, illustration, visual and product design: ideas given form.', angle: 180 },
]

/** The four arms of The First Room (shown on /the-first-room). */
export const disciplinesSection = {
  eyebrow: 'The First Room · Four arms',
  title: 'Four arms. One room.',
  body: 'The First Room brings four creative arms together: fashion, technology, film and storytelling, and arts and design. Every guest registers under one of them.',
}

export const volunteer = {
  eyebrow: 'The Volunteer Collective',
  title: 'The first room needs builders.',
  body: 'Join the team behind The First Room. Six core teams, in Lagos and online. Beginners welcome, and no fee to take part.',
}

export const partnership = {
  eyebrow: 'Partnership & collaboration',
  title: 'Build the room with us.',
  body: 'Africa grows from within. We are looking for organisations that want to back Africa’s next generation of builders. Partnerships can take many forms — tell us what you have in mind.',
  types: [
    { title: 'Event partner', body: 'Support The First Room and future Creator’s Hub gatherings.' },
    { title: 'Venue & production', body: 'Spaces, equipment and technical production.' },
    { title: 'Programme & content', body: 'Co-create sessions, workshops or exhibitions.' },
    { title: 'Media & community', body: 'Help the stories and the work travel further.' },
  ],
}

/** Contact section. Messages are sent through the form (Netlify Forms → the organiser's inbox). */
export const contact = {
  eyebrow: 'Contact',
  title: 'Say hello.',
  body: 'Questions about The First Room, tickets, volunteering or working together? Write to us here. Your message comes straight to the Creator’s Hub team, and we’ll reply to the email address you give.',
}
