'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Star, X, Check, Grid, LayoutList } from 'lucide-react'
import WishlistButton from '@/components/WishlistButton'
import { useSearchParams } from 'next/navigation'


const allProducts = [
  { id: 1,  name: 'Linen Wide-Leg Trousers',   brand: 'Solomon Lawrence', price: 128, originalPrice: null, rating: 4.5, reviews: 23,  badge: 'New',         colors: ['#1a1a1a','#d4cfc8','#4a6741'], category: 'Pants',       image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80' },
  { id: 2,  name: 'Silk Wrap Midi Dress',       brand: 'Solomon Lawrence', price: 218, originalPrice: null, rating: 4.8, reviews: 41,  badge: 'Best Seller', colors: ['#c8a882','#1a1a1a','#8b6f5e'], category: 'Dresses',     image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80' },
  { id: 3,  name: 'Structured Blazer',          brand: 'Solomon Lawrence', price: 248, originalPrice: null, rating: 4.6, reviews: 18,  badge: null,          colors: ['#1a1a1a','#c4bfb5','#6b5d4f'], category: 'Jackets',     image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80' },
  { id: 4,  name: 'Ruffle Wrap Set',            brand: 'Solomon Lawrence', price: 148, originalPrice: null, rating: 4.3, reviews: 56,  badge: 'New',         colors: ['#e8d5c4','#1a1a1a'],           category: 'Sets',        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80' },
  { id: 5,  name: 'Barrel Leg Crop Jeans',      brand: 'Solomon Lawrence', price: 138, originalPrice: null, rating: 4.7, reviews: 92,  badge: 'Best Seller', colors: ['#4a5568','#2d3748','#c4bfb5'], category: 'Denim',       image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80' },
  { id: 6,  name: 'Cashmere Crew Sweater',      brand: 'Solomon Lawrence', price: 188, originalPrice: 248,  rating: 4.9, reviews: 134, badge: 'Sale',        colors: ['#c8a882','#1a1a1a','#e8d5c4'], category: 'Tops',        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=80' },
  { id: 7,  name: 'Strappy Heel Sandal',        brand: 'Solomon Lawrence', price: 118, originalPrice: null, rating: 4.2, reviews: 29,  badge: null,          colors: ['#c8a882','#1a1a1a'],           category: 'Shoes',       image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80' },
  { id: 8,  name: 'Plissé Midi Skirt',          brand: 'Solomon Lawrence', price: 158, originalPrice: null, rating: 4.5, reviews: 37,  badge: 'New',         colors: ['#e8d5c4','#1a1a1a','#4a6741'], category: 'Skirts',      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop&q=80' },
  { id: 9,  name: 'Linen Shirt Dress',          brand: 'Solomon Lawrence', price: 178, originalPrice: 228,  rating: 4.6, reviews: 61,  badge: 'Sale',        colors: ['#fff','#c4bfb5','#1a1a1a'],    category: 'Dresses',     image: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=500&auto=format&fit=crop&q=80' },
  { id: 10, name: 'Wide Brim Sun Hat',          brand: 'Solomon Lawrence', price: 68,  originalPrice: null, rating: 4.4, reviews: 48,  badge: null,          colors: ['#c8a882','#1a1a1a'],           category: 'Accessories', image: 'https://images.unsplash.com/photo-1587467512961-120760940315?w=500&auto=format&fit=crop&q=80' },
  { id: 11, name: 'Cropped Trench Coat',        brand: 'Solomon Lawrence', price: 328, originalPrice: null, rating: 4.8, reviews: 22,  badge: 'New',         colors: ['#c8a882','#1a1a1a','#8b6f5e'], category: 'Jackets',     image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&auto=format&fit=crop&q=80' },
  { id: 12, name: 'Petal Print Cami Top',       brand: 'Solomon Lawrence', price: 88,  originalPrice: null, rating: 4.3, reviews: 73,  badge: null,          colors: ['#e8d5c4','#c0392b','#1a1a1a'], category: 'Tops',        image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=500&auto=format&fit=crop&q=80' },
  { id: 13, name: 'Tailored Bermuda Shorts',    brand: 'Solomon Lawrence', price: 108, originalPrice: null, rating: 4.1, reviews: 15,  badge: 'New',         colors: ['#1a1a1a','#c4bfb5'],           category: 'Pants',       image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5b2a?w=500&auto=format&fit=crop&q=80' },
  { id: 14, name: 'Leather Belt Bag',           brand: 'Solomon Lawrence', price: 148, originalPrice: null, rating: 4.7, reviews: 88,  badge: 'Best Seller', colors: ['#c8a882','#1a1a1a','#8b6f5e'], category: 'Accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop&q=80' },
  { id: 15, name: 'Smocked Maxi Dress',         brand: 'Solomon Lawrence', price: 198, originalPrice: 248,  rating: 4.5, reviews: 44,  badge: 'Sale',        colors: ['#e8d5c4','#4a6741','#c0392b'], category: 'Dresses',     image: 'https://images.unsplash.com/photo-1570464197285-9949814674a7?w=500&auto=format&fit=crop&q=80' },
  { id: 16, name: 'Ribbed Tank Top',            brand: 'Solomon Lawrence', price: 58,  originalPrice: null, rating: 4.2, reviews: 106, badge: null,          colors: ['#1a1a1a','#fff','#c8a882'],    category: 'Tops',        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80' },
  { id: 17, name: 'Slip-On Leather Loafers',   brand: 'Solomon Lawrence', price: 178, originalPrice: null, rating: 4.6, reviews: 33,  badge: 'New',         colors: ['#1a1a1a','#c8a882','#8b6f5e'], category: 'Shoes',       image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&auto=format&fit=crop&q=80' },
  { id: 18, name: 'Broderie Blouse',            brand: 'Solomon Lawrence', price: 128, originalPrice: null, rating: 4.4, reviews: 27,  badge: null,          colors: ['#fff','#e8d5c4'],              category: 'Tops',        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=80' },
  { id: 19, name: 'High-Rise Flare Jeans',      brand: 'Solomon Lawrence', price: 148, originalPrice: 188,  rating: 4.8, reviews: 159, badge: 'Sale',        colors: ['#4a5568','#1a1a1a'],           category: 'Denim',       image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80' },
  { id: 20, name: 'Gold Hoop Earring Set',      brand: 'Solomon Lawrence', price: 48,  originalPrice: null, rating: 4.9, reviews: 201, badge: 'Best Seller', colors: ['#c8a882'],                    category: 'Accessories', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80' },
]



// Then use: const productsToShow = dbProducts.length ? dbProducts : allProducts
const categories = ['All', 'Tops', 'Dresses', 'Pants', 'Skirts', 'Jackets', 'Denim', 'Shoes', 'Accessories', 'Sets']
const sortOptions = ['Featured', 'New Arrivals', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Most Reviewed']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const priceRanges = ['Under $75', '$75 – $150', '$150 – $250', '$250+']



// ── Shimmer skeleton ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 w-full" />
      <div className="flex gap-1.5 mt-2">
        {[1,2,3].map(i => (
          <div key={i} className="w-3.5 h-3.5 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2.5 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-px mt-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 py-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="divide-y divide-gray-100 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-5 py-5 animate-pulse">
          <div className="shrink-0 w-36 aspect-[3/4] bg-gray-200" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-2.5 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="flex gap-px mt-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-3 h-3 bg-gray-200 rounded-sm" />
              ))}
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/5 mt-2" />
            <div className="flex gap-1.5 mt-2">
              {[1,2,3].map(i => <div key={i} className="w-4 h-4 rounded-full bg-gray-200" />)}
            </div>
            <div className="flex gap-1.5 mt-2">
              {[1,2,3,4,5,6].map(i => <div key={i} className="w-10 h-7 bg-gray-200 rounded-sm" />)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1 mt-0.5">
      <div className="flex gap-px">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={11} strokeWidth={1.5}
            fill={s <= Math.round(rating) ? '#c8a882' : 'none'}
            color={s <= Math.round(rating) ? '#c8a882' : '#ccc'} />
        ))}
      </div>
      <span className="text-[11px] text-gray-400">({count})</span>
    </div>
  )
}

function BadgeColor(badge: string | null) {
  if (badge === 'Sale') return 'bg-red-600'
  if (badge === 'Best Seller') return 'bg-[#4a6741]'
  return 'bg-[#1a1a1a]'
}

function colorNameToHex(name: string): string {
  const map: Record<string, string> = {
    black: '#1a1a1a', white: '#ffffff', red: '#c0392b', blue: '#2980b9',
    navy: '#1a2744', green: '#4a6741', gray: '#808080', grey: '#808080',
    beige: '#c8a882', caramel: '#c8a882', tan: '#d4a96a', brown: '#8b6f5e',
    cream: '#f5f0e8', ivory: '#fffff0', pink: '#e8a0a0', rose: '#c8a882',
    purple: '#6b4c8b', lavender: '#9b8ec4', yellow: '#f0c040', orange: '#e07820',
    coral: '#e07060', mint: '#a0c8a0', sage: '#6b8b6b', olive: '#6b7040',
    burgundy: '#6b1a2a', rust: '#b04020', mustard: '#c8a020', teal: '#2a8080',
    charcoal: '#404040', taupe: '#8b7d6b', sand: '#c8b080', blush: '#e8b0a0',
  }
  return map[name.toLowerCase()] ?? '#1a1a1a'
}


function ProductCard({ product }: { product: typeof allProducts[0] & { id: string | number } }) {
  const [wished, setWished] = useState(false)
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null

  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`} className="block relative overflow-hidden bg-[#f5f2ed] aspect-[3/4]">
        <img
          src={product.image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className={`absolute top-2.5 left-2.5 ${BadgeColor(product.badge)} text-white text-[9px] font-semibold tracking-widest uppercase px-2 py-1`}>
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-2.5 left-2.5 mt-6 bg-red-600 text-white text-[9px] font-semibold tracking-wider px-2 py-1">
            -{discount}%
          </span>
        )}
        <WishlistButton
  productId={String(product.id)}
  size={16}
  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
/>
        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a]/90 flex items-center justify-center gap-1 py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {sizes.slice(0,5).map(s => (
            <button key={s} onClick={e => e.preventDefault()}
              className="text-white text-[10px] tracking-wider border border-white/30 bg-white/10 hover:bg-white/25 px-2 py-1 transition-colors cursor-pointer">
              {s}
            </button>
          ))}
        </div>
      </Link>
      {product.colors?.length > 0 && (
        <div className="flex gap-1.5 mt-2">
          {product.colors.slice(0,5).map((c: string) => (
            <button key={c} className="w-3.5 h-3.5 rounded-full border border-gray-200 hover:border-gray-800 transition-all cursor-pointer p-0"
              style={{ background: c.startsWith('#') ? c : colorNameToHex(c) }} />
          ))}
          {product.colors.length > 5 && <span className="text-[10px] text-gray-400 self-center">+{product.colors.length - 5}</span>}
        </div>
      )}
      <div className="mt-1.5">
        <p className="text-[10px] text-gray-400 tracking-widest uppercase">{product.brand}</p>
        <Link href={`/products/${product.id}`} className="text-[13px] text-[#1a1a1a] no-underline leading-snug block mt-0.5 hover:underline">
          {product.name}
        </Link>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className={`text-[13px] font-medium ${product.originalPrice ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[12px] text-gray-400 line-through">${product.originalPrice}</span>
          )}
        </div>
        <StarRating rating={product.rating} count={product.reviews} />
      </div>
    </div>
  )
}

export default function CollectionsPage({ slug }: { slug?: string }) {
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [sort, setSort] = useState('Featured')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [onSaleOnly, setOnSaleOnly] = useState(false)
   const [page, setPage] = useState(1)
  const [dbProducts, setDbProducts] = useState<any[]>([])

  const [collectionName, setCollectionName] = useState('')
  const perPage = 12

  const searchParams = useSearchParams()
  const categoryParam = searchParams?.get('category')

  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam)
  }, [categoryParam])

  // Simulate initial load — replace this with your real DB fetch later
   useEffect(() => {
    setLoading(true)
    if (slug) {
      // fetch specific collection
      fetch(`/api/collections/${slug}`)
        .then(r => r.json())
    .then(data => {
          console.log('Collection API response:', data)
          if (data.error || !data.collection) {
            setDbProducts([])
            setCollectionName('Collection Not Found')
            return
          }
          if (data.products) {
            setDbProducts(data.products.map((p: any) => ({
              ...p,
              image: p.images?.[0] ?? 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80',
              originalPrice: p.comparePrice ? Number(p.comparePrice) : null,
              colors: p.variants
                ? [...new Map(p.variants.filter((v: any) => v.colorHex).map((v: any) => [v.colorHex, v.colorHex])).values()]
                : [],
              reviews: p.reviewCount ?? 0,
            })))
          }
          if (data.collection?.name) setCollectionName(data.collection.name)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      // fetch all products for /collections page
      fetch('/api/admin/products?limit=100')
        .then(r => r.json())
        .then(data => {
          if (data.products) {
            setDbProducts(data.products.map((p: any) => ({
              ...p,
              image: p.images?.[0] ?? 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80',
              originalPrice: p.comparePrice ? Number(p.comparePrice) : null,
               colors: p.variants
                ? [...new Map(p.variants.filter((v: any) => v.colorHex).map((v: any) => [v.colorHex, v.colorHex])).values()]
                : [],
              reviews: p.reviewCount ?? 0,
            })))
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [slug])

    useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [activeCategory, page])

 const filtered = useMemo(() => {
    const productsToShow = slug ? dbProducts : (dbProducts.length ? dbProducts : allProducts)
    let p = [...productsToShow]

    

    
    if (activeCategory !== 'All') p = p.filter(x => x.category === activeCategory)
    if (onSaleOnly) p = p.filter(x => x.badge === 'Sale' || x.originalPrice)
    if (selectedPrices.length) {
      p = p.filter(x => selectedPrices.some(r => {
        if (r === 'Under $75') return x.price < 75
        if (r === '$75 – $150') return x.price >= 75 && x.price <= 150
        if (r === '$150 – $250') return x.price > 150 && x.price <= 250
        if (r === '$250+') return x.price > 250
        return true
      }))
    }
    if (sort === 'Price: Low to High') p.sort((a, b) => a.price - b.price)
    if (sort === 'Price: High to Low') p.sort((a, b) => b.price - a.price)
    if (sort === 'Top Rated') p.sort((a, b) => b.rating - a.rating)
    if (sort === 'Most Reviewed') p.sort((a, b) => b.reviews - a.reviews)
    if (sort === 'New Arrivals') p = [...p.filter(x => x.badge === 'New'), ...p.filter(x => x.badge !== 'New')]
    return p
   }, [activeCategory, sort, onSaleOnly, selectedPrices, dbProducts, slug])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const activeFilters = [
    ...selectedSizes.map(s => ({ label: `Size: ${s}`, remove: () => setSelectedSizes(p => p.filter(x => x !== s)) })),
    ...selectedPrices.map(r => ({ label: r, remove: () => setSelectedPrices(p => p.filter(x => x !== r)) })),
    ...(onSaleOnly ? [{ label: 'On Sale', remove: () => setOnSaleOnly(false) }] : []),
  ]

  const toggleSize = (s: string) => setSelectedSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  const togglePrice = (r: string) => setSelectedPrices(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r])

  return (
    <main className="bg-white min-h-screen">

      {/* Breadcrumb */}
      <div className="max-container px-4 md:px-10 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400 tracking-wide">
          <Link href="/" className="hover:text-[#1a1a1a] hover:underline">Home</Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-[#1a1a1a] hover:underline">Women</Link>
          <span>/</span>
          <span className="text-[#1a1a1a]">All Clothing</span>
        </div>
      </div>

      {/* Page header */}
      <div className="max-container px-4 md:px-10 pt-7 pb-5">
        <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-light italic text-[#1a1a1a] tracking-tight">
          {collectionName || (categoryParam ? categoryParam : "Women's Clothing")}
        </h1>
        <p className="text-sm text-gray-400 tracking-wide mt-1">
          {loading ? (
            <span className="inline-block h-3 w-16 bg-gray-200 rounded animate-pulse" />
          ) : (
            `${filtered.length} items`
          )}
        </p>
      </div>

      {/* Category tabs */}
      <div className="border-t border-b border-gray-100 overflow-x-auto scrollbar-hide">
        <div className="max-container px-4 md:px-10 flex">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setPage(1) }}
              className={`shrink-0 px-4 py-3 text-[13px] tracking-wide border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 whitespace-nowrap
                ${activeCategory === cat
                  ? 'border-b-[#1a1a1a] text-[#1a1a1a] font-medium'
                  : 'border-b-transparent text-gray-400 hover:text-[#1a1a1a] font-normal'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-container px-4 md:px-10">

        {/* Toolbar */}
        <div className="flex items-center justify-between py-3.5 border-b border-gray-100 flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className={`flex items-center gap-1.5 text-xs tracking-widest uppercase px-3.5 py-2 border transition-all cursor-pointer
                ${filtersOpen ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#1a1a1a] border-gray-300 hover:border-[#1a1a1a]'}`}
            >
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filter
              {activeFilters.length > 0 && (
                <span className="bg-red-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
            {activeFilters.map(f => (
              <div key={f.label} className="flex items-center gap-1.5 bg-[#1a1a1a] text-white px-2.5 py-1.5 text-[11px] tracking-wide">
                {f.label}
                <button onClick={f.remove} className="text-white border-none bg-transparent cursor-pointer p-0 flex">
                  <X size={11} />
                </button>
              </div>
            ))}
            {activeFilters.length > 1 && (
              <button
                onClick={() => { setSelectedSizes([]); setSelectedPrices([]); setOnSaleOnly(false) }}
                className="text-[11px] text-gray-400 underline bg-transparent border-none cursor-pointer tracking-wide"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-1.5 text-[12px] tracking-wide px-3.5 py-2 border border-gray-300 bg-white text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors cursor-pointer whitespace-nowrap"
              >
                Sort: {sort}
                <ChevronDown size={12} strokeWidth={1.5} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-50 min-w-[200px] py-1">
                  {sortOptions.map(s => (
                    <button key={s} onClick={() => { setSort(s); setSortOpen(false) }}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-[13px] text-left text-[#1a1a1a] tracking-wide border-none cursor-pointer transition-colors
                        ${s === sort ? 'bg-[#f8f6f1]' : 'bg-white hover:bg-[#f8f6f1]'}`}>
                      {s}
                      {s === sort && <Check size={12} strokeWidth={2} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex border border-gray-300">
              <button onClick={() => setView('grid')}
                className={`p-2 flex items-center border-none cursor-pointer transition-colors ${view === 'grid' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                <Grid size={14} strokeWidth={1.5} />
              </button>
              <button onClick={() => setView('list')}
                className={`p-2 flex items-center border-none cursor-pointer transition-colors ${view === 'list' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                <LayoutList size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="flex gap-10 flex-wrap py-5 border-b border-gray-100">
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#1a1a1a] mb-3">Size</p>
              <div className="flex gap-1.5 flex-wrap">
                {sizes.map(s => (
                  <button key={s} onClick={() => toggleSize(s)}
                    className={`text-xs px-3.5 py-1.5 border tracking-wide transition-all cursor-pointer
                      ${selectedSizes.includes(s) ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-[#1a1a1a]'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#1a1a1a] mb-3">Price</p>
              <div className="flex flex-col gap-2">
                {priceRanges.map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-600 tracking-wide">
                    <input type="checkbox" checked={selectedPrices.includes(r)} onChange={() => togglePrice(r)}
                      className="w-3.5 h-3.5 accent-[#1a1a1a]" />
                    {r}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#1a1a1a] mb-3">Offers</p>
              <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-600 tracking-wide">
                <input type="checkbox" checked={onSaleOnly} onChange={() => setOnSaleOnly(o => !o)}
                  className="w-3.5 h-3.5 accent-red-600" />
                On Sale
              </label>
            </div>
          </div>
        )}

        {/* Products — skeleton or real */}
        {loading ? (
          view === 'list' ? <SkeletonList /> : <SkeletonGrid />
        ) : paginated.length === 0 ? (
          <div className="py-24 text-center font-[family-name:var(--font-display)] text-2xl text-gray-400 italic">
            No products match your filters
          </div>
        ) : view === 'list' ? (
          <div className="divide-y divide-gray-100 py-4">
            {paginated.map(product => {
              const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null
              return (
                <div key={product.id} className="flex gap-5 py-5">
                  <Link href={`/products/${product.id}`} className="shrink-0 w-36 aspect-[3/4] overflow-hidden bg-[#f5f2ed] block relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    {product.badge && (
                      <span className={`absolute top-2 left-2 ${BadgeColor(product.badge)} text-white text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5`}>
                        {product.badge}
                      </span>
                    )}
                  </Link>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 tracking-widest uppercase">{product.brand}</p>
                    <Link href={`/products/${product.id}`} className="font-[family-name:var(--font-display)] text-xl italic text-[#1a1a1a] no-underline hover:underline leading-snug block mt-1">
                      {product.name}
                    </Link>
                    <StarRating rating={product.rating} count={product.reviews} />
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className={`text-sm font-medium ${product.originalPrice ? 'text-red-600' : 'text-[#1a1a1a]'}`}>${product.price}</span>
                      {product.originalPrice && <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>}
                      {discount && <span className="text-xs text-red-600 font-semibold">{discount}% off</span>}
                    </div>
                                      {product.colors?.length > 0 && (
                      <div className="flex gap-1.5 mt-2.5">
                        {product.colors.map((c: string) => (
                           <button key={c} className="w-4 h-4 rounded-full border border-gray-200 hover:border-gray-700 transition-all cursor-pointer p-0" style={{ background: c.startsWith('#') ? c : colorNameToHex(c) }} />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {sizes.map(s => (
                        <button key={s} className="text-[11px] px-2.5 py-1 border border-gray-300 bg-white text-gray-600 hover:border-[#1a1a1a] transition-all cursor-pointer tracking-wide">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 py-6">
            {paginated.map((product, idx) => (
              <React.Fragment key={product.id}>
                {idx === 8 && (
                  <div className="col-span-2 bg-[#1a1a1a] flex flex-col items-center justify-center text-center px-8 py-10 min-h-[180px]">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">New Season</p>
                    <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-light italic text-white leading-snug mb-4">
                      Spring Styling,<br />Your Way
                    </h3>
                    <Link href="/collections/new-arrivals" className="text-[11px] tracking-widest uppercase text-white border-b border-white/40 pb-0.5 no-underline hover:border-white transition-colors">
                      Explore New Arrivals
                    </Link>
                  </div>
                )}
                <ProductCard product={product} />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-10 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center border border-gray-300 bg-white cursor-pointer disabled:opacity-30 hover:border-[#1a1a1a] transition-colors">
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 flex items-center justify-center border text-[13px] transition-all cursor-pointer
                  ${p === page ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white font-semibold' : 'border-gray-300 bg-white text-[#1a1a1a] hover:border-[#1a1a1a]'}`}>
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="text-sm text-gray-400 px-1">... {totalPages}</span>}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center border border-gray-300 bg-white cursor-pointer disabled:opacity-30 hover:border-[#1a1a1a] transition-colors">
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </main>
  )
}