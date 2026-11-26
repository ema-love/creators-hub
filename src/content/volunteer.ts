/**
 * The Creator’s Hub Volunteer Collective: the six core teams, what volunteers
 * get, and the FAQ for Creator’s Hub 001: The First Room.
 *
 * Keep to what is confirmed. A team with `status: 'conditional'` is shown as
 * "Subject to confirmation"; switch it to 'confirmed' once it is final.
 *
 * The team `title`s are what the application form sends and what appears in
 * the Google Sheet, so avoid renaming a team once applications are coming in.
 */

import { firstRoom } from './event'

/** 'beginners': no experience needed. 'preferred': some experience helps, but it isn't required. */
export type ExperienceLevel = 'beginners' | 'preferred'

export const experienceLabel: Record<ExperienceLevel, string> = {
  beginners: 'Beginners welcome',
  preferred: 'Experience preferred',
}

export type ExperienceTag = { level: ExperienceLevel; /** What the tag applies to, when a team is mixed. */ for?: string }

export type VolunteerTeam = {
  id: string
  number: string
  title: string
  /** One line: why the team matters. */
  summary: string
  /** What volunteers on this team do. */
  duties: string[]
  experience: ExperienceTag[]
  /** Extra requirements or conditions, shown as small tags on the card. */
  notes?: string[]
  /** True if the team can be done remotely (lets the applicant choose "Online"). */
  remote?: boolean
  status: 'confirmed' | 'conditional'
}

export const volunteerIntro = {
  eyebrow: 'Creator’s Hub 001 · Volunteer',
  title: ['The Volunteer', 'Collective'],
  lede: `The First Room runs on people who build. Volunteer with us on ${firstRoom.dateCompact} and get front-row access to Lagos’ next generation of creatives.`,
  body: 'Six core teams, and most of them welcome beginners. Pick the one that fits you, or the one that stretches you.',
}

export const volunteerTeams: VolunteerTeam[] = [
  {
    id: 'welcome',
    number: '①',
    title: 'Welcome & Registration',
    summary: 'Be the first face people see.',
    duties: [
      'Scan QR tickets at check-in.',
      'Hand out name tags.',
      'Help guests find seats and their creative “room”.',
      'Answer questions at the welcome desk.',
    ],
    experience: [{ level: 'beginners' }],
    status: 'confirmed',
  },
  {
    id: 'programme',
    number: '②',
    title: 'Programme & Speakers',
    summary: 'Keep the day running on time.',
    duties: [
      'Greet and look after speakers.',
      'Guide them to the green room and stage.',
      'Keep time for each session.',
      'Help with smooth handovers between segments.',
    ],
    experience: [{ level: 'beginners' }],
    status: 'confirmed',
  },
  {
    id: 'media',
    number: '③',
    title: 'Media: photo, video & live Stories',
    summary: 'Capture The First Room.',
    duties: [
      'Photograph and film key moments.',
      'Post live Instagram Stories through the day.',
      'Collect short interviews and quotes.',
      'Gather footage for the highlight Reel.',
    ],
    experience: [
      { level: 'preferred', for: 'Photo & video' },
      { level: 'beginners', for: 'Stories' },
    ],
    status: 'confirmed',
  },
  {
    id: 'online-host',
    number: '④',
    title: 'Online Host',
    summary: 'Look after everyone joining online.',
    duties: [
      'Welcome virtual attendees.',
      'Run the chat.',
      'Pass their questions to the stage.',
      'Share links and updates.',
      'Make online guests feel like they’re in the room.',
    ],
    experience: [{ level: 'beginners' }],
    notes: ['Good internet and a laptop needed', 'Can be done remotely'],
    remote: true,
    status: 'confirmed',
  },
  {
    id: 'community',
    number: '⑤',
    title: 'Community & Networking',
    summary: 'Help people meet the right people.',
    duties: [
      'Make introductions across tech, design, fashion and film.',
      'Run the Reels corner, where guests film their ideas.',
      'Help host the Frozen Ideas “thaw” at the end of the day.',
    ],
    experience: [{ level: 'beginners' }],
    status: 'confirmed',
  },
  {
    id: 'marketplace',
    number: '⑥',
    title: 'Marketplace',
    summary: 'Support creatives showcasing and selling their work.',
    duties: ['Help exhibitors set up.', 'Guide guests around the marketplace.', 'Document the stands.'],
    experience: [{ level: 'beginners' }],
    status: 'conditional',
  },
]

