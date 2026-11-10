import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { asset, photos as allPhotos, srcSet, type Photo } from '../lib/media'
import { ChevronLeft, ChevronRight, Close } from './Icons'

interface LightboxApi {
  open: (photoId: string, list?: Photo[]) => void
}

const LightboxContext = createContext<LightboxApi | null>(null)

export function useLightbox() {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox debe usarse dentro de <LightboxProvider>')
  return ctx
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ list: Photo[]; index: number } | null>(null)

  const open = useCallback((photoId: string, list: Photo[] = allPhotos) => {
    const index = list.findIndex((p) => p.id === photoId)
    setState({ list, index: Math.max(0, index) })
  }, [])

  const api = useMemo(() => ({ open }), [open])

  return (
    <LightboxContext.Provider value={api}>
      {children}
      {createPortal(
        <AnimatePresence>
          {state && (
            <LightboxView
              key="lightbox"
              list={state.list}
              index={state.index}
              onIndex={(index) => setState((s) => (s ? { ...s, index } : s))}
              onClose={() => setState(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </LightboxContext.Provider>
  )
}

interface ViewProps {
  list: Photo[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}

function LightboxView({ list, index, onIndex, onClose }: ViewProps) {
  const [direction, setDirection] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const photo = list[index]
  const total = list.length

  const go = useCallback(
    (delta: number) => {
      setDirection(delta)
      onIndex((index + delta + total) % total)
    },
    [index, total, onIndex],
  )

  // Teclado, bloqueo de scroll y gestión del foco.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab' && dialogRef.current) {
        // Mantener el foco dentro del visor.
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button')
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [go, onClose])

  // Precarga de las fotos vecinas para una navegación instantánea.
  useEffect(() => {
    for (const d of [1, -1]) {
      const p = list[(index + d + total) % total]
      const img = new Image()
      img.sizes = '100vw'
      img.srcset = srcSet(p)
    }
  }, [index, list, total])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -400) go(1)
    else if (info.offset.x > 80 || info.velocity.x > 400) go(-1)
  }

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de fotografías"
      className="fixed inset-0 z-[100] flex flex-col bg-wine-deep/[0.985] text-paper backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-8 sm:py-5">
        <p className="font-serif text-lg tracking-wide text-paper/80 [font-variant-numeric:lining-nums]" aria-live="polite">
          <span className="text-paper">{String(index + 1).padStart(2, '0')}</span>
          <span className="mx-2 text-paper/40">/</span>
          {String(total).padStart(2, '0')}
        </p>
        <button
          ref={closeRef}
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-full border border-paper/20 transition hover:bg-paper/10"
          aria-label="Cerrar visor (Esc)"
        >
          <Close />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20" onClick={onClose}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={photo.id}
            custom={direction}
            src={asset(photo.fallback)}
            srcSet={srcSet(photo)}
            sizes="100vw"
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className="max-h-full max-w-full cursor-grab touch-pan-y rounded-sm object-contain shadow-2xl select-none active:cursor-grabbing"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.98 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (d: number) => ({ opacity: 0, x: d * -60, scale: 0.98 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={onDragEnd}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </AnimatePresence>

        <button
          onClick={(e) => {
            e.stopPropagation()
            go(-1)
          }}
          className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-paper/20 bg-wine-deep/40 transition hover:bg-paper/10 sm:grid"
          aria-label="Foto anterior (←)"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            go(1)
          }}
          className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-paper/20 bg-wine-deep/40 transition hover:bg-paper/10 sm:grid"
          aria-label="Foto siguiente (→)"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:hidden">
        <button
          onClick={() => go(-1)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/20 sm:hidden"
          aria-label="Foto anterior"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => go(1)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/20 sm:hidden"
          aria-label="Foto siguiente"
        >
          <ChevronRight />
        </button>
      </div>
    </motion.div>
  )
}
