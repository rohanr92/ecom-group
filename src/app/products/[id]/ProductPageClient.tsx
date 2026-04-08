'use client'
// Save as: src/app/products/[id]/page.tsx (REPLACE entire file)
// DESIGN IS IDENTICAL — only data source changed from hardcoded to DB
// Share button now opens native share sheet or copies link

import React, { useState, useEffect } from 'react'

import ProductPageSkeleton from '@/components/ProductPageSkeleton'
import Link from 'next/link'
import { Heart, Share2, ChevronDown, ChevronUp, Star, ChevronLeft, ChevronRight, Check, Truck, RefreshCw, ShieldCheck, Copy, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/components/CartContext'
import AddedToCartModal from '@/components/AddedToCartModal'
import WishlistButton from '@/components/WishlistButton'
import type { CartItem } from '@/components/CartContext'
import { StyleWithGrid, YouMayAlsoLikeGrid } from '@/components/ProductPageGrids'
import ProductReviews from '@/components/ProductReviews'
import { useCurrency } from '@/hooks/useCurrency'
import { pushDataLayer } from '@/components/DataLayer'

// ── Star Rating ───────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-px">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size} strokeWidth={1.5}
          fill={s <= Math.round(rating) ? '#151515' : 'none'}
          color={s <= Math.round(rating) ? '#151515' : '#ccc'} />
      ))}
    </div>
  )
}

// ── Accordion ────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-100">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left bg-transparent border-none cursor-pointer group">
        <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">{title}</span>
        {open ? <ChevronUp size={15} strokeWidth={1.5} className="text-gray-400" />
               : <ChevronDown size={15} strokeWidth={1.5} className="text-gray-400" />}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}


