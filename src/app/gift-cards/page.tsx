'use client'
// Save as: src/app/gift-cards/page.tsx
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function GiftCardsPage() {
  const [amount, setAmount]   = useState(50)
  const [custom, setCustom]   = useState('')
  const [tab, setTab]         = useState<'buy' | 'redeem'>('buy')

  const amounts = [25, 50, 100, 150, 200, 250]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <div style={{ background: 'var(--color-cream)', borderBottom: '1px solid #e8e4de', padding: '48px 0 40px' }}>
          <div className="max-container" style={{ padding: '0 clamp(16px,4vw,60px)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '12px' }}>Solomon & Sage</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-charcoal)', margin: 0 }}>Gift Cards</h1>
          </div>
        </div>

        <div className="max-container" style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,60px)', maxWidth: '800px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e8e4de', marginBottom: '40px' }}>
            {(['buy', 'redeem'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '12px 32px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--color-charcoal)' : '2px solid transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: tab === t ? 'var(--color-charcoal)' : 'var(--color-mid)', fontWeight: tab === t ? 600 : 400 }}>
                {t === 'buy' ? 'Buy a Gift Card' : 'Redeem a Gift Card'}
              </button>
            ))}
          </div>

          {tab === 'buy' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '48px' }}>
              <div>
                <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #3a2a1a 100%)', aspectRatio: '1.6/1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px', marginBottom: '32px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontStyle: 'italic', fontWeight: 300, color: '#fff', letterSpacing: '0.1em' }}>Solomon & Sage</p>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Gift Card</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 300, color: 'var(--color-accent)' }}>${custom || amount}.00</p>
                  </div>
                </div>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Select Amount</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
                  {amounts.map(a => (
                    <button key={a} onClick={() => { setAmount(a); setCustom('') }}
                      style={{ padding: '10px', border: `1px solid ${amount === a && !custom ? 'var(--color-charcoal)' : '#ddd'}`, background: amount === a && !custom ? 'var(--color-charcoal)' : '#fff', color: amount === a && !custom ? '#fff' : 'var(--color-charcoal)', fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer' }}>
                      ${a}
                    </button>
                  ))}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Custom Amount</label>
                  <input value={custom} onChange={e => setCustom(e.target.value.replace(/\D/g, ''))} placeholder="Enter amount ($25–$500)"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none' }} />
                </div>
                <Link href="/cart" className="btn-solid" style={{ display: 'block', textAlign: 'center', fontSize: '11px' }}>
                  Add to Cart — ${custom || amount}.00
                </Link>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-mid)', marginTop: '12px', lineHeight: 1.6 }}>Gift cards are delivered by email and never expire.</p>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '400px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.7, marginBottom: '24px' }}>
                Enter your gift card code below to check your balance or apply it to your next purchase at checkout.
              </p>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Gift Card Code</label>
                <input placeholder="XXXX-XXXX-XXXX-XXXX"
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', letterSpacing: '0.1em' }} />
              </div>
              <button className="btn-solid" style={{ width: '100%', fontSize: '11px', padding: '13px' }}>Check Balance</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}