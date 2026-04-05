'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, Heart, ShoppingBag, X, Menu, MapPin, Mail, CreditCard, User, ChevronDown } from 'lucide-react'
import { useCart } from '@/components/CartContext'

// Fallback hardcoded data (used until DB loads)
const FALLBACK_WOMEN = ['New', 'Best Sellers', 'Clothing', 'Dresses', 'Tops', 'Jeans', 'Shoes', 'Accessories', 'Sale']
const FALLBACK_MEN   = ['New', 'Best Sellers', 'Clothing', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Sale']

export default function Navbar() {
  const [activeTab, setActiveTab] = useState<'women' | 'men'>('women')
  const { totalCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [navItems, setNavItems] = useState<any[]>([])

  const currencies = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
    { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka' },
  ]

  // Fetch nav from DB
  useEffect(() => {
    fetch(`/api/admin/nav?tab=${activeTab}`)
      .then(r => r.json())
      .then(d => { if (d.items?.length) setNavItems(d.items) })
      .catch(() => {})
  }, [activeTab])

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [itemOffset, setItemOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const dressesRef = useRef<HTMLDivElement>(null)

  // Use DB items or fallback
  const navLinks = navItems.length > 0
    ? navItems.map(i => i.label)
    : (activeTab === 'women' ? FALLBACK_WOMEN : FALLBACK_MEN)

  // Get mega menu from DB items
  const getMegaMenu = (label: string) => {
    const item = navItems.find(i => i.label === label)
    if (!item || !item.sections || item.sections.length === 0) return null
    return {
      sections: item.sections.map((s: any) => ({
        heading: s.heading,
        links: s.links.map((l: any) => ({ label: l.label, href: l.href })),
      })),
      featured: item.featured ?? null,
    }
  }

  // Get nav item href from DB
  const getNavHref = (label: string) => {
    const item = navItems.find(i => i.label === label)
    if (item?.href) return item.href
    // fallback
    if (label === 'New') return '/collections/new-arrivals'
    if (label === 'Best Sellers') return '/collections/best-sellers'
    if (label === 'Sale') return '/collections/sale'
    return `/collections?category=${label}`
  }

  const rightItems = ['Jeans', 'Shoes', 'Accessories', 'Sale']

  const openMenu = (item: string) => {
    if (timer.current) clearTimeout(timer.current)
    setActiveMenu(item)
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      if (rightItems.includes(item) && dressesRef.current) {
        const dressesRect = dressesRef.current.getBoundingClientRect()
        setItemOffset(dressesRect.left - containerRect.left)
      } else {
        setItemOffset(0)
      }
    }
  }
  const closeMenu = () => { timer.current = setTimeout(() => setActiveMenu(null), 120) }
  const stayOpen = () => { if (timer.current) clearTimeout(timer.current) }

  const activeMega = activeMenu ? getMegaMenu(activeMenu) : null

  return (
    <>
      {/* BAR 1: Promo */}
      <div style={{ background: '#e8f0e8', borderBottom: '1px solid #d4e0d4', padding: '10px 0' }}>
        <div className="max-container" style={{ padding: '0 clamp(16px,3vw,40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(13px,1.5vw,18px)', fontStyle: 'italic', color: '#2a4a2a', whiteSpace: 'nowrap', flexShrink: 0 }}>Spring is here!</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(18px,3vw,36px)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>GET $50</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(11px,1.2vw,14px)', color: '#2a2a2a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>TOWARD A FUTURE PURCHASE</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(13px,1.8vw,22px)', fontWeight: 700, color: '#1a1a1a' }}>WHEN YOU SPEND $150</span>
          </div>
          <Link href="/collections/new-arrivals" className="promo-btn">SHOP NEW ARRIVALS</Link>
        </div>
      </div>

      {/* BAR 2: Utility */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ede9e3', padding: '7px 0' }} className="utility-bar">
        <div className="max-container" style={{ padding: '0 clamp(16px,3vw,40px)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'clamp(12px,2vw,28px)' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setCurrencyOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#3a3a3a', letterSpacing: '0.03em', padding: '2px 0' }}
              className="utility-link">
              <span style={{ fontSize: '13px' }}>🌐</span>
              <span>{currency} ({currencies.find(c => c.code === currency)?.symbol})</span>
              <ChevronDown size={11} strokeWidth={1.5} style={{ transform: currencyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {currencyOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: '#fff', border: '1px solid #e8e4de', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 200, minWidth: '180px', padding: '6px 0' }}>
                {currencies.map(c => (
                  <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencyOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 16px', background: c.code === currency ? '#f8f6f1' : 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', letterSpacing: '0.03em', textAlign: 'left' }}
                    className="currency-option">
                    <span>{c.code} — {c.label}</span>
                    <span style={{ color: '#888', marginLeft: '8px' }}>{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {([
            { icon: <Mail size={13} strokeWidth={1.5} />, label: 'Sign Up For Email', href: '/email-signup' },
            { icon: <CreditCard size={13} strokeWidth={1.5} />, label: 'Gift Cards', href: '/gift-cards' },
            { icon: <MapPin size={13} strokeWidth={1.5} />, label: 'Stores', href: '/stores' },
            { icon: <User size={13} strokeWidth={1.5} />, label: 'Sign In / Sign Up', href: '/account' },
          ] as { icon: React.ReactNode, label: string, href: string }[]).map(({ icon, label, href }) => (
            <Link key={label} href={href} className="utility-link" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#3a3a3a', textDecoration: 'none', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
              {icon}<span>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* BAR 3: Logo + Search */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ede9e3' }}>
        <div className="max-container" style={{ padding: '0 clamp(16px,3vw,40px)', display: 'flex', alignItems: 'stretch', minHeight: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', marginRight: '8px' }}>
            <button onClick={() => setActiveTab('women')} style={{ background: 'none', border: 'none', borderBottom: activeTab === 'women' ? '3px solid #c0392b' : '3px solid transparent', cursor: 'pointer', padding: '0 20px 0 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,2.8vw,32px)', fontWeight: 400, letterSpacing: '0.08em', color: 'var(--color-charcoal)', whiteSpace: 'nowrap' }}>SOLOMON LAWRENCE</span>
            </button>
            <div style={{ width: '1px', background: '#ddd', margin: '14px 0' }} />
            <button onClick={() => setActiveTab('men')} style={{ background: 'none', border: 'none', borderBottom: activeTab === 'men' ? '3px solid #c0392b' : '3px solid transparent', cursor: 'pointer', padding: '0 0 0 20px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px,2vw,22px)', fontStyle: 'italic', fontWeight: 300, color: activeTab === 'men' ? 'var(--color-charcoal)' : '#aaa', whiteSpace: 'nowrap' }}>for men</span>
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <div className="search-bar-desktop" style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '2px', padding: '0 12px', margin: '12px 0', minWidth: 'clamp(140px,20vw,260px)', gap: '8px', background: '#fafafa' }}>
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="What are you looking for..." style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#555', outline: 'none' }} />
            <Search size={15} strokeWidth={1.5} style={{ color: '#888', flexShrink: 0 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
            <Link href="/wishlist" className="icon-link" style={{ padding: '8px', display: 'flex', alignItems: 'center', color: 'var(--color-charcoal)' }}><Heart size={20} strokeWidth={1.5} /></Link>
            <Link href="/cart" className="icon-link" style={{ padding: '8px', display: 'flex', alignItems: 'center', color: 'var(--color-charcoal)', position: 'relative' }}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalCount > 0 && <span style={{ position: 'absolute', top: '4px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--color-charcoal)', color: '#fff', fontSize: '9px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalCount > 99 ? '99+' : totalCount}</span>}
            </Link>
            <button onClick={() => setMobileOpen(true)} className="mobile-menu-btn" style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'none' }} aria-label="Menu">
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* BAR 4: Nav + Mega menu */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ede9e3', position: 'relative', zIndex: 50 }} className="desktop-nav" onMouseLeave={closeMenu}>
        <div className="max-container" style={{ padding: '0 clamp(16px,3vw,40px)', position: 'relative' }}>
          <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,2vw,32px)', height: '44px', overflowX: 'auto' }}>
            {navLinks.map(link => (
              <div key={link}
                onMouseEnter={() => getMegaMenu(link) ? openMenu(link) : setActiveMenu(null)}
                ref={link === 'Dresses' ? dressesRef : undefined}
                style={{ height: '44px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <Link
                  href={getNavHref(link)}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 400,
                    letterSpacing: '0.04em', whiteSpace: 'nowrap', textDecoration: 'none',
                    color: (navItems.find(i => i.label === link)?.isSale || link === 'Sale') ? '#c0392b' : 'var(--color-charcoal)',
                    borderBottom: activeMenu === link ? '2px solid var(--color-charcoal)' : '2px solid transparent',
                    height: '44px', display: 'inline-flex', alignItems: 'center',
                  }}>
                  {link}
                </Link>
              </div>
            ))}
          </div>

          {/* Mega panel */}
          {activeMenu && activeMega && (
            <div onMouseEnter={stayOpen} onMouseLeave={closeMenu}
              style={{ position: 'absolute', top: '100%', left: itemOffset, background: '#fff', border: '1px solid #e8e4de', borderTop: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 100, padding: '28px 32px', display: 'inline-flex', alignItems: 'flex-start', gap: 0 }}>
              <div style={{ display: 'flex', gap: 0 }}>
                {activeMega.sections.map((section: any, i: number) => (
                  <div key={i} style={{ width: '175px', paddingRight: '24px', marginRight: i < activeMega.sections.length - 1 ? '24px' : 0, borderRight: i < activeMega.sections.length - 1 ? '1px solid #f0ece6' : 'none' }}>
                    {section.heading && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '14px' }}>
                        {section.heading}
                      </div>
                    )}
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {section.links.map((l: any) => (
                        <li key={l.label}>
                          <Link href={l.href} className="mega-link"
                            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#444', textDecoration: 'none', letterSpacing: '0.02em', lineHeight: 1.4 }}>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {activeMega.featured && (
                <div style={{ flexShrink: 0, width: '170px', marginLeft: '32px' }}>
                  <Link href={activeMega.featured.href} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ overflow: 'hidden', marginBottom: '10px' }}>
                      <img src={activeMega.featured.image} alt={activeMega.featured.label}
                        style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} className="mega-img" />
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', textDecoration: 'underline', letterSpacing: '0.03em' }}>
                      {activeMega.featured.label}
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#fff', overflowY: 'auto' }}>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.1em' }}>SOLOMON LAWRENCE</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} strokeWidth={1.5} /></button>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '14px' }}>
              {(['women', 'men'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: activeTab === t ? 600 : 400, borderBottom: activeTab === t ? '2px solid #1a1a1a' : '2px solid transparent', paddingBottom: '6px' }}>
                  {t === 'women' ? 'Women' : 'Men'}
                </button>
              ))}
            </div>
            <nav>
              {navLinks.map(link => {
                const mega = getMegaMenu(link)
                return (
                  <div key={link} style={{ borderBottom: '1px solid #f0ece6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                      <Link href={getNavHref(link)} onClick={() => setMobileOpen(false)}
                        style={{ fontFamily: 'var(--font-body)', fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', color: (navItems.find(i => i.label === link)?.isSale || link === 'Sale') ? '#c0392b' : '#1a1a1a' }}>
                        {link}
                      </Link>
                      {mega && (
                        <button onClick={() => setMobileExpanded(mobileExpanded === link ? null : link)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#555', padding: '4px' }}>
                          <ChevronDown size={16} strokeWidth={1.5} style={{ transform: mobileExpanded === link ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                      )}
                    </div>
                    {mobileExpanded === link && mega && (
                      <div style={{ paddingBottom: '14px', paddingLeft: '12px' }}>
                        {mega.sections.map((section: any, i: number) => (
                          <div key={i} style={{ marginBottom: '12px' }}>
                            {section.heading && <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>{section.heading}</div>}
                            {section.links.map((l: any) => (
                              <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                                style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#444', textDecoration: 'none', padding: '5px 0' }}>
                                {l.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      <style>{`
        .utility-link:hover { color: #000 !important; text-decoration: underline; }
        .icon-link:hover { opacity: 0.6; }
        .mega-link:hover { color: #000 !important; text-decoration: underline; }
        .currency-option:hover { background: #f8f6f1 !important; }
        .mega-img:hover { transform: scale(1.04); }
        @media (max-width: 768px) {
          .search-bar-desktop { display: none !important; }
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .utility-bar { display: none !important; }
        }
      `}</style>
    </>
  )
}