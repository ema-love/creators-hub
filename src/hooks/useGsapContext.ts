import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Runs GSAP setup scoped to a container and reverts every tween and
 * ScrollTrigger it created when the component unmounts or deps change.
 */
export function useGsapContext(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: gsap.Context) => void,
  deps: DependencyList = [],
) {
  useLayoutEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context((self) => setup(self), scope.current)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
