import { config, type SectionId } from '../content/config'

/** Ancla (#id) en la URL de cada sección. */
export const anchors: Record<SectionId, string> = {
  hero: 'inicio',
  story: 'historia',
  gallery: 'galeria',
  film: 'pelicula',
  moments: 'momentos',
  closing: 'final',
}

export const orderedSections = config.sectionOrder

/** Ancla de la sección que sigue a `id` (para el botón de la portada). */
export function nextAnchor(id: SectionId) {
  const i = orderedSections.indexOf(id)
  const next = orderedSections[i + 1]
  return next ? anchors[next] : undefined
}

export function coupleNames() {
  const { name1, name2 } = config.couple
  return [name1, name2].filter(Boolean).join(' & ')
}
