import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { config } from '../content/config'
import { getPhoto } from '../lib/media'
import { anchors } from '../lib/sections'
import { PhotoImage } from '../components/PhotoImage'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { useLightbox } from '../components/Lightbox'

type Item = (typeof config.moments.items)[number]

export function Moments() {
  const { moments } = config
  return (
    <section id={anchors.moments} className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading kicker={moments.kicker} title={moments.title} />
        <div className="mt-20 space-y-28 sm:mt-28 sm:space-y-40">
          {moments.items.map((item, i) => (
            <Moment key={item.photo + i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Moment({ item, index }: { item: Item; index: number }) {
  const photo = getPhoto(item.photo)
  const { open } = useLightbox()
  const reversed = index % 2 === 1
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // Parallax discreto: la foto se mueve un poco más lento que la página.
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])
  const numberY = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <article
      ref={ref}
      className={`grid items-center gap-10 md:grid-cols-12 md:gap-8 ${reversed ? 'md:[&>*:first-child]:order-2' : ''}`}
    >
      <motion.div
        className={`relative md:col-span-7 ${reversed ? 'md:col-start-6' : ''}`}
        initial={{ opacity: 0, clipPath: 'inset(8% 8% 8% 8%)' }}
        whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={() => open(photo.id)}
          className="group block w-full cursor-zoom-in overflow-hidden rounded-[2px]"
          aria-label={`Ampliar: ${photo.alt}`}
        >
          <div className="aspect-[4/5] overflow-hidden">
            <motion.div style={{ y }} className="h-[114%] -translate-y-[6.1%]">
              <PhotoImage
                photo={photo}
                sizes="(min-width: 768px) 55vw, 100vw"
                className="h-full w-full"
                imgClassName="object-cover transition-transform duration-[1.6s] ease-[var(--ease-soft)] group-hover:scale-[1.03]"
              />
            </motion.div>
          </div>
        </button>
        <div
          aria-hidden="true"
          className={`absolute -bottom-4 -z-10 h-full w-full border border-wine/20 ${reversed ? '-left-4' : '-right-4'}`}
        />
      </motion.div>

      <div className={`relative md:col-span-5 ${reversed ? 'md:col-start-1 md:pr-6' : 'md:pl-6'}`}>
        <motion.span
          aria-hidden="true"
          style={{ y: numberY }}
          className="pointer-events-none absolute -top-24 -left-2 font-serif text-[8rem] leading-none [font-variant-numeric:lining-nums] text-blush/80 select-none md:-top-40 md:text-[11rem]"
        >
          {String(index + 1).padStart(2, '0')}
        </motion.span>
        <Reveal className="relative" delay={0.15}>
          <p className="kicker">{item.label}</p>
          <blockquote className="display mt-5 text-4xl text-ink italic sm:text-5xl">
            “{item.quote}”
          </blockquote>
          <div className="mt-8 h-px w-16 bg-wine/40" />
        </Reveal>
      </div>
    </article>
  )
}
