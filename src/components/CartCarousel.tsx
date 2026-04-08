'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
// import { ChevronLeft, ChevronRight } from 'lucide-react'
import WishlistButton from '@/components/WishlistButton'


interface Product {
  id: string; slug: string; name: string
  price: number; comparePrice: number | null
  image: string; badge: string | null
  colors: { hex: string; name: string }[]
}

function ProductCard({ item }: { item: Product }) {
const [hovered, setHovered] = useState(false)
  const { convert } = useCurrency()
  const onSale = item.comparePrice && item.comparePrice > item.price
  const href = `/products/${item.slug}`

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
style={{
  position: 'relative',
  border: '1px solid #eeebe6',
  padding: '8px',
  background: '#fff',
  transition: 'box-shadow 0.3s ease',
  boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.10)' : 'none',
  flexShrink: 0,
  width: '160px',
}}
      className="md:w-48"
    >
      <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: '#f9f9f9', aspectRatio: '3/4' }}>
          {item.image
            ? <img src={item.image} alt={item.name}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  transition: 'transform 0.5s ease',
                  transform: hovered ? 'scale(1.04)' : 'scale(1)',
                }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', color: '#ccc' }}>No Image</span>
              </div>
          }
          {item.badge && (
            <span style={{
              position: 'absolute', top: '10px', left: '10px',
              background: item.badge === 'Sale' ? '#c0392b' : item.badge === 'Best Seller' ? '#4a6741' : '#1a1a1a',
              color: '#fff', fontSize: '9px', fontWeight: 600,
              letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 8px',
            }}>
              {item.badge}
            </span>
          )}
         <div onClick={e => e.preventDefault()}
            style={{ position: 'absolute', top: '10px', right: '10px', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease' }}>
            <WishlistButton
              productId={item.id.split('__')[0]}
              size={13}
              className="w-[30px] h-[30px] rounded-full bg-white/90 flex items-center justify-center shadow-sm" />
          </div>
          {hovered && (
            <div style={{
              position: 'absolute', bottom: '12px', left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff', padding: '8px 16px',
              fontSize: '10px', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#1a1a1a', fontWeight: 600,
              whiteSpace: 'nowrap', border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)', cursor: 'pointer',
            }}>
              Quick View
            </div>
          )}
        </div>
      </Link>

      {/* Color swatches */}
      {item.colors?.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
          {item.colors.slice(0, 5).map(c => (
            <div key={c.hex} title={c.name} style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: c.hex,
              border: (c.hex === '#ffffff' || c.hex === '#fffff0') ? '1px solid #ddd' : '1px solid transparent',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
            }} />
          ))}
        </div>
      )}

      {/* Info */}
      <div style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '2px', overflow: 'hidden', marginTop: '4px' }}>
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '12px', color: '#1a1a1a', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.name}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline', marginTop: '2px' }}>
            <span style={{ fontSize: '12px', color: onSale ? '#c0392b' : '#555', fontWeight: onSale ? 600 : 400 }}>
              {convert(item.price)}
            </span>
            {onSale && (
              <span style={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>
                {convert(item.comparePrice!)}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function CartCarousel({ title, slot }: { title: string; slot: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/collections/slot?slot=${slot}&limit=10`)
      .then(r => r.json())
      .then(d => {
        const raw = d.products ?? []
        const expanded: Product[] = []
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
                img = p.images.find((url: string) => url.toLowerCase().includes(colorSlug)) ?? p.images[0]
              }
              expanded.push({
                id: `${p.id}__${color}`, slug: p.slug ?? p.id,
                name: p.name, price: Number(p.price),
                comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
                image: img, badge: p.badge ?? null,
                colors: [{ hex: v.colorHex, name: color }],
              })
            }
          } else {
            expanded.push({
              id: p.id, slug: p.slug ?? p.id,
              name: p.name, price: Number(p.price),
              comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
              image: p.images?.[0] ?? '', badge: p.badge ?? null,
              colors: p.variants
                ? [...new Map(p.variants.map((v: any) => [v.colorHex, { hex: v.colorHex, name: v.color }])).values()]
                : [],
            })
          }
        }
        setProducts(expanded)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [slot])

  const scroll = (dir: 'left' | 'right') =>
    ref.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })

  return (
    <section className="py-10 border-t border-gray-100">
      <div className="max-container px-4 md:px-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl italic font-light text-[#1a1a1a]">
            {title}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')}
              className="w-8 h-8 border border-gray-300 flex items-center justify-center cursor-pointer bg-white hover:border-[#1a1a1a] transition-colors">
              <ChevronLeft size={15} strokeWidth={1.5} />
            </button>
            <button onClick={() => scroll('right')}
              className="w-8 h-8 border border-gray-300 flex items-center justify-center cursor-pointer bg-white hover:border-[#1a1a1a] transition-colors">
              <ChevronRight size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      
        <div ref={ref} className="cart-scroll flex gap-3 pb-2" style={{ overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ flexShrink: 0, width: '160px', border: '1px solid #eeebe6', padding: '8px', background: '#fff' }} className="animate-pulse md:w-48">
                  <div style={{ aspectRatio: '3/4', background: '#f0ece6' }} />
                  <div style={{ marginTop: '8px', height: '12px', background: '#f0ece6', borderRadius: '2px', width: '75%' }} />
                  <div style={{ marginTop: '4px', height: '12px', background: '#f0ece6', borderRadius: '2px', width: '40%' }} />
                </div>
              ))
            : products.map(item => <ProductCard key={item.id} item={item} />)
          }
        </div>
      </div>
      <style>{`.cart-scroll::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}