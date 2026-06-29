'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Star, X, Check, Grid, LayoutList } from 'lucide-react'
import WishlistButton from '@/components/WishlistButton'
import { useSearchParams } from 'next/navigation'
import { useCurrency } from '@/hooks/useCurrency'





// Then use: const productsToShow = dbProducts.length ? dbProducts : allProducts
const categories = ['All', 'Tops', 'Dresses', 'Pants', 'Skirts', 'Jackets', 'Denim', 'Accessories', 'Sets']
const sortOptions = ['Featured', 'New Arrivals', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Most Reviewed']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const priceRanges = ['Under $75', '$75 – $150', '$150 – $250', '$250+']



function expandProducts(products: any[]) {
  const result: any[] = []
  for (const p of products) {
    if (p.isGrouped === false && p.variants?.length) {
      const colors = [...new Map(p.variants.map((v: any) => [v.color, v])).values()]
      for (const v of colors) {
       const colorImages = v.images?.length ? v.images : []
const colorSlug = v.color.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const fallbackImage = p.images?.find((img: string) => img.toLowerCase().includes(colorSlug))
  ?? p.images?.[0] 
  ?? p.image
const displayImage = colorImages[0] ?? fallbackImage
result.push({
  ...p,
  id: p.id,
  slug: p.slug,
  image: displayImage,
  colors: v.colorHex ? [{ hex: v.colorHex, name: v.color, images: colorImages }] : [],
  _colorLabel: v.color,
  _colorHex: v.colorHex,
  _expandedKey: `${p.id}-${v.color}`,
})
      }
    } else {
      result.push(p)
    }
  }
  return result
}

// ── Shimmer skeleton ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2.5/3.8] bg-gray-200 w-full" />
      <div className="flex gap-1.5 mt-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-3.5 h-3.5 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2.5 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-px mt-1">
          {[1, 2, 3, 4, 5].map(i => (
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
          <div className="shrink-0 w-36 aspect-[2.5/3.8] bg-gray-200" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-2.5 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="flex gap-px mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-3 h-3 bg-gray-200 rounded-sm" />
              ))}
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/5 mt-2" />
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 rounded-full bg-gray-200" />)}
            </div>
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-10 h-7 bg-gray-200 rounded-sm" />)}
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
        {[1, 2, 3, 4, 5].map(s => (
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
  const [hovered, setHovered] = useState(false)
  const [activeColor, setActiveColor] = useState<any>(null)
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null
  const href = `/products/${(product as any).slug ?? product.id}`
  const { convert } = useCurrency()
  const displayImage = activeColor?.images?.[0] ?? product.image
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        border: '1px solid #eeebe6',
        padding: '8px',
        background: '#fff',
        transition: 'box-shadow 0.3s ease',
        boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.10)' : 'none',
      }}
    >
      <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
       <div style={{ position: 'relative', overflow: 'hidden', background: '#f9f9f9', aspectRatio: '3/4', width: '100%' }}>
<img
  src={displayImage} alt={product.name}
  loading="lazy"
  decoding="async"
  fetchPriority="low"
  style={{
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
    transition: 'transform 0.5s ease',
    transform: hovered ? 'scale(1.04)' : 'scale(1)',
  }}
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
            style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}
          />
          {hovered && (
            <div style={{
              position: 'absolute', bottom: '16px', left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff', padding: '10px 24px',
              fontFamily: 'var(--font-body)', fontSize: '11px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#1a1a1a', fontWeight: 600,
              whiteSpace: 'nowrap', border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)', cursor: 'pointer',
            }}>
              Quick View
            </div>
          )}
        </div>
      </Link>
      {product.colors?.length > 0 && (
        <div className="flex gap-1.5 mt-2">
          {product.colors.slice(0, 6).map((c: any) => {
            const hex = typeof c === 'string' ? (c.startsWith('#') ? c : colorNameToHex(c)) : c.hex
            const isActive = activeColor?.hex === hex
            return (
              <div
                key={hex}
                title={typeof c === 'object' ? c.name : c}
                onClick={e => { e.preventDefault(); setActiveColor(isActive ? null : (typeof c === 'object' ? c : { hex, images: [] })) }}
                className="w-3.5 h-3.5 rounded-full cursor-pointer"
                style={{
                  background: hex,
                  border: isActive ? '2px solid #1a1a1a' : (hex === '#ffffff' || hex === '#fffff0') ? '1px solid #ddd' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 0 2px #fff, 0 0 0 3px #1a1a1a' : '0 0 0 1px rgba(0,0,0,0.08)',
                  transition: 'box-shadow 0.15s',
                }}
              />
            )
          })}
          {product.colors.length > 6 && <span className="text-[10px] text-gray-400 self-center">+{product.colors.length - 6}</span>}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '2px', overflow: 'hidden', marginTop: '6px' }}>
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#1a1a1a', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline', marginTop: '2px' }}>
            <span style={{ fontSize: '13px', color: product.originalPrice ? '#c0392b' : '#555', fontWeight: product.originalPrice ? 600 : 400 }}>
              {convert(product.price)}
            </span>
            {product.originalPrice && (
              <span style={{ fontSize: '12px', color: '#aaa', textDecoration: 'line-through' }}>
               {convert(product.originalPrice)}
              </span>
            )}
          </div>
          {(product as any).reviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={10} strokeWidth={1.5}
                    fill={s <= Math.round((product as any).rating ?? 0) ? '#1a1a1a' : 'none'}
                    color={s <= Math.round((product as any).rating ?? 0) ? '#1a1a1a' : '#ccc'} />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: '#888' }}>
                {((product as any).rating ?? 0).toFixed(1)} ({(product as any).reviews})
              </span>
            </div>
          )}
        </Link>
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
  const searchQuery = searchParams?.get('search') ?? ''

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
          
          if (data.error || !data.collection) {
            setDbProducts([])
            setCollectionName('Collection Not Found')
            return
          }
          if (data.products) {
            setDbProducts(data.products.map((p: any) => ({
  ...p,
  image: p.images?.[0] ?? '',
  originalPrice: p.comparePrice ? Number(p.comparePrice) : null,
  colors: p.variants
    ? [...new Map(p.variants.filter((v: any) => v.colorHex).map((v: any) => [v.colorHex, { hex: v.colorHex, name: v.color, images: v.images ?? [] }])).values()]
    : [],
  reviews: p.reviewCount ?? 0,
rating: p.avgRating ?? 0,
})))
          }
          if (data.collection?.name) setCollectionName(data.collection.name)
        })
        .catch(() => { })
        .finally(() => setLoading(false))
    } else {
      // fetch all products for /collections page
      fetch('/api/products/search?q=&limit=200')
        .then(r => r.json())
        .then(data => {
          
          if (data.products) {
            setDbProducts(data.products.map((p: any) => ({
              ...p,
              image: p.images?.[0] ?? 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80',
              originalPrice: p.comparePrice ? Number(p.comparePrice) : null,
              colors: p.variants
                ? [...new Map(p.variants.filter((v: any) => v.colorHex).map((v: any) => [v.colorHex, { hex: v.colorHex, name: v.color, images: v.images ?? [] }])).values()]
                : [],
              reviews: p.reviewCount ?? 0,
              rating: p.avgRating ?? 0,
            })))
          }
        })
        .catch(() => { })
        .finally(() => setLoading(false))
    }
  }, [slug])



  const filtered = useMemo(() => {
    const productsToShow = slug ? dbProducts : (dbProducts.length ? dbProducts : [])
    let p = [...productsToShow]

if (searchQuery.trim()) {
  const q = searchQuery.toLowerCase()
  p = p.filter(x =>
    x.name?.toLowerCase().includes(q) ||
    x.category?.toLowerCase().includes(q) ||
    x.description?.toLowerCase().includes(q)
  )
}


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
 }, [activeCategory, sort, onSaleOnly, selectedPrices, dbProducts, slug, searchQuery])

  const expanded = expandProducts(filtered)
  const totalPages = Math.ceil(expanded.length / perPage)
  const paginated = expanded.slice((page - 1) * perPage, page * perPage)

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
<span className="text-[#1a1a1a]">
  {searchQuery
    ? `Search: "${searchQuery}"`
    : collectionName
    ? collectionName
    : activeCategory !== 'All'
    ? activeCategory
    : 'All Clothing'}
