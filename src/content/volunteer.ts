/**
 * The Creators Hub Volunteer Collective: departments, positions and FAQ for
 * Creators Hub 001: The First Room. Supplied by Creators Hub.
 *
 * Keep to what is confirmed: no benefits, dates, deadlines or contact details
 * that haven't been agreed. A department with `status: 'conditional'` is shown
 * as subject to confirmation; switch it to 'confirmed' once it is final.
 */

/** 'beginners': no experience needed. 'preferred': some experience helps, but it isn't required. */
export type ExperienceLevel = 'beginners' | 'preferred'

export type VolunteerRole = {
  id: string
  title: string
  duties: string[]
  experience: ExperienceLevel
}

export type VolunteerDepartment = {
  id: string
  title: string
  summary: string
  status: 'confirmed' | 'conditional'
  /** Shown on conditional departments. */
  note?: string
  roles: VolunteerRole[]
}

export const experienceLabel: Record<ExperienceLevel, string> = {
  beginners: 'Beginners welcome',
  preferred: 'Experience preferred',
}

export const volunteerIntro = {
  eyebrow: 'Creators Hub 001 · Volunteer',
  title: ['The Volunteer', 'Collective'],
  lede: 'A team of students, emerging creatives and curious people helping to build The First Room, and learning by doing it.',
  body: 'You don’t need event experience to join. You need to show up, care about the work and be ready to learn. Pick a role that fits you, or one that stretches you.',
}

export const volunteerWhy = {
  eyebrow: 'Why volunteer',
  title: ['Get in the room', 'while it’s being built.'],
  openCall:
    'If you’re a student, an emerging creative, or someone looking for real experience and the right people to learn from, this is for you. Many of the people in this room never had a way in. We want to change that.',
  points: [
    {
      title: 'Practical experience',
      body: 'Work on a real creative event, alongside the people running it, rather than reading about how it’s done.',
    },
    {
      title: 'A community across disciplines',
      body: 'Meet people working in fashion, technology, film and storytelling, and arts and design, in one place.',
    },
    {
      title: 'Be part of the first edition',
      body: 'The First Room is the inaugural Creators Hub event. Volunteers help set the tone for everything that follows.',
    },
    {
      title: 'Learn something new',
      body: 'Try a side of creative work you haven’t done before. Most roles are open to beginners.',
    },
  ],
}

export const volunteerValues = {
  eyebrow: 'What the collective stands for',
  items: [
    { title: 'Inclusion and accessibility', body: 'The collective is open to people from every background and level of experience.' },
    { title: 'Practical experience and learning', body: 'Every role is a chance to learn real skills on a real event.' },
    { title: 'Community building', body: 'We look after each other, and we leave with people we can call on.' },
    { title: 'Creativity and collaboration', body: 'Good ideas come from anyone on the team, whatever their role.' },
    { title: 'Professionalism and respect', body: 'Towards guests, speakers, partners and one another.' },
    { title: 'Equal opportunity', body: 'Every application is read on its own merits. Who you know doesn’t come into it.' },
  ],
  commitments: ['No fee to take part', 'No equipment to buy', 'No previous event experience required'],
}

