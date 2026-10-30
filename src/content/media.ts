/**
 * Media manifest.
 *
 * No authentic photography has been supplied yet. Each entry describes the
 * art direction for an image; while `src` is null the site renders a labelled,
 * abstract placeholder instead of stock imagery.
 *
 * To add real imagery: place optimised files (AVIF/WebP, ~1600px long edge,
 * plus a ~800px variant for mobile) in /public/media and set `src` / `srcMobile`.
 * Keep `width` / `height` accurate so the layout never shifts.
 */
export type MediaKind = 'technology' | 'fashion' | 'film' | 'art' | 'design' | 'entrepreneurship' | 'community'

export type MediaItem = {
  id: string
  kind: MediaKind
  label: string
  /** Art direction brief for the photographer / picture editor. */
  direction: string
  alt: string
  src: string | null
  srcMobile?: string | null
  width: number
  height: number
}

export const montage: MediaItem[] = [
  {
    id: 'fashion-hands',
    kind: 'fashion',
    label: 'Fashion',
    direction: 'Close-up: hands guiding fabric through a sewing machine in a working Lagos studio. Natural light.',
    alt: 'Hands guiding fabric through a sewing machine',
    src: null,
    width: 1600,
    height: 1000,
  },
  {
    id: 'art-studio',
    kind: 'art',
    label: 'Art',
    direction: 'Painter mid-stroke, paint on knuckles, canvas edge in frame. Avoid posed smiles.',
    alt: 'A painter mid-stroke in a studio',
    src: null,
    width: 1600,
    height: 1000,
  },
  {
    id: 'film-set',
    kind: 'film',
    label: 'Film',
    direction: 'Cinematographer’s hand on a focus ring; monitor glow on face. Real set, real crew.',
    alt: 'A cinematographer adjusting a camera focus ring',
    src: null,
    width: 1600,
    height: 1000,
  },
  {
    id: 'technology-build',
    kind: 'technology',
    label: 'Technology',
    direction: 'Two developers pairing over a laptop and a prototype board. Candid, mid-conversation.',
    alt: 'Two developers working together on a hardware prototype',
    src: null,
    width: 1600,
    height: 1000,
  },
  {
    id: 'design-desk',
    kind: 'design',
    label: 'Design',
    direction: 'Overhead: sketches, swatches and type specimens being arranged by hand.',
    alt: 'Hands arranging design sketches and colour swatches',
    src: null,
    width: 1600,
    height: 1000,
  },
  {
    id: 'enterprise-market',
    kind: 'entrepreneurship',
    label: 'Entrepreneurship',
    direction: 'A founder showing a product to a customer at a market stall or pop-up. Genuine exchange.',
    alt: 'A founder presenting a product to a customer',
    src: null,
    width: 1600,
    height: 1000,
  },
]
