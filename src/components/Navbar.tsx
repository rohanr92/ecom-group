'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Search, Heart, ShoppingBag, X, Menu, MapPin, Mail, CreditCard, User, ChevronDown } from 'lucide-react'
import { useCart } from '@/components/CartContext'

const megaMenus: Record<string, {
  sections: { heading: string; links: string[] }[]
  featured?: { image: string; label: string; href: string }
}> = {
  'New': {
    sections: [
      { heading: 'Shop By Category', links: ['New Arrivals', 'New Clothing', 'New Shoes', 'New Accessories', 'New Beauty'] },
      { heading: 'Shop By Collection', links: ['Spring Edit', 'Resort Collection', 'Vacation Ready', 'Workwear'] },
    ],
    featured: { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80', label: 'Shop New Arrivals', href: '/collections/new-arrivals' },
  },
  'Best Sellers': {
    sections: [
      { heading: 'Shop By Category', links: ['Shop All Best Sellers', 'Best Sellers Lookbook', 'Most Duped', 'Top Rated'] },
      { heading: 'Trending Now', links: ['Dresses', 'Wide Leg Pants', 'Linen Tops', 'Sandals', 'Tote Bags'] },
    ],
    featured: { image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80', label: 'Shop Best Sellers', href: '/collections/best-sellers' },
  },
  'Clothing': {
    sections: [
      { heading: 'Shop By Category', links: ['Shop All Clothing', 'Dresses', 'Tops', 'Sweaters', 'Jackets & Coats', 'Pants', 'Skirts', 'Shorts', 'Sets & Matching'] },
      { heading: 'Shop By Collection', links: ['Spring Collection', 'Resort Wear', 'Work Wear', 'Weekend Casual', 'Loungewear'] },
      { heading: 'Brands We Love', links: ['Free People', 'Reformation', 'Madewell', 'Anthropologie', 'Veronica Beard'] },
    ],
    featured: { image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=400&auto=format&fit=crop&q=80', label: 'Shop Spring Clothing', href: '/collections/clothing' },
  },
  'Dresses': {
    sections: [
      { heading: 'Shop By Category', links: ['Shop All Dresses', 'Mini Dresses', 'Midi Dresses', 'Maxi Dresses', 'Slip Dresses', 'Wrap Dresses', 'Shirt Dresses', 'Floral Dresses'] },
      { heading: 'Shop By Collection', links: ['Wedding Guest', 'Vacation Dresses', 'Work Dresses', 'Going Out', 'Summer Dresses'] },
    ],
    featured: { image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop&q=80', label: 'Shop All Dresses', href: '/collections/dresses' },
  },
  'Tops': {
    sections: [
      { heading: 'Shop By Category', links: ['Shop All Tops', 'T-Shirts', 'Blouses', 'Tank Tops', 'Crop Tops', 'Button-Downs', 'Sweaters', 'Sweatshirts'] },
      { heading: 'Shop By Collection', links: ['Linen Tops', 'Silk Tops', 'Graphic Tees', 'Workwear Tops'] },
    ],
    featured: { image: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&auto=format&fit=crop&q=80', label: 'New Tops', href: '/collections/tops' },
  },
  'Jeans': {
    sections: [
      { heading: 'Shop By Category', links: ['Shop All Jeans', 'New Jeans', 'Top Rated', 'Barrel Jeans', 'Bootcut Jeans', 'Boyfriend Jeans', 'Flare Jeans', 'Wide-Leg Jeans'] },
      { heading: 'Shop By Collection', links: ['Lightweight Denim', 'Statement Jeans', 'White Jeans', 'Long Jeans', 'Petite Jeans'] },
      { heading: 'Brands We Love', links: ['Wrangler', "Levi's", 'Mother', 'RE/DONE', 'AGOLDE'] },
    ],
    featured: { image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&auto=format&fit=crop&q=80', label: 'Shop Statement Jeans', href: '/collections/jeans' },
  },
  'Shoes': {
    sections: [
      { heading: 'Shop By Category', links: ['Shop All Shoes', 'Sandals', 'Heels', 'Sneakers', 'Boots', 'Loafers', 'Flats', 'Wedges'] },
      { heading: 'Shop By Collection', links: ['Spring Shoes', 'Vacation Shoes', 'Work Shoes'] },
    ],
    featured: { image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&auto=format&fit=crop&q=80', label: 'Shop New Shoes', href: '/collections/shoes' },
  },
  'Accessories': {
    sections: [
      { heading: 'Shop By Category', links: ['Shop All Accessories', 'Bags & Handbags', 'Jewelry', 'Sunglasses', 'Hats', 'Scarves', 'Belts'] },
      { heading: 'Shop By Collection', links: ['Summer Accessories', 'Jewelry Trends', 'Bag Edit'] },
    ],
    featured: { image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80', label: 'Shop Accessories', href: '/collections/accessories' },
  },
  'Sale': {
    sections: [
      { heading: 'Shop Sale', links: ['All Sale', 'Sale Clothing', 'Sale Shoes', 'Sale Accessories', 'Under $50', 'Under $100'] },
    ],
    featured: { image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&auto=format&fit=crop&q=80', label: 'Shop All Sale', href: '/collections/sale' },
  },
}

const womenNav = ['New', 'Best Sellers', 'Clothing', 'Dresses', 'Tops', 'Jeans', 'Shoes', 'Accessories', 'Sale']
const menNav = ['New', 'Best Sellers', 'Clothing', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Sale']

export default function Navbar() {
  const [activeTab, setActiveTab] = useState<'women' | 'men'>('women')
  const { totalCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [currencyOpen, setCurrencyOpen] = useState(false)

  const currencies = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
    { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka' },
  ]
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [itemOffset, setItemOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)


  const navLinks = activeTab === 'women' ? womenNav : menNav

  const rightItems = ['Jeans', 'Shoes', 'Accessories', 'Sale']
  const dressesRef = useRef<HTMLDivElement>(null)

  const openMenu = (item: string, e?: React.MouseEvent<HTMLDivElement>) => {
    if (timer.current) clearTimeout(timer.current)
    setActiveMenu(item)
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      if (rightItems.includes(item) && dressesRef.current) {
        // Jeans/Shoes/Accessories/Sale → start from Dresses position
        const dressesRect = dressesRef.current.getBoundingClientRect()
        setItemOffset(dressesRect.left - containerRect.left)
      } else {
        // New/Best Sellers/Clothing/Dresses/Tops → always start from left:0
        setItemOffset(0)
      }
    }
  }
  const closeMenu = () => { timer.current = setTimeout(() => setActiveMenu(null), 120) }
  const stayOpen = () => { if (timer.current) clearTimeout(timer.current) }

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
<Link href="/collections/new-arrivals" className="promo-btn">
            SHOP NEW ARRIVALS
          </Link>
        </div>
      </div>

      {/* BAR 2: Utility */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ede9e3', padding: '7px 0' }} className="utility-bar">
        <div className="max-container" style={{ padding: '0 clamp(16px,3vw,40px)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'clamp(12px,2vw,28px)' }}>

          {/* Currency selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setCurrencyOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#3a3a3a', letterSpacing: '0.03em', padding: '2px 0' }}
              className="utility-link"
            >
              <span style={{ fontSize: '13px' }}>🌐</span>
              <span>{currency} ({currencies.find(c => c.code === currency)?.symbol})</span>
              <ChevronDown size={11} strokeWidth={1.5} style={{ transform: currencyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {currencyOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: '#fff', border: '1px solid #e8e4de', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 200, minWidth: '180px', padding: '6px 0' }}>
                {currencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setCurrencyOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '8px 16px', background: c.code === currency ? '#f8f6f1' : 'none',
                      border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                      fontSize: '12px', color: '#1a1a1a', letterSpacing: '0.03em', textAlign: 'left',
                    }}
                    className="currency-option"
                  >
                    <span>{c.code} — {c.label}</span>
                    <span style={{ color: '#888', marginLeft: '8px' }}>{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Other utility links */}
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

      {/* BAR 4: Nav + Mega menu
          KEY: nav has position:relative, mega has position:absolute top:100% left:0
          This means mega always starts from the LEFT edge of the nav, same as "New" */}
      <nav
        style={{ background: '#fff', borderBottom: '1px solid #ede9e3', position: 'relative', zIndex: 50 }}
        className="desktop-nav"
        onMouseLeave={closeMenu}
      >
        {/* Nav links + mega panel share the same max-container so left edges align */}
        <div className="max-container" style={{ padding: '0 clamp(16px,3vw,40px)', position: 'relative' }}>

          {/* Nav links row */}
          <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,2vw,32px)', height: '44px', overflowX: 'auto' }}>
            {navLinks.map(link => (
              <div
                key={link}
                onMouseEnter={(e) => megaMenus[link] ? openMenu(link, e) : setActiveMenu(null)}
                ref={link === 'Dresses' ? dressesRef : undefined}
                style={{ height: '44px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
              >
                <Link
                  href={`/collections/${link.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 400,
                    letterSpacing: '0.04em', whiteSpace: 'nowrap', textDecoration: 'none',
                    color: link === 'Sale' ? '#c0392b' : 'var(--color-charcoal)',
                    borderBottom: activeMenu === link ? '2px solid var(--color-charcoal)' : '2px solid transparent',
                    height: '44px', display: 'inline-flex', alignItems: 'center',
                  }}
                >
                  {link}
                </Link>
              </div>
            ))}
          </div>

          {/* Mega panel — left:0 is relative to max-container, same left as "New" nav item */}
          {activeMenu && megaMenus[activeMenu] && (
            <div
              onMouseEnter={stayOpen}
              onMouseLeave={closeMenu}
              style={{
                position: 'absolute',
                top: '100%',
                left: itemOffset,
                background: '#fff',
                border: '1px solid #e8e4de',
                borderTop: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                zIndex: 100,
                padding: '28px 32px',
                display: 'inline-flex',
                alignItems: 'flex-start',
                gap: 0,
              }}
            >
              {/* Columns */}
              <div style={{ display: 'flex', gap: 0 }}>
                {megaMenus[activeMenu].sections.map((section, i) => (
                  <div key={i} style={{
                    width: '175px',
                    paddingRight: '24px',
                    marginRight: i < megaMenus[activeMenu].sections.length - 1 ? '24px' : 0,
                    borderRight: i < megaMenus[activeMenu].sections.length - 1 ? '1px solid #f0ece6' : 'none',
                  }}>
                    {section.heading && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '14px' }}>
                        {section.heading}
                      </div>
                    )}
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {section.links.map(sl => (
                        <li key={sl}>
                          <Link href={`/collections/${sl.toLowerCase().replace(/[\s+&]/g, '-')}`} className="mega-link"
                            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#444', textDecoration: 'none', letterSpacing: '0.02em', lineHeight: 1.4 }}>
                            {sl}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Featured image */}
              {megaMenus[activeMenu].featured && (
                <div style={{ flexShrink: 0, width: '170px', marginLeft: '32px' }}>
                  <Link href={megaMenus[activeMenu].featured!.href} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ overflow: 'hidden', marginBottom: '10px' }}>
                      <img src={megaMenus[activeMenu].featured!.image} alt={megaMenus[activeMenu].featured!.label}
                        style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} className="mega-img" />
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#1a1a1a', textDecoration: 'underline', letterSpacing: '0.03em' }}>
                      {megaMenus[activeMenu].featured!.label}
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
              {(['women', 'men'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: activeTab === tab ? 600 : 400, borderBottom: activeTab === tab ? '2px solid #1a1a1a' : '2px solid transparent', paddingBottom: '6px' }}>
                  {tab === 'women' ? 'Women' : 'Men'}
                </button>
              ))}
            </div>
            <nav>
              {navLinks.map(link => (
                <div key={link} style={{ borderBottom: '1px solid #f0ece6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                    <Link href={`/collections/${link.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setMobileOpen(false)}
                      style={{ fontFamily: 'var(--font-body)', fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', color: link === 'Sale' ? '#c0392b' : '#1a1a1a' }}>
                      {link}
                    </Link>
                    {megaMenus[link] && (
                      <button onClick={() => setMobileExpanded(mobileExpanded === link ? null : link)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#555', padding: '4px' }}>
                        <ChevronDown size={16} strokeWidth={1.5} style={{ transform: mobileExpanded === link ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    )}
                  </div>
                  {mobileExpanded === link && megaMenus[link] && (
                    <div style={{ paddingBottom: '14px', paddingLeft: '12px' }}>
                      {megaMenus[link].sections.map((section, i) => (
                        <div key={i} style={{ marginBottom: '12px' }}>
                          {section.heading && <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>{section.heading}</div>}
                          {section.links.map(sl => (
                            <Link key={sl} href={`/collections/${sl.toLowerCase().replace(/[\s+&]/g, '-')}`} onClick={() => setMobileOpen(false)}
                              style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#444', textDecoration: 'none', padding: '5px 0' }}>
                              {sl}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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