function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x, y })
  }

  return (
    <div
      onClick={() => setZoomed(z => !z)}
      onMouseMove={handleMove}
      className={`relative overflow-hidden ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
      style={{ maxHeight: '85vh', maxWidth: '100%' }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          maxHeight: '85vh',
          maxWidth: '100%',
          objectFit: 'contain',
          transform: zoomed ? 'scale(2.5)' : 'scale(1)',
          transformOrigin: `${pos.x}% ${pos.y}%`,
          transition: zoomed ? 'transform 0.1s' : 'transform 0.3s ease',
          display: 'block',
        }}
      />
      {!zoomed && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
          Click to zoom
        </div>
      )}
    </div>
  )
}

// ── Share Modal ───────────────────────────────────────────────────
function ShareModal({ onClose, productName }: { onClose: () => void; productName: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOptions = [
  {
  label: 'Facebook',
  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  color: '#1877f2',
  action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'),
},
{
  label: 'X / Twitter',
  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  color: '#000',
  action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out ${productName} from Solomon & Sage`)}`, '_blank'),
},
    {
      label: 'Pinterest',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.55c0-1.45.84-2.54 1.89-2.54.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.85 0 3.27-1.95 3.27-4.76 0-2.49-1.79-4.23-4.34-4.23-2.96 0-4.69 2.22-4.69 4.51 0 .89.34 1.85.77 2.37.08.1.09.2.07.3-.08.32-.25 1.04-.28 1.18-.04.19-.14.23-.32.14-1.25-.58-2.03-2.42-2.03-3.89 0-3.15 2.29-6.05 6.61-6.05 3.47 0 6.16 2.47 6.16 5.77 0 3.45-2.17 6.22-5.19 6.22-1.01 0-1.97-.53-2.3-1.15l-.62 2.33c-.23.87-.84 1.96-1.25 2.62.94.29 1.94.45 2.97.45 5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      ),
      color: '#e60023',
      action: () => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(productName)}`, '_blank'),
    },
    {
      label: 'WhatsApp',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: '#25d366',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${productName} - ${url}`)}`, '_blank'),
    },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '480px', padding: '24px', borderRadius: '12px 12px 0 0' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Share this product</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={18} /></button>
        </div>

        {/* Social buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {shareOptions.map(opt => (
            <button key={opt.label} onClick={opt.action}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: '1px solid #e8e4de', background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#1a1a1a', textAlign: 'left' }}>
              <span style={{ color: opt.color }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Copy link */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', border: '1px solid #e8e4de', background: '#f8f6f1' }}>
          <p style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</p>
          <button onClick={copy}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function ProductPage({ id }: { id: string }) {
  const productId = id
  const { convert } = useCurrency()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading]  = useState(true)
  const [selectedColor, setSelectedColor] = useState<any>(null)
  const [selectedSize,  setSelectedSize]  = useState<string | null>(null)
  const [activeImage,   setActiveImage]   = useState(0)
  const [added,         setAdded]         = useState(false)
  const [sizeError,     setSizeError]     = useState(false)
  const [showShare,     setShowShare]     = useState(false)
  const [modalItem,     setModalItem]     = useState<CartItem | null>(null)
  const { addItem } = useCart()
  const [lightboxOpen, setLightboxOpen] = useState(false)
const [lightboxIndex, setLightboxIndex] = useState(0)

  // ── Fetch product from DB ──────────────────────────────────────
  useEffect(() => {
    if (!productId) return
    setLoading(true)
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(d => {
        if (d.product) {
          const p = d.product
          // Normalise fields so the template always has the same shape
          p.images    = Array.isArray(p.images) && p.images.length ? p.images
                        : ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80']
                    p.allImages = Array.isArray(p.images) && p.images.length ? p.images
  : ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80']

p.colors = p.variants
  ? [...new Map(p.variants.filter((v:any) => v.color).map((v:any) => [v.color, { name: v.color, hex: v.colorHex || '#1a1a1a' }])).values()]
  : []

p.sizes = p.variants
  ? [...new Set(p.variants.filter((v:any) => v.size).map((v:any) => v.size))]
  : []

// Build inventory map: { "S-Black": 3, "M-Black": 0, ... }
p.inventoryMap = {}
for (const v of (p.variants ?? [])) {
  if (v.size) {
    const key = `${v.size}-${v.color ?? ''}`
    p.inventoryMap[key] = (p.inventoryMap[key] ?? 0) + v.inventory
  }
}

// Also build size-only map (total across all colors)
p.sizeInventory = {}
for (const v of (p.variants ?? [])) {
  if (v.size) {
    p.sizeInventory[v.size] = (p.sizeInventory[v.size] ?? 0) + v.inventory
  }
}

 

// Build color->images map from filenames
p.colorImageMap = {}
for (const color of p.colors) {
  const variantsForColor = p.variants.filter((v: any) => v.color === color.name)
  const assignedImages = variantsForColor[0]?.images ?? []
  // Fall back to filename matching if no images assigned yet
  if (assignedImages.length > 0) {
    p.colorImageMap[color.name] = assignedImages
  } else {
    const slug = color.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const matched = p.allImages.filter((img: string) => img.includes(slug))
    p.colorImageMap[color.name] = matched.length ? matched : p.allImages
  }
}

p.images = p.allImages
p.rating = p.avgRating ?? 0
p.reviewCount = p.reviewCount ?? 0
p.ratingBreakdown = p.ratingBreakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
p.details = p.details ?? []
p.brand = p.brand ?? 'Solomon & Sage'
setProduct(p)
if (p.colors.length) setSelectedColor(p.colors[0])
        }
        setLoading(false)


        if (d.product) {
  pushDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: 'USD',
      value: Number(d.product.price),
      items: [{
        item_id: d.product.id,
        item_name: d.product.name,
        item_category: d.product.category ?? '',
        price: Number(d.product.price),
        quantity: 1,
      }]
    }
  })
}
      })
      .catch(() => setLoading(false))
  }, [productId])


