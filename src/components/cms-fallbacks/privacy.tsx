// Save as: src/components/cms-fallbacks/privacy.tsx
export default function PrivacyFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      {[
        { t: '1. Information We Collect', b: 'We collect information you provide when you create an account, place an order, or contact us — including your name, email address, postal address, phone number, and payment information. We also automatically collect browser type, pages visited, and IP address.' },
        { t: '2. How We Use Your Information', b: 'We use your information to process and fulfill orders, send shipping updates and order confirmations, respond to inquiries, send promotional communications with your consent, and improve our website and services.' },
        { t: '3. Sharing Your Information', b: 'We do not sell your personal information. We share it only with service providers who help us operate (shipping carriers, payment processors), retail partners such as Nordstrom, Macy\'s, and Kohl\'s, and as required by law.' },
        { t: '4. Data Security', b: 'We use SSL encryption on all payment transactions and implement technical safeguards to protect your data from unauthorized access, alteration, or disclosure.' },
        { t: '5. Your Rights', b: 'You may access, update, or delete your personal information at any time by logging into your account or contacting us at privacy@solomonlawrence.com. California residents have additional rights under the CCPA.' },
        { t: '6. Contact', b: 'Questions about this policy? Email privacy@solomonlawrence.com or write to Solomon & Sage Group LLC, Los Angeles, California.' },
      ].map((s, i, arr) => (
        <div key={i} style={{ paddingBottom: '28px', marginBottom: '28px', borderBottom: i < arr.length - 1 ? '1px solid #f0ece6' : 'none' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '10px' }}>{s.t}</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.9 }}>{s.b}</p>
        </div>
      ))}
    </div>
  )
}