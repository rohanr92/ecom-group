// Save as: src/components/cms-fallbacks/contact.tsx
export default function ContactFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '40px' }}>
        Our customer service team is available Monday through Friday, 9am–6pm PST. We typically respond within 24 hours.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '32px', paddingBottom: '40px', borderBottom: '1px solid #e8e4de', marginBottom: '40px' }}>
        {[
          { label: 'Email', value: 'support@solomonlawrencegroup.com' },
          { label: 'Hours', value: 'Mon–Fri, 9am–6pm PST' },
          { label: 'HQ', value: 'Los Angeles, California' },
          { label: 'Returns', value: 'support@solomonlawrencegroup.com' },
        ].map((item, i) => (
          <div key={i}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: '6px' }}>{item.label}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)' }}>{item.value}</p>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.8 }}>
        For press inquiries, contact <a href="mailto:support@solomonlawrencegroup.com" style={{ color: 'var(--color-charcoal)', textDecoration: 'underline' }}>support@solomonlawrencegroup.com</a>. For wholesale or retail partnership inquiries, contact <a href="mailto:wholesale@solomonlawrencegroup.com" style={{ color: 'var(--color-charcoal)', textDecoration: 'underline' }}>wholesale@solomonlawrencegroup.com</a>.
      </p>
    </div>
  )
}