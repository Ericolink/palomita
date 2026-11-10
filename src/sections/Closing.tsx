import { motion } from 'motion/react'
import { config } from '../content/config'
import { getPhoto } from '../lib/media'
import { anchors } from '../lib/sections'
import { PhotoImage } from '../components/PhotoImage'
import { Ornament } from '../components/Ornament'
import { Reveal } from '../components/Reveal'
import { ArrowUp } from '../components/Icons'

export function Closing() {
  const { closing, specialDate } = config
  const photo = getPhoto(closing.photo)

  return (
    <section
      id={anchors.closing}
      className="relative isolate scroll-mt-16 overflow-hidden bg-gradient-to-b from-cream via-blush/50 to-cream pt-24 pb-16 sm:pt-32"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <motion.div
          className="relative mx-auto w-full max-w-[22rem]"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -inset-3 rounded-[999px] border border-wine/25" aria-hidden="true" />
          <PhotoImage
            photo={photo}
            sizes="22rem"
            className="aspect-[3/4] rounded-[999px] shadow-[0_40px_80px_-40px_rgb(63_17_28/0.55)]"
          />
        </motion.div>

        <Reveal delay={0.1}>
          <h2 className="display mt-16 text-5xl text-ink italic sm:text-6xl md:text-7xl">{closing.phrase}</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <Ornament className="mx-auto mt-8 text-wine/70" />
          <p className="mx-auto mt-8 max-w-xl text-base leading-[1.9] text-ink/80 sm:text-lg">{closing.message}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-10 font-hand text-4xl text-wine">{closing.signature}</p>
          {specialDate && <p className="mt-3 text-xs tracking-[0.3em] text-muted uppercase">{specialDate}</p>}
        </Reveal>

        <Reveal delay={0.35}>
          <a
            href={`#${anchors[config.sectionOrder[0]]}`}
            className="mt-14 inline-flex items-center gap-2 text-xs tracking-[0.25em] text-wine uppercase transition-opacity hover:opacity-70"
          >
            <ArrowUp width={14} height={14} /> Volver al principio
          </a>
        </Reveal>
      </div>

      <footer className="mx-auto mt-24 max-w-7xl px-5 text-center text-xs tracking-[0.2em] text-muted/80 uppercase sm:px-8">
        <p>Hecho con cariño · {new Date().getFullYear()}</p>
        <p className="mt-3">
          Desarrollado por{' '}
          <a
            href="https://github.com/Ericolink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-wine underline decoration-wine/30 underline-offset-4 transition-colors hover:decoration-wine"
          >
            Ericolink
          </a>
        </p>
      </footer>
    </section>
  )
}
