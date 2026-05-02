// Save as: src/app/cart/page.tsx
'use client'
import React from 'react'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/components/CartContext'
import { Trash2, Plus, Minus, ChevronDown, ChevronLeft, ChevronRight, ShoppingBag, Tag, Truck, RotateCcw, Shield, MessageCircle } from 'lucide-react'
import CartCarousel from '@/components/CartCarousel'
import { useCurrency } from '@/hooks/useCurrency'


// ── Picked For You / You Might Also Like data ─────────────────────
const pickedForYou = [
  { id: 4,  name: 'Ruffle Wrap Set',          price: 148, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80', badge: 'New' },
  { id: 8,  name: 'Plissé Midi Skirt',        price: 158, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80', badge: 'New' },
  { id: 11, name: 'Cropped Trench Coat',      price: 328, image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&auto=format&fit=crop&q=80', badge: 'New' },
  { id: 3,  name: 'Structured Blazer',        price: 248, image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&auto=format&fit=crop&q=80', badge: null },
  { id: 15, name: 'Smocked Maxi Dress',       price: 198, originalPrice: 248, image: 'https://images.unsplash.com/photo-1570464197285-9949814674a7?w=400&auto=format&fit=crop&q=80', badge: 'Sale' },
  { id: 20, name: 'Gold Hoop Earring Set',    price: 48,  image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&auto=format&fit=crop&q=80', badge: 'Best Seller' },
  { id: 7,  name: 'Strappy Heel Sandal',      price: 118, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&auto=format&fit=crop&q=80', badge: null },
]

function ProductCarousel({ title, items }: { title: string; items: typeof pickedForYou }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }
  return (
    <section className="py-10 border-t border-gray-100">
      <div className="max-container px-4 md:px-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl italic font-light text-[#1a1a1a]">{title}</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-8 h-8 border border-gray-300 flex items-center justify-center cursor-pointer bg-white hover:border-[#1a1a1a] transition-colors">
              <ChevronLeft size={15} strokeWidth={1.5} />
            </button>
            <button onClick={() => scroll('right')} className="w-8 h-8 border border-gray-300 flex items-center justify-center cursor-pointer bg-white hover:border-[#1a1a1a] transition-colors">
              <ChevronRight size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {items.map(item => (
            <Link key={item.id} href={`/products/${item.id}`} className="shrink-0 w-40 md:w-48 no-underline group">
              <div className="aspect-[3/4] overflow-hidden bg-[#f5f2ed] relative">
                <img src={item.image} alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {item.badge && (
                  <span className={`absolute top-2 left-2 text-white text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5
                    ${item.badge === 'Sale' ? 'bg-red-600' : item.badge === 'Best Seller' ? 'bg-[#4a6741]' : 'bg-[#1a1a1a]'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#1a1a1a] mt-2 leading-snug tracking-wide group-hover:underline">{item.name}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className={`text-[12px] ${'originalPrice' in item && item.originalPrice ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
                  ${item.price}
                </span>
                {'originalPrice' in item && item.originalPrice && (
                  <span className="text-[11px] text-gray-400 line-through">${item.originalPrice}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}


function CheckoutButton() {
  const [loading, setLoading] = React.useState(false)
  return (
    <a href="/checkout"
      onClick={() => setLoading(true)}
      className="flex items-center justify-center gap-2 w-full h-12 bg-[#1a1a1a] text-white text-[12px] font-semibold tracking-widest uppercase no-underline hover:bg-gray-800 transition-colors cursor-pointer">
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </>
      ) : 'Proceed to Checkout'}
    </a>
  )
}

export default function CartPage() {
  const { items, removeItem, updateQty, addItem, totalCount, totalPrice, clearCart, cartLoaded } = useCart()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { convert } = useCurrency()



  const [cartNewsletterEmail, setCartNewsletterEmail] = useState('')
const [cartNewsletterStatus, setCartNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

const handleCartNewsletter = async () => {
  if (!cartNewsletterEmail || !cartNewsletterEmail.includes('@')) return
  setCartNewsletterStatus('loading')
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cartNewsletterEmail, source: 'cart' }),
    })
    const d = await res.json()
    if (d.success) { setCartNewsletterStatus('success'); setCartNewsletterEmail('') }
    else setCartNewsletterStatus('error')
  } catch { setCartNewsletterStatus('error') }
}

useEffect(() => {
  fetch('/api/auth/me').then(r => r.json()).then(d => {
    setIsLoggedIn(!!d.user)
  }).catch(() => setIsLoggedIn(false))
}, [])
  const [savedItems, setSavedItems] = useState<typeof items>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('sl_saved_for_later')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })
  

  const [promoOpen, setPromoOpen] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoResult, setPromoResult] = useState<{ discount: number; code: string } | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)

  const shipping = 0
  const tax = 0
  const discount = promoResult?.discount ?? 0
  const orderTotal = totalPrice - discount

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, orderTotal: totalPrice }),
      })
      const data = await res.json()
      if (res.ok) {
        setPromoResult({ discount: data.discount, code: data.code })
        setPromoApplied(true)
        setPromoError('')
      } else {
        setPromoError(data.error ?? 'Invalid promo code')
        setPromoApplied(false)
        setPromoResult(null)
      }
    } catch {
      setPromoError('Failed to validate promo code')
    } finally {
      setPromoLoading(false)
    }
  }



 const saveForLater = (item: typeof items[0]) => {
    setSavedItems(prev => {
      const next = [...prev, item]
      localStorage.setItem('sl_saved_for_later', JSON.stringify(next))
      return next
    })
    removeItem(item.id, item.size, item.color)
  }

 const moveToCart = (item: typeof items[0]) => {
    setSavedItems(prev => {
      const next = prev.filter(i => !(i.id === item.id && i.size === item.size && i.color === item.color))
      localStorage.setItem('sl_saved_for_later', JSON.stringify(next))
      return next
    })
    addItem(item)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 bg-white">

        {/* Page title */}
        <div className="max-container px-4 md:px-10 pt-8 pb-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl italic font-light text-[#1a1a1a]">
            Shopping Bag
          </h1>
          {totalCount > 0 && (
            <p className="text-[12px] text-gray-400 tracking-wide mt-1">
              {totalCount} {totalCount === 1 ? 'item' : 'items'} · Items in your bag are not on hold.
            </p>
          )}
        </div>

        {!cartLoaded ? (
          <div className="max-container px-4 md:px-10 py-24 flex flex-col items-center text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin" />
          </div>
        ) : items.length === 0 && savedItems.length === 0 ? (
          /* ── Empty state ── */
          <div className="max-container px-4 md:px-10 py-24 flex flex-col items-center text-center">
            <ShoppingBag size={52} strokeWidth={1} className="text-gray-200 mb-5" />
            <h2 className="font-[family-name:var(--font-display)] text-2xl italic text-gray-400 mb-3">Your bag is empty</h2>
            <p className="text-sm text-gray-400 tracking-wide mb-8 max-w-sm">
              Looks like you haven't added anything yet. Start shopping to fill it up.
            </p>
            <Link href="/collections/all"
              className="bg-[#1a1a1a] text-white text-xs tracking-widest uppercase px-10 py-3.5 no-underline hover:bg-gray-800 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="max-container px-4 md:px-10 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-14 items-start">

              {/* ── Left: Cart items ── */}
              <div className="lg:col-span-2">

                      {/* Sign in prompt */}
                {!isLoggedIn && (
                  <div className="text-[12px] text-gray-500 tracking-wide mb-5 pb-4 border-b border-gray-100">
                    Want to make checkout and order tracking easier?{' '}
                    <Link href="/account" className="text-[#1a1a1a] underline hover:no-underline">Sign in or create an account</Link>
                  </div>
                )}

                {/* Shipping estimate */}
                {items.length > 0 && (
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 tracking-wide mb-5 pb-5 border-b border-gray-100">
                    <Truck size={14} strokeWidth={1.5} className="text-[#151515] shrink-0" />
                    <span>
                      {<span className="text-[#4a6741] font-medium">Free shipping on your order!</span>}
                    </span>
                  </div>
                )}

                {/* ── Item rows ── */}
                <div className="divide-y divide-gray-100">
                  {items.map(item => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-5 py-6">

                      {/* Product image */}
                      <Link href={`/products/${item.id}`}
                        className="shrink-0 w-24 md:w-32 aspect-[3/4] overflow-hidden bg-[#f5f2ed] block">
                        <img src={item.image} alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-0.5">{item.brand}</p>
                            <Link href={`/products/${item.id}`}
                              className="font-[family-name:var(--font-display)] text-lg md:text-xl italic text-[#1a1a1a] no-underline hover:underline leading-snug block">
                              {item.name}
                            </Link>
                          </div>
                          {/* Price right aligned */}
                          <div className="text-right shrink-0">
                            <p className="font-[family-name:var(--font-display)] text-lg font-light text-[#1a1a1a]">
                              {convert(item.price)}
                            </p>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="mt-2 space-y-0.5">
                          <p className="text-[12px] text-gray-500 tracking-wide">Color: <span className="text-[#1a1a1a]">{item.color}</span></p>
                          <p className="text-[12px] text-gray-500 tracking-wide">Size: <span className="text-[#1a1a1a]">{item.size}</span></p>
                        </div>

                        {/* Free returns badge */}
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <RotateCcw size={11} strokeWidth={1.5} className="text-gray-400" />
                          <span className="text-[11px] text-gray-400 tracking-wide">Free returns · Sold by Solomon & Sage</span>
                        </div>

                        {/* Quantity + Actions */}
                        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                          {/* Qty selector */}
                          <div className="flex items-center border border-gray-300">
                            <button onClick={() => updateQty(item.id, item.size, item.color, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-gray-50">
                              <Minus size={11} strokeWidth={1.5} />
                            </button>
                            <span className="w-10 text-center text-[13px] text-[#1a1a1a] tracking-wide select-none">
                              {item.quantity}
                            </span>
                            <button onClick={() => updateQty(item.id, item.size, item.color, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-gray-50">
                              <Plus size={11} strokeWidth={1.5} />
                            </button>
                          </div>

                          {/* Total for this item */}
                          <p className="text-[13px] text-[#1a1a1a] font-medium tracking-wide">
                            Total: {convert(item.price * item.quantity)}
                          </p>

                          {/* Remove / Save for later */}
                          <div className="flex items-center gap-4">
                            <button onClick={() => removeItem(item.id, item.size, item.color)}
                              className="text-[12px] text-gray-400 tracking-wide bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors underline">
                              Remove
                            </button>
                            <button onClick={() => saveForLater(item)}
                              className="text-[12px] text-[#1a1a1a] tracking-wide bg-transparent border-none cursor-pointer hover:text-gray-500 transition-colors underline">
                              Save for Later
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Saved for Later ── */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl italic font-light text-[#1a1a1a] mb-4">
                    Saved for Later ({savedItems.length} items)
                  </h2>
                  {savedItems.length === 0 ? (
                    <div className="border border-gray-100 bg-[#f8f6f1] px-5 py-4">
                      <p className="text-[12px] text-gray-400 tracking-wide">
                        Nothing to see here — yet. Add items you love, but might not be ready to buy.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {savedItems.map(item => (
                        <div key={`saved-${item.id}-${item.size}-${item.color}`} className="flex gap-4 py-5">
                          <Link href={`/products/${item.id}`} className="shrink-0 w-20 aspect-[3/4] overflow-hidden bg-[#f5f2ed] block">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </Link>
                          <div className="flex-1">
                            <Link href={`/products/${item.id}`}
                              className="font-[family-name:var(--font-display)] text-base italic text-[#1a1a1a] no-underline hover:underline block">
                              {item.name}
                            </Link>
                            <p className="text-[11px] text-gray-400 tracking-wide mt-0.5">{item.size} · {item.color}</p>
                            <p className="text-[13px] text-[#1a1a1a] mt-1">${item.price.toFixed(2)}</p>
                            <div className="flex gap-4 mt-2">
                              <button onClick={() => moveToCart(item)}
                                className="text-[12px] text-[#1a1a1a] tracking-wide bg-transparent border-none cursor-pointer hover:text-gray-500 underline">
                                Move to Bag
                              </button>
                              <button onClick={() => setSavedItems(prev => {
  const next = prev.filter(i => !(i.id === item.id && i.size === item.size && i.color === item.color))
  localStorage.setItem('sl_saved_for_later', JSON.stringify(next))
  return next
})}
                                className="text-[12px] text-gray-400 tracking-wide bg-transparent border-none cursor-pointer hover:text-red-500 underline">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right: Order Summary ── */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 sticky top-24">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-[12px] font-semibold tracking-widest uppercase text-[#1a1a1a]">Order Summary</h2>
                  </div>

                  <div className="px-5 py-4 space-y-3 text-[13px]">
                    <div className="flex justify-between text-gray-600 tracking-wide">
                      <span>Sub Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-[#4a6741] tracking-wide">
                        <span>Promo (SOLOMON10)</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600 tracking-wide">
                      <span>Shipping</span>
                      <span className={typeof shipping === 'number' && shipping === 0 ? 'text-[#4a6741]' : 'text-gray-600'}>
                        {typeof shipping === 'number' && shipping === 0 ? 'Free' : 'TBD'}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600 tracking-wide">
                      <span>Estimated Tax</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between items-baseline font-semibold border-t border-gray-100 pt-3">
                      <span className="text-[13px] tracking-widest uppercase text-[#1a1a1a]">Total</span>
                      <span className="font-[family-name:var(--font-display)] text-xl font-light text-[#1a1a1a]">
                        {convert(orderTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Promo code */}
                  <div className="px-5 pb-4">
                    <button onClick={() => setPromoOpen(o => !o)}
                      className="flex items-center justify-between w-full py-2.5 border-t border-gray-100 text-[12px] text-gray-500 tracking-wide bg-transparent cursor-pointer border-x-0 border-b-0">
                      <span className="flex items-center gap-2"><Tag size={12} strokeWidth={1.5} /> Promo Code</span>
                      <span className="text-lg leading-none">{promoOpen ? '−' : '+'}</span>
                    </button>
                    {promoOpen && (
                      <div className="mt-2">
                        <div className="flex">
                          <input value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError('') }}
                            placeholder="Enter promo code"
                            className="flex-1 px-3 py-2 text-[12px] border border-gray-300 border-r-0 outline-none focus:border-[#1a1a1a] transition-colors tracking-wide placeholder:text-gray-300" />
                          <button onClick={applyPromo} disabled={promoLoading || promoApplied}
                            className="px-4 py-2 bg-[#1a1a1a] text-white text-[11px] tracking-widest uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors shrink-0 disabled:opacity-50">
                            {promoLoading ? '...' : 'Apply'}
                          </button>
                        </div>
                        {promoError && <p className="text-red-500 text-[11px] mt-1 tracking-wide">{promoError}</p>}
                        {promoApplied && <p className="text-[#4a6741] text-[11px] mt-1 tracking-wide">✓ {promoResult?.code} applied! -{promoResult?.discount ? `$${promoResult.discount.toFixed(2)}` : ''}</p>}
                      </div>
                    )}
                  </div>

                  {/* CTAs */}
                  <div className="px-5 pb-5 space-y-2.5">
                    <CheckoutButton />

                 
                    {/* Afterpay / Klarna note */}
                    <p className="text-center text-[10px] text-gray-400 tracking-wide leading-relaxed">
                      Or 4 interest-free installments of <span className="font-semibold text-gray-600">${(orderTotal / 4).toFixed(2)}</span> with <span className="font-bold text-gray-600">Klarna</span> or <span className="font-bold text-gray-600">Afterpay</span>
                    </p>
                  </div>

                  {/* Questions */}
                  <div className="px-5 py-4 border-t border-gray-100 text-center">
                    <p className="text-[11px] text-gray-500 tracking-wide mb-2">Questions about your order?</p>
                    <button className="flex items-center justify-center gap-1.5 mx-auto text-[11px] text-[#1a1a1a] tracking-wide bg-transparent border-none cursor-pointer hover:underline">
                      <MessageCircle size={12} strokeWidth={1.5} /><Link href="/contact"> Talk to us</Link>
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 tracking-widest uppercase text-center mb-3">Accepted payments</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {['Visa', 'MC', 'Amex', 'PayPal', 'Stripe', 'Klarna'].map(p => (
                        <span key={p} className="text-[9px] tracking-wider text-gray-400 uppercase border border-gray-200 px-2 py-1 rounded-sm">{p}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      <Shield size={11} strokeWidth={1.5} className="text-[#4a6741]" />
                      <span className="text-[10px] text-gray-400 tracking-wide">SSL encrypted & secure checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

<CartCarousel title="Picked For You"       slot="cart_picked_for_you" />
<CartCarousel title="You Might Also Like"  slot="cart_also_like" />

        {/* ── Email signup strip ── */}
        <section className="bg-[#f8f6f1] py-12 border-t border-gray-100">
          <div className="max-container px-4 md:px-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl italic font-light text-[#1a1a1a] mb-1">
                  Get Free Express Shipping!
                </h3>
                <p className="text-[13px] text-gray-500 tracking-wide max-w-md">
                  Sign up for emails and receive Free Express Shipping on your first order! Plus, early access to New Arrivals, Sales, Events & more.
                </p>
              </div>
              <div className="flex w-full md:w-auto gap-0 min-w-72">
               {cartNewsletterStatus === 'success' ? (
  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#4a6741', fontStyle: 'italic', padding: '10px 0' }}>
    ✓ You're subscribed!
  </p>
) : (
  <>
    <input
      type="email"
      value={cartNewsletterEmail}
      onChange={e => setCartNewsletterEmail(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && handleCartNewsletter()}
      placeholder="Email Address *"
      className="flex-1 px-4 py-3 text-[12px] border border-gray-300 border-r-0 outline-none focus:border-[#1a1a1a] transition-colors tracking-wide bg-white placeholder:text-gray-300"
    />
    <button
      onClick={handleCartNewsletter}
      disabled={cartNewsletterStatus === 'loading'}
      className="px-6 py-3 bg-[#1a1a1a] text-white text-[11px] tracking-widest uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors shrink-0 disabled:opacity-60">
      {cartNewsletterStatus === 'loading' ? '...' : 'Submit'}
    </button>
  </>
)}
{cartNewsletterStatus === 'error' && (
  <p className="text-red-500 text-[11px] mt-1 tracking-wide w-full">Something went wrong. Please try again.</p>
)}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wide mt-4 leading-relaxed max-w-2xl">
              By signing up, you will receive Solomon & Sage offers, promotions and other commercial messages. See our Privacy Policy. You may unsubscribe at any time.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}