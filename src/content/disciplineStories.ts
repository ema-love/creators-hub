import type { DisciplineId } from './site'

/**
 * Photography and copy for each discipline, cut from the Creators Hub
 * moodboards and recomposed in the site's own layouts.
 *
 * Photos live in src/assets/crops. To swap one, replace the file (keep the
 * name) or point an entry below at a new file.
 */
const files = import.meta.glob<string>('../assets/crops/*.webp', { eager: true, import: 'default' })

export type Photo = {
  src: string
  alt: string
  /** CSS object-position, to keep the subject in frame when cropped. */
  position?: string
}

function photo(name: string, alt: string, position?: string): Photo {
  const src = files[`../assets/crops/${name}.webp`]
  if (!src) throw new Error(`Missing discipline photo: ${name}`)
  return { src, alt, position }
}

export type DisciplineStory = {
  tagline: string
  areas: string[]
  /** Short line set on the mosaic's text tile. */
  quote: string
  /** Five photos for the Disciplines mosaic: hero, square, tall, tall, wide. */
  mosaic: [Photo, Photo, Photo, Photo, Photo]
  /** Four photos for the intro montage spread: tall, tall, small, small. */
  montage: [Photo, Photo, Photo, Photo]
}

const fashion = {
  portrait: photo('fashion-portrait', 'A woman in a green and gold headwrap, sunglasses and statement earrings, lit by late sun', '60% 30%'),
  hands: photo('fashion-hands', 'Hands with stacked gold rings resting on a woven green leather bag'),
  silk: photo('fashion-silk', 'Green silk gathered with a pearl and gold chain'),
  stride: photo('fashion-stride', 'A green silk skirt and strappy green heels mid-step on stone stairs', '50% 70%'),
  runway: photo('fashion-runway', 'Models in green, gold and ivory gowns lined up backstage before a show', '40% 40%'),
  studio: photo('fashion-studio', 'A design studio wall of sketches and photographs behind a dress form in green satin'),
}

const art = {
  painter: photo('art-painter', 'A painter working on a large abstract canvas in green, rust and black', '45% 40%'),
  brushes: photo('art-brushes', 'Paint brushes standing in a speckled ceramic jar among paint bottles'),
  sketchbook: photo('art-sketchbook', 'An open sketchbook with fine botanical drawings'),
  drawing: photo('art-drawing', 'A designer in a green beanie drawing at a desk surrounded by prints and plants', '55% 60%'),
  knife: photo('art-knife', 'A hand with gold rings spreading green paint with a palette knife'),
  sketch: photo('art-sketch', 'A hand inking a portrait sketch with a fine pen'),
  wall: photo('art-wall', 'A studio wall of pinned illustrations above a laptop'),
}

const tech = {
  headphones: photo('tech-headphones', 'A developer in headphones studying code on a laptop among plants', '35% 40%'),
  laptop: photo('tech-laptop', 'Hands typing on a laptop full of code next to a green juice'),
  plan: photo('tech-plan', 'A notebook sketch of a product process: idea, plan, build, test, launch'),
  keys: photo('tech-keys', 'A green mechanical keyboard with a key labelled Create'),
  studio: photo('tech-studio', 'A workspace with two monitors of code under posters about people and technology'),
  team: photo('tech-team', 'Two developers leaning in together over a laptop', '40% 35%'),
  coder: photo('tech-coder', 'A developer in a cap coding on a laptop in a bright, busy studio', '40% 40%'),
}

const film = {
  camera: photo('film-camera', 'A camera operator framing a shot on a cinema camera', '45% 40%'),
  clapper: photo('film-clapper', 'A clapperboard marked “A New Story”, roll A001, scene 3, take 1, Lagos'),
  light: photo('film-light', 'A film light with barn doors glowing on a dark set'),
  chair: photo('film-chair', 'A director’s chair with “Creative” printed on the back, on a warm-lit set'),
  monitor: photo('film-monitor', 'A field monitor showing an actor in a sunlit room'),
  editor: photo('film-editor', 'An editor in headphones cutting footage on a timeline'),
  boom: photo('film-boom', 'A sound recordist holding a boom microphone in silhouette against the sunset'),
}

export const disciplineStories: Record<DisciplineId, DisciplineStory> = {
  fashion: {
    tagline: 'Style, identity and culture in motion.',
    areas: ['People', 'Culture', 'Trends', 'Designers', 'Street style', 'Heritage'],
    quote: 'Fashion as self-expression.',
    mosaic: [fashion.portrait, fashion.hands, fashion.silk, fashion.stride, fashion.runway],
    montage: [fashion.portrait, fashion.studio, fashion.hands, fashion.runway],
  },
  technology: {
    tagline: 'Building tools for creative futures.',
    areas: ['Software', 'Products', 'AI & innovation', 'Creative tools', 'Digital communities', 'Learning'],
    quote: 'Create. Build. Collaborate.',
    mosaic: [tech.headphones, tech.laptop, tech.plan, tech.keys, tech.studio],
    montage: [tech.headphones, tech.team, tech.laptop, tech.coder],
  },
  film: {
    tagline: 'Voices, perspectives and new narratives.',
    areas: ['Film production', 'Cinematography', 'Screenwriting', 'Editing', 'Directing', 'Documentary', 'Animation'],
    quote: 'Stories, people, places.',
    mosaic: [film.camera, film.clapper, film.light, film.chair, film.monitor],
    montage: [film.camera, film.editor, film.clapper, film.boom],
  },
  artdesign: {
    tagline: 'Ideas, expression and creative practice.',
    areas: ['Visual arts', 'Illustration', 'Graphic design', 'Product design', 'Typography', 'Creative direction'],
    quote: 'Create. Explore. Express.',
    mosaic: [art.painter, art.brushes, art.sketchbook, art.drawing, art.knife],
    montage: [art.painter, art.drawing, art.sketch, art.wall],
  },
}
