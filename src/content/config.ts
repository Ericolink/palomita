/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DEL ÁLBUM — edita aquí todo el contenido.
 * ─────────────────────────────────────────────────────────────
 *
 *  Las fotos se identifican por un ID (p01 … p23) y los videos por v01 …
 *  La correspondencia ID → archivo original está en
 *  src/content/media.generated.json (campo "source").
 *  Si agregas fotos nuevas a /fotos ejecuta `npm run media`.
 *
 *  Todos los textos son sugerencias: cámbialos con libertad.
 */

export type SectionId = 'hero' | 'story' | 'gallery' | 'film' | 'moments' | 'closing'

export const config = {
  /** Nombres de la pareja (se muestran en el menú). Déjalos vacíos para no mostrarlos. */
  couple: {
    name1: 'Kevin',
    name2: 'Miranda',
  },

  /**
   * Fecha especial (aniversario, día en que se conocieron…).
   * Formato libre, p. ej. '14 de febrero de 2024'. `null` para ocultarla.
   */
  specialDate: null as string | null,

  /** Título de la pestaña del navegador y descripción para buscadores / redes. */
  meta: {
    title: 'Para Miranda · Nuestros días favoritos',
    description: 'Un álbum de recuerdos de Kevin para Miranda.',
  },

  /** Orden en que aparecen las secciones (quita una para ocultarla). */
  sectionOrder: ['hero', 'story', 'gallery', 'film', 'moments', 'closing'] as SectionId[],

  /** Etiquetas del menú de navegación. */
  navLabels: {
    hero: 'Inicio',
    story: 'Historia',
    gallery: 'Galería',
    film: 'Película',
    moments: 'Momentos',
    closing: 'Final',
  } satisfies Record<SectionId, string>,

  hero: {
    /** Dedicatoria sobre el título. */
    eyebrow: 'Para Miranda, de Kevin',
    title: 'Nuestros días favoritos',
    phrase: 'Un pequeño lugar para guardar todo lo que nos ha hecho sonreír.',
    cta: 'Revivir nuestros recuerdos',
    photo: 'p19',
    accentPhoto: 'p10',
  },

  story: {
    kicker: 'Capítulo uno',
    title: 'Nuestra historia',
    paragraphs: [
      'Hay historias que no se cuentan con palabras, sino con fotografías: una sonrisa a destiempo, un ramo de flores, una noche que no queríamos que terminara.',
      'Este álbum reúne esos instantes. Los grandes y los pequeños. Los que planeamos y los que simplemente sucedieron, porque estábamos juntos.',
    ],
    signature: 'Con todo mi cariño, Kevin',
    /** Fotos del collage (máx. 4). Puedes añadir `note: 'texto'` para una nota manuscrita. */
    photos: [
      { id: 'p05' } as { id: string; note?: string },
      { id: 'p03' },
      { id: 'p15' },
      { id: 'p02' },
    ],
  },

  gallery: {
    kicker: 'Capítulo dos',
    title: 'Galería de recuerdos',
    intro: 'Cada fotografía guarda un momento que vale la pena volver a vivir. Toca cualquiera para verla en grande.',
    /** Fotos que aparecen más grandes en el collage. */
    featured: ['p19', 'p10', 'p15', 'p20', 'p03', 'p08'],
    /** Fotos que no quieras mostrar en la galería. */
    exclude: [] as string[],
  },

  film: {
    kicker: 'Capítulo tres',
    title: 'Nuestra película',
    intro: 'Algunos recuerdos se mueven, ríen y se escuchan. Dale play cuando quieras.',
    videos: [
      { id: 'v01', title: 'Pura diversión', caption: 'De esos días en los que no paramos de reír.' },
    ],
  },

  moments: {
    kicker: 'Capítulo cuatro',
    title: 'Momentos especiales',
    items: [
      { photo: 'p10', label: 'Bajo las luces', quote: 'Contigo, cualquier noche se vuelve inolvidable.' },
      { photo: 'p17', label: 'Juntos', quote: 'Mi lugar favorito siempre ha sido a tu lado.' },
      { photo: 'p22', label: 'Atardecer', quote: 'Lo bonito no es el lugar, es con quién lo vives.' },
      { photo: 'p06', label: 'De fiesta', quote: 'Brillamos más cuando estamos juntos.' },
    ],
  },

  closing: {
    photo: 'p20',
    phrase: 'Y lo mejor todavía está por venir.',
    message:
      'Gracias por cada risa, cada abrazo y cada recuerdo compartido. Gracias por los días tranquilos y por las noches que brillaron. Este álbum apenas comienza: aún nos quedan muchas páginas por llenar.',
    signature: 'Con amor, Kevin',
  },

  /**
   * Música de fondo opcional. Coloca el archivo en public/media/music/.
   * Si no existe, el botón no se muestra. Nunca se reproduce automáticamente.
   */
  music: {
    src: 'media/music/cancion.mp3',
    title: 'Nuestra canción',
  },

  /** Descripciones de cada foto. No se muestran en pantalla: solo las leen los lectores de pantalla. */
  captions: {
    p01: 'Los dos de negro, posando juntos',
    p02: 'Selfie en una noche de feria',
    p03: 'Una selfie llena de risas',
    p04: 'Juntos, vestidos de negro, en un pasillo',
    p05: 'Ella con un ramo de girasoles, él a su lado',
    p06: 'Selfie en el espejo durante una fiesta',
    p07: 'Otra foto en el espejo de la fiesta',
    p08: 'Selfie de noche, muy cerquita',
    p09: 'Selfie en una cena',
    p10: 'Vestido rojo, un ramo y luces colgantes',
    p11: 'De pie bajo las luces de la terraza',
    p12: 'Vestido de flores y traje elegante',
    p13: 'Selfie con sonrisas al aire libre',
    p14: 'Selfie divertida con señal de paz',
    p15: 'Un gran ramo de flores frente al arco de hojas',
    p16: 'Selfie con el ramo de flores',
    p17: 'Abrazados junto a una pared iluminada',
    p18: 'Bajo el árbol de enredadera, de noche',
    p19: 'Sonriendo bajo el árbol de enredadera',
    p20: 'Sentados en una banca junto a la palmera iluminada',
    p21: 'Selfie de noche, mejilla con mejilla',
    p22: 'En la banca, al atardecer',
    p23: 'De pie al atardecer, ella elegante y él con lentes de sol',
  } as Record<string, string>,
}

export type Config = typeof config