</span>
        </div>
      </div>

      {/* Page header */}
      <div className="max-container px-4 md:px-10 pt-7 pb-5">
             <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-light italic text-[#1a1a1a] tracking-tight">
          {loading && slug
            ? <span className="inline-block h-10 w-64 bg-gray-200 rounded animate-pulse" />
            : collectionName || (searchQuery ? `Search results for "${searchQuery}"` : categoryParam ? categoryParam : "Clothing")
          }
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
        ) : paginated.length === 0 && !loading ? (
          <div className="py-24 text-center font-[family-name:var(--font-display)] text-2xl text-gray-400 italic">
            No products match your filters
          </div>
      ) : view === 'list' ? (
  <div key={`list-${view}`} className="divide-y divide-gray-100 py-4">
    {paginated.map(product => {
              const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null
              return (
                <div key={product._expandedKey ?? product.id} className="flex gap-5 py-5">
                  <Link href={`/products/${product.id}`} className="shrink-0 w-36 aspect-[2.5/3.8] overflow-hidden bg-[#f5f2ed] block relative">
                    <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
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
                          <button key={c} className="w-4 h-4 rounded-full border border-gray-200 hover:border-gray-700 transition-all cursor-pointer p-0" style={{ background: typeof c === 'object' ? c.hex : (c.startsWith('#') ? c : colorNameToHex(c)) }} />
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
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 py-6" key={`grid-${view}`}>
  {paginated.map((product, idx) => (
    <React.Fragment key={product._expandedKey ?? product.id}>
      {idx === 8 && (
        <div className="col-span-2 flex flex-col items-center justify-center text-center px-8 py-10 min-h-[180px] relative overflow-hidden">
          <img
            src="https://d3o8u8o2i2q94t.cloudfront.net/products/1776100767629-1775596326876-s-linenwomen-dt-v1.webp"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">New Season</p>
            <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-light italic text-white leading-snug mb-4">
              Spring Styling,<br />Your Way
            </h3>
            <Link href="/collections/new-arrivals" className="text-[11px] tracking-widest uppercase text-white border-b border-white/40 pb-0.5 no-underline hover:border-white transition-colors">
              Explore New Arrivals
            </Link>
          </div>
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