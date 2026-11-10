/**
 * Genera versiones optimizadas (derivadas) de las fotos y videos de /fotos.
 *
 * - Los archivos originales NUNCA se modifican: solo se leen.
 * - Las fotos se exportan en WebP a varios anchos (srcset) + un JPEG de respaldo.
 * - Las capturas de pantalla con franjas negras se recortan automáticamente.
 * - Los videos se copian sin recomprimir (remux "faststart" para streaming)
 *   y se extraen una portada y fotogramas para la tira de película.
 * - Escribe el manifiesto src/content/media.generated.json.
 *
 * Uso: npm run media            (incremental)
 *      npm run media -- --force (regenera todo)
 */
import { readdir, mkdir, writeFile, access, copyFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import sharp from 'sharp'

const run = promisify(execFile)
const ROOT = path.resolve(import.meta.dirname, '..')
const SRC_DIR = path.join(ROOT, 'fotos')
const OUT_PHOTOS = path.join(ROOT, 'public/media/photos')
const OUT_VIDEOS = path.join(ROOT, 'public/media/videos')
const MANIFEST = path.join(ROOT, 'src/content/media.generated.json')

const WIDTHS = [480, 960, 1600, 2400]
const FALLBACK_WIDTH = 1600
const FORCE = process.argv.includes('--force')

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.avif', '.tif', '.tiff'])
const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v', '.webm'])

const exists = (p) => access(p).then(() => true, () => false)
const pad = (n) => String(n).padStart(2, '0')

/** Orden natural: "AM.jpeg" < "AM(1).jpeg" < "AM(2).jpeg" ... */
const naturalKey = (name) => name.replace(/\.[^.]+$/, '').replace(/\((\d+)\)$/, (_, n) => `~${n.padStart(4, '0')}`)
const byNatural = (a, b) => naturalKey(a).localeCompare(naturalKey(b), 'en', { numeric: true })

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true })
  return entries
    .filter((e) => e.isFile())
    .map((e) => path.relative(dir, path.join(e.parentPath ?? e.path, e.name)))
    .sort(byNatural)
}

/**
 * Detecta franjas negras en los bordes (típicas de capturas de pantalla)
 * y devuelve el rectángulo útil en proporciones, o null si no hay que recortar.
 */
async function detectLetterbox(input) {
  const { data, info } = await sharp(input).rotate().greyscale().resize({ width: 300 }).raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  const px = (x, y) => data[y * W + x]
  const darkShare = (len, get) => {
    let dark = 0
    for (let i = 0; i < len; i++) if (get(i) < 14) dark++
    return dark / len
  }
  const isBarRow = (y) => darkShare(W, (x) => px(x, y)) > 0.94
  const isBarCol = (x, y0, y1) => darkShare(y1 - y0 + 1, (i) => px(x, y0 + i)) > 0.94

  let top = 0
  while (top < H - 1 && isBarRow(top)) top++
  let bottom = H - 1
  while (bottom > top && isBarRow(bottom)) bottom--
  let left = 0
  while (left < W - 1 && isBarCol(left, top, bottom)) left++
  let right = W - 1
  while (right > left && isBarCol(right, top, bottom)) right--

  const box = { x: left / W, y: top / H, w: (right - left + 1) / W, h: (bottom - top + 1) / H }
  if (box.w * box.h > 0.99) return null
  return box
}

