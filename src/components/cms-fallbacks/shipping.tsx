// Save as: src/components/cms-fallbacks/shipping.tsx
export default function ShippingFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '48px' }}>
        All orders are processed within 1–2 business days. Orders placed after 12pm PST may be processed the following business day. We'll send a shipping confirmation with your tracking number as soon as your order ships.
      </p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontStyle: 'italic', fontWeight: 400, marginBottom: '16px' }}>Domestic Shipping</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '13px', marginBottom: '40px' }}>
        <tbody>
          {[
            ['Standard (5–7 business days)', 'Free on orders $150+, otherwise $12'],
            ['Express (2–3 business days)', '$22'],
            ['Overnight (next business day)', '$38'],
          ].map(([method, cost], i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0ece6' }}>
              <td style={{ padding: '14px 0', color: 'var(--color-charcoal)' }}>{method}</td>
              <td style={{ padding: '14px 0', color: 'var(--color-charcoal)', fontWeight: 500, textAlign: 'right' }}>{cost}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontStyle: 'italic', fontWeight: 400, marginBottom: '16px' }}>International Shipping</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '13px', marginBottom: '48px' }}>
        <tbody>
          {[
            ['Canada (7–14 business days)', '$28'],
            ['United Kingdom (7–14 business days)', '$35'],
            ['Australia (10–18 business days)', '$40'],
            ['All other countries', 'Calculated at checkout'],
          ].map(([dest, cost], i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0ece6' }}>
              <td style={{ padding: '14px 0', color: 'var(--color-charcoal)' }}>{dest}</td>
              <td style={{ padding: '14px 0', color: 'var(--color-charcoal)', fontWeight: 500, textAlign: 'right' }}>{cost}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px solid #e8e4de', paddingTop: '32px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.8 }}>
          Questions about your shipment? Email <a href="mailto:support@solomonlawrence.com" style={{ color: 'var(--color-charcoal)', textDecoration: 'underline' }}>support@solomonlawrence.com</a> or visit our <a href="/contact" style={{ color: 'var(--color-charcoal)', textDecoration: 'underline' }}>Contact Us</a> page.
        </p>
      </div>
    </div>
  )
}