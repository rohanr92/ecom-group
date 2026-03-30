// Save as: src/components/PromoBanner.tsx (REPLACE entire file)
import Link from 'next/link'

export default function PromoBanner() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(400px, 55vw, 550px)' }}>

      {/* Background video — replace src with your own video URL */}
      <video
        src="/videos/promo.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.55)',
        }}
      />

      {/* Content overlay — unchanged */}
      <div
        style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: 'clamp(400px, 55vw, 550px)',
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(10px, 1.2vw, 12px)',
          letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.9)',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          Limited time offer
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 6vw, 80px)',
          fontWeight: 300,
          color: '#fff',
          lineHeight: 1,
          marginBottom: '8px',
        }}>
          FREE
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(18px, 3vw, 42px)',
          fontWeight: 400,
          color: '#fff',
          letterSpacing: '0.05em',
          marginBottom: '4px',
          fontStyle: 'italic',
        }}>
          Limited-Edition Tote Bag
        </div>

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(11px, 1.3vw, 14px)',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.85)',
          textTransform: 'uppercase',
          marginBottom: '28px',
        }}>
          With any $500+ purchase
        </div>

        <Link href="/collections/all" className="btn-solid" style={{
          background: 'rgba(255,255,255,0.12)',
          borderColor: 'rgba(255,255,255,0.7)',
          color: '#fff',
          backdropFilter: 'blur(6px)',
        }}>
          Shop Now
        </Link>

        <p style={{
          marginTop: '14px',
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.06em',
        }}>
          *While supplies last. One per order.
        </p>
      </div>
    </section>
  )
}