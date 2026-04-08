// Save as: src/components/cms-fallbacks/sustainability.tsx
export default function SustainabilityFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '48px' }}>
        We believe fashion and responsibility aren't mutually exclusive. Solomon & Sage is committed to building a business that's good for people and the planet — not as a marketing exercise, but as a core part of how we operate.
      </p>
      {[
        { label: 'Materials', text: 'We prioritize organic cotton, recycled fabrics, and low-impact dyes. We\'re working toward 80% sustainable materials across all collections by 2027.' },
        { label: 'Manufacturing', text: 'Every factory we work with is audited annually for fair wages, safe conditions, and workers\' rights. We publish our factory list every year.' },
        { label: 'Packaging', text: 'Our packaging is 100% recyclable. We\'ve eliminated single-use plastic from all shipments and are transitioning to compostable mailers.' },
        { label: 'Carbon', text: 'We offset 100% of shipping emissions through verified carbon offset programs and are working toward net-zero operations by 2028.' },
        { label: 'Circular Fashion', text: 'Our take-back program lets you return worn Solomon & Sage pieces for store credit. We repair, donate, or responsibly recycle everything returned.' },
      ].map((item, i, arr) => (
        <div key={i} style={{ display: 'flex', gap: '24px', paddingBottom: '28px', marginBottom: '28px', borderBottom: i < arr.length - 1 ? '1px solid #f0ece6' : 'none' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-charcoal)', width: '100px', flexShrink: 0, paddingTop: '2px' }}>{item.label}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.8, flex: 1 }}>{item.text}</p>
        </div>
      ))}
    </div>
  )
}