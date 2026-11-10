import { Reveal } from './Reveal'
import { Ornament } from './Ornament'

interface Props {
  kicker: string
  title: string
  intro?: string
  tone?: 'light' | 'dark'
  align?: 'center' | 'left'
}

export function SectionHeading({ kicker, title, intro, tone = 'light', align = 'center' }: Props) {
  const dark = tone === 'dark'
  const centered = align === 'center'
  return (
    <Reveal className={`${centered ? 'mx-auto text-center' : ''} max-w-2xl`}>
      <p className={`kicker ${dark ? 'text-rose!' : ''}`}>{kicker}</p>
      <h2 className={`display mt-4 text-5xl sm:text-6xl md:text-7xl ${dark ? 'text-paper' : 'text-ink'}`}>
        {title}
      </h2>
      <Ornament className={`mt-6 ${centered ? 'mx-auto' : ''} ${dark ? 'text-rose' : 'text-wine/70'}`} />
      {intro && (
        <p className={`mt-6 text-base leading-relaxed sm:text-lg ${dark ? 'text-paper/75' : 'text-muted'}`}>{intro}</p>
      )}
    </Reveal>
  )
}
