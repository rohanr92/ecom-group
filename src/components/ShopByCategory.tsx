import Link from 'next/link'

const womenCategories = [
  { label: "Women's New Arrivals", image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100762104-1775598851179-wmns_opc02f_0126_d3-1b-008-050.jpeg', href: '/collections/womens-new-arrivals' },
  { label: "Men's New Arrivals",   image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100763028-1775598849682-mens_cont02f_0126_074.jpeg', href: '/collections/mens-new-arrivals' },
  { label: "Women's Spring Essentials",      image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100761153-1775599025404-wmns_adc07f_0326_0165_altbgd_ext_1-1-1-.jpeg', href: '/collections/womens-spring-essentials' },
  { label: "Men's Denim",      image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100760148-1775599234635-mens_ymt03f_0326_0091_altbgd_ext_8-5.jpeg', href: '/collections/mens-denim' },
  { label: "Women's Denim",     image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100759161-1775599347953-wmns_trd04f_0126_063.jpeg', href: '/collections/womens-denim' },
  { label: "Women's Pants", image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100758226-1775599582552-32778185_fpx.webp', href: '/collections/womens-pants' },
  { label: "Women's Button Up",   image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100757280-1775600506360-wmns_adc09f_0126_062-1-.jpeg', href: '/collections/womens-button-up' },
  { label: "Men's T-Shirts",     image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100756337-1775600787242-c2601577_103_9_4x5.webp', href: '/collections/mens-tshirts' },
  { label: "Women's Sweatshirts",    image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100754548-1775600957901-35458740_fpx.jpg', href: '/collections/womens-sweatshirts' },
  { label: "Women's Shorts",               image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100753497-1775601251870-36309272_fpx.webp', href: '/collections/womens-shorts' },
  { label: "Women's Dresses", image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776788246307-desw_app01f_0326_1696.jpeg', href: '/collections/womens-dresses' },
  { label: "Handbags", image: 'https://d3o8u8o2i2q94t.cloudfront.net/products/1776100750353-1775600565396-wmns_core01f_0226_041.jpeg', href: '/collections/womens-handbags' },
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