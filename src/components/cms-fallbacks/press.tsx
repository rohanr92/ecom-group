// Save as: src/components/cms-fallbacks/press.tsx
export default function PressFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '48px' }}>
        Solomon & Sage has been featured in leading fashion publications and media outlets. For press inquiries, samples, or interview requests, contact our team directly.
      </p>
      {[
        { outlet: 'Vogue', headline: 'Solomon & Sage Is the California Brand You Need to Know', date: 'March 2026' },
        { outlet: "Harper's Bazaar", headline: '15 Under-the-Radar Brands That Fashion Editors Are Wearing', date: 'February 2026' },
        { outlet: 'WWD', headline: 'Solomon & Sage Group Expands Nordstrom Partnership', date: 'January 2026' },
        { outlet: 'Refinery29', headline: 'The Best New Dresses to Buy Right Now', date: 'December 2025' },
        { outlet: 'InStyle', headline: 'Cool California Brands Redefining Accessible Luxury', date: 'November 2025' },
      ].map((item, i, arr) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', paddingBottom: '20px', marginBottom: '20px', borderBottom: i < arr.length - 1 ? '1px solid #f0ece6' : 'none' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '4px' }}>{item.outlet}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontStyle: 'italic', fontWeight: 400, color: 'var(--color-charcoal)', lineHeight: 1.3 }}>{item.headline}</p>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: '4px' }}>{item.date}</p>
        </div>
      ))}
      <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #e8e4de' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-charcoal)', marginBottom: '8px' }}>Press Contact</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)' }}>
          <a href="mailto:press@solomonandsage.com" style={{ color: 'var(--color-charcoal)', textDecoration: 'underline' }}>press@solomonandsage.com</a>
        </p>
      </div>
    </div>
  )
}