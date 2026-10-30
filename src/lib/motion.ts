/**
 * Creators Hub motion language — "Spark, Flow, Converge".
 *
 * Spark:    things begin small and precise (short, crisp entrances).
 * Flow:     movement is continuous and spatial, never bouncy for its own sake.
 * Converge: separate elements resolve into one composition.
 *
 * Keep every interface transition on these tokens so timing stays coherent.
 */
export const ease = {
  /** Default entrance: fast start, long settle. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Scene changes and large spatial moves. */
  inOut: [0.76, 0, 0.24, 1] as const,
  /** Exits. */
  in: [0.7, 0, 0.84, 0] as const,
}

/** Same curves as GSAP ease strings. */
export const gsapEase = {
  out: 'expo.out',
  inOut: 'power4.inOut',
  in: 'power3.in',
}

export const duration = {
  micro: 0.2,
  short: 0.45,
  base: 0.8,
  long: 1.2,
}

export const spring = {
  /** Restrained spring for hover and magnetic micro-interactions. */
  soft: { type: 'spring', stiffness: 220, damping: 26, mass: 0.6 } as const,
}
