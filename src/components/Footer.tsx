'use client'

import Link from 'next/link'
import { Share2, Globe, Mail, Rss, AtSign } from 'lucide-react'
import { useState, useEffect } from 'react'

const DEFAULTS = {
  columns: [
    {
      id: '1', heading: 'Your Order',
      links: [
        { id: '1', label: 'Track Order', href: '/track' },
        { id: '2', label: 'Shipping & Delivery', href: '/shipping' },
        { id: '3', label: 'Returns & Exchanges', href: '/returns' },
        { id: '4', label: 'Size Guide', href: '/size-guide' },
        { id: '5', label: 'FAQ', href: '/faq' },
      ]
    },
    {
      id: '2', heading: 'Help & Info',
      links: [
        { id: '6', label: 'Contact Us', href: '/contact' },
        { id: '7', label: 'About Us', href: '/about' },
        { id: '8', label: 'Job Opportunities', href: '/jobs' },
        { id: '9', label: 'Affiliate Program', href: '/affiliate' },
        { id: '10', label: 'Gift Cards', href: '/gift-cards' },
      ]
    },
    {
      id: '3', heading: 'About Solomon & Sage',
      links: [
        { id: '11', label: 'Our Story', href: '/about' },
        { id: '12', label: 'Sustainability', href: '/sustainability' },
        { id: '13', label: 'Press', href: '/press' },
        { id: '14', label: 'Influencers', href: '/influencers' },
      ]
    },
    {
      id: '4', heading: 'Retailers',
      links: [
        { id: '15', label: 'Nordstrom', href: 'https://www.nordstrom.com', openInNewTab: true },
        { id: '16', label: "Macy's", href: 'https://www.macys.com', openInNewTab: true },
        { id: '17', label: "Kohl's", href: 'https://www.kohls.com', openInNewTab: true },
        { id: '18', label: 'JCPenney', href: 'https://www.jcpenney.com', openInNewTab: true },
        { id: '19', label: 'Find a Store', href: '/stores' },
      ]
    },
  ],
  social: {
    instagram: 'https://instagram.com/solomonandsage',
    facebook: 'https://facebook.com/solomonandsage',
    pinterest: 'https://pinterest.com/solomonandsage',
    youtube: '',
  },
  bottomLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'CA Privacy Rights', href: '/ca-privacy' },
  ]
}

export default function Footer() {
  const [columns, setColumns] = useState(DEFAULTS.columns)
  const [social, setSocial] = useState(DEFAULTS.social)
  const [bottomLinks, setBottomLinks] = useState(DEFAULTS.bottomLinks)
  const [newsletterEmail, setNewsletterEmail] = useState('')
const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

const handleNewsletter = async () => {
  if (!newsletterEmail || !newsletterEmail.includes('@')) return
  setNewsletterStatus('loading')
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newsletterEmail, source: 'footer' }),
    })
    const d = await res.json()
    if (d.success) {
      setNewsletterStatus('success')
      setNewsletterEmail('')
    } else {
      setNewsletterStatus('error')
    }
  } catch {
    setNewsletterStatus('error')
  }
}

  useEffect(() => {
    fetch('/api/admin/footer')
      .then(r => r.json())
      .then(d => {
        if (d.columns?.length) setColumns(d.columns)
        if (d.settings?.social_links) setSocial({ ...DEFAULTS.social, ...d.settings.social_links })
        if (d.settings?.bottom_links?.length) setBottomLinks(d.settings.bottom_links)
      })
      .catch(() => {})
  }, [])

  const socialIcons = [
    { Icon: AtSign, href: social.instagram, label: 'Instagram' },
    { Icon: Globe, href: social.facebook, label: 'Facebook' },
    { Icon: Share2, href: social.pinterest, label: 'Pinterest' },
    { Icon: Rss, href: social.youtube, label: 'YouTube' },
  ].filter(s => s.href)

  return (
    <footer style={{ background: 'var(--color-charcoal)', color: '#fff', paddingTop: 'clamp(40px, 6vw, 72px)' }}>
      <div className="max-container" style={{ padding: '0 clamp(16px, 3vw, 32px)' }}>

        {/* Top section — brand + email signup */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '24px', paddingBottom: '40px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          marginBottom: '40px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 400, letterSpacing: '0.2em', color: '#fff', lineHeight: 1.1 }}>
              Solomon & Sage
            </div>
            {/* <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', marginTop: '4px', textTransform: 'uppercase' }}>
              GROUP
            </div> */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
              {socialIcons.map(({ Icon, href, label }) => (
                <Link key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                  className="footer-social">
                  <Icon size={18} strokeWidth={1.5} />
                </Link>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: '380px', width: '100%' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: '6px' }}>
              Sign Up for Email
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em', lineHeight: 1.6, marginBottom: '14px' }}>
              Get exclusive access to new arrivals, special offers, and insider news.
            </p>
            <div style={{ display: 'flex' }}>
             {newsletterStatus === 'success' ? (
  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', padding: '10px 0', fontStyle: 'italic' }}>
    ✓ You're subscribed!
  </p>
) : (
  <>
    <input
      type="email"
      value={newsletterEmail}
      onChange={e => setNewsletterEmail(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && handleNewsletter()}
      placeholder="Your email address"
      style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRight: 'none', color: '#fff', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.04em' }}
    />
    <button
      onClick={handleNewsletter}
      disabled={newsletterStatus === 'loading'}
      style={{ padding: '10px 18px', background: '#fff', color: 'var(--color-charcoal)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap', opacity: newsletterStatus === 'loading' ? 0.7 : 1 }}>
      {newsletterStatus === 'loading' ? '...' : 'Submit'}
    </button>
  </>
)}
{newsletterStatus === 'error' && (
  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#e05252', marginTop: '6px' }}>
    Something went wrong. Please try again.
  </p>
)}
            </div>
            <p style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
              By signing up you agree to receive marketing emails. See our{' '}
              <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'clamp(24px, 3vw, 48px)', paddingBottom: '48px' }}>
          {columns.map(col => (
            <div key={col.id}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: '16px' }}>
                {col.heading}
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0 }}>
                {col.links.map((link: any) => (
                  <li key={link.id}>
                    <Link
                      href={link.href || '#'}
                      target={link.openInNewTab ? '_blank' : undefined}
                      rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                      style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
                      className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', margin: 0 }}>
            © {new Date().getFullYear()} Solomon & Sage Group LLC. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {bottomLinks.map((link: any) => (
              <Link key={link.label} href={link.href || '#'}
                style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', letterSpacing: '0.04em' }}
                className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: rgba(255,255,255,0.85) !important; }
        .footer-social:hover { color: #fff !important; }
      `}</style>
    </footer>
  )
}