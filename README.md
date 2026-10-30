# Creators Hub

Website for **Creators Hub**, a multidisciplinary creative organisation and community, and its inaugural event, **Creators Hub 001: The First Room** (19 December 2026, Lagos, Nigeria).

Built with React, TypeScript, Vite, Tailwind CSS v4, Motion for React, GSAP + ScrollTrigger, Lucide and React Router. Deployed on Netlify.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run lint
```

Add `?intro` to any URL to force the opening sequence (it otherwise plays once per browser session, on the homepage only).

---

## Brand assets: what is still missing

The repository started empty. **No brand assets were supplied**, so the site uses clearly marked stand-ins. Nothing below is invented as final.

| Asset | Current state | Where to swap it in |
| --- | --- | --- |
| Official logo / wordmark | Organisation name set in Space Grotesk (not a logo) | `src/components/brand/Wordmark.tsx` (header, intro reveal and footer all render through it) |
| Favicon / app icon | Green "spark" dot | `public/favicon.svg` |
| Brand colours | Working references from the brief | `src/styles/index.css` `@theme` block (single source) |
| Typography | Space Grotesk (display) + Inter (body), self-hosted | `src/styles/index.css` + `package.json` fontsource packages |
| Discipline imagery | Photos cut from the supplied moodboards (see below) | `src/assets/crops/` + `src/content/disciplineStories.ts` |
| Intro sound | Synthesised with Web Audio (no files), off by default | `src/components/intro/introSound.ts` |
| Social share image (`og:image`) | Not set | `index.html` |
| Contact email, social handles | Rendered as `TBC` placeholders | `src/content/site.ts` → `contact` |
| Event venue, time, speakers, programme, tickets, partners | Rendered as `TBC` placeholders | `src/content/event.ts` |
| Organisational tagline | None assigned. Hero headline and other copy are working copy | `src/content/site.ts` |

Unconfirmed values are `null` or empty arrays in the content files. Components render `<Placeholder>` (a dashed `TBC` label) for them automatically. Filling in a value replaces the placeholder everywhere.

---

## Project structure

```
src/
  App.tsx                 Router, layout shell, intro overlay
  main.tsx
  styles/index.css        Tailwind v4 theme: colour, type scale, motion tokens
  content/                ALL copy and data (no copy hard-coded in components)
    site.ts               nav, hero, manifesto, sections, contact
    event.ts              The First Room (confirmed vs. unconfirmed fields)
    disciplineStories.ts  per-discipline photos, taglines, focus areas, alt text
    forms.ts              Netlify form names
  lib/
    motion.ts             easing/duration tokens: the motion language
    gsap.ts               GSAP + ScrollTrigger registration
    calendar.ts, date.ts, cn.ts
  hooks/                  media queries, GSAP context, header surface, Netlify forms
  components/
    brand/Wordmark.tsx    logo swap point
    intro/                cinematic opening (see below)
    layout/               Header, MobileMenu, Footer, Section, ScrollManager
    ui/                   ArrowLink, Reveal, MaskText, MediaFrame, Placeholder, Marquee, Eyebrow
    forms/Fields.tsx      editorial form fields
  sections/               one file per homepage section
  pages/                  HomePage, FirstRoomPage (/the-first-room), NotFoundPage