async function processPhoto(file, index) {
  const id = `p${pad(index + 1)}`
  const input = path.join(SRC_DIR, file)
  const meta = await sharp(input).rotate().toBuffer({ resolveWithObject: true })
  let { width, height } = meta.info
  let pipeline = () => sharp(meta.data)

  const box = await detectLetterbox(input)
  if (box) {
    // Pequeño margen interior para no dejar líneas oscuras residuales.
    const inset = (r) => (r < 1 ? 3 : 0)
    const left = Math.round(box.x * width) + inset(box.w)
    const top = Math.round(box.y * height) + inset(box.h)
    const w = Math.round(box.w * width) - 2 * inset(box.w)
    const h = Math.round(box.h * height) - 2 * inset(box.h)
    const cropped = await sharp(meta.data).extract({ left, top, width: w, height: h }).toBuffer()
    pipeline = () => sharp(cropped)
    width = w
    height = h
  }

  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, width)))]
  const srcset = []
  for (const w of widths) {
    const name = `${id}-${w}.webp`
    const out = path.join(OUT_PHOTOS, name)
    if (FORCE || !(await exists(out))) {
      await pipeline().resize({ width: w }).webp({ quality: 82, effort: 5 }).toFile(out)
    }
    srcset.push({ w, src: `media/photos/${name}` })
  }

  const fw = Math.min(FALLBACK_WIDTH, width)
  const fallbackName = `${id}-${fw}.jpg`
  const fallbackOut = path.join(OUT_PHOTOS, fallbackName)
  if (FORCE || !(await exists(fallbackOut))) {
    await pipeline().resize({ width: fw }).jpeg({ quality: 84, mozjpeg: true }).toFile(fallbackOut)
  }

  const tiny = await pipeline().resize({ width: 20 }).webp({ quality: 40 }).toBuffer()

  return {
    id,
    source: file,
    width,
    height,
    cropped: Boolean(box),
    placeholder: `data:image/webp;base64,${tiny.toString('base64')}`,
    srcset,
    fallback: `media/photos/${fallbackName}`,
  }
}

async function probe(input) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height:format=duration', '-of', 'json', input,
  ])
  const j = JSON.parse(stdout)
  return { width: j.streams[0].width, height: j.streams[0].height, duration: Number(j.format.duration) }
}

async function processVideo(file, index) {
  const id = `v${pad(index + 1)}`
  const input = path.join(SRC_DIR, file)
  const ext = path.extname(file).toLowerCase() === '.webm' ? '.webm' : '.mp4'
  const videoOut = path.join(OUT_VIDEOS, `${id}${ext}`)
  const posterOut = path.join(OUT_VIDEOS, `${id}-poster.webp`)

  let info = { width: 0, height: 0, duration: 0 }
  const frames = []
  try {
    info = await probe(input)
    if (FORCE || !(await exists(videoOut))) {
      // Copia sin recomprimir: misma calidad, solo mueve el índice al inicio.
      await run('ffmpeg', ['-v', 'error', '-y', '-i', input, '-c', 'copy', '-movflags', '+faststart', videoOut])
    }
    const grab = async (t, out, w) => {
      if (!FORCE && (await exists(out))) return
      const { stdout } = await run('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', input, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 })
      await sharp(stdout).resize({ width: w }).webp({ quality: 80 }).toFile(out)
    }
    await grab(Math.min(1.2, info.duration / 3), posterOut, 960)
    const count = 8
    for (let i = 0; i < count; i++) {
      const out = path.join(OUT_VIDEOS, `${id}-frame-${i}.webp`)
      await grab(((i + 0.5) / count) * info.duration, out, 220)
      frames.push(`media/videos/${id}-frame-${i}.webp`)
    }
  } catch (err) {
    console.warn(`⚠ ffmpeg/ffprobe no disponible o falló para ${file}; se copia el video tal cual.`, err.message)
    if (!(await exists(videoOut))) await copyFile(input, videoOut)
  }

  return {
    id,
    source: file,
    src: `media/videos/${id}${ext}`,
    type: ext === '.webm' ? 'video/webm' : 'video/mp4',
    poster: (await exists(posterOut)) ? `media/videos/${id}-poster.webp` : null,
    frames,
    ...info,
  }
}

async function main() {
  await mkdir(OUT_PHOTOS, { recursive: true })
  await mkdir(OUT_VIDEOS, { recursive: true })
  await mkdir(path.dirname(MANIFEST), { recursive: true })

  const files = await listFiles(SRC_DIR)
  const images = files.filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
  const videos = files.filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase()))

  console.log(`Fotos: ${images.length} · Videos: ${videos.length}`)
  const photos = []
  for (const [i, f] of images.entries()) {
    const p = await processPhoto(f, i)
    console.log(`  ${p.id}  ${p.width}×${p.height}${p.cropped ? '  (franjas recortadas)' : ''}  ← ${f}`)
    photos.push(p)
  }
  const vids = []
  for (const [i, f] of videos.entries()) {
    const v = await processVideo(f, i)
    console.log(`  ${v.id}  ${v.width}×${v.height}  ${v.duration.toFixed(1)}s  ← ${f}`)
    vids.push(v)
  }

  await writeFile(MANIFEST, JSON.stringify({ photos, videos: vids }, null, 2) + '\n')
  console.log(`Manifiesto escrito en ${path.relative(ROOT, MANIFEST)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
