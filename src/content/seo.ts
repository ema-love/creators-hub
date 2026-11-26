/**
 * What search engines and link previews show for each public page, and the
 * Creator's Hub profiles listed in Google's organisation data.
 *
 * Read by the pages themselves (tab title) and by the build (the HTML Google
 * receives: title, description, structured data). Keep each description
 * around 150 characters.
 */

export type PageMeta = { title: string; description: string }

export const pageMeta = {
  '/': {
    title: "Creator's Hub · Turning idealists into builders · Lagos",
    description:
      "Creator's Hub turns idealists into builders. Young creatives meet at The First Room, Lagos and online, on 19 December 2026. Free to register. Join us.",
  },
  '/the-first-room': {
    title: "Creator's Hub 001: The First Room · 19 Dec 2026 · Lagos + online · Free",
    description:
      'A free one-day gathering for young creatives in tech, art & design, fashion and film & storytelling: 19 December 2026, 9 AM–3 PM, in Lagos and online.',
  },
  '/tickets': {
    title: 'Register free · The First Room, 19 Dec 2026, Lagos + online',
    description:
      'Register free for The First Room, a one-day gathering for young creatives on 19 December 2026 in Lagos or online. One registration per person. Join us.',
  },
  '/team': {
    title: "The Team · Creator's Hub",
    description:
      "Meet the team behind Creator's Hub, building rooms where young creatives find each other. First up: The First Room, Lagos, 19 December 2026. Free.",
  },
} satisfies Record<string, PageMeta>

/** Creator's Hub elsewhere (Google's organisation "sameAs"). Add or remove links here. */
export const socialProfiles = [
  'https://www.instagram.com/creatorshubafrica/',
  'https://www.linkedin.com/company/creatorshubafrica',
  'https://whatsapp.com/channel/0029Vb9JcdRK5cDAX538aL1i',
]

/** The event, as Google's Event rich result describes it. */
export const eventSeo = {
  name: "Creator's Hub 001: The First Room",
  description:
    'A free one-day gathering in Lagos (and online) for young creatives in tech, art & design, fashion, and film & storytelling. Turning idealists into builders.',
  /** Registration opened (the Offer's validFrom). */
  offerValidFrom: '2026-11-01T00:00:00+01:00',
}
