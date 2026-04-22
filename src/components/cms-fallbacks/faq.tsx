// Save as: src/components/cms-fallbacks/faq.tsx
const FAQS = [
  { section: 'Orders & Payment', items: [
    { q: 'How do I track my order?', a: "You'll receive a shipping confirmation email with a tracking link once your order ships. You can also track your order at any time from the Track Order page." },
    { q: 'Can I modify or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placement. Contact us immediately at support@solomonandsage.com — after 1 hour your order enters fulfillment and cannot be changed.' },
    { q: 'What payment methods do you accept?', a: 'Visa, Mastercard, American Express, PayPal, and Afterpay. All payments are SSL encrypted.' },
  ]},
  { section: 'Shipping', items: [
    { q: 'How long does shipping take?', a: 'Standard shipping takes 5–7 business days. Express takes 2–3 business days. Overnight delivers the next business day for orders placed before 12pm PST.' },
    { q: 'Is there free shipping?', a: 'Yes — free standard shipping on all orders in the USA .' },
    { q: 'Do you ship internationally?', a: 'Yes, we ship to over 50 countries. ' },
  ]},
  { section: 'Returns', items: [
    { q: 'What is your return policy?', a: 'Free returns within 30 days of delivery on unworn, unwashed items with original tags.' },
    { q: 'How long does a refund take?', a: 'Refunds are processed within 5–7 business days after we receive your return.' },
    { q: 'Can I exchange for a different size?', a: 'Yes — return your item and place a new order. This gives you the fastest turnaround.' },
  ]},
  { section: 'Products & Fit', items: [
    { q: 'How do I find my size?', a: 'Check the Size Guide on each product page or visit our Size Guide for detailed measurements.' },
    { q: 'Are your products sustainable?', a: "Sustainability is important to us. We work with certified ethical factories and are working toward 100% eco-friendly packaging by 2026." },
  ]},
]

export default function FaqFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      {FAQS.map((section, si) => (
        <div key={si} style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontStyle: 'italic', fontWeight: 400, color: 'var(--color-charcoal)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e8e4de' }}>
            {section.section}
          </h2>
          {section.items.map((item, ii) => (
            <details key={ii} style={{ borderBottom: '1px solid #f0ece6' }}>
              <summary style={{ padding: '15px 0', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-charcoal)', fontWeight: 500, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item.q}
                <span style={{ fontSize: '18px', fontWeight: 300, marginLeft: '16px', flexShrink: 0, color: 'var(--color-mid)' }}>+</span>
              </summary>
              <p style={{ padding: '0 0 15px', margin: 0, fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.8 }}>{item.a}</p>
            </details>
          ))}
        </div>
      ))}
    </div>
  )
}