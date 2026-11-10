import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { config } from '../content/config'
import { galleryPhotos, type Photo } from '../lib/media'
import { anchors } from '../lib/sections'
import { PhotoImage } from '../components/PhotoImage'
import { SectionHeading } from '../components/SectionHeading'
import { Expand } from '../components/Icons'
import { useLightbox } from '../components/Lightbox'

interface Placed {
  photo: Photo
  x: number
  y: number
  w: number
  h: number
}

function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return { ref, width }
}

/**
 * Masonry: cada foto va a la columna más baja, con su proporción original.
 * Las destacadas ocupan dos columnas cuando hay dos columnas contiguas de
 * altura similar; si no, se posponen un poco para no dejar huecos grandes.
 */
function computeLayout(list: Photo[], featured: Set<string>, width: number) {
  const cols = width < 640 ? 2 : width < 1024 ? 3 : 4
  const gap = width < 640 ? 10 : 18
  const colWidth = (width - gap * (cols - 1)) / cols
  const heights = new Array<number>(cols).fill(0)
  const placed: Placed[] = []

  const wantsDouble = (p: Photo) => featured.has(p.id) && (cols >= 3 || p.width > p.height)

  const place = (photo: Photo, span: number, col: number) => {
    const w = span * colWidth + (span - 1) * gap
    const h = Math.round((w * photo.height) / photo.width)
    const y = Math.max(...heights.slice(col, col + span))
    placed.push({ photo, x: col * (colWidth + gap), y, w, h })
    for (let c = col; c < col + span; c++) heights[c] = y + h + gap
  }

  const shortest = () => heights.indexOf(Math.min(...heights))

  /** Mejor par contiguo para una foto doble y cuánto hueco dejaría. */
  const bestPair = () => {
    let best = { col: 0, waste: Infinity, top: Infinity }
    for (let c = 0; c < cols - 1; c++) {
      const top = Math.max(heights[c], heights[c + 1])
      const waste = Math.abs(heights[c] - heights[c + 1])
      if (top + waste < best.top + best.waste) best = { col: c, waste, top }
    }
    return best
  }

  const pending: Photo[] = []
  const tryPending = (force: boolean) => {
    for (let i = 0; i < pending.length; i++) {
      const pair = bestPair()
      if (force || pair.waste <= colWidth * 0.18) {
        place(pending[i], 2, pair.col)
        pending.splice(i--, 1)
      }
    }
  }

  for (const photo of list) {
    if (wantsDouble(photo)) pending.push(photo)
    else place(photo, 1, shortest())
    tryPending(false)
  }
  tryPending(true)

  return { placed, height: Math.max(0, ...heights) - gap, cols }
}

export function Gallery() {
  const { gallery } = config
  const { open } = useLightbox()
  const { ref, width } = useContainerWidth()
  const { placed, height, cols } = useMemo(
    () => (width > 0 ? computeLayout(galleryPhotos, new Set(gallery.featured), width) : { placed: [], height: 0, cols: 1 }),
    [width, gallery.featured],
  )

  return (
    <section id={anchors.gallery} className="relative scroll-mt-16 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker={gallery.kicker} title={gallery.title} intro={gallery.intro} />
        <p className="mt-4 text-center text-xs tracking-[0.25em] text-muted uppercase">
          {galleryPhotos.length} fotografías
        </p>

        <div ref={ref} className="relative mt-14 sm:mt-20" style={{ height }}>
          {placed.map(({ photo, x, y, w, h }, i) => (
            <motion.div
              key={photo.id}
              className="absolute top-0 left-0"
              style={{ width: w, height: h, transform: `translate(${x}px, ${y}px)` }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 1, delay: (i % cols) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.button
                onClick={() => open(photo.id, galleryPhotos)}
                className="group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-[3px] shadow-[0_10px_30px_-18px_rgb(59_43_45/0.5)]"
                aria-label={`Ampliar: ${photo.alt}`}
                initial={{ y: 30 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 1, delay: (i % cols) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <PhotoImage
                  photo={photo}
                  sizes={`${Math.ceil(w)}px`}
                  className="h-full w-full"
                  imgClassName="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine-deep/45 via-wine-deep/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 bottom-0 p-4 text-paper opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 sm:translate-y-2"
                >
                  <Expand width={16} height={16} />
                </span>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
