import { motion, useReducedMotion } from 'motion/react'
import { ease } from '../../lib/motion'
import { cn } from '../../lib/cn'

type MaskTextProps = {
  lines: string[]
  className?: string
  lineClassName?: string
  delay?: number
  /** Animate when scrolled into view. When false, animation follows `play`. */
  inView?: boolean
  play?: boolean
}

/** Headline lines rise out of a mask, one after another. */
export function MaskText({ lines, className, lineClassName, delay = 0, inView = true, play = true }: MaskTextProps) {
  const reduce = useReducedMotion()
  const trigger = inView
    ? { whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } }
    : { animate: play ? 'show' : 'hide' }
  return (
    <motion.span
      className={cn('block', className)}
      initial={reduce ? false : 'hide'}
      {...trigger}
      transition={{ staggerChildren: 0.09, delayChildren: delay }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={cn('block will-change-transform', lineClassName)}
            variants={{ hide: { y: '105%' }, show: { y: '0%' } }}
            transition={{ duration: 1.1, ease: ease.out }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
