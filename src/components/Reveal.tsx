import { motion, type HTMLMotionProps } from 'motion/react'

interface Props extends HTMLMotionProps<'div'> {
  delay?: number
  y?: number
}

/** Aparición suave cuando el elemento entra en pantalla (una sola vez). */
export function Reveal({ delay = 0, y = 28, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
