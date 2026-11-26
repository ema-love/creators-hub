/**
 * The team behind Creator's Hub: shown on the homepage ("The team") and at /team.
 *
 * To add someone, copy one entry in `teamMembers` and fill it in. The cards,
 * the /team page and Google's organisation data all update from this list.
 *
 * ✏️ PLACEHOLDERS to fill in are marked "PLACEHOLDER" below:
 *   - bio:      one line about the person (Divine's is still an example)
 *   - photo:    a square photo in public/team/ (e.g. '/team/divine-moses.jpg');
 *               null shows a neutral placeholder with their initials
 *   - linkedin / instagram: profile URLs; null hides the link
 *
 * A member with `profile` also gets their own page (e.g. /team/erioluwa-akintayo),
 * listed in the sitemap, so their name shows on Google with their role.
 */

export type TeamMember = {
  id: string
  name: string
  /** Short form used for initials and alt text, e.g. "Ema". */
  shortName: string
  role: string
  bio: string
  /** Square photo, at least 640 × 640, in public/team/. */
  photo: string | null
  linkedin: string | null
  /** Instagram profile URL; null hides the link. */
  instagram?: string | null
  /** The founder is listed as `founder` in Google's data; everyone else as `member`. */
  founder?: boolean
  /**
   * Optional profile page (e.g. /team/erioluwa-akintayo): helps Google show the
   * person's name with their role when someone searches for them.
   */
  profile?: {
    path: string
    /** Search title and description for the profile page. */
    title: string
    description: string
    /** Other names people may search for. */
    alternateNames: string[]
    /** One or two sentences about the person, shown on the profile page. */
    about: string
    /** Longer story in the person's own words: one string per paragraph. */
    story?: string[]
    /** Quick facts shown beside the story. */
    facts?: Array<{ label: string; value: string }>
    /** For Google: where they study or work besides Creator's Hub, where they're based, what they know about. */
    affiliation?: { name: string; url?: string }
    basedIn?: string
    knowsAbout?: string[]
  }
}

export const teamSection = {
  eyebrow: 'The team',
  title: ['The team behind', 'Creator’s Hub'],
  intro: 'A small team building the rooms where young creatives find each other.',
}

export const teamMembers: TeamMember[] = [
  {
    id: 'erioluwa-akintayo',
    name: 'Erioluwa Mercy Akintayo (Ema)',
    shortName: 'Ema',
    role: 'Founder',
    bio: 'Leads the vision of creating spaces where young people can explore their ideas, find support, and bring their creativity to life.',
    photo: '/team/erioluwa-akintayo.jpg',
    linkedin: 'https://www.linkedin.com/in/erioluwa-akintayo-76449037a',
    instagram: 'https://www.instagram.com/eri.by.ema/',
    founder: true,
    profile: {
      path: '/team/erioluwa-akintayo',
      title: "Erioluwa Mercy Akintayo (Ema) · Founder of Creator's Hub",
      description:
        "Erioluwa Mercy Akintayo (Ema), founder of Creator's Hub, turning idealists into builders. Software Engineering student at African Leadership University.",
      alternateNames: ['Ema', 'Erioluwa Akintayo', 'Ema Akintayo'],
      // Ema's own words.
      about:
        'Erioluwa Mercy Akintayo (Ema) is the founder of Creator’s Hub, a community built to turn idealists into builders. She leads the vision of creating spaces where young people can explore their ideas, find support, and bring their creativity to life.',
      // Ema's own words.
      story: [
        'I’m Erioluwa Mercy Akintayo, known as Ema, and I’m the founder of Creator’s Hub. I’m a Software Engineering student at African Leadership University, with a growing interest in artificial intelligence, technology, and building products that solve meaningful problems.',
        'Creator’s Hub was born from a belief I deeply hold: Africa doesn’t lack ideas; it lacks the space, support, and belief in the people behind those ideas. I wanted to build a community that gives young people, creatives, and aspiring builders the opportunity to move beyond imagining and begin creating.',
        'Creator’s Hub is about turning idealists into builders. It is a space for people figuring things out, exploring their potential, and bringing their ideas to life through community, collaboration, and real opportunities.',
        'I’m currently based in Lagos, Nigeria, and I’m building Creator’s Hub with the long-term vision of growing it across Africa and beyond.',
      ],
      facts: [
        { label: 'Role', value: 'Founder, Creator’s Hub' },
        { label: 'Studying', value: 'Software Engineering, African Leadership University' },
        { label: 'Interests', value: 'Artificial intelligence, technology, and building products that solve meaningful problems' },
      ],
      affiliation: { name: 'African Leadership University', url: 'https://www.alueducation.com' },
      knowsAbout: ['Software engineering', 'Artificial intelligence', 'Technology', 'Product building', 'Community building'],
    },
  },
  {
    id: 'divine-moses',
    name: 'Divine Kamsi Moses',
    shortName: 'Divine',
    role: 'Community Lead',
    // PLACEHOLDER: replace with Divine's own line.
    bio: 'Brings creatives into the room and keeps the community connected.',
    // PLACEHOLDER: add a square photo to public/team/ and put its path here.
    photo: null,
    // PLACEHOLDER: add the LinkedIn profile URL.
    linkedin: null,
  },
]

/** A person's public profiles, in display order. Also used as `sameAs` in Google's data. */
export const socialLinksOf = (m: TeamMember) =>
  [
    { label: 'LinkedIn', url: m.linkedin },
    { label: 'Instagram', url: m.instagram ?? null },
  ].filter((l): l is { label: string; url: string } => Boolean(l.url))

/** Full name without the nickname in brackets: "Erioluwa Mercy Akintayo (Ema)" → "Erioluwa Mercy Akintayo". */
export const legalName = (m: TeamMember) => m.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()

export const profilePages = teamMembers.filter((m) => m.profile)

/** "Erioluwa Mercy Akintayo (Ema)" → "EA"; "Divine Kamsi Moses" → "DM". */
export const initialsOf = (m: TeamMember) => {
  const parts = m.name.replace(/\(.*?\)/g, '').trim().split(/\s+/)
  return (parts[0]![0]! + (parts.length > 1 ? parts[parts.length - 1]![0]! : '')).toUpperCase()
}
