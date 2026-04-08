'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const DEFAULTS = {
  leftImage:    'https://d3o8u8o2i2q94t.cloudfront.net/products/1775597572905-allsaints_0126_v05665a_001-1.jpeg',
  leftTitle:    'Wear-to-work arrivals for spring',
  leftSubtitle: 'Slip into something a little more chic—these new season styles make every day a special occasion.',
  leftCta:      'Shop Now',
  leftCtaHref:  '/collections/workwear',
  topImage:     'https://d3o8u8o2i2q94t.cloudfront.net/products/1775596326876-s-linenwomen-dt-v1.webp',
  topLabel:     'Shop Shoes',
  topHref:      '/collections/shoes',
  bottomImage:  'https://d3o8u8o2i2q94t.cloudfront.net/products/1775596331910-wmns_dres04f_0426_0085_altbgd_ext_8-5.jpeg',
  bottomLabel:  'Shop Accessories',
  bottomHref:   '/collections/accessories',
}

export default function HeroBanner() {
  const [cms, setCms] = useState(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/cms/settings')
      .then(r => r.json())
      .then(d => {
        const h = d.settings?.hero_banner
        if (h) setCms({ ...DEFAULTS, ...h })
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto',
    gap: '3px',
    minHeight: 'clamp(400px, 65vw, 680px)',
  }

  if (!loaded) {
    return (
      <section style={{ background: '#fff' }}>
        <div style={gridStyle} className="hero-grid">
          <div style={{ background: '#e8e4de', gridRow: '1 / 3', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ background: '#e8e4de', minHeight: '200px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ background: '#e0dcd6', minHeight: '200px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <style>{`
          @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
          @media (max-width: 640px) {
            .hero-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    )
  }

  return (
    <section style={{ background: '#fff' }}>
      <div>
        <div style={gridStyle} className="hero-grid">
          {/* Left large panel */}
          <div style={{ position: 'relative', overflow: 'hidden', gridRow: '1 / 3', background: '#d4cfc8' }}>
            {cms.leftImage && (
              <img
                src={cms.leftImage}
                alt={cms.leftTitle}
                fetchPriority="high"
                decoding="async"
                width={800}
                height={1067}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
            <div style={{ position: 'absolute', bottom: '10%', left: '8%', right: '8%' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 3.5vw, 46px)',
                fontWeight: 300, color: '#fff',
                lineHeight: 1.15, textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                marginBottom: '8px', fontStyle: 'italic',
              }}>
                {cms.leftTitle}
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(11px, 1.2vw, 13px)',
                color: 'rgba(255,255,255,0.88)',
                letterSpacing: '0.04em', marginBottom: '16px',
                maxWidth: '280px', lineHeight: 1.5,
              }}>
                {cms.leftSubtitle}
              </p>
              <Link href={cms.leftCtaHref} className="btn-solid" style={{ background: 'rgba(255,255,255,0.15)', borderColor: '#fff', color: '#fff', backdropFilter: 'blur(4px)' }}>
                {cms.leftCta}
              </Link>
            </div>
          </div>

          {/* Top right panel */}
          <Link href={cms.topHref} style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ position: 'relative', overflow: 'hidden', background: '#c4bfb5', cursor: 'pointer', height: '100%' }} className="category-card">
              {cms.topImage && (
                <img src={cms.topImage} alt={cms.topLabel}
                  fetchPriority="high"
                  decoding="async"
                  width={600}
                  height={400}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '200px' }} />
              )}
              <div style={{ position: 'absolute', bottom: '10%', left: '8%' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(10px, 1.2vw, 12px)', letterSpacing: '0.2em', color: '#fff', fontWeight: 600, textTransform: 'uppercase', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                  {cms.topLabel} →
                </div>
              </div>
            </div>
          </Link>

          {/* Bottom right panel */}
          <Link href={cms.bottomHref} style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ position: 'relative', overflow: 'hidden', background: '#b8bfbc', cursor: 'pointer', height: '100%' }} className="category-card">
              {cms.bottomImage && (
                <img src={cms.bottomImage} alt={cms.bottomLabel}
                  fetchPriority="high"
                  decoding="async"
                  width={600}
                  height={400}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '200px' }} />
              )}
              <div style={{ position: 'absolute', bottom: '10%', left: '8%' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(10px, 1.2vw, 12px)', letterSpacing: '0.2em', color: '#fff', fontWeight: 600, textTransform: 'uppercase', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                  {cms.bottomLabel} →
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hero-grid { grid-template-columns: 1fr !important; grid-template-rows: auto auto auto !important; }
          .hero-grid > div:first-child { grid-row: 1 !important; min-height: 60vw !important; }
        }
      `}</style>
    </section>
  )
}