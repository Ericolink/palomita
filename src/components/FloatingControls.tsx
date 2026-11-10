import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { config } from '../content/config'
import { asset } from '../lib/media'
import { ArrowUp, Music } from './Icons'

/** Botón de música (solo si existe el archivo) y botón para volver al inicio. */
export function FloatingControls() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.9)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="fixed bottom-5 left-5 z-50 sm:bottom-8 sm:left-8">
        <MusicToggle />
      </div>
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => window.scrollTo({ top: 0 })}
            className="icon-btn fixed right-5 bottom-5 z-50 sm:right-8 sm:bottom-8"
            aria-label="Volver al inicio"
          >
            <ArrowUp />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

function MusicToggle() {
  const [available, setAvailable] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const src = config.music.src ? asset(config.music.src) : ''

  // Solo comprobamos que el archivo exista; no se descarga ni se reproduce nada.
  useEffect(() => {
    if (!src) return
    const ctrl = new AbortController()
    fetch(src, { method: 'HEAD', signal: ctrl.signal })
      .then((r) => setAvailable(r.ok && (r.headers.get('content-type') ?? '').startsWith('audio')))
      .catch(() => {})
    return () => ctrl.abort()
  }, [src])

  useEffect(() => () => audioRef.current?.pause(), [])

  if (!available) return null

  const toggle = async () => {
    if (!audioRef.current) {
      const audio = new Audio(src)
      audio.loop = true
      audio.volume = 0.55
      audio.addEventListener('pause', () => setPlaying(false))
      audio.addEventListener('play', () => setPlaying(true))
      audioRef.current = audio
    }
    const audio = audioRef.current
    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        setPlaying(false)
      }
    } else {
      audio.pause()
    }
  }

  return (
    <button
      onClick={toggle}
      className="icon-btn !w-auto gap-2 px-4"
      aria-pressed={playing}
      aria-label={playing ? `Pausar música: ${config.music.title}` : `Reproducir música: ${config.music.title}`}
    >
      <span className="flex items-center gap-2">
        {playing ? (
          <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
            {[0, 0.2, 0.4].map((d) => (
              <span key={d} className="eq-bar block h-4 w-[3px] rounded-full bg-wine" style={{ animationDelay: `${d}s` }} />
            ))}
          </span>
        ) : (
          <Music width={18} height={18} />
        )}
        <span className="hidden text-xs tracking-wider sm:inline">{playing ? 'Pausar' : 'Música'}</span>
      </span>
    </button>
  )
}
