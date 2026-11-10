import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { config } from '../content/config'
import { getPhoto } from '../lib/media'
import { anchors, nextAnchor } from '../lib/sections'
import { PhotoImage } from '../components/PhotoImage'
import { ArrowDown } from '../components/Icons'

const ease = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const { hero, specialDate } = config
  const main = getPhoto(hero.photo)
  const accent = hero.accentPhoto ? getPhoto(hero.accentPhoto) : null
  const target = nextAnchor('hero')

  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const accentY = useTransform(scrollYProgress, [0, 1], [0, -60])

  return (
    <section
      ref={ref}
      id={anchors.hero}
      className="relative isolate overflow-hidden pt-24 pb-16 sm:pt-28 lg:flex lg:min-h-svh lg:items-center lg:py-24"
    >
      {/* Fondo: brillo rosado muy suave */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_40%,var(--color-blush)_0%,transparent_70%),radial-gradient(40%_40%_at_10%_90%,rgb(223_179_173/0.35)_0%,transparent_70%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* Fotografías */}
        <div className="relative mx-auto w-full max-w-[25rem] lg:order-2 lg:max-w-[30rem]">
          <motion.div
            style={{ y: photoY }}
            initial={{ opacity: 0, scale: 0.96, clipPath: 'inset(100% 0 0 0 round 999px 999px 20px 20px)' }}
            animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0 0 0 round 999px 999px 20px 20px)' }}
            transition={{ duration: 1.4, ease }}
            className="relative"
          >
            <div className="arch absolute -inset-3 border border-wine/25" aria-hidden="true" />
            <PhotoImage
              photo={main}
              priority
              sizes="(min-width: 1024px) 30rem, 25rem"
              className="arch aspect-[3/4] shadow-[0_40px_80px_-40px_rgb(63_17_28/0.55)]"
            />
          </motion.div>

          {accent && (
            <motion.div
              style={{ y: accentY }}
              initial={{ opacity: 0, rotate: -14, x: -30 }}
              animate={{ opacity: 1, rotate: -7, x: 0 }}
              transition={{ duration: 1.2, delay: 0.7, ease }}
              className="print absolute -bottom-10 -left-4 w-32 sm:-left-14 sm:w-40 lg:-left-20 lg:w-44"
            >
              <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-3" aria-hidden="true" />
              <PhotoImage photo={accent} sizes="11rem" className="aspect-[3/4]" />
            </motion.div>
          )}
        </div>

        {/* Texto */}
        <div className="relative text-center lg:order-1 lg:text-left">
          <motion.p
            className="kicker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease }}
          >
            {hero.eyebrow}
          </motion.p>

          <h1 className="display mt-5 text-[3.4rem] text-ink sm:text-7xl lg:text-[6.5rem]">
            {hero.title.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className={`inline-block pr-[0.22em] ${i === hero.title.split(' ').length - 1 ? 'text-wine italic' : ''}`}
                initial={{ opacity: 0, y: '0.4em' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.45 + i * 0.12, ease }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="mx-auto mt-6 max-w-md font-serif text-2xl leading-snug text-muted italic sm:text-[1.7rem] lg:mx-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease }}
          >
            {hero.phrase}
          </motion.p>

          {specialDate && (
            <motion.p
              className="mt-5 text-xs tracking-[0.3em] text-wine/80 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.05 }}
            >
              {specialDate}
            </motion.p>
          )}

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.15, ease }}
          >
            <a href={target ? `#${target}` : '#'} className="btn-primary group">
              {hero.cta}
              <ArrowDown width={16} height={16} className="transition-transform duration-500 group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
