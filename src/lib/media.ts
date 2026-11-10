import manifest from '../content/media.generated.json'
import { config } from '../content/config'

export interface PhotoSource {
  w: number
  src: string
}

export interface Photo {
  id: string
  source: string
  width: number
  height: number
  placeholder: string
  srcset: PhotoSource[]
  fallback: string
  alt: string
}

export interface Video {
  id: string
  source: string
  src: string
  type: string
  poster: string | null
  frames: string[]
  width: number
  height: number
  duration: number
}

/** Resuelve una ruta de /public respetando la base de despliegue. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const photos: Photo[] = manifest.photos.map((p) => ({
  ...p,
  alt: config.captions[p.id] ?? 'Fotografía de la pareja',
}))

export const videos: Video[] = manifest.videos as Video[]

const photoMap = new Map(photos.map((p) => [p.id, p]))
const videoMap = new Map(videos.map((v) => [v.id, v]))

export function getPhoto(id: string): Photo {
  const photo = photoMap.get(id)
  if (photo) return photo
  if (import.meta.env.DEV) console.warn(`[album] Foto "${id}" no encontrada; se usa la primera.`)
  return photos[0]
}

export const getVideo = (id: string) => videoMap.get(id)

export const srcSet = (photo: Photo) => photo.srcset.map((s) => `${asset(s.src)} ${s.w}w`).join(', ')

export const largestSrc = (photo: Photo) => asset(photo.srcset[photo.srcset.length - 1].src)

/** Fotos visibles en la galería, en el orden del manifiesto. */
export const galleryPhotos = photos.filter((p) => !config.gallery.exclude.includes(p.id))
