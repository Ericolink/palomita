import { motion } from 'motion/react'
import { config } from '../content/config'
import { getPhoto } from '../lib/media'
import { anchors } from '../lib/sections'
import { PhotoImage } from '../components/PhotoImage'
import { Ornament } from '../components/Ornament'
import { Reveal } from '../components/Reveal'
import { useLightbox } from '../components/Lightbox'

/** Inclinación y desplazamiento de cada foto del collage, por posición. */
const layout = [
  { rotate: -3.5, className: 'col-start-1 mt-6', tape: '-top-3 left-6 -rotate-6' },
  { rotate: 2.5, className: 'col-start-2 mt-0 sm:-ml-4', tape: '-top-3 right-8 rotate-6' },
  { rotate: 2, className: 'col-start-1 -mt-6 sm:ml-6', tape: '-top-3 left-1/2 -translate-x-1/2 rotate-2' },
  { rotate: -2.5, className: 'col-start-2 -mt-2 sm:-ml-2', tape: '-top-3 left-8 -rotate-3' },
]

export function Story() {
  const { story } = config
  const { open } = useLightbox()

  return (
    <section id={anchors.story} className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="max-w-xl lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="kicker">{story.kicker}</p>
            <h2 className="display mt-4 text-5xl text-ink sm:text-6xl md:text-7xl">{story.title}</h2>
            <Ornament className="mt-6 text-wine/70" />
          </Reveal>
          {story.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.1 + i * 0.1}>
              <p
                className={`mt-6 text-base leading-[1.85] text-ink/80 sm:text-lg ${
                  i === 0 ? 'first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:font-serif first-letter:text-[4.2rem] first-letter:leading-[0.78] first-letter:text-wine' : ''
                }`}
              >
                {p}
              </p>
            </Reveal>
          ))}
          {story.signature && (
            <Reveal delay={0.3}>
              <p className="mt-8 font-hand text-3xl text-wine">{story.signature}</p>
            </Reveal>
          )}
        </div>

        <div className="grid grid-cols-2 items-start gap-x-4 gap-y-10 sm:gap-x-8 sm:px-6">
          {story.photos.slice(0, 4).map((item, i) => {
            const photo = getPhoto(item.id)
            const l = layout[i % layout.length]
            return (
              <motion.figure
                key={item.id}
                className={`relative ${l.className}`}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: l.rotate }}
                whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  onClick={() => open(photo.id)}
                  className="print block w-full cursor-zoom-in text-left"
                  aria-label={`Ampliar: ${photo.alt}`}
                >
                  <PhotoImage
                    photo={photo}
                    sizes="(min-width: 1024px) 18rem, 45vw"
                    className="w-full"
                    keepRatio
                  />
                </button>
                {item.note && (
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-1.5 text-center font-hand text-xl text-ink/75 sm:text-2xl">
                    {item.note}
                  </figcaption>
                )}
                <span className={`tape ${l.tape}`} aria-hidden="true" />
              </motion.figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