```

### Homepage sections

1. **Hero**: brand statement, pointer-following ambient light, link to the event, replay intro
2. **Manifesto**: words brighten as you read (GSAP scrub)
3. **What Creators Hub represents**: numbered editorial list with a sticky title
4. **Disciplines & ecosystem**: the four disciplines; choosing one brings its illustrated studio into view, with a small map showing its connections to the others
5. **The First Room 001**: pinned scroll sequence where a doorway opens into the event (own rust-and-ink treatment)
6. **Community & opportunities**: stated as intentions, not confirmed programmes
7. **Volunteer**: interest form
8. **Partnership**: partnership types + enquiry form
9. **Contact** + footer

---

## Motion strategy

The motion language is **Spark → Flow → Converge**: things begin small and precise, move with continuous spatial flow, and resolve into one composition. Shared curves live in `src/lib/motion.ts` and as CSS variables.

| Tool | Used for |
| --- | --- |
| **GSAP timeline** | The intro: one timeline, five labelled scenes, so timing reads and tunes in one place |
| **GSAP ScrollTrigger** | Only two scroll stories: the manifesto word reveal and The First Room doorway pin |
| **Motion for React** | Interface transitions: header hide/show, mobile menu, masked headlines, in-view reveals, ecosystem map, form states |
| **CSS** | Hover micro-interactions, link underlines, marquee |

GSAP owns every transform it animates. Initial states are set with `gsap.set`, not Tailwind utilities, because Tailwind v4's `translate`/`scale` properties would stack with GSAP's `transform`.

### The cinematic intro (`src/components/intro/`)

| Time | Scene | What happens |
| --- | --- | --- |
| 0–2s | Spark | A pulsing point of electric green; ambient light and depth particles (canvas) |
| 2–4s | Possibility | Light becomes drawn ribbons and dimensional planes; "Imagine. Make. Share." |
| 4–7s | The Creators | A four-photo spread per discipline, with its name and tagline, cut in with clip-paths |
| 7–9s | Convergence | Frames gather into a grid, then collapse into the light as particles converge |
| 9–12s | Reveal | Wordmark letters rise from a mask, rule draws, hand-off to the homepage |

- The site is rendered underneath the whole time (`inert` while the intro plays). It is never a gate.
- **Skip intro** is focused on load. **Escape** also skips. **Replay intro** is in the hero and the footer.
- Plays once per session, homepage only.
- **Mobile**: fewer particles, ~7s.
- **Reduced motion**: never autoplays. Replay runs a ~5s cross-fade-only version with static particles.
- **Sound**: off by default, starts only from the toggle.
- A safety timeout ends the intro if anything stalls.

---

## Accessibility & performance

- Skip-to-content link, visible focus rings, keyboard-operable menu (focus trap, Escape, focus return) and ecosystem map.
- `prefers-reduced-motion` is respected by GSAP (`matchMedia`), Motion (`MotionConfig reducedMotion="user"`) and CSS.
- Text colours meet WCAG AA on their surfaces. Rust is used only for large display text, accents, or with ink text.
- Fonts are self-hosted with unicode-range subsets. No external requests.
- Routes are code-split. GSAP, Motion and React ship as separately cached chunks.
- Media reserves its aspect ratio (no layout shift) and lazy-loads below the fold. There are no autoplay video backgrounds.
- Animations use transforms and opacity. The canvas caps device pixel ratio at 2.

### Disciplines and photography

Creators Hub presents four disciplines: **Fashion**, **Technology**, **Film & Storytelling** and **Arts & Design** (defined in `src/content/site.ts`).

The photographs were cut from the Creators Hub moodboards and recomposed in the site's own layouts, so they share its type, colour and shapes:

- **Disciplines section**: a mosaic per discipline (`src/components/ui/DisciplineMosaic.tsx`) with five photos and a text tile, beside the discipline's tagline and focus areas.
- **Intro montage**: a four-photo spread per discipline with its name and tagline.

Photos, taglines, focus areas, the text-tile line and alt text all live in `src/content/disciplineStories.ts`. The image files are in `src/assets/crops/` (named like `fashion-portrait.webp`).

To swap a photo, replace its file with a WebP of similar shape (keep the name), or point the entry at a new file and update its alt text. `position` sets which part of the photo stays in frame when it is cropped.

---

## Deployment (Netlify)

`netlify.toml` configures the build (`npm run build` → `dist`), Node 22, SPA redirects, long-term caching for hashed assets and security headers.

Forms use **Netlify Forms**: `volunteer`, `partnership` and `contact`. Static copies in `index.html` let Netlify detect them at deploy time. Keep their field names in sync with the React forms. After the first deploy, enable form notifications under **Site configuration → Forms**.

To connect: in Netlify, choose **Add new site → Import an existing project**, pick this repository, and keep the defaults from `netlify.toml`.
