# Nuestro álbum de recuerdos

Álbum digital romántico hecho con React + TypeScript + Vite + Tailwind CSS + Motion.

## Uso

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # versión final en /dist (lista para subir a cualquier hosting estático)
npm run preview   # ver la versión final localmente
```

## Personalizar el contenido

Todo el texto se edita en **`src/content/config.ts`**:

- `couple.name1` / `couple.name2`: nombres (vacíos = no se muestran)
- `specialDate`: fecha especial (o `null`)
- `hero`, `story`, `gallery`, `film`, `moments`, `closing`: títulos, frases, mensajes y fotos elegidas
- `sectionOrder`: orden de las secciones (quita una para ocultarla)
- `captions`: descripción de cada foto (se ve en el visor y sirve de texto alternativo)
- `music.src`: música de fondo opcional (ver abajo)

Las fotos se identifican como `p01` … `p23` y el video como `v01`. La correspondencia con
los archivos originales está en `src/content/media.generated.json` (campo `source`).

En `index.html` están los textos para la vista previa al compartir el enlace (`og:*`) y una
etiqueta `noindex` para que el álbum no aparezca en buscadores; elimínala si quieres que sea público.

## Fotos y videos

Los originales viven en `/fotos` y **nunca se modifican**. El comando

```bash
npm run media           # incremental
npm run media -- --force  # regenera todo
```

crea versiones derivadas en `public/media/`:

- Fotos en WebP a 480/960/1600/2400 px (srcset) + JPEG de respaldo + miniatura borrosa de carga.
- Las capturas de pantalla con franjas negras se recortan automáticamente (solo en la copia).
- Videos copiados sin recomprimir (con `faststart` para reproducción inmediata), portada y
  fotogramas para la tira de película (requiere `ffmpeg`).

Para añadir recuerdos: copia los archivos a `/fotos`, ejecuta `npm run media` y, si quieres,
añade su descripción en `captions`. Los IDs siguen el orden de los nombres de archivo.

## Música

Coloca un archivo `cancion.mp3` en `public/media/music/`. El botón aparece solo si el
archivo existe y la música nunca empieza sin que el visitante la active.

## Estructura

```
src/
  content/     config.ts (contenido editable) · media.generated.json (manifiesto)
  sections/    Hero, Story, Gallery, Film, Moments, Closing
  components/  PhotoImage, Lightbox, Nav, ScrollProgress, FloatingControls, Reveal…
  lib/         utilidades de medios y secciones
  styles/      index.css (paleta, tipografías y estilos base)
scripts/       process-media.mjs
```
# palomita
