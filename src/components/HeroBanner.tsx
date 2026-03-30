'use client'

import Link from 'next/link'

// Hero uses a 3-panel layout: large left panel + 2 stacked right panels
// Images: use Unsplash for placeholder. Replace with your own product images.

export default function HeroBanner() {
  return (
    <section style={{ background: '#fff' }}>
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto',
            gap: '3px',
            minHeight: 'clamp(400px, 65vw, 680px)',
          }}
          className="hero-grid"
        >
          {/* ── Left large panel ── */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              gridRow: '1 / 3',
              background: '#d4cfc8',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80"
              alt="Wear-to-work arrivals"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Overlay text */}
            <div
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '8%',
                right: '8%',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(22px, 3.5vw, 46px)',
                  fontWeight: 300,
                  color: '#fff',
                  lineHeight: 1.15,
                  textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                  marginBottom: '8px',
                  fontStyle: 'italic',
                }}
              >
                Wear-to-work<br />arrivals for spring
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(11px, 1.2vw, 13px)',
                  color: 'rgba(255,255,255,0.88)',
                  letterSpacing: '0.04em',
                  marginBottom: '16px',
                  maxWidth: '280px',
                  lineHeight: 1.5,
                }}
              >
                Slip into something a little more chic—these new season styles make every day a special occasion.
              </p>
              <Link href="/collections/workwear" className="btn-solid" style={{ background: 'rgba(255,255,255,0.15)', borderColor: '#fff', color: '#fff', backdropFilter: 'blur(4px)' }}>
                Shop Now
              </Link>
            </div>
          </div>

          {/* ── Top right panel ── */}
          <div
            style={{ position: 'relative', overflow: 'hidden', background: '#c4bfb5', cursor: 'pointer' }}
            className="category-card"
          >
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&auto=format&fit=crop&q=80"
              alt="Shop Shoes"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '200px' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '8%',
              }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(10px, 1.2vw, 12px)', letterSpacing: '0.2em', color: '#fff', fontWeight: 600, textTransform: 'uppercase', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                Shop Shoes →
              </div>
            </div>
          </div>

          {/* ── Bottom right panel ── */}
          <div
            style={{ position: 'relative', overflow: 'hidden', background: '#b8bfbc', cursor: 'pointer' }}
            className="category-card"
          >
            <img
              src="https://images.unsplash.com/photo-1551803091-e20673f15770?w=700&auto=format&fit=crop&q=80"
              alt="Shop Accessories"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '200px' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '8%',
              }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(10px, 1.2vw, 12px)', letterSpacing: '0.2em', color: '#fff', fontWeight: 600, textTransform: 'uppercase', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                Shop Accessories →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stack all vertically */}
      <style>{`
        @media (max-width: 640px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto !important;
          }
          .hero-grid > div:first-child {
            grid-row: 1 !important;
            min-height: 60vw !important;
          }
          .hero-grid > div:nth-child(2),
          .hero-grid > div:nth-child(3) {
            min-height: 50vw !important;
          }
        }
      `}</style>
    </section>
  )
}