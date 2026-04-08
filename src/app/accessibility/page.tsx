import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Accessibility', alternates: { canonical: 'https://solomonandsage.com/accessibility' } }

// Save as: src/app/accessibility/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <div style={{ background: 'var(--color-cream)', borderBottom: '1px solid #e8e4de', padding: '48px 0 40px' }}>
          <div className="max-container" style={{ padding: '0 clamp(16px,4vw,60px)', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-charcoal)', margin: 0 }}>Accessibility</h1>
          </div>
        </div>
        <div className="max-container" style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,60px)', maxWidth: '800px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '36px' }}>
            Solomon & Sage Group LLC is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying relevant accessibility standards.
          </p>
          {[
            { title: 'Conformance Status', body: 'We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content accessible to people with disabilities.' },
            { title: 'Measures We Take', body: 'We include accessibility as part of our mission. Our team regularly audits our website, trains staff on accessibility requirements, and uses assistive technologies to evaluate our digital content.' },
            { title: 'Known Limitations', body: 'While we strive for full accessibility, some legacy content and third-party integrations may not yet meet all standards. We are actively working to address these areas.' },
            { title: 'Contact Us', body: 'If you experience any accessibility barriers on our website, please contact us at accessibility@solomonlawrence.com. We\'ll respond within 2 business days and work to provide the information you need in an accessible format.' },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: '32px' }}>
              <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>{s.title}</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.9 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}