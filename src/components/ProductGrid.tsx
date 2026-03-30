'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image: string
  badge?: string
  href: string
}

interface ProductGridProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllHref?: string
}

function ProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false)

  return (
    <div>
      <Link href={product.href} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: '#f5f2ed', aspectRatio: '3/4' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
            className="product-img"
          />
          {product.badge && (
            <div style={{
              position: 'absolute', top: '10px', left: '10px',
              background: 'var(--color-charcoal)', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '9px',
              letterSpacing: '0.15em', fontWeight: 600,
              textTransform: 'uppercase', padding: '4px 8px',
            }}>
              {product.badge}
            </div>
          )}
          <button
            onClick={e => { e.preventDefault(); setWished(w => !w) }}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(255,255,255,0.9)', border: 'none',
              borderRadius: '50%', width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            }}
            aria-label="Add to wishlist"
          >
            <Heart size={15} strokeWidth={1.5} fill={wished ? '#c0392b' : 'none'} color={wished ? '#c0392b' : '#333'} />
          </button>
        </div>
      </Link>
      <div style={{ padding: '8px 2px 4px' }}>
        <Link href={product.href} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.02em', color: 'var(--color-charcoal)', lineHeight: 1.35, marginBottom: '3px' }}>
            {product.name}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#555', letterSpacing: '0.02em' }}>
            ${product.price.toFixed(2)}
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function ProductGrid({ title, subtitle, products, viewAllHref }: ProductGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // slight delay so layout is painted before measuring
    setTimeout(checkScroll, 100)
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [products])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth : el.clientWidth, behavior: 'smooth' })
  }

  return (
    <section style={{ padding: 'clamp(28px, 4vw, 52px) 0' }}>
      <div className="max-container" style={{ padding: '0 clamp(16px, 3vw, 40px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'clamp(16px, 2vw, 28px)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--color-charcoal)', fontStyle: 'italic', margin: 0 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)', letterSpacing: '0.06em', marginTop: '4px' }}>
                {subtitle}
              </p>
            )}
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-charcoal)', textDecoration: 'none', borderBottom: '1px solid var(--color-charcoal)', paddingBottom: '1px' }}>
              View All
            </Link>
          )}
        </div>

        {/* Carousel */}
        <div style={{ position: 'relative' }}>

          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            aria-label="Previous"
            style={{
              position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: '36px', height: '36px', borderRadius: '50%',
              background: '#fff', border: '1px solid #ccc',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={18} strokeWidth={1.5} color={canLeft ? '#1a1a1a' : '#ccc'} />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            aria-label="Next"
            style={{
              position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: '36px', height: '36px', borderRadius: '50%',
              background: '#fff', border: '1px solid #ccc',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={18} strokeWidth={1.5} color={canRight ? '#1a1a1a' : '#ccc'} />
          </button>

          {/* Scrollable track — 5 cards visible, gap 6px */}
          <div
            ref={scrollRef}
            style={{
              display: 'grid',
              gridAutoFlow: 'column',
              gridAutoColumns: 'calc((100% - 4 * 6px) / 5)',
              gap: '6px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="carousel-track"
          >
            {products.map(product => (
              <div key={product.id} style={{ scrollSnapAlign: 'start' }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        .carousel-track::-webkit-scrollbar { display: none; }
        .product-img:hover { transform: scale(1.04); }

        @media (max-width: 1024px) {
          .carousel-track {
            grid-auto-columns: calc((100% - 3 * 6px) / 4) !important;
          }
        }
        @media (max-width: 768px) {
          .carousel-track {
            grid-auto-columns: calc((100% - 2 * 6px) / 3) !important;
          }
        }
        @media (max-width: 480px) {
          .carousel-track {
            grid-auto-columns: calc((100% - 6px) / 2) !important;
          }
        }
      `}</style>
    </section>
  )
}