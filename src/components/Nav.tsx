import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { config } from '../content/config'
import { anchors, coupleNames, orderedSections } from '../lib/sections'
import { Close, Menu } from './Icons'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(anchors[orderedSections[0]])
  const [open, setOpen] = useState(false)
  const brand = coupleNames() || 'Nuestro álbum'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Resalta la sección visible.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const id of orderedSections) {
      const el = document.getElementById(anchors[id])
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    // Evita que la página se desplace detrás del menú abierto.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open])

  const links = orderedSections.map((id) => ({ id: anchors[id], label: config.navLabels[id] }))

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-cream/80 shadow-[0_1px_0_rgb(123_34_52/0.08)] backdrop-blur-lg' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Secciones">
        <a href={`#${links[0]?.id ?? ''}`} className="font-serif text-xl tracking-wide text-ink italic">
          {brand}
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? 'true' : undefined}
                className={`relative px-3 py-2 text-[0.78rem] tracking-[0.14em] uppercase transition-colors ${
                  active === l.id ? 'text-wine' : 'text-muted hover:text-ink'
                }`}
              >
                {l.label}
                {active === l.id && (
                  <motion.span layoutId="nav-dot" className="absolute inset-x-3 -bottom-0.5 h-px bg-wine" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="icon-btn md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <Menu />
        </button>
      </nav>

      {/* Portal a <body>: el backdrop-filter del header limitaría un `fixed` interno a su tamaño. */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              className="fixed inset-0 z-[80] flex flex-col overscroll-contain bg-cream md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex h-16 items-center justify-between px-5">
                <span className="font-serif text-xl italic">{brand}</span>
                <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar menú" autoFocus>
                  <Close />
                </button>
              </div>
              <ul className="flex flex-1 flex-col justify-center gap-2 px-8">
                {links.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i + 0.1, duration: 0.5 }}
                  >
                    <a
                      href={`#${l.id}`}
                      onClick={() => setOpen(false)}
                      className={`display block py-2 text-5xl ${active === l.id ? 'text-wine italic' : 'text-ink'}`}
                    >
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </header>
  )
}
