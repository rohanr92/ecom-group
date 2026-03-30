// Save as: src/components/cms-fallbacks/about.tsx
export default function AboutFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '48px' }}>
        Solomon Lawrence Group LLC was founded in California with one clear vision: to create women's clothing that feels luxurious without the luxury price tag. We design for real women — every size, every occasion, every day.
      </p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontStyle: 'italic', fontWeight: 400, color: 'var(--color-charcoal)', marginBottom: '16px' }}>Where We Come From</h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '16px' }}>
        Born in Los Angeles, shaped by California's effortless attitude toward style and dressing. Our founders grew up believing that getting dressed should feel good — not stressful, not expensive, just right.
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '48px' }}>
        Today, Solomon Lawrence collections are available at Nordstrom, Macy's, and Kohl's — retailers we chose because they share our belief that quality fashion should be accessible.
      </p>

      <div style={{ borderTop: '1px solid #e8e4de', paddingTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '32px', marginBottom: '48px' }}>
        {[
          { label: 'Quality First', text: 'Premium materials, meticulous construction, built to last.' },
          { label: 'Size Inclusive', text: 'Every collection runs XS through XXL.' },
          { label: 'Ethically Made', text: 'Fair labor standards, certified partner factories.' },
          { label: 'California Born', text: 'Designed in LA, made for everywhere.' },
        ].map((item, i) => (
          <div key={i}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-charcoal)', marginBottom: '8px' }}>{item.label}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.7 }}>{item.text}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #e8e4de', paddingTop: '32px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '16px' }}>Available at</p>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {["Nordstrom", "Macy's", "Kohl's"].map(r => (
            <p key={r} style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontStyle: 'italic', fontWeight: 300, color: 'var(--color-charcoal)' }}>{r}</p>
          ))}
        </div>
      </div>
    </div>
  )
}