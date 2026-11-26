/**
 * Creator’s Hub: the organisation (homepage copy).
 *
 * Creator’s Hub is a community for young African creatives and builders of
 * every kind. The four arms (Tech, Art & Design, Fashion, Film & Storytelling)
 * belong ONLY to the event, Creator’s Hub 001: The First Room. Never describe
 * the four arms as who Creator’s Hub is.
 *
 * Edit the words here; the homepage, intro and search text read from this file.
 */

/** The organisation's name, spelt the way it is everywhere on the site. */
export const BRAND = 'Creator’s Hub'
/** Plain-apostrophe spelling for search engines and page titles. */
export const BRAND_PLAIN = "Creator's Hub"
/** The event's name as shown on the homepage and The First Room page. */
export const EVENT_NAME = `${BRAND} 001: The First Room`

export const heroCopy = {
  eyebrow: 'Creator’s Hub · Est. 2026 · Lagos',
  headline: ['Africa does', 'not lack ideas.'],
  statement: 'It lacks rooms where the people holding them can find each other. We’re building those rooms.',
  primary: { label: 'Register for The First Room', to: '/tickets' },
  secondary: { label: 'Volunteer', to: '/volunteer' },
}

export const whoWeAre = {
  eyebrow: 'Who we are',
  title: ['Turning idealists', 'into builders.'],
  body: 'Creator’s Hub is a community for young African creatives and builders: anyone carrying an idea they haven’t started yet. We bring people with ideas into the same room as the people who can help build them, and then we help them start.',
}

export const manifesto = {
  eyebrow: 'The manifesto',
  title: ['What we', 'believe'],
  lines: [
    'Every creative has an idea frozen inside them.',
    'Ideas don’t die from a lack of talent. They die from isolation.',
    'Every builder needs someone who sees what they can’t.',
    'Start small. Start unfinished. Start now.',
    'Share the work, not just the wins.',
    'Ask “What are you building?”, not “What do you do?”',
    'We don’t wait for someone else to build our ideas.',
    'Not someday. Not by someone else. Now.',
  ],
}

export type StepId = 'imagine' | 'gather' | 'connect' | 'build'

export const howWeWork = {
  eyebrow: 'How we work',
  steps: [
    { id: 'imagine' as StepId, title: 'Imagine', body: 'Name the idea you’ve been sitting on.' },
    { id: 'gather' as StepId, title: 'Gather', body: 'Get in the room with people who build.' },
    { id: 'connect' as StepId, title: 'Connect', body: 'Find the collaborators your idea is missing.' },
    { id: 'build' as StepId, title: 'Build', body: 'Start it, together, and show the world.' },
  ],
}

/** The event section on the homepage. The four arms are The First Room's. */
export const firstRoomSection = {
  eyebrow: EVENT_NAME,
  title: ['It starts with', 'The First Room.'],
  body: 'Our first event brings four creative arms together for one day: Saturday 19 December 2026, 9 AM–3 PM (WAT), in Lagos and online. Free.',
  armsLabel: 'The four arms of Creator’s Hub 001',
  arms: [
    { id: 'technology' as const, name: 'Tech', body: 'For the ones who think in code. Developers, product people, AI tinkerers.' },
    { id: 'artdesign' as const, name: 'Art & Design', body: 'For the ones who see in colour. Illustrators, painters, UI designers, 3D artists.' },
    { id: 'fashion' as const, name: 'Fashion', body: 'For the ones who speak in cloth. Designers, stylists, tailors, thrift reworkers.' },
    { id: 'film' as const, name: 'Film & Storytelling', body: 'For the ones who frame everything. Filmmakers, writers, photographers, animators.' },
  ],
  after: 'They’ve rarely been in the same room. On 19 December, they will be.',
  cta: { label: 'Register free, in person or online', to: '/tickets' },
  small: 'This is the first of many rooms.',
}

/** The opening animation: three beats from manifesto line 08, the four steps, then the name. */
export const intro = {
  lines: ['Not someday.', 'Not by someone else.', 'Now.'],
  signoff: 'Est. 2026 · Lagos',
}

export const oath = {
  n: '06',
  eyebrow: 'The founder’s oath',
  /** The middle sentence is highlighted. */
  before:
    'I am building Creators Hub not for a grade, not for recognition, not for a moment. I am building it because I believe Africa’s greatest chapter has not been written yet — and I intend to be part of writing it.',
  highlight: 'This is my life’s work.',
  after: 'I will look back on it with pride. I will look forward and watch it go further than I could ever imagine.',
  signature: 'Founder · Creators Hub · 2026',
}

/** Shown directly under the Founder’s Oath. */
export const founderLine = '— Erioluwa Mercy Akintayo (Ema), Founder, Creator’s Hub'

/** One-line description, for search results and link previews. */
export const brandSummary =
  "Creator's Hub is a community for young African creatives and builders: anyone carrying an idea they haven't started yet."
