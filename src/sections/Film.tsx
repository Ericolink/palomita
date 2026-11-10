import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { config } from '../content/config'
import { asset, getVideo, type Video } from '../lib/media'
import { anchors } from '../lib/sections'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { Play } from '../components/Icons'

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

export function Film() {
  const { film } = config
  const items = film.videos
    .map((v) => ({ ...v, video: getVideo(v.id) }))
    .filter((v): v is typeof v & { video: Video } => Boolean(v.video))

  if (items.length === 0) return null
  const frames = items.flatMap((i) => i.video.frames)

  return (
    <section
      id={anchors.film}
      className="relative scroll-mt-16 overflow-hidden bg-wine-deep py-36 text-paper sm:py-44"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_45%,rgb(123_34_52/0.55)_0%,transparent_75%)]"
      />

      {frames.length > 0 && <FilmStrip frames={frames} className="absolute top-6 opacity-40" />}

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading kicker={film.kicker} title={film.title} intro={film.intro} tone="dark" />

        <div
          className={`mt-16 grid justify-center gap-14 sm:mt-20 ${
            items.length > 1 ? 'md:grid-cols-2' : ''
          }`}
        >
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.1}>
              <VideoCard video={item.video} title={item.title} caption={item.caption} />
            </Reveal>
          ))}
        </div>
      </div>

      {frames.length > 0 && <FilmStrip frames={[...frames].reverse()} className="absolute bottom-6 opacity-40" />}
    </section>
  )
}

function VideoCard({ video, title, caption }: { video: Video; title: string; caption: string }) {
  const [started, setStarted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ratio = video.width && video.height ? `${video.width} / ${video.height}` : '9 / 16'

  return (
    <figure className="mx-auto w-full max-w-[22rem]">
      <div className="relative rounded-[1.4rem] bg-paper/5 p-2.5 ring-1 ring-paper/15 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.7)]">
        <div className="relative overflow-hidden rounded-[1rem] bg-black" style={{ aspectRatio: ratio }}>
          {started ? (
            // El video solo se monta tras la interacción: nada se descarga antes.
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              controls
              autoPlay
              playsInline
              preload="metadata"
              poster={video.poster ? asset(video.poster) : undefined}
            >
              <source src={asset(video.src)} type={video.type} />
              Tu navegador no puede reproducir este video.
            </video>
          ) : (
            <button
              onClick={() => setStarted(true)}
              className="group absolute inset-0 block h-full w-full cursor-pointer"
              aria-label={`Reproducir video: ${title}`}
            >
              {video.poster && (
                <img
                  src={asset(video.poster)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-wine-deep/80 via-wine-deep/10 to-wine-deep/20" />
              <motion.span
                className="absolute top-1/2 left-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-wine shadow-xl transition-transform duration-500 group-hover:scale-110"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-paper/30 [animation-duration:2.4s]" />
                <Play width={26} height={26} className="relative ml-1" />
              </motion.span>
              {video.duration > 0 && (
                <span className="absolute right-4 bottom-4 rounded-full bg-black/40 px-3 py-1 text-xs tracking-wider text-paper/90 backdrop-blur">
                  {formatDuration(video.duration)}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      <figcaption className="mt-7 text-center">
        <p className="font-serif text-3xl italic">{title}</p>
        {caption && <p className="mt-2 text-sm leading-relaxed text-paper/65">{caption}</p>}
      </figcaption>
    </figure>
  )
}

/** Tira de fotogramas del video que se desplaza lentamente (decorativa). */
function FilmStrip({ frames, className = '' }: { frames: string[]; className?: string }) {
  const loop = [...frames, ...frames, ...frames, ...frames]
  return (
    <div aria-hidden="true" className={`pointer-events-none inset-x-0 overflow-hidden ${className}`}>
      <div className="film-roll flex w-max flex-col bg-black/60 py-1">
        <div className="sprockets h-2.5 w-full" />
        <div className="flex gap-1.5 px-1 py-1">
          {[...loop, ...loop].map((src, i) => (
            <img
              key={i}
              src={asset(src)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-16 w-12 object-cover grayscale-[40%] sepia-[25%] sm:h-20 sm:w-16"
            />
          ))}
        </div>
        <div className="sprockets h-2.5 w-full" />
      </div>
    </div>
  )
}