export const volunteerDepartments: VolunteerDepartment[] = [
  {
    id: 'technology',
    title: 'Technology & Digital Support',
    summary: 'Keep the room’s tools, screens and systems working.',
    status: 'confirmed',
    roles: [
      {
        id: 'digital-technical-support',
        title: 'Digital & Technical Support Assistant',
        experience: 'preferred',
        duties: [
          'Assist with event-related digital tools and technology.',
          'Support ticketing and digital registration systems where necessary.',
          'Assist with presentations and technical equipment.',
          'Help troubleshoot basic technical issues during the event.',
        ],
      },
    ],
  },
  {
    id: 'programme',
    title: 'Speaker & Programme Support',
    summary: 'Help speakers feel at home and keep the programme moving.',
    status: 'confirmed',
    roles: [
      {
        id: 'speaker-liaison',
        title: 'Speaker Liaison',
        experience: 'beginners',
        duties: [
          'Assist speakers with event arrival and orientation.',
          'Communicate relevant programme information to speakers.',
          'Help speakers navigate the event venue.',
          'Support speaker coordination before and during the event.',
        ],
      },
      {
        id: 'programme-support',
        title: 'Programme Support Assistant',
        experience: 'beginners',
        duties: [
          'Assist the programme team with event transitions.',
          'Help ensure programme activities are organized.',
          'Support communication between programme staff and speakers.',
        ],
      },
      {
        id: 'programme-timekeeper',
        title: 'Programme Timekeeper',
        experience: 'beginners',
        duties: [
          'Monitor programme timing.',
          'Help communicate timing reminders to speakers and programme staff.',
          'Support smooth transitions between programme segments.',
        ],
      },
    ],
  },
  {
    id: 'media',
    title: 'Marketing, Media & Communications',
    summary: 'Capture the day and help its stories travel.',
    status: 'confirmed',
    roles: [
      {
        id: 'social-media',
        title: 'Social Media Assistant',
        experience: 'beginners',
        duties: [
          'Assist with event-related social media coverage.',
          'Capture live updates and behind-the-scenes moments.',
          'Help document activities for social media content.',
        ],
      },
      {
        id: 'photography',
        title: 'Photography Assistant',
        experience: 'preferred',
        duties: [
          'Support event photography.',
          'Capture candid moments, attendees, and event activities.',
          'Assist with organizing photographs.',
        ],
      },
      {
        id: 'videography',
        title: 'Videography Assistant',
        experience: 'preferred',
        duties: [
          'Assist with video recording.',
          'Capture behind-the-scenes footage and event highlights.',
          'Support video documentation activities.',
        ],
      },
      {
        id: 'content-documentation',
        title: 'Content Documentation Assistant',
        experience: 'beginners',
        duties: [
          'Document important event moments.',
          'Collect quotes, highlights, and key observations.',
          'Assist with creating post-event content.',
        ],
      },
      {
        id: 'interview',
        title: 'Interview Assistant',
        experience: 'beginners',
        duties: [
          'Assist with coordinating interviews.',
          'Help prepare interview questions and identify interview participants.',
          'Support interviews with speakers, attendees, and creative exhibitors.',
        ],
      },
      {
        id: 'media-communications',
        title: 'Media & Communications Assistant',
        experience: 'beginners',
        duties: [
          'Assist with communications activities.',
          'Help coordinate media-related tasks.',
          'Support the collection and organization of event content.',
        ],
      },
    ],
  },
  {
    id: 'marketplace',
    title: 'Creative Marketplace',
    summary: 'Support the makers selling their work at The First Room.',
    status: 'conditional',
    note: 'The Creative Marketplace hasn’t been confirmed yet. These roles will only go ahead if it is. You’re welcome to register your interest in the meantime.',
    roles: [
      {
        id: 'vendor-relations',
        title: 'Vendor Relations Assistant',
        experience: 'beginners',
        duties: [
          'Communicate with marketplace vendors.',
          'Assist vendors with event-related information.',
          'Help address vendor questions.',
        ],
      },
      {
        id: 'marketplace-support',
        title: 'Marketplace Support Assistant',
        experience: 'beginners',
        duties: [
          'Assist vendors with marketplace setup.',
          'Help vendors navigate the marketplace area.',
          'Provide general support during the event.',
        ],
      },
      {
        id: 'marketplace-documentation',
        title: 'Marketplace Documentation Assistant',
        experience: 'beginners',
        duties: [
          'Document marketplace activities.',
          'Capture participating vendors and their creative products.',
          'Assist with marketplace content creation.',
        ],
      },
    ],
  },
  {
    id: 'community',
    title: 'Partnerships & Community Engagement',
    summary: 'Grow the circle, before the event and on the day.',
    status: 'confirmed',
    roles: [
      {
        id: 'community-engagement',
        title: 'Community Engagement Assistant',
        experience: 'beginners',
        duties: [
          'Assist with outreach to creative communities and student groups.',
          'Help strengthen connections with local creative networks.',
          'Support community engagement activities.',
        ],
      },
      {
        id: 'partnership-support',
        title: 'Partnership Support Assistant',
        experience: 'beginners',
        duties: [
          'Assist with partner communication.',
          'Help organize partnership information and documentation.',
          'Support partner coordination and follow-up activities.',
        ],
      },
      {
        id: 'networking',
        title: 'Networking Assistant',
        experience: 'beginners',
        duties: [
          'Help attendees connect with other creatives.',
          'Encourage meaningful networking between attendees, speakers, and partners.',
          'Support networking activities during the event.',
        ],
      },
      {
        id: 'community-outreach',
        title: 'Community Outreach Assistant',
        experience: 'beginners',
        duties: [
          'Assist with reaching potential attendees, volunteers, and community organizations.',
          'Help distribute event information.',
          'Support community recruitment and engagement.',
        ],
      },
    ],
  },
]

export const volunteerArrangementsNote =
  'Some positions may change depending on final event arrangements. If a role you apply for changes, we’ll let you know and talk through the options.'

export const allVolunteerRoles = volunteerDepartments.flatMap((d) => d.roles.map((r) => ({ ...r, department: d })))

export const volunteerStages = ['Student', 'Emerging creative', 'Looking for practical experience', 'Working professional', 'Other'] as const

export const volunteerFaqs: { q: string; a: string }[] = [
  {
    q: 'Do I need previous experience?',
    a: 'No. You don’t need to have volunteered at an event before. Most roles are marked “Beginners welcome”. A few say “Experience preferred”: some familiarity helps there, but it isn’t a requirement, so apply anyway and tell us where you’re starting from.',
  },
  {
    q: 'Who can apply?',
    a: 'Anyone who wants to contribute. We especially encourage students, emerging creatives and people looking for practical experience or a way into creative networks they don’t yet have access to.',
  },
  {
    q: 'Does it cost anything, or do I need my own equipment?',
    a: 'No. There’s no fee to volunteer, and you won’t be asked to buy equipment to qualify for any role, including photography and videography. If you do have your own kit, you’re welcome to mention it.',
  },
  {
    q: 'How are volunteers selected?',
    a: 'Every application is read. We look for enthusiasm, reliability and how well your interests match the roles we need to fill, not for a long CV or who you know. We’ll contact applicants using the email address on their application.',
  },
  {
    q: 'What will I be responsible for?',
    a: 'Each role above lists its main responsibilities. Selected volunteers will be briefed on their role, who they’ll be working with and what’s expected on the day before the event.',
  },
  {
    q: 'What do volunteers get out of it?',
    a: 'Hands-on experience at a real creative event, people to learn from, and a place in a community across fashion, technology, film and storytelling, and arts and design. Any further volunteer benefits will be shared with selected volunteers once they’re confirmed.',
  },
  {
    q: 'Can I apply for more than one role?',
    a: 'Yes. Choose your first choice and, if you like, a second. We’ll do our best to match you to one of them.',
  },
  {
    q: 'Are all positions confirmed?',
    a: 'Some positions may change depending on final event arrangements. The Creative Marketplace roles depend on the marketplace being confirmed, and are marked as such.',
  },
]
