// Save as: src/components/HomeProductGrid.tsx (REPLACE existing)
// Now fetches from collection slot API — admin controls which collection shows here
'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import WishlistButton from '@/components/WishlistButton'

interface Props {
  title:        string
  subtitle?:    string
  slot:         string   // e.g. "homepage_new_arrivals"
  fallbackFilter?: 'new' | 'bestseller' | 'sale' | 'all'
  limit?:       number
  viewAllHref:  string
}

interface Product {
  id: string; slug: string; name: string
  price: number; comparePrice: number | null
  image: string; badge: string | null
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-40 md:w-52 animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 w-full" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

export default function HomeProductGrid({
  title, subtitle, slot, fallbackFilter = 'all', limit = 10, viewAllHref
}: Props) {
  const [products,        setProducts]        = useState<Product[]>([])
  const [collectionName,  setCollectionName]  = useState<string | null>(null)
  const [loading,         setLoading]         = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/collections/slot?slot=${slot}&limit=${limit}`)
      .then(r => r.json())
      .then(d => {
        setCollectionName(d.collection?.name ?? null)
        const mapped: Product[] = (d.products ?? []).slice(0, limit).map((p: any) => ({
          id:           p.id,
          slug:         p.slug ?? p.id,
          name:         p.name,
          price:        Number(p.price),
          comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
          image:        p.images?.[0] ?? '',
          badge:        p.badge ?? null,
        }))
        setProducts(mapped)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [slot, limit])

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })

  return (
    <section className="py-10 md:py-14">
      <div className="max-container px-4 md:px-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-light italic text-[#1a1a1a]">
              {title}
            </h2>
            {(subtitle || collectionName) && (
              <p className="text-[13px] text-gray-400 tracking-wide mt-1">
                {subtitle ?? collectionName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2">
              <button onClick={() => scroll('left')}
                className="w-8 h-8 border border-gray-300 flex items-center justify-center cursor-pointer bg-white hover:border-[#1a1a1a] transition-colors">
                <ChevronLeft size={15} strokeWidth={1.5} />
              </button>
              <button onClick={() => scroll('right')}
                className="w-8 h-8 border border-gray-300 flex items-center justify-center cursor-pointer bg-white hover:border-[#1a1a1a] transition-colors">
                <ChevronRight size={15} strokeWidth={1.5} />
              </button>
            </div>
            <Link href={viewAllHref}
              className="text-[11px] tracking-widests uppercase text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 no-underline hover:text-gray-500 transition-colors whitespace-nowrap">
              View All
            </Link>
          </div>
        </div>

        <div ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length === 0
              ? <div className="w-full py-12 text-center text-gray-300 text-[13px] italic">No products</div>
              : products.map(product => {
                  const onSale = product.comparePrice && product.comparePrice > product.price
                  return (
                    <div key={product.id} className="shrink-0 w-40 md:w-52 group">
                      <Link href={`/products/${product.slug}`}
                        className="block aspect-[3/4] overflow-hidden bg-[#f5f2ed] relative no-underline">
                        {product.image
                          ? <img src={product.image} alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <span className="text-[10px] text-gray-300 tracking-widests">No Image</span>
                            </div>
                        }
                        {product.badge && (
                          <span className={`absolute top-2 left-2 text-white text-[9px] font-semibold tracking-widests uppercase px-2 py-0.5
                            ${product.badge === 'Sale' ? 'bg-red-600' : product.badge === 'Best Seller' ? 'bg-[#4a6741]' : 'bg-[#1a1a1a]'}`}>
                            {product.badge}
                          </span>
                        )}
                        <WishlistButton
                          productId={product.id}
                          size={14}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </Link>
                      <Link href={`/products/${product.slug}`} className="no-underline block mt-2">
                        <p className="text-[12px] text-[#1a1a1a] leading-snug tracking-wide group-hover:underline line-clamp-2">
                          {product.name}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className={`text-[12px] font-medium ${onSale ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
                            ${product.price.toFixed(2)}
                          </span>
                          {onSale && (
                            <span className="text-[11px] text-gray-400 line-through">
                              ${product.comparePrice!.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  )
                })}
        </div>
      </div>
    </section>
  )
}