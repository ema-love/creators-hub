import { cn } from '../../lib/cn'

type WordmarkProps = {
  className?: string
  /** Render the two words on separate lines. */
  stacked?: boolean
  /** Wrap each letter in a masked span (class `wm-char`) for the intro reveal. */
  split?: boolean
}

const WORDS = ['Creators', 'Hub'] as const

/**
 * PLACEHOLDER WORDMARK.
 *
 * This is the organisation's name set in the display typeface — it is not the
 * Creators Hub logo and must not be treated as one. When the official logo
 * files are supplied, add them to /src/assets/brand and render them here; every
 * usage across the site (header, intro reveal, footer) flows through this file.
 */
export function Wordmark({ className, stacked = false, split = false }: WordmarkProps) {
  return (
    <span
      className={cn('font-display font-semibold tracking-[-0.04em] leading-none', className)}
      data-placeholder="wordmark"
    >
      <span className="sr-only">Creators Hub</span>
      <span aria-hidden="true" className={cn(stacked ? 'flex flex-col' : 'inline-flex gap-[0.25em]')}>
        {WORDS.map((word) =>
          split ? (
            <span key={word} className="inline-flex overflow-hidden pb-[0.1em] -mb-[0.1em]">
              {Array.from(word).map((ch, i) => (
                <span key={i} className="wm-char inline-block will-change-transform">
                  {ch}
                </span>
              ))}
            </span>
          ) : (
            <span key={word}>{word}</span>
          ),
        )}
      </span>
    </span>
  )
}
