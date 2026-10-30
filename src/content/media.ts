import type { DisciplineId } from './site'
import fashion from '../assets/disciplines/fashion.webp'
import fashionSm from '../assets/disciplines/fashion-960.webp'
import technology from '../assets/disciplines/technology.webp'
import technologySm from '../assets/disciplines/technology-960.webp'
import film from '../assets/disciplines/film.webp'
import filmSm from '../assets/disciplines/film-960.webp'
import artdesign from '../assets/disciplines/artdesign.webp'
import artdesignSm from '../assets/disciplines/artdesign-960.webp'

/**
 * Media manifest — one moodboard per discipline, supplied by Creators Hub.
 *
 * To replace one, add an optimised WebP (1536×1024 plus a 960×640 phone
 * version) to src/assets/disciplines and update the imports above. Keep
 * `width` / `height` accurate so the layout never shifts.
 */
export type MediaItem = {
  id: string
  kind: DisciplineId
  label: string
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
    alt: 'Fashion moodboard: portraits, a runway, a designer’s studio wall, green silk and gold jewellery — style, identity and culture in motion',
    src: fashion,
    srcMobile: fashionSm,
    width: 1536,
    height: 1024,
  },
  {
    id: 'technology',
    kind: 'technology',
    label: 'Technology',
    alt: 'Technology moodboard: young African developers coding and collaborating, a product-planning sketch and a city skyline — building tools for creative futures',
    src: technology,
    srcMobile: technologySm,
    width: 1536,
    height: 1024,
  },
  {
    id: 'film',
    kind: 'film',
    label: 'Film & Storytelling',
    alt: 'Film & Storytelling moodboard: a camera operator on set, a clapperboard dated Lagos, a sound recordist, an editor at work and a script — voices, perspectives and new narratives',
    src: film,
    srcMobile: filmSm,
    width: 1536,
    height: 1024,
  },
  {
    id: 'artdesign',
    kind: 'artdesign',
    label: 'Arts & Design',
    alt: 'Arts & Design moodboard: a painter at a large canvas, sketches, a palette knife on green paint and a designer drawing — ideas, expression and creative practice',
    src: artdesign,
    srcMobile: artdesignSm,
    width: 1536,
    height: 1024,
  },
]

export const mediaFor = (kind: DisciplineId) => montage.find((m) => m.kind === kind)!
