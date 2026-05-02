import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Affiliate Program', alternates: { canonical: 'https://solomonandsage.com/affiliate' } }

// Save as: src/app/affiliate/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AffiliatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <div style={{ background: 'var(--color-cream)', borderBottom: '1px solid #e8e4de', padding: '48px 0 40px' }}>
          <div className="max-container" style={{ padding: '0 clamp(16px,4vw,60px)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '12px' }}>Solomon & Sage</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-charcoal)', margin: 0 }}>Affiliate Program</h1>
          </div>
        </div>
        <div className="max-container" style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,60px)', maxWidth: '800px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '48px' }}>
            Earn commissions by promoting Solomon & Sage. Our affiliate program is open to bloggers, publishers, content creators, and anyone passionate about fashion.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '2px', marginBottom: '48px' }}>
            {[
              { stat: '10%', label: 'Commission Rate' },
              { stat: '30 Days', label: 'Cookie Duration' },
              { stat: '$50', label: 'Minimum Payout' },
              { stat: 'Monthly', label: 'Payment Schedule' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--color-charcoal)', color: '#fff', padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 300, color: 'var(--color-accent)' }}>{item.stat}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>{item.label}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--color-cream)', padding: '36px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontStyle: 'italic', fontWeight: 400, marginBottom: '12px' }}>Ready to Join?</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', marginBottom: '20px', lineHeight: 1.7 }}>Apply through our affiliate network or email us directly to get started.</p>
            <a href="mailto:support@solomonlawrencegroup.com" className="btn-solid" style={{ fontSize: '11px' }}>Apply Now</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}