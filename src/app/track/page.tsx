// Save as: src/app/track/page.tsx
'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Package, Search, Truck, CheckCircle, Clock } from 'lucide-react'

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState('')
  const [email,    setEmail]    = useState('')
  const [searched, setSearched] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <div style={{ background: 'var(--color-cream)', borderBottom: '1px solid #e8e4de', padding: '48px 0 40px' }}>
          <div className="max-container" style={{ padding: '0 clamp(16px,4vw,60px)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '12px' }}>Solomon Lawrence</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-charcoal)', margin: 0 }}>Track Your Order</h1>
          </div>
        </div>

        <div className="max-container" style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,60px)', maxWidth: '600px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.7, marginBottom: '36px' }}>
            Enter your order number and email address below to track your shipment. Your order number can be found in your confirmation email.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-charcoal)', display: 'block', marginBottom: '8px' }}>Order Number</label>
              <input value={orderNum} onChange={e => setOrderNum(e.target.value)}
                placeholder="e.g. SL-123456"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', background: '#fff' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-charcoal)', display: 'block', marginBottom: '8px' }}>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', background: '#fff' }} />
            </div>
            <button onClick={() => setSearched(true)}
              style={{ padding: '14px', background: 'var(--color-charcoal)', color: '#fff', border: 'none', fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Search size={14} /> Track Order
            </button>
          </div>

          {searched && (
            <div style={{ border: '1px solid #e8e4de', padding: '28px', marginTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f0ece6' }}>
                <Package size={20} strokeWidth={1.5} color="var(--color-accent)" />
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal)' }}>Order {orderNum || 'SL-123456'}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)' }}>Placed March 25, 2026</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: <CheckCircle size={16} color="#4a6741" />, label: 'Order Confirmed', date: 'Mar 25', done: true },
                  { icon: <CheckCircle size={16} color="#4a6741" />, label: 'Processing', date: 'Mar 26', done: true },
                  { icon: <Truck size={16} color="var(--color-accent)" />, label: 'Shipped — In Transit', date: 'Mar 27', done: true },
                  { icon: <Clock size={16} color="#ccc" />, label: 'Out for Delivery', date: 'Est. Mar 31', done: false },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {step.icon}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: step.done ? 'var(--color-charcoal)' : '#aaa', fontWeight: step.done ? 500 : 400 }}>{step.label}</p>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)' }}>{step.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}