'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, Heart, ShoppingBag, X, Menu, MapPin, Mail, CreditCard, User, ChevronDown } from 'lucide-react'
import { useCart } from '@/components/CartContext'
import { useRouter } from 'next/navigation'

const FALLBACK_WOMEN = ['New', 'Best Sellers', 'Clothing', 'Dresses', 'Tops', 'Jeans', 'Accessories', 'Sale']
const FALLBACK_MEN   = ['New', 'Best Sellers', 'Clothing', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Sale']

const CURRENCIES = [
  { code: 'USD', symbol: '$',   label: 'US Dollar' },
  { code: 'EUR', symbol: '€',   label: 'Euro' },
  { code: 'GBP', symbol: '£',   label: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥',   label: 'Japanese Yen' },
  { code: 'BDT', symbol: '৳',   label: 'Bangladeshi Taka' },
]

export const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36,
  AUD: 1.53, JPY: 149.5, BDT: 110.5,
}

export default function Navbar() {
  const router = useRouter()
  const [activeTab,      setActiveTab]      = useState<'women' | 'men'>('women')
  const { totalCount }                      = useCart()
  const [mobileOpen,     setMobileOpen]     = useState(false)
  const [searchVal,      setSearchVal]      = useState('')
  const [searchResults,  setSearchResults]  = useState<any[]>([])
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [searchLoading,  setSearchLoading]  = useState(false)
  const [activeMenu,     setActiveMenu]     = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [currency,       setCurrency]       = useState('USD')
  const [currencyOpen,   setCurrencyOpen]   = useState(false)
  const [navItems,       setNavItems]       = useState<any[]>([])
  const searchRef    = useRef<HTMLDivElement>(null)
  const timer        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
const [itemOffset, setItemOffset] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('sl_currency')
    if (saved && RATES[saved]) setCurrency(saved)
  }, [])

  const handleCurrencyChange = (code: string) => {
    setCurrency(code)
    localStorage.setItem('sl_currency', code)
    setCurrencyOpen(false)
    window.dispatchEvent(new CustomEvent('currencyChange', {
      detail: { code, rate: RATES[code], symbol: CURRENCIES.find(c => c.code === code)?.symbol ?? '$' }
    }))
  }

  useEffect(() => {
    fetch(`/api/admin/nav?tab=${activeTab}`)
      .then(r => r.json())
      .then(d => { if (d.items?.length) setNavItems(d.items) })
      .catch(() => {})
  }, [activeTab])

  useEffect(() => {
    if (!searchVal.trim()) { setSearchResults([]); setSearchOpen(false); return }
    setSearchLoading(true)
    const t = setTimeout(() => {
      fetch(`/api/admin/products?search=${encodeURIComponent(searchVal)}&limit=6`)
        .then(r => r.json())
        .then(d => { setSearchResults(d.products ?? []); setSearchOpen(true) })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [searchVal])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navLinks = navItems.length > 0
    ? navItems.map(i => i.label)
    : (activeTab === 'women' ? FALLBACK_WOMEN : FALLBACK_MEN)

  const getMegaMenu = (label: string) => {
    const item = navItems.find(i => i.label === label)
    if (!item?.sections?.length) return null
    return {
      sections: item.sections.map((s: any) => ({ heading: s.heading, links: s.links.map((l: any) => ({ label: l.label, href: l.href })) })),
      featured: item.featured ?? null,
    }
  }

  const getNavHref = (label: string) => {
    const item = navItems.find(i => i.label === label)
    if (item?.href) return item.href
    if (label === 'New') return '/collections/new-arrivals'
    if (label === 'Best Sellers') return '/collections/best-sellers'
    if (label === 'Sale') return '/collections/sale'
    return `/collections?category=${label}`
  }

const rightItems = ['Jeans', 'Accessories', 'Mens']
const openMenu = (item: string) => {
  if (timer.current) clearTimeout(timer.current)
  setActiveMenu(item)
  if (containerRef.current) {
    const cr = containerRef.current.getBoundingClientRect()
    if (item === 'Sale' && navItemRefs.current['Jeans']) {
      setItemOffset(navItemRefs.current['Jeans']!.getBoundingClientRect().left - cr.left)
    } else if (rightItems.includes(item) && navItemRefs.current['Dresses']) {
      setItemOffset(navItemRefs.current['Dresses']!.getBoundingClientRect().left - cr.left)
    } else setItemOffset(0)
  }
}
  const closeMenu = () => { timer.current = setTimeout(() => setActiveMenu(null), 120) }
  const stayOpen  = () => { if (timer.current) clearTimeout(timer.current) }
  const activeMega = activeMenu ? getMegaMenu(activeMenu) : null
  const curObj = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0]

  return (
    <>
      {/* BAR 1: Promo */}
      <div style={{ background: '#e8f0e8', borderBottom: '1px solid #d4e0d4', padding: '10px 0' }}>
        <div className="max-container" style={{ padding: '0 clamp(16px,3vw,40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(13px,1.5vw,18px)', fontStyle: 'italic', color: '#2a4a2a', whiteSpace: 'nowrap', flexShrink: 0 }} className="promo-left">Spring is here!</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(12px,1.8vw,22px)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>FREE SHIPPING</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(10px,1.2vw,14px)', color: '#2a2a2a', letterSpacing: '0.06em', textTransform: 'uppercase' }} className="promo-mid-text">FOR YOUR EVERY PURCHASE</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(12px,1.8vw,22px)', fontWeight: 700, color: '#1a1a1a' }}>WHEN YOU SPEND $150</span>
          </div>
          <Link href="/collections/new-arrivals" className="promo-btn" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>SHOP NEW ARRIVALS</Link>
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
              <span>{currency} ({curObj.symbol})</span>
              <ChevronDown size={11} strokeWidth={1.5} style={{ transform: currencyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {currencyOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: '#fff', border: '1px solid #e8e4de', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 200, minWidth: '200px', padding: '6px 0' }}>
                {CURRENCIES.map(c => (
                  <button key={c.code} onClick={() => handleCurrencyChange(c.code)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 16px', background: c.code === currency ? '#f8f6f1' : 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', textAlign: 'left' }}>
                    <span>{c.code} — {c.label}</span>
                    <span style={{ color: '#888', marginLeft: '8px' }}>{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {([
            { icon: <Mail size={13} strokeWidth={1.5} />, label: 'Sign Up For Email', href: 'mailto:support@solomongroupllc.com' },
            { icon: <CreditCard size={13} strokeWidth={1.5} />, label: 'Gift Cards', href: '/contact' },
            { icon: <MapPin size={13} strokeWidth={1.5} />, label: 'Stores', href: '/contact' },
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
       <div className="max-container" style={{ padding: '0 clamp(8px,3vw,20px)', display: 'flex', alignItems: 'center', minHeight: '64px', gap: 'clamp(4px,2vw,12px)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0, marginRight: '8px' }}>
           <img
  src="https://d3o8u8o2i2q94t.cloudfront.net/products/1776112843934-logo-01.png"
  alt="Solomon & Sage"
  className="site-logo"
  style={{ height: 'clamp(32px, 7vw, 66px)', width: 'auto', display: 'block', maxWidth: '100%' }}
/>
          </Link>

        <div className="search-spacer" style={{ flex: 1 }} />

          {/* Search */}
          <div ref={searchRef} className="search-bar-desktop" style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '2px', padding: '0 12px', margin: '12px 0', minWidth: 'clamp(140px,20vw,280px)', gap: '8px', background: '#fafafa' }}>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && searchVal.trim()) { router.push(`/collections?search=${encodeURIComponent(searchVal)}`); setSearchOpen(false); setSearchVal('') } }}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              placeholder="What are you looking for..."
              style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#555', outline: 'none', padding: '10px 0' }}
            />
            {searchVal
              ? <button onClick={() => { setSearchVal(''); setSearchResults([]); setSearchOpen(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={13} strokeWidth={1.5} style={{ color: '#888' }} /></button>
              : <Search size={15} strokeWidth={1.5} style={{ color: '#888', flexShrink: 0 }} />
            }
            {searchOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e8e4de', borderTop: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 300, maxHeight: '400px', overflowY: 'auto' }}>
                {searchLoading ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#999' }}>Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#999' }}>No products found for "{searchVal}"</div>
                ) : (
                  <>
                    {searchResults.map(p => (
                      <Link key={p.id} href={`/products/${p.slug ?? p.id}`}
                        onClick={() => { setSearchOpen(false); setSearchVal('') }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', textDecoration: 'none', borderBottom: '1px solid #f5f5f5' }}
                        className="search-result-item">
                        <div style={{ width: '40px', height: '52px', background: '#f5f5f5', flexShrink: 0, overflow: 'hidden' }}>
                          {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#888', marginTop: '2px' }}>${Number(p.price).toFixed(2)}</div>
                        </div>
                      </Link>
                    ))}
                    <Link href={`/collections?search=${encodeURIComponent(searchVal)}`}
                      onClick={() => { setSearchOpen(false); setSearchVal('') }}
                      style={{ display: 'block', padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', textDecoration: 'none', borderTop: '1px solid #f0ece6', fontWeight: 600 }}
                      className="search-result-item">
                      View all results for "{searchVal}"
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Icons */}
         {/* Icons */}
<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
  {/* Sign In — mobile only */}
  <Link href="/account" aria-label="Account" className="icon-link mobile-only" style={{ padding: '8px', display: 'none', alignItems: 'center', color: 'var(--color-charcoal)' }}>
  <User size={20} strokeWidth={1.5} />
</Link>
  <Link href="/account/wishlist" aria-label="Wishlist" className="icon-link" style={{ padding: '8px', display: 'flex', alignItems: 'center', color: 'var(--color-charcoal)' }}><Heart size={20} strokeWidth={1.5} /></Link>
  <Link href="/cart" aria-label="Shopping cart" className="icon-link" style={{ padding: '8px', display: 'flex', alignItems: 'center', color: 'var(--color-charcoal)', position: 'relative' }}>
    <ShoppingBag size={20} strokeWidth={1.5} />
   <span suppressHydrationWarning style={{ position: 'absolute', top: '4px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--color-charcoal)', color: '#fff', fontSize: '9px', fontWeight: 600, display: totalCount > 0 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>
  {totalCount > 99 ? '99+' : totalCount}
</span>
  </Link>
  <button onClick={() => setMobileOpen(true)} className="mobile-menu-btn" style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'none' }} aria-label="Menu">
    <Menu size={22} strokeWidth={1.5} />
  </button>
</div>
        </div>
      </div>

      {/* BAR 4: Women/Men tabs + Nav links */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ede9e3', position: 'relative', zIndex: 50 }} className="desktop-nav" onMouseLeave={closeMenu}>
        <div className="max-container" style={{ padding: '0 clamp(16px,3vw,40px)', position: 'relative' }}>
          <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', height: '44px' }}>

     
            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px,2vw,30px)', flex: 1, overflowX: 'auto', height: '44px' }}>
             {navLinks.map(link => (
  <div key={link}
    onMouseEnter={() => getMegaMenu(link) ? openMenu(link) : setActiveMenu(null)}
    ref={el => { navItemRefs.current[link] = el }}
    style={{ height: '44px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <Link href={getNavHref(link)}
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
          </div>

          {/* Mega panel */}
          {activeMenu && activeMega && (
            <div onMouseEnter={stayOpen} onMouseLeave={closeMenu}
              style={{ position: 'absolute', top: '100%', left: itemOffset, background: '#fff', border: '1px solid #e8e4de', borderTop: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', zIndex: 100, padding: '28px 32px', display: 'inline-flex', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                {activeMega.sections.map((section: any, i: number) => (
                  <div key={i} style={{ width: '175px', paddingRight: '24px', marginRight: i < activeMega.sections.length - 1 ? '24px' : 0, borderRight: i < activeMega.sections.length - 1 ? '1px solid #f0ece6' : 'none' }}>
                    {section.heading && <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '14px' }}>{section.heading}</div>}
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {section.links.map((l: any) => (
                        <li key={l.label}><Link href={l.href} className="mega-link" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#444', textDecoration: 'none', letterSpacing: '0.02em' }}>{l.label}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {activeMega.featured && (
                <div style={{ flexShrink: 0, width: '170px', marginLeft: '32px' }}>
                  <Link href={activeMega.featured.href} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ overflow: 'hidden', marginBottom: '10px' }}>
                      <img src={activeMega.featured.image} alt={activeMega.featured.label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} className="mega-img" />
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', textDecoration: 'underline', letterSpacing: '0.03em' }}>{activeMega.featured.label}</div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <img src="https://d3o8u8o2i2q94t.cloudfront.net/products/1775557455099-logo-01.png" alt="Solomon & Sage" style={{ height: '32px', width: 'auto' }} />
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} strokeWidth={1.5} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '2px', padding: '8px 12px', marginBottom: '16px', gap: '8px', background: '#fafafa' }}>
              <Search size={14} strokeWidth={1.5} style={{ color: '#888' }} />
              <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && searchVal.trim()) { router.push(`/collections?search=${encodeURIComponent(searchVal)}`); setMobileOpen(false) } }}
                placeholder="Search products..."
                style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#555', outline: 'none' }} />
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
                                style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#444', textDecoration: 'none', padding: '5px 0' }}>{l.label}</Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0ece6' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '10px' }}>Currency</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CURRENCIES.map(c => (
                  <button key={c.code} onClick={() => handleCurrencyChange(c.code)}
                    style={{ padding: '6px 12px', border: `1px solid ${c.code === currency ? '#1a1a1a' : '#ddd'}`, background: c.code === currency ? '#1a1a1a' : '#fff', color: c.code === currency ? '#fff' : '#555', fontFamily: 'var(--font-body)', fontSize: '12px', cursor: 'pointer' }}>
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .utility-link:hover { color: #000 !important; text-decoration: underline; }
        .icon-link:hover { opacity: 0.6; }
        .mega-link:hover { color: #000 !important; text-decoration: underline; }
        .mega-img:hover { transform: scale(1.04); }
        .search-result-item:hover { background: #f8f6f1; }
 @media (max-width: 768px) {
  .search-bar-desktop { display: none !important; }
  .desktop-nav { display: none !important; }
  .mobile-menu-btn { display: flex !important; }
  .utility-bar { display: none !important; }
  .promo-left { display: none !important; }
  .promo-mid-text { display: none !important; }
  .mobile-only { display: flex !important; }
  .search-spacer { flex: 0 !important; }
  .site-logo { max-width: 140px !important; }
  .max-container { justify-content: space-between; }
}
        @media (max-width: 480px) { .promo-btn { display: none !important; } }
      `}</style>
    </>
  )
}