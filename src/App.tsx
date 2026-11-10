import { MotionConfig } from 'motion/react'
import type { ComponentType } from 'react'
import { config, type SectionId } from './content/config'
import { LightboxProvider } from './components/Lightbox'
import { Nav } from './components/Nav'
import { ScrollProgress } from './components/ScrollProgress'
import { FloatingControls } from './components/FloatingControls'
import { Hero } from './sections/Hero'
import { Story } from './sections/Story'
import { Gallery } from './sections/Gallery'
import { Film } from './sections/Film'
import { Moments } from './sections/Moments'
import { Closing } from './sections/Closing'

const sections: Record<SectionId, ComponentType> = {
  hero: Hero,
  story: Story,
  gallery: Gallery,
  film: Film,
  moments: Moments,
  closing: Closing,
}

export default function App() {
  return (
    // reducedMotion="user": respeta la preferencia del sistema de reducir animaciones.
    <MotionConfig reducedMotion="user">
      <LightboxProvider>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2"
        >
          Saltar al contenido
        </a>
        <ScrollProgress />
        <Nav />
        <main id="contenido">
          {config.sectionOrder.map((id) => {
            const Section = sections[id]
            return <Section key={id} />
          })}
        </main>
        <FloatingControls />
      </LightboxProvider>
    </MotionConfig>
  )
}
