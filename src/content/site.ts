/**
 * Site copy.
 *
 * Everything here is WORKING COPY written for the build. None of it is an
 * approved organisational tagline. Replace with approved copy when available.
 */

export const nav = [
  { label: 'Manifesto', href: '/#manifesto' },
  { label: 'Disciplines', href: '/#disciplines' },
  { label: 'The First Room', href: '/the-first-room' },
  { label: 'Community', href: '/#community' },
  { label: 'Partner', href: '/#partner' },
] as const

export const hero = {
  eyebrow: 'A multidisciplinary creative organisation and community',
  // Working headline, not an approved tagline.
  headline: ['Technology, fashion,', 'film, art, design', '& enterprise —', 'in one room.'],
  statement:
    'Creators Hub brings together the people who make things — engineers and image-makers, designers and founders, tailors and storytellers — and gives them a room to meet in.',
}

export const manifesto = {
  eyebrow: 'Manifesto',
  // Each string is one paragraph. Words are revealed individually on scroll.
  paragraphs: [
    'Creativity was never meant to live in separate buildings. The coder and the costume designer are solving the same problem from different ends: how to turn an idea into something people can hold.',
    'Creators Hub exists for the space in between. We gather people across disciplines, put them in the same room, and see what they make together.',
  ],
  signature: 'Creators Hub',
}

export const represents = {
  eyebrow: 'What Creators Hub represents',
  title: 'Four commitments, in no particular order.',
  items: [
    {
      n: '01',
      title: 'Craft',
      body: 'Respect for the work itself — the hours of practice, the tools, the materials, the hand that makes the final cut.',
    },
    {
      n: '02',
      title: 'Exchange',
      body: 'Disciplines learn fastest from each other. A fashion designer’s eye can change a product; an engineer’s logic can change a film.',
    },
    {
      n: '03',
      title: 'Possibility',
      body: 'Opening doors to collaborators, audiences and opportunities that are hard to find alone.',
    },
    {
      n: '04',
      title: 'Culture',
      body: 'Rooted in African creativity and confident about where it is going. Built by the community, for the community.',
    },
  ],
}

export type Discipline = {
  id: string
  name: string
  line: string
  /** Angle (degrees) on the ecosystem diagram. */
  angle: number
}

export const disciplines: Discipline[] = [
  { id: 'technology', name: 'Technology', line: 'Software, hardware and the systems that shape everyday life.', angle: -90 },
  { id: 'fashion', name: 'Fashion', line: 'Textiles, tailoring and the language of what we wear.', angle: -30 },
  { id: 'film', name: 'Film', line: 'Moving image, sound and the craft of telling stories at scale.', angle: 30 },
  { id: 'art', name: 'Art', line: 'Painting, sculpture, performance — work that asks questions.', angle: 90 },
  { id: 'design', name: 'Design', line: 'Visual, product and spatial design: ideas given form.', angle: 150 },
  { id: 'entrepreneurship', name: 'Entrepreneurship', line: 'Building the ventures that let creative work last.', angle: 210 },
]

export const disciplinesSection = {
  eyebrow: 'Disciplines & ecosystem',
  title: 'Six starting points. One shared room.',
  body: 'The list is not closed. Music, writing, architecture, photography and more all belong here — these are simply where the conversation begins.',
}

export const community = {
  eyebrow: 'Community & opportunities',
  title: 'What we are building towards',
  note: 'These describe intentions for the community. Specific programmes will be announced as they are confirmed.',
  items: [
    { title: 'Cross-disciplinary collaboration', body: 'Introductions between people who would not otherwise meet, around real projects.' },
    { title: 'Learning in the open', body: 'Talks, critiques and working sessions where process is shared, not hidden.' },
    { title: 'Showcasing work', body: 'Moments for members to put their work in front of new audiences.' },
    { title: 'Access to opportunity', body: 'A network that surfaces collaborators, partners and openings across industries.' },
  ],
}

export const volunteer = {
  eyebrow: 'Volunteer & participate',
  title: 'The first room needs builders.',
  body: 'From production and hospitality to content, design and logistics — volunteers shape how The First Room feels. Tell us how you would like to be involved and we will be in touch as roles are confirmed.',
  interests: ['Event production', 'Hospitality & guest experience', 'Content & media', 'Design', 'Logistics', 'Something else'],
}

export const partnership = {
  eyebrow: 'Partnership & collaboration',
  title: 'Build the room with us.',
  body: 'We are looking for organisations that care about creative work across disciplines. Partnerships can take many forms — tell us what you have in mind.',
  types: [
    { title: 'Event partner', body: 'Support The First Room and future Creators Hub gatherings.' },
    { title: 'Venue & production', body: 'Spaces, equipment and technical production.' },
    { title: 'Programme & content', body: 'Co-create sessions, workshops or exhibitions.' },
    { title: 'Media & community', body: 'Help the stories and the work travel further.' },
  ],
}

/**
 * PLACEHOLDER contact details — none have been supplied.
 * Set `value` to null to render a clearly labelled placeholder.
 */
export const contact = {
  eyebrow: 'Contact',
  title: 'Say hello.',
  email: null as string | null,
  socials: [
    { label: 'Instagram', href: null as string | null },
    { label: 'LinkedIn', href: null as string | null },
    { label: 'X', href: null as string | null },
  ],
}