useEffect(() => {
  if (!lightboxOpen) return
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setLightboxOpen(false)
    if (e.key === 'ArrowRight') setLightboxIndex(i => Math.min(product.images.length - 1, i + 1))
    if (e.key === 'ArrowLeft')  setLightboxIndex(i => Math.max(0, i - 1))
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [lightboxOpen, product])

 const handleAddToCart = () => {
  if (!selectedSize && product?.sizes?.length) { setSizeError(true); return }
  const stock = product?.sizeInventory?.[selectedSize ?? ''] ?? 999
  if (stock === 0) { setSizeError(false); return }
    setSizeError(false)
    const item: CartItem = {
      id:       product.id,
      name:     product.name,
      brand:    product.brand,
      price:    Number(product.price),
      image:    product.images[0],
      size:     selectedSize ?? '',
      color:    selectedColor?.name ?? '',
      quantity: 1,
    }
    addItem(item)
    setModalItem(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <ProductPageSkeleton />
      <Footer />
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontStyle: 'italic', fontWeight: 300, color: '#1a1a1a', marginBottom: '12px' }}>Product not found</p>
          <Link href="/collections/all" className="btn-outline">Browse Collections</Link>
        </div>
      </main>
      <Footer />
    </div>
  )

  

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-container px-4 md:px-10 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400 tracking-wide">
            <Link href="/" className="hover:text-[#1a1a1a] hover:underline">Home</Link>
<span>/</span>
<Link href="/collections" className="hover:text-[#1a1a1a] hover:underline">Women</Link>
<span>/</span>
{product.category && (
  <>
    <Link href={`/collections?category=${product.category}`} className="hover:text-[#1a1a1a] hover:underline">
      {product.category}
    </Link>
    <span>/</span>
  </>
)}
<span className="text-[#1a1a1a]">{product.name}</span>
          </div>
        </div>

        {/* Product Section */}
        <div className="max-container px-4 md:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* ── Image Gallery ── */}
            <div className="flex gap-3">
              {/* Thumbnail strip */}
            {/* Thumbnail strip — scrollable carousel */}
<div className="hidden md:flex flex-col w-16 shrink-0" style={{ maxHeight: '520px' }}>
  {/* Up arrow */}
  {activeImage > 0 && (
    <button onClick={() => setActiveImage(i => Math.max(0, i - 1))}
      className="w-full flex items-center justify-center py-1 text-gray-400 hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer shrink-0">
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 7L6 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </button>
  )}

  {/* Scrollable thumbnails — show 5 at a time */}
  <div className="flex flex-col gap-2 overflow-hidden flex-1">
    {product.images.slice(
      Math.max(0, Math.min(activeImage - 2, product.images.length - 5)),
      Math.max(0, Math.min(activeImage - 2, product.images.length - 5)) + 5
    ).map((img: string, i: number) => {
      const realIndex = Math.max(0, Math.min(activeImage - 2, product.images.length - 5)) + i
      return (
        <button key={realIndex} onClick={() => setActiveImage(realIndex)}
          className={`aspect-[2.5/3.8] overflow-hidden border-2 transition-all cursor-pointer p-0 bg-transparent shrink-0
            ${activeImage === realIndex ? 'border-[#1a1a1a]' : 'border-transparent hover:border-gray-300'}`}>
          <img src={img} alt={`${product.name} - view ${realIndex + 1}`} className="w-full h-full object-cover" />
        </button>
      )
    })}
  </div>

  {/* Down arrow */}
  {activeImage < product.images.length - 1 && (
    <button onClick={() => setActiveImage(i => Math.min(product.images.length - 1, i + 1))}
      className="w-full flex items-center justify-center py-1 text-gray-400 hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer shrink-0">
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </button>
  )}

  {/* Image counter */}
  <p className="text-center text-[10px] text-gray-400 mt-1 shrink-0">{activeImage + 1}/{product.images.length}</p>
