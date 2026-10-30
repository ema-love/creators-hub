import { motion, useReducedMotion } from 'motion/react'
import { ease } from '../../lib/motion'

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  /** Distance travelled in px. */
  y?: number
  as?: 'div' | 'li' | 'p' | 'span'
}

/** Fades and lifts content into place once, when it enters the viewport. */
export function Reveal({ children, className, delay = 0, y = 28, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: ease.out, delay }}
    >
      {children}
    </Tag>
  )
}
