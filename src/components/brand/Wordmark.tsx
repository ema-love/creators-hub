import logoOnDark from '../../assets/brand/logo-on-dark.png'
import logoOnLight from '../../assets/brand/logo-on-light.png'
import { cn } from '../../lib/cn'

type WordmarkProps = {
  className?: string
  /**
   * The background it sits on. `dark` (default): white "Creator's", green "Hub.".
   * `light`: near-black "Creator's", for cream backgrounds.
   */
  on?: 'dark' | 'light'
  /** Wrap the logo in a mask (class `wm-char`) for the intro reveal. */
  split?: boolean
}

/** Logo artwork is 1638 × 204 px. */
const RATIO = 1638 / 204

/**
 * The Creators Hub logo, from the supplied artwork (src/assets/brand/).
 * Without a className it is 1.15em tall; a className replaces that sizing
 * (e.g. `h-8` or `h-auto w-full`).
 */
export function Wordmark({ className, on = 'dark', split = false }: WordmarkProps) {
  const img = (
    <img
      src={on === 'light' ? logoOnLight : logoOnDark}
      alt="Creator's Hub"
      width={1638}
      height={204}
      draggable={false}
      className={cn('block max-w-none select-none', className ?? 'h-[1.15em] w-auto', split && 'wm-char will-change-transform')}
      style={{ aspectRatio: String(RATIO) }}
    />
  )
  return split ? <span className="inline-block overflow-hidden pb-[0.06em] -mb-[0.06em]">{img}</span> : img
}
