// Save as: src/components/ProductPageGrids.tsx (NEW FILE)
// Renders the two product grids on the product detail page
// Products come from admin-assigned slots in the Collections panel
'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import WishlistButton from '@/components/WishlistButton'
import { Heart } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface GridProduct {
  id:           string
  name:         string
  price:        number
  comparePrice?: number
  images:       string[]
  badge?:       string
  slug?:        string
}

function ProductMiniCard({ product }: { product: GridProduct }) {
  const href = `/products/${product.slug ?? product.id}`
  const onSale = product.comparePrice && Number(product.comparePrice) > Number(product.price)
  const img = Array.isArray(product.images) ? product.images[0] : ''
 const [hovered, setHovered] = useState(false)
  const { convert } = useCurrency()

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ border: '1px solid #eeebe6', padding: '8px', background: '#fff', transition: 'box-shadow 0.3s ease', boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.10)' : 'none' }}
    >
      <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: '#f9f9f9', aspectRatio: '3/4' }}>
          {img
            ? <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
            : <div style={{ width: '100%', height: '100%', background: '#f0ece6' }} />
          }
          {product.badge && (
            <span style={{ position: 'absolute', top: '10px', left: '10px', background: product.badge === 'Sale' ? '#c0392b' : product.badge === 'Best Seller' ? '#4a6741' : '#1a1a1a', color: '#fff', fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 8px' }}>
              {product.badge}
            </span>
          )}
      <div onClick={e => e.preventDefault()}
            style={{ position: 'absolute', top: '10px', right: '10px', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease' }}>
            <WishlistButton productId={product.id} size={13}
              className="w-[30px] h-[30px] rounded-full bg-white/90 flex items-center justify-center shadow-sm" />
          </div>
          {hovered && (
            <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '8px 16px', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1a1a', fontWeight: 600, whiteSpace: 'nowrap', border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', cursor: 'pointer' }}>
              Quick View
            </div>
          )}
        </div>
      </Link>
      <div style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '2px', overflow: 'hidden', marginTop: '6px' }}>
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline', marginTop: '2px' }}>
            <span style={{ fontSize: '12px', color: onSale ? '#c0392b' : '#555', fontWeight: onSale ? 600 : 400 }}>{convert(Number(product.price))}</span>
            {onSale && <span style={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>{convert(Number(product.comparePrice))}</span>}
          </div>
        </Link>
      </div>
    </div>
  )
}
// Small square card for "Style With" section
function StyleCard({ product }: { product: GridProduct }) {
  const href = `/products/${product.slug ?? product.id}`
  const img = Array.isArray(product.images) ? product.images[0] : ''
const [hovered, setHovered] = useState(false)
  const { convert } = useCurrency()

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ border: '1px solid #eeebe6', padding: '8px', background: '#fff', transition: 'box-shadow 0.3s ease', boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.10)' : 'none' }}
    >
      <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: '#f9f9f9', aspectRatio: '3/4' }}>
          {img
            ? <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
            : <div style={{ width: '100%', height: '100%', background: '#f0ece6' }} />
          }
         <div onClick={e => e.preventDefault()}
            style={{ position: 'absolute', top: '10px', right: '10px', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease' }}>
            <WishlistButton productId={product.id} size={13}
              className="w-[30px] h-[30px] rounded-full bg-white/90 flex items-center justify-center shadow-sm" />
          </div>
          {hovered && (
            <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '8px 16px', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1a1a', fontWeight: 600, whiteSpace: 'nowrap', border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', cursor: 'pointer' }}>
              Quick View
            </div>
          )}
        </div>
      </Link>
      <div style={{ height: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '2px', overflow: 'hidden', marginTop: '6px' }}>
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{convert(Number(product.price))}</div>
        </Link>
      </div>
    </div>
  )
}

// Hook to fetch slot products
function useSlotProducts(slot: string) {
  const [products, setProducts] = useState<GridProduct[]>([])
  useEffect(() => {
    fetch(`/api/collections/slot?slot=${slot}`)
      .then(r => r.json())
      .then(d => setProducts(d.products ?? []))
      .catch(() => {})
  }, [slot])
  return products
}

// Style With section (square cards, max 3)
export function StyleWithGrid() {
  const products = useSlotProducts('product_page_style_with')
  if (!products.length) return null

  return (
    <section style={{ borderTop: '1px solid #f0ece6', paddingTop: '48px', paddingBottom: '48px' }}>
      <div className="max-container" style={{ padding: '0 clamp(16px,2.5vw,40px)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 300, fontStyle: 'italic', color: '#1a1a1a', marginBottom: '24px' }}>
          Style With
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '480px' }}>
          {products.slice(0, 3).map(p => <StyleCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

// You May Also Like section (4-col grid like original)
export function YouMayAlsoLikeGrid() {
  const products = useSlotProducts('product_page_you_may_like')
  if (!products.length) return null

  return (
    <section style={{ borderTop: '1px solid #f0ece6', paddingTop: '48px', paddingBottom: '48px' }}>
      <div className="max-container" style={{ padding: '0 clamp(16px,2.5vw,40px)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 300, fontStyle: 'italic', color: '#1a1a1a', marginBottom: '24px' }}>
          You May Also Like
        </h2>
    <div className="grid grid-cols-3 md:grid-cols-8 gap-3 md:gap-4">
  {products.slice(0, 8).map((p, i) => (
    <div key={p.id} className={i >= 3 ? 'hidden md:block' : ''}>
              <ProductMiniCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}