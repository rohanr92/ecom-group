// Save as: src/components/cms-fallbacks/returns.tsx
import Link from 'next/link'
export default function ReturnsFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '48px' }}>
        Not the right fit? No problem. We offer free returns on all unworn, unwashed items within 30 days of delivery. Refunds are processed within 5–7 business days of us receiving your return.
      </p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontStyle: 'italic', fontWeight: 400, marginBottom: '20px' }}>How to Start a Return</h2>
      <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          'Go to My Account → Orders, or use the Guest Return portal below.',
          'Select the item(s) you want to return and your reason.',
          'Print your prepaid USPS return label — emailed to you instantly.',
          'Drop the package at any USPS location within 30 days.',
          'Refund issued within 5–7 business days after we receive it.',
        ].map((step, i) => (
          <li key={i} style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontStyle: 'italic', color: 'var(--color-accent)', flexShrink: 0, width: '24px' }}>{i+1}</span>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.8, margin: 0 }}>{step}</p>
          </li>
        ))}
      </ol>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px', paddingTop: '32px', borderTop: '1px solid #e8e4de' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: '14px' }}>Eligible for return</p>
          {['Unworn and unwashed', 'Original tags attached', 'In original packaging', 'Within 30 days of delivery'].map((t,i) => (
            <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', padding: '7px 0', borderBottom: '1px solid #f0ece6' }}>{t}</p>
          ))}
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: '14px' }}>Not eligible</p>
          {['Final sale items', 'Worn or washed items', 'Missing original tags', 'Gift cards'].map((t,i) => (
            <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', padding: '7px 0', borderBottom: '1px solid #f0ece6' }}>{t}</p>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link href="/account/returns" className="btn-solid" style={{ fontSize: '11px' }}>Start a Return</Link>
        <Link href="/contact" className="btn-outline" style={{ fontSize: '11px' }}>Contact Support</Link>
      </div>
    </div>
  )
}