</div>

              {/* Main image */}
             {/* Main image */}
              <div className="flex-1 relative">
                <div className="aspect-[2.5/3.8] overflow-hidden bg-[#f9f9f9] relative group cursor-zoom-in"
                  onClick={e => { e.preventDefault(); setLightboxIndex(activeImage); setLightboxOpen(true) }}>
                <img src={product.images[activeImage]} alt={product.name}
  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[9px] font-semibold tracking-widest uppercase px-2.5 py-1">
                      {product.badge}
                    </span>
                  )}
                  <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i - 1 + product.images.length) % product.images.length) }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none shadow-sm">
                    <ChevronLeft size={16} strokeWidth={1.5} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i + 1) % product.images.length) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none shadow-sm">
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-white/80 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>
                    <span className="text-[10px] font-medium tracking-wide">Zoom</span>
                  </div>
                </div>
                {/* Mobile dots */}
                <div className="flex justify-center gap-1.5 mt-3 md:hidden">
                  {product.images.map((_: any, i: number) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-1.5 h-1.5 rounded-full border-none cursor-pointer transition-all
                        ${activeImage === i ? 'bg-[#1a1a1a] w-4' : 'bg-gray-300'}`} />
                  ))}
                </div>
                </div>
              </div>

            {/* ── Product Info ── */}
            <div className="flex flex-col">
              {/* Brand + Title */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-1">{product.brand}</p>
                  <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-light italic text-[#1a1a1a] leading-tight">
                    {product.name}
                  </h1>
                </div>
                <div className="flex gap-2 shrink-0 mt-1">
                  {/* Wishlist — connected to DB */}
                  <WishlistButton productId={product.id} size={16}
                    className="w-9 h-9 border border-gray-200 hover:border-[#1a1a1a] transition-colors" />
                  {/* Share */}
                  <button onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: product.name, text: `Check out ${product.name} from Solomon & Sage`, url: window.location.href })
                    } else {
                      setShowShare(true)
                    }
                  }}
                    className="w-9 h-9 border border-gray-200 flex items-center justify-center hover:border-[#1a1a1a] transition-colors cursor-pointer bg-transparent">
                    <Share2 size={15} strokeWidth={1.5} color="#1a1a1a" />
                  </button>
                </div>
              </div>

              {/* Rating */}
        {
  product.reviewCount > 0 ? (
    <div className="flex items-center gap-2 mt-3">
      <Stars rating={product.rating} size={13} />
      <a
        href="#reviews"
        className="text-[12px] text-gray-400 tracking-wide hover:underline hover:text-[#1a1a1a]"
      >
        {product.reviewCount} reviews
      </a>
    </div>
  ) : (
    <div className="flex items-center gap-2 mt-3">
      {/* <Stars rating={0} size={13} />
      <span className="text-[12px] text-gray-400 tracking-wide">
        No reviews yet
      </span> */}
    </div>
  )
}
            

              {/* Price */}
              <div className="flex items-baseline gap-2.5 mt-4">
                <span className="font-[family-name:var(--font-display)] text-2xl font-light text-[#1a1a1a]">
                  {convert(Number(product.price))}
                </span>
                {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                 <span className="text-sm text-gray-400 line-through">{convert(Number(product.comparePrice))}</span>
                )}
              </div>

              <div className="w-12 h-px bg-[#151515] mt-5 mb-5" />

              {/* Color selector */}
              {product.colors?.length > 0 && (
                <div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[#1a1a1a] font-semibold mb-2.5">
                    Color — <span className="font-normal text-gray-500">{selectedColor?.name}</span>
                  </p>
                  <div className="flex gap-2">
                    {product.colors.map((c: any) => (
                      <button key={c.name} onClick={() => {
  setSelectedColor(c)
  setActiveImage(0)
  setProduct((prev: any) => ({
    ...prev,
    images: prev.colorImageMap[c.name] || prev.allImages
  }))
}} title={c.name}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer p-0
                          ${selectedColor?.name === c.name ? 'border-[#1a1a1a] scale-110' : 'border-gray-200 hover:border-gray-500'}`}
                        style={{ background: c.hex }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {product.sizes?.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] tracking-[0.15em] uppercase text-[#1a1a1a] font-semibold">Size</p>
                    <Link href="/size-guide" className="text-[11px] text-gray-400 underline tracking-wide hover:text-[#1a1a1a]">Size Guide</Link>
                  </div>
                <div className="flex gap-2 flex-wrap">
  {product.sizes.map((s: string) => {
    const stock = product.sizeInventory?.[s] ?? 999
    const outOfStock = stock === 0
    const lowStock = stock > 0 && stock <= 3
    const isSelected = selectedSize === s
    return (
      <button
        key={s}
        onClick={() => { if (!outOfStock) { setSelectedSize(s); setSizeError(false) } }}
        disabled={outOfStock}
        title={outOfStock ? 'Out of stock' : lowStock ? `Only ${stock} left` : ''}
        className={`min-w-[44px] h-10 px-3 border text-[12px] tracking-wider transition-all relative
          ${outOfStock
            ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
            : isSelected
              ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white cursor-pointer'
              : 'border-gray-300 bg-white text-[#1a1a1a] hover:border-[#1a1a1a] cursor-pointer'
          }`}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {s}
        {/* Diagonal strikethrough for out of stock */}
        {outOfStock && (
          <span style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to bottom right, transparent calc(50% - 0.5px), #d1d5db calc(50% - 0.5px), #d1d5db calc(50% + 0.5px), transparent calc(50% + 0.5px))',
          }} />
        )}
        {/* Low stock dot */}
        {lowStock && !outOfStock && !isSelected && (
          <span style={{
            position: 'absolute', top: '3px', right: '3px',
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#e08a00',
          }} />
        )}
      </button>
    )
  })}
</div>
{/* Low stock warning */}
{selectedSize && product.sizeInventory?.[selectedSize] > 0 && product.sizeInventory?.[selectedSize] <= 3 && (
  <p className="text-[11px] text-amber-600 tracking-wide mt-2">
    Only {product.sizeInventory[selectedSize]} left in this size
  </p>
)}
{sizeError && <p className="text-red-500 text-[11px] tracking-wide mt-2">Please select a size to continue</p>}
                  {sizeError && <p className="text-red-500 text-[11px] tracking-wide mt-2">Please select a size to continue</p>}
                </div>
              )}

              {/* Add to Cart */}
              <div className="flex gap-2.5 mt-6">
                <button onClick={handleAddToCart}
                  className={`flex-1 h-12 text-[12px] font-semibold tracking-[0.2em] uppercase transition-all cursor-pointer border flex items-center justify-center gap-2
                    ${added ? 'bg-[#4a6741] border-[#4a6741] text-white' : 'bg-[#1a1a1a] border-[#1a1a1a] text-white hover:bg-transparent hover:text-[#1a1a1a]'}`}>
                  {added ? <><Check size={14} strokeWidth={2} /> Added</> : 'Add to Cart'}
                </button>
                <WishlistButton productId={product.id} size={16} showLabel
                  className="h-12 px-5 border border-gray-300 hover:border-[#1a1a1a] transition-colors" />
              </div>

              {/* Shipping badges */}
              <div className="grid grid-cols-3 gap-3 mt-5 py-4 border-t border-b border-gray-100">
                {[
                  { icon: <Truck size={15} strokeWidth={1.5} />, label: 'Free Shipping', sub: 'Orders over $150' },
                  { icon: <RefreshCw size={15} strokeWidth={1.5} />, label: 'Free Returns', sub: '30-day returns' },
                  { icon: <ShieldCheck size={15} strokeWidth={1.5} />, label: 'Secure Pay', sub: 'SSL encrypted' },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center text-center gap-1">
                    <span className="text-[#151515]">{b.icon}</span>
                    <p className="text-[10px] font-semibold tracking-wide text-[#1a1a1a]">{b.label}</p>
                    <p className="text-[10px] text-gray-400">{b.sub}</p>
                  </div>
                ))}
              </div>

              {/* Accordions */}
              <div className="mt-2">
                <Accordion title="Description" defaultOpen>
                  <p className="text-[13px] text-gray-500 leading-relaxed tracking-wide">{product.description || 'No description available.'}</p>
                </Accordion>
                {product.details?.length > 0 && (
                  <Accordion title="Product Details">
                    <ul className="space-y-1.5">
                      {product.details.map((d: string, i: number) => (
                        <li key={i} className="text-[13px] text-gray-500 tracking-wide flex gap-2">
                          <span className="text-[#151515] mt-0.5 shrink-0">—</span>{d}
                        </li>
                      ))}
                    </ul>
                  </Accordion>
                )}
                <Accordion title="Shipping & Returns">
                  <div className="space-y-2 text-[13px] text-gray-500 tracking-wide leading-relaxed">
                    <p>Free standard shipping on orders over $150. Express shipping available at checkout.</p>
                    <p>Returns accepted within 30 days of delivery. Items must be unworn and in original condition with tags attached.</p>
                  </div>
                </Accordion>
              </div>
            </div>
          </div>
        </div>


        <StyleWithGrid />

        {/* Ratings & Reviews */}
        <ProductReviews
          productId={product.id}
          productName={product.name}
          initialRating={product.rating}
          initialReviewCount={product.reviewCount}
          initialRatingBreakdown={product.ratingBreakdown}
        />

        <YouMayAlsoLikeGrid /> 
      </main>

      <Footer />

      {/* Share modal (fallback for browsers without native share) */}
      {showShare && <ShareModal onClose={() => setShowShare(false)} productName={product.name} />}

      {/* Added to cart modal */}
    {modalItem && <AddedToCartModal item={modalItem} onClose={() => setModalItem(null)} />}

      {/* Lightbox */}
      {lightboxOpen && (
  <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
    onClick={() => setLightboxOpen(false)}>
    
    {/* Close button */}
    <button onClick={() => setLightboxOpen(false)}
      className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-white/10 hover:bg-white/20 border-none cursor-pointer rounded-full z-10">
      <X size={20} />
    </button>

    {/* Counter */}
    <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-[12px] tracking-widest">
      {lightboxIndex + 1} / {product.images.length}
    </p>

    {/* Prev arrow */}
    {lightboxIndex > 0 && (
      <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i - 1) }}
        className="absolute left-4 w-10 h-10 flex items-center justify-center text-white bg-white/10 hover:bg-white/20 border-none cursor-pointer rounded-full">
        <ChevronLeft size={22} />
      </button>
    )}

    {/* Main image */}
    <div className="max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center px-16"
      onClick={e => e.stopPropagation()}>
      <ZoomableImage src={product.images[lightboxIndex]} alt={product.name} />
    </div>

    {/* Next arrow */}
    {lightboxIndex < product.images.length - 1 && (
      <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i + 1) }}
        className="absolute right-4 w-10 h-10 flex items-center justify-center text-white bg-white/10 hover:bg-white/20 border-none cursor-pointer rounded-full">
        <ChevronRight size={22} />
      </button>
    )}

    {/* Thumbnail strip at bottom */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-1"
      onClick={e => e.stopPropagation()}>
      {product.images.map((img: string, i: number) => (
        <button key={i} onClick={() => setLightboxIndex(i)}
          className={`w-14 aspect-[2.5/3.8] shrink-0 overflow-hidden border-2 cursor-pointer p-0 transition-all
            ${lightboxIndex === i ? 'border-white' : 'border-white/20 hover:border-white/60'}`}>
         <img src={img} alt={`${product.name} - image ${i + 1}`} className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
</div>
      )}
    </div>
  )
}