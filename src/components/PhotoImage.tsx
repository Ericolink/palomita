import { useState } from 'react'
import { asset, srcSet, type Photo } from '../lib/media'

interface Props {
  photo: Photo
  /** Atributo `sizes` para que el navegador elija la resolución adecuada. */
  sizes: string
  className?: string
  imgClassName?: string
  /** Fotos visibles al cargar (portada): sin lazy loading y con prioridad alta. */
  priority?: boolean
  alt?: string
  /** Reserva el espacio con la proporción original de la foto. */
  keepRatio?: boolean
}

/**
 * Imagen responsiva con srcset WebP, carga diferida y un desenfoque
 * de baja resolución mientras llega la versión definitiva.
 */
export function PhotoImage({ photo, sizes, className = '', imgClassName = '', priority, alt, keepRatio }: Props) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={`relative overflow-hidden bg-sand ${className}`}
      style={{
        backgroundImage: `url(${photo.placeholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        aspectRatio: keepRatio ? `${photo.width} / ${photo.height}` : undefined,
      }}
    >
      <img
        src={asset(photo.fallback)}
        srcSet={srcSet(photo)}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={alt ?? photo.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        ref={(el) => {
          // Si la imagen ya estaba en caché, onLoad puede no dispararse.
          if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true)
        }}
        className={`h-full w-full transition-[opacity,filter] duration-700 ease-out ${
          loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
        } ${imgClassName || 'object-cover'}`}
      />
    </div>
  )
}
