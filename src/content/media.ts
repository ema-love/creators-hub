import type { DisciplineId } from './site'

/**
 * Media manifest — one entry per discipline.
 *
 * Each discipline is represented by an original illustration
 * (src/components/art). To use photography instead, place optimised files
 * (AVIF/WebP, ~1600px long edge, plus ~800px for mobile) in /public/media
 * and set `src` / `srcMobile`. Keep `width` / `height` accurate so the
 * layout never shifts. `direction` is the brief for that photography.
 */
export type MediaItem = {
  id: string
  kind: DisciplineId
  label: string
  direction: string
  alt: string
  src: string | null
  srcMobile?: string | null
  width: number
  height: number
}

export const montage: MediaItem[] = [
  {
    id: 'fashion',
    kind: 'fashion',
    label: 'Fashion',
    direction: 'Close-up: hands guiding fabric through a sewing machine in a working Lagos studio. Natural light.',
    alt: 'A fashion atelier: a dress form draped in patterned fabric, a tape measure, pattern pieces, scissors and thread',
    src: null,
    width: 1600,
    height: 1000,
  },
  {
    id: 'technology',
    kind: 'technology',
    label: 'Technology',
    direction: 'Two developers pairing over a laptop and a prototype board. Candid, mid-conversation.',
    alt: 'A technology workspace: a laptop showing code, a phone app, a terminal and a circuit board',
    src: null,
    width: 1600,
    height: 1000,
  },
  {
    id: 'film',
    kind: 'film',
    label: 'Film & Storytelling',
    direction: 'Cinematographer’s hand on a focus ring; monitor glow on face. Real set, real crew.',
    alt: 'A film set: a cinema camera on a tripod, a clapperboard, a screenplay page and a strip of film',
    src: null,
    width: 1600,
    height: 1000,
  },
  {
    id: 'artdesign',
    kind: 'artdesign',
    label: 'Arts & Design',
    direction: 'Painter mid-stroke beside a designer arranging swatches and type specimens by hand.',
    alt: 'An art and design studio: a painting on an easel, a palette and brushes, a vector artboard, type specimen and colour swatches',
    src: null,
    width: 1600,
    height: 1000,
  },
]

export const mediaFor = (kind: DisciplineId) => montage.find((m) => m.kind === kind)!
