// Save as: src/components/cms-fallbacks/terms.tsx
export default function TermsFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      {[
        { t: '1. Acceptance of Terms', b: 'By using the Solomon & Sage website and services, you agree to these Terms of Service. If you do not agree, please do not use our website.' },
        { t: '2. Use of the Website', b: 'You may use our website for lawful purposes only. You agree not to engage in any activity that is harmful, fraudulent, or that violates applicable laws.' },
        { t: '3. Product Availability & Pricing', b: 'We strive to keep product listings accurate, but availability and pricing are subject to change. We reserve the right to limit quantities or cancel orders.' },
        { t: '4. Orders & Payment', b: 'All orders are subject to availability and acceptance. Payment must be received in full before an order ships.' },
        { t: '5. Intellectual Property', b: 'All content on this website — text, images, logos, and software — is the property of Solomon & Sage Group LLC and is protected by copyright and trademark law.' },
        { t: '6. Governing Law', b: 'These terms are governed by the laws of the State of California, without regard to conflict of law provisions.' },
        { t: '7. Contact', b: 'For questions about these terms, email legal@solomonandsage.com.' },
      ].map((s, i, arr) => (
        <div key={i} style={{ paddingBottom: '28px', marginBottom: '28px', borderBottom: i < arr.length - 1 ? '1px solid #f0ece6' : 'none' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '10px' }}>{s.t}</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.9 }}>{s.b}</p>
        </div>
      ))}
    </div>
  )
}