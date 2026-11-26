/**
 * The team behind Creator's Hub: shown on the homepage ("The team") and at /team.
 *
 * To add someone, copy one entry in `teamMembers` and fill it in. The cards,
 * the /team page and Google's organisation data all update from this list.
 *
 * ✏️ PLACEHOLDERS to fill in are marked "PLACEHOLDER" below:
 *   - bio:      one line about the person (the current lines are examples)
 *   - photo:    a square photo in public/team/ (e.g. '/team/divine-moses.jpg');
 *               null shows a neutral placeholder with their initials
 *   - linkedin: their LinkedIn profile URL; null hides the LinkedIn link
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
    // PLACEHOLDER: replace with Ema's own line.
    bio: 'Founded Creator’s Hub to turn idealists into builders.',
    photo: '/team/erioluwa-akintayo.jpg',
    linkedin: 'https://www.linkedin.com/in/erioluwa-akintayo-76449037a',
    founder: true,
    profile: {
      path: '/team/erioluwa-akintayo',
      title: "Erioluwa Mercy Akintayo (Ema) · Founder of Creator's Hub",
      description:
        "Erioluwa Mercy Akintayo (Ema) is the founder of Creator's Hub, a community in Lagos for young African creatives and builders, established in 2026.",
      alternateNames: ['Ema', 'Erioluwa Akintayo', 'Ema Akintayo'],
      about:
        'Erioluwa Mercy Akintayo, known as Ema, is the founder of Creator’s Hub: a community for young African creatives and builders, established in Lagos in 2026. Creator’s Hub’s first event is Creator’s Hub 001: The First Room, on 19 December 2026.',
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

/** Full name without the nickname in brackets: "Erioluwa Mercy Akintayo (Ema)" → "Erioluwa Mercy Akintayo". */
export const legalName = (m: TeamMember) => m.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()

export const profilePages = teamMembers.filter((m) => m.profile)

/** "Erioluwa Mercy Akintayo (Ema)" → "EA"; "Divine Kamsi Moses" → "DM". */
export const initialsOf = (m: TeamMember) => {
  const parts = m.name.replace(/\(.*?\)/g, '').trim().split(/\s+/)
  return (parts[0]![0]! + (parts.length > 1 ? parts[parts.length - 1]![0]! : '')).toUpperCase()
}