export const conditionalNote = 'Subject to confirmation'

export const teamByTitle = (title: string) => volunteerTeams.find((t) => t.title === title)

/** "Beginners welcome", or "Photo & video: Experience preferred · Stories: Beginners welcome" for mixed teams. */
export const experienceText = (team: VolunteerTeam) =>
  team.experience.map((e) => (e.for ? `${e.for}: ${experienceLabel[e.level]}` : experienceLabel[e.level])).join(' · ')

/**
 * What volunteers get.
 * ✏️ EDIT ME: these are placeholders. Change the wording, add or remove items
 * once the benefits are confirmed. They appear on /volunteer.
 */
export const volunteerBenefits = {
  eyebrow: 'What volunteers get',
  title: ['Give a day.', 'Leave with more.'],
  items: [
    { title: 'Volunteer certificate & recognition', body: 'A certificate for every volunteer, and recognition on the day.' },
    { title: 'A feature on our page', body: 'A Creator’s Hub volunteer feature on our page, introducing you and your work.' },
    { title: 'Connections that last', body: 'Time with the speakers and partners behind The First Room.' },
  ],
}

export const volunteerValues = {
  eyebrow: 'What the collective stands for',
  items: [
    { title: 'Inclusion and accessibility', body: 'The collective is open to people from every background and level of experience.' },
    { title: 'Practical experience and learning', body: 'Every team is a chance to learn real skills on a real event.' },
    { title: 'Community building', body: 'We look after each other, and we leave with people we can call on.' },
    { title: 'Creativity and collaboration', body: 'Good ideas come from anyone on the team, whatever their role.' },
    { title: 'Professionalism and respect', body: 'Towards guests, speakers, partners and one another.' },
    { title: 'Equal opportunity', body: 'Every application is read on its own merits. Who you know doesn’t come into it.' },
  ],
  commitments: ['No fee to take part', 'No equipment to buy', 'Most teams welcome beginners'],
}

/** Application form options. The values are what's saved in Netlify Forms and the sheet. */
export const volunteerAttendance = {
  inPerson: 'In person, in Lagos',
  online: 'Online (Online Host only)',
} as const
export const briefingOptions = ['Yes', 'No'] as const

export const volunteerSuccess =
  'Thank you! We’ve received your application and will be in touch on WhatsApp/email before 15 December.'

export const volunteerFaqs: { q: string; a: string }[] = [
  {
    q: 'Do I need previous experience?',
    a: 'No. Every team welcomes beginners. On the Media team, some photo or video experience is preferred for shooting, but anyone can help with live Stories.',
  },
  {
    q: 'Who can apply?',
    a: 'Anyone who wants to contribute. We especially encourage students, emerging creatives and people looking for practical experience or a way into creative networks they don’t yet have access to.',
  },
  {
    q: 'Can I volunteer online?',
    a: 'Yes, on the Online Host team, which looks after everyone joining online. You’ll need good internet and a laptop. All other teams are in person in Lagos.',
  },
  {
    q: 'Does it cost anything, or do I need my own equipment?',
    a: 'No. There’s no fee to volunteer, and you won’t be asked to buy equipment for any team. If you do have your own camera or kit, mention it in your application.',
  },
  {
    q: 'Can I apply for more than one team?',
    a: 'Choose a first choice and, if you like, a second. We’ll do our best to place you on one of them.',
  },
  {
    q: 'When will I hear back?',
    a: 'We’ll be in touch on WhatsApp or email before 15 December. Selected volunteers are briefed on their team, who they’ll work with and what’s expected on the day.',
  },
  {
    q: 'Is the Marketplace confirmed?',
    a: 'Not yet. The Marketplace team is subject to confirmation. You’re welcome to apply now; if it doesn’t go ahead, we’ll talk to you about your second choice.',
  },
]
