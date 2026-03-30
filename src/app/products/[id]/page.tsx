'use client'

import React, { useState } from 'react'
import { useEffect } from 'react' 
import ProductPageSkeleton from '@/components/ProductPageSkeleton'
import Link from 'next/link'
import { Heart, Share2, ChevronDown, ChevronUp, Star, ChevronLeft, ChevronRight, Check, Truck, RefreshCw, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/components/CartContext'
import AddedToCartModal from '@/components/AddedToCartModal'
import type { CartItem } from '@/components/CartContext'

// ── Fake product data ─────────────────────────────────────────────
const product = {
  id: 1,
  name: 'Silk Wrap Midi Dress',
  brand: 'Solomon Lawrence',
  price: 218,
  originalPrice: null,
  badge: 'Best Seller',
  description: 'Effortlessly elegant, this silk wrap midi dress is cut from a fluid, lightweight fabric that drapes beautifully with every movement. Designed for the woman who moves between boardroom and dinner with ease.',
  details: [
    'Fabric: 100% Silk',
    'Lining: 95% Polyester, 5% Elastane',
    'Dry clean only',
    'Adjustable wrap tie at waist',
    'V-neckline with flutter sleeves',
    'Midi length, approximately 42" from shoulder',
    'Model is 5\'9" wearing size S',
  ],
  colors: [
    { name: 'Caramel', hex: '#c8a882' },
    { name: 'Onyx',    hex: '#1a1a1a' },
    { name: 'Mocha',   hex: '#8b6f5e' },
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  rating: 4.8,
  reviewCount: 41,
  images: [
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570464197285-9949814674a7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&auto=format&fit=crop&q=80',
  ],
  ratingBreakdown: { 5: 28, 4: 9, 3: 3, 2: 1, 1: 0 },
  reviews: [
    { id: 1, name: 'Emma R.', rating: 5, date: 'March 12, 2026', title: 'Absolutely stunning', body: 'This dress exceeded every expectation. The silk feels incredible against the skin and the wrap style is so flattering. I wore it to a wedding and got compliments all night.', size: 'S', body_type: 'Petite', verified: true },
    { id: 2, name: 'Leila M.', rating: 5, date: 'February 28, 2026', title: 'Worth every penny', body: 'I was hesitant about the price but this is quality you can feel immediately. True to size, drapes beautifully. Already planning to buy another color.', size: 'M', body_type: 'Curvy', verified: true },
    { id: 3, name: 'Sofia K.', rating: 4, date: 'February 15, 2026', title: 'Elegant and versatile', body: 'Love this dress for both casual and formal occasions. Only reason for 4 stars is that the tie could be slightly longer for a more generous wrap.', size: 'S', body_type: 'Athletic', verified: true },
  ],
}

const relatedProducts = [
  { id: 3,  name: 'Structured Blazer',      price: 248, image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&auto=format&fit=crop&q=80', badge: null },
  { id: 8,  name: 'Plissé Midi Skirt',      price: 158, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80', badge: 'New' },
  { id: 15, name: 'Smocked Maxi Dress',     price: 198, originalPrice: 248, image: 'https://images.unsplash.com/photo-1570464197285-9949814674a7?w=400&auto=format&fit=crop&q=80', badge: 'Sale' },
  { id: 4,  name: 'Ruffle Wrap Set',        price: 148, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80', badge: 'New' },
  { id: 11, name: 'Cropped Trench Coat',    price: 328, image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&auto=format&fit=crop&q=80', badge: 'New' },
]

const styleWith = [
  { id: 7,  name: 'Strappy Heel Sandal',  price: 118, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&auto=format&fit=crop&q=80' },
  { id: 14, name: 'Leather Belt Bag',     price: 148, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80' },
  { id: 20, name: 'Gold Hoop Earring Set',price: 48,  image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&auto=format&fit=crop&q=80' },
]

// ── Star Rating ───────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-px">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size} strokeWidth={1.5}
          fill={s <= Math.round(rating) ? '#c8a882' : 'none'}
          color={s <= Math.round(rating) ? '#c8a882' : '#ccc'} />
      ))}
    </div>
  )
}

// ── Accordion ────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left bg-transparent border-none cursor-pointer group"
      >
        <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">{title}</span>
        {open
          ? <ChevronUp size={15} strokeWidth={1.5} className="text-gray-400" />
          : <ChevronDown size={15} strokeWidth={1.5} className="text-gray-400" />
        }
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function ProductPage() {
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [wished, setWished] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  
const [modalItem, setModalItem] = useState<CartItem | null>(null)

useEffect(() => {
  if (!loading) return
  const timer = setTimeout(() => setLoading(false), 1200)
  return () => clearTimeout(timer)
}, [])

 

  const handleAddToCart = () => {
  if (!selectedSize) { setSizeError(true); return }
  setSizeError(false)
  const item: CartItem = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.images[0],
    size: selectedSize,
    color: selectedColor.name,
    quantity: 1,
  }
  addItem(item)
  setModalItem(item)
  setAdded(true)           
setTimeout(() => setAdded(false), 2000)
}

  const totalReviews = Object.values(product.ratingBreakdown).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
{loading ? <ProductPageSkeleton /> : (
      <main className="flex-1">

        {/* Breadcrumb */}
        <div className="max-container px-4 md:px-10 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400 tracking-wide">
            <Link href="/" className="hover:text-[#1a1a1a] hover:underline">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-[#1a1a1a] hover:underline">Women</Link>
            <span>/</span>
            <Link href="/collections/dresses" className="hover:text-[#1a1a1a] hover:underline">Dresses</Link>
            <span>/</span>
            <span className="text-[#1a1a1a]">{product.name}</span>
          </div>
        </div>

        {/* Product Section */}
        <div className="max-container px-4 md:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* ── Image Gallery ── */}
            <div className="flex gap-3">

              {/* Thumbnail strip */}
              <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-[3/4] overflow-hidden border-2 transition-all cursor-pointer p-0 bg-transparent
                      ${activeImage === i ? 'border-[#1a1a1a]' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="flex-1 relative">
                <div className="aspect-[3/4] overflow-hidden bg-[#f5f2ed] relative group">
                  <img
                    src={product.images[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[9px] font-semibold tracking-widest uppercase px-2.5 py-1">
                      {product.badge}
                    </span>
                  )}
                  {/* Prev/Next arrows */}
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none shadow-sm"
                  >
                    <ChevronLeft size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none shadow-sm"
                  >
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Mobile dot indicators */}
                <div className="flex justify-center gap-1.5 mt-3 md:hidden">
                  {product.images.map((_, i) => (
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
                  <button onClick={() => setWished(w => !w)}
                    className="w-9 h-9 border border-gray-200 flex items-center justify-center hover:border-[#1a1a1a] transition-colors cursor-pointer bg-transparent">
                    <Heart size={16} strokeWidth={1.5} fill={wished ? '#c0392b' : 'none'} color={wished ? '#c0392b' : '#1a1a1a'} />
                  </button>
                  <button className="w-9 h-9 border border-gray-200 flex items-center justify-center hover:border-[#1a1a1a] transition-colors cursor-pointer bg-transparent">
                    <Share2 size={15} strokeWidth={1.5} color="#1a1a1a" />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <Stars rating={product.rating} size={13} />
                <a href="#reviews" className="text-[12px] text-gray-400 tracking-wide hover:underline hover:text-[#1a1a1a]">
                  {product.reviewCount} reviews
                </a>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 mt-4">
                <span className="font-[family-name:var(--font-display)] text-2xl font-light text-[#1a1a1a]">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                )}
              </div>

              <div className="w-12 h-px bg-[#c8a882] mt-5 mb-5" />

              {/* Color selector */}
              <div>
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#1a1a1a] font-semibold mb-2.5">
                  Color — <span className="font-normal text-gray-500">{selectedColor.name}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      title={c.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer p-0
                        ${selectedColor.name === c.name ? 'border-[#1a1a1a] scale-110' : 'border-gray-200 hover:border-gray-500'}`}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Size selector */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[#1a1a1a] font-semibold">Size</p>
                  <button className="text-[11px] text-gray-400 underline tracking-wide bg-transparent border-none cursor-pointer hover:text-[#1a1a1a]">
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSelectedSize(s); setSizeError(false) }}
                      className={`min-w-[44px] h-10 px-3 border text-[12px] tracking-wider transition-all cursor-pointer
                        ${selectedSize === s
                          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                          : 'border-gray-300 bg-white text-[#1a1a1a] hover:border-[#1a1a1a]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="text-red-500 text-[11px] tracking-wide mt-2">Please select a size to continue</p>
                )}
              </div>

              {/* Add to Cart */}
              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 text-[12px] font-semibold tracking-[0.2em] uppercase transition-all cursor-pointer border flex items-center justify-center gap-2
                    ${added
                      ? 'bg-[#4a6741] border-[#4a6741] text-white'
                      : 'bg-[#1a1a1a] border-[#1a1a1a] text-white hover:bg-transparent hover:text-[#1a1a1a]'}`}
                >
                  {added ? <><Check size={14} strokeWidth={2} /> Added</> : 'Add to Cart'}
                </button>
                <button className="h-12 px-5 border border-gray-300 text-[12px] tracking-[0.15em] uppercase text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors cursor-pointer bg-white">
                  Wishlist
                </button>
              </div>

              {/* Shipping badges */}
              <div className="grid grid-cols-3 gap-3 mt-5 py-4 border-t border-b border-gray-100">
                {[
                  { icon: <Truck size={15} strokeWidth={1.5} />, label: 'Free Shipping', sub: 'Orders over $150' },
                  { icon: <RefreshCw size={15} strokeWidth={1.5} />, label: 'Free Returns', sub: '30-day returns' },
                  { icon: <ShieldCheck size={15} strokeWidth={1.5} />, label: 'Secure Pay', sub: 'SSL encrypted' },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center text-center gap-1">
                    <span className="text-[#c8a882]">{b.icon}</span>
                    <p className="text-[10px] font-semibold tracking-wide text-[#1a1a1a]">{b.label}</p>
                    <p className="text-[10px] text-gray-400">{b.sub}</p>
                  </div>
                ))}
              </div>

              {/* Accordions */}
              <div className="mt-2">
                <Accordion title="Description" defaultOpen>
                  <p className="text-[13px] text-gray-500 leading-relaxed tracking-wide">{product.description}</p>
                </Accordion>
                <Accordion title="Product Details">
                  <ul className="space-y-1.5">
                    {product.details.map((d, i) => (
                      <li key={i} className="text-[13px] text-gray-500 tracking-wide flex gap-2">
                        <span className="text-[#c8a882] mt-0.5 shrink-0">—</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </Accordion>
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

        {/* Style With */}
        <section className="border-t border-gray-100 py-12">
          <div className="max-container px-4 md:px-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-light italic text-[#1a1a1a] mb-6">
              Style With
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 max-w-lg">
              {styleWith.map(item => (
                <Link key={item.id} href={`/products/${item.id}`} className="group no-underline">
                  <div className="aspect-square overflow-hidden bg-[#f5f2ed]">
                    <img src={item.image} alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="text-[12px] text-[#1a1a1a] mt-2 leading-snug group-hover:underline">{item.name}</p>
                  <p className="text-[12px] text-gray-400">${item.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Ratings & Reviews */}
        <section id="reviews" className="border-t border-gray-100 py-12 bg-[#f8f6f1]">
          <div className="max-container px-4 md:px-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-light italic text-[#1a1a1a] mb-8">
              Ratings & Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              {/* Overall score */}
              <div className="flex flex-col items-center justify-center text-center bg-white p-8">
                <p className="font-[family-name:var(--font-display)] text-6xl font-light italic text-[#1a1a1a]">
                  {product.rating}
                </p>
                <Stars rating={product.rating} size={16} />
                <p className="text-[12px] text-gray-400 tracking-wide mt-2">{product.reviewCount} reviews</p>
              </div>

              {/* Breakdown bars */}
              <div className="flex flex-col justify-center gap-2 col-span-2">
                {[5,4,3,2,1].map(star => {
                  const count = product.ratingBreakdown[star as keyof typeof product.ratingBreakdown]
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-[12px] text-gray-500 w-4 shrink-0">{star}</span>
                      <Star size={11} strokeWidth={1.5} fill="#c8a882" color="#c8a882" />
                      <div className="flex-1 h-1.5 bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#c8a882] transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-gray-400 w-6 shrink-0">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Review cards */}
            <div className="space-y-6">
              {product.reviews.map(review => (
                <div key={review.id} className="bg-white p-6 border border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Stars rating={review.rating} size={12} />
                      <p className="font-[family-name:var(--font-display)] text-lg italic text-[#1a1a1a] mt-1">{review.title}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 tracking-wide shrink-0">{review.date}</p>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed tracking-wide mt-3">{review.body}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[11px] text-[#1a1a1a] font-semibold tracking-wide">{review.name}</p>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-[#4a6741] tracking-wide">
                        <Check size={10} strokeWidth={2.5} /> Verified Purchase
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 tracking-wide">Size: {review.size}</span>
                    <span className="text-[11px] text-gray-400 tracking-wide">{review.body_type}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 btn-outline">Load More Reviews</button>
          </div>
        </section>

        {/* You May Also Like */}
        <section className="border-t border-gray-100 py-12">
          <div className="max-container px-4 md:px-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-light italic text-[#1a1a1a] mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6">
              {relatedProducts.map(item => (
                <Link key={item.id} href={`/products/${item.id}`} className="group no-underline">
                  <div className="aspect-[3/4] overflow-hidden bg-[#f5f2ed] relative">
                    <img src={item.image} alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {item.badge && (
                      <span className={`absolute top-2 left-2 text-white text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5
                        ${item.badge === 'Sale' ? 'bg-red-600' : 'bg-[#1a1a1a]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#1a1a1a] mt-2 leading-snug group-hover:underline">{item.name}</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className={`text-[13px] ${'originalPrice' in item && item.originalPrice ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
                      ${item.price}
                    </span>
                    {'originalPrice' in item && item.originalPrice && (
                      <span className="text-[12px] text-gray-400 line-through">${item.originalPrice}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

 
          </div>
        </section>

      </main>
        )}
      <Footer />

                 {modalItem && (
  <AddedToCartModal item={modalItem} onClose={() => setModalItem(null)} />
)}
    </div>
  )
}