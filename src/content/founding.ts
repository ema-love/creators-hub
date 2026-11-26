/**
 * Creators Hub: the organisation.
 *
 * Taken word for word from the Creators Hub Founding Document (Founding
 * Charter, est. 2026). Edit here to change what the homepage says about
 * Creators Hub. The First Room, the first event, is in ./event.ts; its four
 * creative arms (fashion, technology, film & storytelling, arts & design)
 * belong to the event, not to Creators Hub as a whole.
 *
 * Titles are split as [plain, accent]: the accent word is shown in green.
 */

export const founding = {
  eyebrow: 'Founding document · Est. 2026 · Pan-African',
  /** The three beats of the opening animation, from the mission. */
  introLines: ['Not someday.', 'Not by someone else.', 'Now. By them.'],
  /** Under the logo at the end of the opening animation. */
  introSignoff: 'Pan-African · Est. 2026',
  headline: ['Africa does', 'not lack ideas.'],
  statement: 'Africa lacks the space, the support, and the belief that those ideas can be built — by the very people who thought them.',
}

export const mission = {
  n: '01',
  eyebrow: 'Mission & vision',
  title: ['Why we', 'exist.'],
  mission:
    'To build a pan-African ecosystem where young thinkers are given the education, community, and creative space to turn their own ideas into reality — not someday, not by someone else. Now. By them.',
  vision:
    'A future where no African idea disappears because the person who thought it didn’t believe they could build it. Where Africa’s greatest innovations are created by Africans, for Africa, and carried by Africa to the world.',
}

export const problem = {
  n: '02',
  eyebrow: 'The problem',
  title: ['What we’re', 'solving.'],
  items: [
    {
      title: 'The waiting trap',
      body: 'Young Africans have world-class ideas but wait for someone else — a company, a government, a foreign investor — to build them. The idea dies waiting.',
    },
    {
      title: 'The confidence gap',
      body: 'Brilliant thinkers don’t believe they are builders. They’ve never been shown that the distance between an idea and a product is something they can cross themselves.',
    },
    {
      title: 'The education mismatch',
      body: 'Africa’s education system teaches people what to think — not how to build what they think. Passive learning produces passive creators.',
    },
    {
      title: 'The isolation problem',
      body: 'Young innovators across Africa are building alone, unaware that others across borders share their vision. There is no common space, no shared language of creation.',
    },
  ],
}

export type PillarIcon = 'recognition' | 'space' | 'education' | 'guidance'

export const pillars = {
  n: '03',
  eyebrow: 'The four pillars',
  title: ['How we’re', 'built.'],
  items: [
    {
      icon: 'recognition' as PillarIcon,
      title: 'Recognition',
      /** Short line for the opening animation, from the pillar's own words. */
      line: 'We create that visibility.',
      body: 'Africa’s big thinkers deserve to be seen and celebrated on this continent — before the world discovers them. We create that visibility.',
    },
    {
      icon: 'space' as PillarIcon,
      title: 'Creative Space',
      line: 'Treated as the raw material of something real.',
      body: 'A physical and digital environment where ideas are welcomed, taken seriously, and treated as the raw material of something real.',
    },
    {
      icon: 'education' as PillarIcon,
      title: 'Education',
      line: 'Not theory. Execution.',
      body: 'Practical, hands-on learning in the skills that close the gap — coding, design, storytelling, pitching, building. Not theory. Execution.',
    },
    {
      icon: 'guidance' as PillarIcon,
      title: 'Guidance',
      line: 'No one builds alone here.',
      body: 'Mentors, community, and structure that walk alongside creators from first idea to finished product. No one builds alone here.',
    },
  ],
}

export const philosophy = {
  n: '04',
  eyebrow: 'The philosophy',
  title: ['The shift', 'we make.'],
  shifts: [
    { from: 'Someone else will build this.', to: 'I will build this.' },
    { from: 'I’m not technical enough.', to: 'I’ll learn what I need to build what I see.' },
    { from: 'My idea isn’t ready yet.', to: 'Start small. Build. Let it become what it needs to be.' },
    { from: 'Africa needs foreign investment to grow.', to: 'Africa grows from within. We are the investment.' },
    { from: 'I’m doing this alone.', to: 'You are surrounded by builders. Build together.' },
  ],
}

export const roadmap = {
  n: '05',
  eyebrow: 'The roadmap',
  title: ['Where we’re', 'going.'],
  phases: [
    {
      phase: 'Phase 01',
      when: 'Now',
      where: 'Nigeria',
      title: 'Plant the Seed',
      body: 'Enter schools across Lagos with game-based coding programmes. Make technology feel like play. Build the pipeline. Identify the thinkers who are waiting for a space like this.',
    },
    {
      phase: 'Phase 02',
      when: 'Year 1',
      where: 'Nigeria',
      title: 'The First Hackathon',
      body: 'Host Creators Hub’s first week-long hackathon. Young builders tackle real problems — healthcare, job creation, infrastructure. Real challenges. Real solutions. Built by them.',
    },
    {
      phase: 'Phase 03',
      when: 'Year 2–3',
      where: 'West Africa',
      title: 'Build the Community',
      body: 'Open the ecosystem beyond Nigeria. Creators Hub becomes a pan-West African community of young innovators connected across borders, sharing skills, ideas, and momentum.',
    },
    {
      phase: 'Phase 04',
      when: 'Year 4–7',
      where: 'Pan-African',
      title: 'The Movement',
      body: 'Creators Hub becomes Africa’s defining creative and innovation ecosystem. A name every young African thinker knows. The place where Africa’s next generation of builders begin.',
    },
    {
      phase: 'Phase 05',
      when: 'Year 10+',
      where: 'The world',
      title: 'The Legacy',
      body: 'Creators Hub has produced companies, movements, technologies, and leaders that have changed Africa — and Africa has changed the world. This is what it was always meant to become.',
    },
  ],
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

/** One-line description of Creators Hub, for search results and link previews. */
export const creatorsHubSummary =
  'Creators Hub is a pan-African ecosystem where young thinkers are given the education, community, and creative space to turn their own ideas into reality.'
