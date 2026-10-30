import { useId } from 'react'

/** Unique, URL-safe id prefix so several copies of an artwork can share a page. */
export function useArtIds() {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (name: string) => `${base}-${name}`
}

export type ArtProps = {
  className?: string
  /** How the 16:10 artwork fits its frame. */
  fit?: 'cover' | 'contain'
}

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'
export const DISPLAY = "'Space Grotesk Variable', 'Space Grotesk', sans-serif"

export function ArtSvg({ className, fit = 'cover', children }: ArtProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}
