import { motion, useScroll, useSpring } from 'motion/react'

/** Barra fina en la parte superior que indica el avance de la lectura. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-rose via-wine to-wine"
      style={{ scaleX }}
    />
  )
}
