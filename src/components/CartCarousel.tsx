// Save as: src/components/CartCarousel.tsx (REPLACE existing)
'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Product {
  id: string; slug: string; name: string
  price: number; comparePrice: number | null
  image: string; badge: string | null
}

export default function CartCarousel({ title, slot }: { title: string; slot: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/collections/slot?slot=${slot}&limit=10`)
      .then(r => r.json())
      .then(d => {
        setProducts((d.products ?? []).map((p: any) => ({
          id:           p.id,
          slug:         p.slug ?? p.id,
          name:         p.name,
          price:        Number(p.price),
          comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
          image:        p.images?.[0] ?? '',
          badge:        p.badge ?? null,
        })))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [slot])

  const scroll = (dir: 'left' | 'right') =>
    ref.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })

  return (
    <section className="py-10 border-t border-gray-100">
      <div className="max-container px-4 md:px-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl italic font-light text-[#1a1a1a]">
            {title}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')}
              className="w-8 h-8 border border-gray-300 flex items-center justify-center cursor-pointer bg-white hover:border-[#1a1a1a] transition-colors">
              <ChevronLeft size={15} strokeWidth={1.5} />
            </button>
            <button onClick={() => scroll('right')}
              className="w-8 h-8 border border-gray-300 flex items-center justify-center cursor-pointer bg-white hover:border-[#1a1a1a] transition-colors">
              <ChevronRight size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 w-40 md:w-48 animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 w-full" />
                  <div className="mt-2 h-3 bg-gray-200 rounded w-3/4" />
                  <div className="mt-1 h-3 bg-gray-200 rounded w-1/3" />
                </div>
              ))
            : products.map(item => {
                const onSale = item.comparePrice && item.comparePrice > item.price
                return (
                  <Link key={item.id} href={`/products/${item.slug}`}
                    className="shrink-0 w-40 md:w-48 no-underline group">
                    <div className="aspect-[3/4] overflow-hidden bg-[#f5f2ed] relative">
                      {item.image
                        ? <img src={item.image} alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[10px] text-gray-300">No Image</span>
                          </div>
                      }
                      {item.badge && (
                        <span className={`absolute top-2 left-2 text-white text-[9px] font-semibold tracking-widests uppercase px-2 py-0.5
                          ${item.badge === 'Sale' ? 'bg-red-600' : item.badge === 'Best Seller' ? 'bg-[#4a6741]' : 'bg-[#1a1a1a]'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#1a1a1a] mt-2 leading-snug tracking-wide group-hover:underline line-clamp-2">
                      {item.name}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className={`text-[12px] ${onSale ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
                        ${item.price.toFixed(2)}
                      </span>
                      {onSale && <span className="text-[11px] text-gray-400 line-through">${item.comparePrice!.toFixed(2)}</span>}
                    </div>
                  </Link>
                )
              })}
        </div>
      </div>
    </section>
  )
}