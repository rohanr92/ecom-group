import Link from 'next/link'

const womenCategories = [
  { label: "Women's New Arrivals", image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80', href: '/collections/new-arrivals' },
  { label: "Men's New Arrivals",   image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5b2a?w=600&auto=format&fit=crop&q=80', href: '/collections/men-new' },
  { label: 'Dresses',             image: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=600&auto=format&fit=crop&q=80', href: '/collections/dresses' },
  { label: 'Jeans & Denim',      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80', href: '/collections/denim' },
  { label: 'Wide Leg Suits',     image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', href: '/collections/suits' },
  { label: "Women's Spring Essentials", image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80', href: '/collections/spring' },
  { label: "Women's Vacation",   image: 'https://images.unsplash.com/photo-1570464197285-9949814674a7?w=600&auto=format&fit=crop&q=80', href: '/collections/vacation' },
  { label: "Men's Vacation",     image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80', href: '/collections/men-vacation' },
  { label: 'Boots & Sandals',    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=80', href: '/collections/shoes' },
  { label: 'Swim',               image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', href: '/collections/swim' },
  { label: 'Handbags',           image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80', href: '/collections/handbags' },
  { label: 'Sunglasses & Eyewear', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80', href: '/collections/accessories' },
]

export default function ShopByCategory() {
  return (
    <section style={{ padding: 'clamp(32px, 5vw, 64px) 0' }}>
      <div className="max-container" style={{ padding: '0 clamp(16px, 3vw, 32px)' }}>
        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 3vw, 36px)',
          fontWeight: 400,
          fontStyle: 'italic',
          letterSpacing: '0.04em',
          color: 'var(--color-charcoal)',
          marginBottom: 'clamp(20px, 3vw, 36px)',
        }}>
          Shop by Category
        </h2>

        {/* Grid: 6 columns on desktop, 3 on tablet, 2 on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 'clamp(8px, 1.5vw, 16px)',
        }}
          className="category-grid"
        >
          {womenCategories.map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className="category-card no-underline"
              style={{ display: 'block', color: 'inherit' }}
            >
              {/* Image */}
              <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#e8e4de' }}>
                <img
                  src={cat.image}
                  alt={cat.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              {/* Label */}
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(10px, 1vw, 12px)',
                letterSpacing: '0.06em',
                color: 'var(--color-charcoal)',
                marginTop: '8px',
                lineHeight: 1.35,
                textAlign: 'center',
              }}>
                {cat.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 1024px) { .category-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 640px)  { .category-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 380px)  { .category-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  )
}