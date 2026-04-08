'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Star, X, Check, Grid, LayoutList } from 'lucide-react'
import WishlistButton from '@/components/WishlistButton'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const sortOptions = ['Featured', 'New Arrivals', 'Price: Low to High', 'Price: High to Low', 'Top Rated']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const priceRanges = ['Under $75', '$75 – $150', '$150 – $250', '$250+']

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

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 py-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 w-full" />
          <div className="mt-2 space-y-1.5">
            <div className="h-2.5 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`} className="block relative overflow-hidden bg-[#f5f2ed] aspect-[3/4]">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className={`absolute top-2.5 left-2.5 ${BadgeColor(product.badge)} text-white text-[9px] font-semibold tracking-widest uppercase px-2 py-1`}>
            {product.badge}
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
      <div className="mt-1.5">
        <p className="text-[10px] text-gray-400 tracking-widest uppercase">{product.brand ?? 'Solomon & Sage'}</p>
        <Link href={`/products/${product.id}`} className="text-[13px] text-[#1a1a1a] no-underline leading-snug block mt-0.5 hover:underline">
          {product.name}
        </Link>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className={`text-[13px] font-medium ${product.comparePrice ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
            ${Number(product.price).toFixed(2)}
          </span>
          {product.comparePrice && (
            <span className="text-[12px] text-gray-400 line-through">${Number(product.comparePrice).toFixed(2)}</span>
          )}
        </div>
        <StarRating rating={product.rating ?? 4.5} count={product.reviewCount ?? 0} />
      </div>
    </div>
  )
}

export default function CollectionSlugPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [collection, setCollection] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [sort, setSort] = useState('Featured')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [onSaleOnly, setOnSaleOnly] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 12

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    fetch(`/api/collections/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (!data.collection) { setNotFound(true); return }
        setCollection(data.collection)
        setProducts(data.products ?? [])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const filtered = useMemo(() => {
    let p = [...products]
    if (onSaleOnly) p = p.filter(x => x.badge === 'Sale' || x.comparePrice)
    if (selectedPrices.length) {
      p = p.filter(x => selectedPrices.some(r => {
        const price = Number(x.price)
        if (r === 'Under $75') return price < 75
        if (r === '$75 – $150') return price >= 75 && price <= 150
        if (r === '$150 – $250') return price > 150 && price <= 250
        if (r === '$250+') return price > 250
        return true
      }))
    }
    if (sort === 'Price: Low to High') p.sort((a, b) => Number(a.price) - Number(b.price))
    if (sort === 'Price: High to Low') p.sort((a, b) => Number(b.price) - Number(a.price))
    if (sort === 'Top Rated') p.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    if (sort === 'New Arrivals') p = [...p.filter(x => x.badge === 'New'), ...p.filter(x => x.badge !== 'New')]
    return p
  }, [products, sort, onSaleOnly, selectedPrices])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const togglePrice = (r: string) => setSelectedPrices(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r])

  const activeFilters = [
    ...selectedPrices.map(r => ({ label: r, remove: () => setSelectedPrices(p => p.filter(x => x !== r)) })),
    ...(onSaleOnly ? [{ label: 'On Sale', remove: () => setOnSaleOnly(false) }] : []),
  ]

  if (notFound) return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center py-20">
          <p className="font-[family-name:var(--font-display)] text-3xl italic font-light text-gray-400 mb-4">Collection not found</p>
          <Link href="/collections" className="text-[12px] tracking-widest uppercase underline text-[#1a1a1a]">Browse All</Link>
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
            <Link href="/collections" className="hover:text-[#1a1a1a] hover:underline">Collections</Link>
            <span>/</span>
            <span className="text-[#1a1a1a]">{collection?.name ?? slug}</span>
          </div>
        </div>

        {/* Header */}
        <div className="max-container px-4 md:px-10 pt-7 pb-5">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-64 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          ) : (
            <>
              <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-light italic text-[#1a1a1a] tracking-tight">
                {collection?.name}
              </h1>
              {collection?.description && (
                <p className="text-sm text-gray-400 tracking-wide mt-1 max-w-xl">{collection.description}</p>
              )}
              <p className="text-sm text-gray-400 tracking-wide mt-1">{filtered.length} items</p>
            </>
          )}
        </div>

        <div className="max-container px-4 md:px-10">

          {/* Toolbar */}
          <div className="flex items-center justify-between py-3.5 border-b border-gray-100 flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setFiltersOpen(o => !o)}
                className={`flex items-center gap-1.5 text-xs tracking-widest uppercase px-3.5 py-2 border transition-all cursor-pointer
                  ${filtersOpen ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#1a1a1a] border-gray-300 hover:border-[#1a1a1a]'}`}>
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
                  <button onClick={f.remove} className="text-white border-none bg-transparent cursor-pointer p-0 flex"><X size={11} /></button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setSortOpen(o => !o)}
                  className="flex items-center gap-1.5 text-[12px] tracking-wide px-3.5 py-2 border border-gray-300 bg-white text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors cursor-pointer whitespace-nowrap">
                  Sort: {sort}
                  <ChevronDown size={12} strokeWidth={1.5} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-50 min-w-[200px] py-1">
                    {sortOptions.map(s => (
                      <button key={s} onClick={() => { setSort(s); setSortOpen(false) }}
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-[13px] text-left text-[#1a1a1a] tracking-wide border-none cursor-pointer transition-colors
                          ${s === sort ? 'bg-[#f8f6f1]' : 'bg-white hover:bg-[#f8f6f1]'}`}>
                        {s}{s === sort && <Check size={12} strokeWidth={2} />}
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
                <p className="text-[11px] font-semibold tracking-widests uppercase text-[#1a1a1a] mb-3">Price</p>
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
                <p className="text-[11px] font-semibold tracking-widests uppercase text-[#1a1a1a] mb-3">Offers</p>
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-600 tracking-wide">
                  <input type="checkbox" checked={onSaleOnly} onChange={() => setOnSaleOnly(o => !o)}
                    className="w-3.5 h-3.5 accent-red-600" />
                  On Sale
                </label>
              </div>
            </div>
          )}

          {/* Products */}
          {loading ? <SkeletonGrid /> : paginated.length === 0 ? (
            <div className="py-24 text-center font-[family-name:var(--font-display)] text-2xl text-gray-400 italic">
              No products in this collection
            </div>
          ) : view === 'list' ? (
            <div className="divide-y divide-gray-100 py-4">
              {paginated.map(product => (
                <div key={product.id} className="flex gap-5 py-5">
                  <Link href={`/products/${product.id}`} className="shrink-0 w-36 aspect-[3/4] overflow-hidden bg-[#f5f2ed] block">
                    <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 tracking-widests uppercase">{product.brand ?? 'Solomon & Sage'}</p>
                    <Link href={`/products/${product.id}`} className="font-[family-name:var(--font-display)] text-xl italic text-[#1a1a1a] no-underline hover:underline leading-snug block mt-1">
                      {product.name}
                    </Link>
                    <StarRating rating={product.rating ?? 4.5} count={product.reviewCount ?? 0} />
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className={`text-sm font-medium ${product.comparePrice ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.comparePrice && <span className="text-xs text-gray-400 line-through">${Number(product.comparePrice).toFixed(2)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 py-6">
              {paginated.map(product => (
                <ProductCard key={product.id} product={product} />
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
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 bg-white cursor-pointer disabled:opacity-30 hover:border-[#1a1a1a] transition-colors">
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}