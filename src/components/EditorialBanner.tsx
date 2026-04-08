'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Props {
  title:      string
  subtitle?:  string
  ctaText?:   string
  ctaHref?:   string
  image:      string
  align?:     'left' | 'right' | 'center'
  dark?:      boolean
  cmsKey?:    string  // e.g. 'editorial_1' or 'editorial_2'
}

export default function EditorialBanner({
  title: defaultTitle,
  subtitle: defaultSubtitle,
  ctaText: defaultCtaText = 'Shop Now',
  ctaHref: defaultCtaHref = '/collections/all',
  image: defaultImage,
  align: defaultAlign = 'left',
  dark: defaultDark = true,
  cmsKey,
}: Props) {
  const [title,    setTitle]    = useState(defaultTitle)
  const [subtitle, setSubtitle] = useState(defaultSubtitle ?? '')
  const [ctaText,  setCtaText]  = useState(defaultCtaText)
  const [ctaHref,  setCtaHref]  = useState(defaultCtaHref)
  const [image,    setImage]    = useState(defaultImage)
  const [align,    setAlign]    = useState(defaultAlign)
  const [dark,     setDark]     = useState(defaultDark)

  useEffect(() => {
    if (!cmsKey) return
    fetch('/api/cms/settings')
      .then(r => r.json())
      .then(d => {
        const s = d.settings?.[cmsKey]
        if (!s) return
        if (s.title)    setTitle(s.title)
        if (s.subtitle) setSubtitle(s.subtitle)
        if (s.cta)      setCtaText(s.cta)
        if (s.ctaHref)  setCtaHref(s.ctaHref)
        if (s.image)    setImage(s.image)
        if (s.align)    setAlign(s.align)
        if (s.dark !== undefined) setDark(s.dark)
      })
      .catch(() => {})
  }, [cmsKey])

  const textColor    = dark ? '#fff' : 'var(--color-charcoal)'
  const alignMap     = { left: 'flex-start', right: 'flex-end', center: 'center' } as const
  const textAlignMap = { left: 'left', right: 'right', center: 'center' } as const

  return (
    <section style={{ position: 'relative', minHeight: 'clamp(300px, 45vw, 580px)' }}>
      <img src={image} alt={title}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          filter: dark ? 'brightness(0.72)' : 'brightness(0.95)',
        }}
      />
      {dark && (
        <div style={{
          position: 'absolute', inset: 0,
          background: align === 'left'
            ? 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, transparent 65%)'
            : 'linear-gradient(270deg, rgba(0,0,0,0.45) 0%, transparent 65%)',
        }} />
      )}
      <div className="max-container" style={{
        position: 'relative', zIndex: 2,
        minHeight: 'clamp(300px, 45vw, 580px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: alignMap[align],
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 60px)',
      }}>
        <div style={{ maxWidth: '500px', textAlign: textAlignMap[align] }}>
          {subtitle && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(10px, 1.1vw, 12px)', letterSpacing: '0.3em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.75)' : 'var(--color-mid)', marginBottom: '12px' }}>
              {subtitle}
            </div>
          )}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 68px)', fontWeight: 300, color: textColor, lineHeight: 1.1, fontStyle: 'italic', marginBottom: '20px' }}>
            {title}
          </h2>
          <Link href={ctaHref} className="btn-outline" style={{ borderColor: dark ? '#fff' : undefined, color: dark ? '#fff' : undefined }}>
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  )
}
