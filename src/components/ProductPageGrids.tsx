// Save as: src/components/ProductPageGrids.tsx (NEW FILE)
// Renders the two product grids on the product detail page
// Products come from admin-assigned slots in the Collections panel
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import WishlistButton from '@/components/WishlistButton'
import { Heart } from 'lucide-react'

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

  return (
    <Link href={href} className="group no-underline" style={{ display: 'block' }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: '#f5f2ed', aspectRatio: '3/4' }}>
        {img ? (
          <img src={img} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
            className="group-hover:scale-105" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0ece6' }}>
            <Heart size={24} strokeWidth={1} style={{ color: '#ddd' }} />
          </div>
        )}
        {product.badge && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px',
            background: product.badge === 'Sale' ? '#c0392b' : '#1a1a1a',
            color: '#fff', fontSize: '9px', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px',
          }}>{product.badge}</span>
        )}
        {/* Wishlist */}
        <div style={{ position: 'absolute', top: '8px', right: '8px' }} onClick={e => e.preventDefault()}>
          <WishlistButton productId={product.id} size={16}
            className="w-8 h-8 bg-white/90 flex items-center justify-center" />
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#1a1a1a', lineHeight: 1.3, marginBottom: '4px' }}
          className="group-hover:underline">{product.name}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: onSale ? '#c0392b' : '#1a1a1a' }}>
            ${Number(product.price).toFixed(2)}
          </span>
          {onSale && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#aaa', textDecoration: 'line-through' }}>
              ${Number(product.comparePrice).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// Small square card for "Style With" section
function StyleCard({ product }: { product: GridProduct }) {
  const href = `/products/${product.slug ?? product.id}`
  const img = Array.isArray(product.images) ? product.images[0] : ''

  return (
    <Link href={href} className="group no-underline" style={{ display: 'block' }}>
      <div style={{ aspectRatio: '1/1', overflow: 'hidden', background: '#f5f2ed' }}>
        {img ? (
          <img src={img} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
            className="group-hover:scale-105" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f0ece6' }} />
        )}
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', marginTop: '8px', lineHeight: 1.3 }}
        className="group-hover:underline">{product.name}</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#888' }}>
        ${Number(product.price).toFixed(2)}
      </p>
    </Link>
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
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}
  className="scrollbar-hide">
          {products.slice(0, 5).map(p => <ProductMiniCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}