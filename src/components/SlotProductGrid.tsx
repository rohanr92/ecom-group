'use client'

import { useEffect, useState } from 'react'
import ProductGrid from '@/components/ProductGrid'

interface Props {
  title:       string
  subtitle?:   string
  slot:        string
  limit?:      number
  viewAllHref: string
}

function SkeletonProductGrid({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section style={{ padding: 'clamp(28px, 4vw, 52px) 0' }}>
      <div className="max-container" style={{ padding: '0 clamp(16px, 3vw, 40px)' }}>
        {/* Header skeleton */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'clamp(16px, 2vw, 28px)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--color-charcoal)', margin: 0 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)', letterSpacing: '0.06em', marginTop: '4px' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Skeleton cards */}
        <div style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'calc((100% - 4 * 6px) / 5)',
          gap: '6px',
          overflow: 'hidden',
        }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div style={{
                aspectRatio: '3/4',
                background: 'linear-gradient(90deg, #f0ece6 25%, #e8e4de 50%, #f0ece6 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }} />
              <div style={{ padding: '8px 2px 4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ height: '13px', background: '#f0ece6', borderRadius: '2px', width: '80%', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #f0ece6 25%, #e8e4de 50%, #f0ece6 75%)' }} />
                <div style={{ height: '13px', background: '#f0ece6', borderRadius: '2px', width: '40%', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #f0ece6 25%, #e8e4de 50%, #f0ece6 75%)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  )
}

export default function SlotProductGrid({ title, subtitle, slot, limit = 10, viewAllHref }: Props) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/collections/slot?slot=${slot}&limit=${limit}`)
      .then(r => r.json())
      .then(d => {
     const raw = d.products ?? []
const expanded: any[] = []
for (const p of raw) {
  if (p.isGrouped === false && Array.isArray(p.variants) && p.variants.length > 0) {
    const seen = new Map<string, any>()
    for (const v of p.variants) {
      if (!seen.has(v.color)) seen.set(v.color, v)
    }
    for (const [color, v] of seen) {
     let img = p.images?.[0] ?? ''
if (Array.isArray(v.images) && v.images.length > 0) {
  img = v.images[0]
} else if (Array.isArray(p.images) && p.images.length > 0) {
  const colorSlug = color.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const matched = p.images.find((url: string) => url.toLowerCase().includes(colorSlug))
  img = matched ?? p.images[0]
}
      expanded.push({
          id:    `${p.id}__${color}`,
  name:  p.name,
  price: Number(p.price),
  image: img,
  badge: p.badge ?? undefined,
  href:  `/products/${p.slug ?? p.id}`,
  colors: [{ hex: v.colorHex, name: color }],
  comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      })
    }
  } else {
    expanded.push({
  id:    p.id,
  name:  p.name,
  price: Number(p.price),
  image: p.images?.[0] ?? '',
  badge: p.badge ?? undefined,
  href:  `/products/${p.slug ?? p.id}`,
  colors: p.variants
    ? [...new Map(p.variants.map((v: any) => [v.colorHex, { hex: v.colorHex, name: v.color }])).values()]
    : [],
  comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    })
  }
}
setProducts(expanded)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [slot, limit])

  if (loading) return <SkeletonProductGrid title={title} subtitle={subtitle} />

  if (products.length === 0) return null

  return (
    <ProductGrid
      title={title}
      subtitle={subtitle}
      products={products}
      viewAllHref={viewAllHref}
    />
  )
}