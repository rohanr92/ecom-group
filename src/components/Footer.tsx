'use client'

import Link from 'next/link'
import { Share2, Globe, Mail, Rss, AtSign } from 'lucide-react'

const footerLinks = {
  'Your Order': ['Track Order', 'Shipping & Delivery', 'Returns & Exchanges', 'Size Guide', 'FAQ'],
  'Help & Info': ['Contact Us', 'About Us', 'Job Opportunities', 'Affiliate Program', 'Gift Cards'],
  'About Solomon Lawrence': ['Our Story', 'Sustainability', 'Press', 'Free People King', 'Influencers'],
  'Retailers': ["Nordstrom", "Macy's", "Kohl's", "JCPenney", 'Find a Store'],
}

const socialLinks = [
  { Icon: AtSign,  href: '#', label: 'Instagram' },
  { Icon: Globe,   href: '#', label: 'Facebook' },
  { Icon: Share2,  href: '#', label: 'Pinterest' },
  { Icon: Rss,     href: '#', label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-charcoal)', color: '#fff', paddingTop: 'clamp(40px, 6vw, 72px)' }}>
      <div className="max-container" style={{ padding: '0 clamp(16px, 3vw, 32px)' }}>

        <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '24px',
          paddingBottom: '40px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          marginBottom: '40px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 400, letterSpacing: '0.2em', color: '#fff', lineHeight: 1.1 }}>
              SOLOMON LAWRENCE
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', marginTop: '4px', textTransform: 'uppercase' }}>
              GROUP
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
              {socialLinks.map(({ Icon, href, label }) => (
                <Link key={label} href={href} aria-label={label} style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }} className="footer-social">
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
              <input type="email" placeholder="Your email address" style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRight: 'none', color: '#fff', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.04em' }} />
              <button style={{ padding: '10px 18px', background: '#fff', color: 'var(--color-charcoal)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Submit
              </button>
            </div>
            <p style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
              By signing up you agree to receive marketing emails. See our Privacy Policy.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'clamp(24px, 3vw, 48px)', paddingBottom: '48px' }}>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: '16px' }}>
                {heading}
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0 }}>
                {links.map(link => (
                  <li key={link}>
                    <Link href="#" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }} className="footer-link">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', margin: 0 }}>
            © {new Date().getFullYear()} Solomon Lawrence Group LLC. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {['Privacy Policy', 'Terms of Service', 'Accessibility', 'CA Privacy Rights'].map(t => (
              <Link key={t} href="#" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', letterSpacing: '0.04em' }}>
                {t}
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