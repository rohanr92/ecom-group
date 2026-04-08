'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Star, Users, TrendingUp, Share2 } from 'lucide-react'

export default function InfluencersPage() {
  const [form, setForm] = useState({ name: '', email: '', handle: '', followerCount: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (d.success) {
        setSubmitted(true)
      } else {
        setError(d.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div style={{ position: 'relative', minHeight: '360px', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1400&auto=format&fit=crop&q=80"
            alt="Influencers" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, filter: 'brightness(0.55)' }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: '16px' }}>Partner With Us</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,6vw,68px)', fontWeight: 300, fontStyle: 'italic', color: '#fff' }}>Creator Program</h1>
          </div>
        </div>

        <div className="max-container" style={{ padding: 'clamp(48px,7vw,96px) clamp(16px,4vw,60px)' }}>
          {/* Intro */}
          <div style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '680px', margin: '0 auto 60px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9 }}>
              Join the Solomon & Sage creator community and get paid to share styles you love. We partner with influencers of all sizes — from micro-creators to established style icons.
            </p>
          </div>

          {/* Benefits */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '24px', marginBottom: '72px' }}>
            {[
              { icon: <Star size={24} strokeWidth={1.5} />, title: 'Free Product', desc: 'Receive complimentary pieces from our latest collections to style and share.' },
              { icon: <TrendingUp size={24} strokeWidth={1.5} />, title: 'Commission', desc: 'Earn 10–20% commission on every sale made through your unique link.' },
              { icon: <Users size={24} strokeWidth={1.5} />, title: 'Community', desc: 'Join an exclusive community of creators with early access to new drops.' },
              { icon: <Share2 size={24} strokeWidth={1.5} />, title: 'Exposure', desc: 'Get featured on our official channels with a combined following of 500k+.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--color-cream)', padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ color: 'var(--color-accent)', display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontStyle: 'italic', fontWeight: 400, marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontStyle: 'italic', fontWeight: 400, textAlign: 'center', marginBottom: '32px' }}>Apply to Partner</h2>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-cream)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontStyle: 'italic', fontWeight: 400, marginBottom: '8px' }}>Application Received!</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)' }}>We'll review your profile and get back to you within 3–5 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Full Name', key: 'name', type: 'text', required: true },
                  { label: 'Email Address', key: 'email', type: 'email', required: true },
                  { label: 'Instagram / TikTok Handle', key: 'handle', type: 'text', placeholder: '@yourhandle' },
                  { label: 'Follower Count', key: 'followerCount', type: 'text', placeholder: 'e.g. 25,000' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-charcoal)', display: 'block', marginBottom: '6px' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required={field.required}
                      value={(form as any)[field.key]}
                      placeholder={(field as any).placeholder ?? ''}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-charcoal)', display: 'block', marginBottom: '6px' }}>
                    Tell Us About Yourself
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Your niche, audience, and why you love Solomon & Sage..."
                    rows={4}
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {error && (
                  <p style={{ color: '#c0392b', fontSize: '13px', fontFamily: 'var(--font-body)' }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '14px', background: submitting ? '#888' : 'var(--color-charcoal)', color: '#fff', border: 'none', fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}