// Save as: src/app/account/wishlist/page.tsx (REPLACE existing)
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, X, Package } from 'lucide-react'

export default function WishlistPage() {
  const [items,   setItems]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/account/wishlist')
      if (!res.ok) { setItems([]); setLoading(false); return }
      const d = await res.json()
      setItems(d.items ?? [])
    } catch {
      setItems([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = async (productId: string) => {
    await fetch('/api/account/wishlist', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId }),
    })
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 p-5">
        <h1 className="text-[18px] font-semibold text-[#1a1a1a] mb-1 flex items-center gap-2">
          <Heart size={18} strokeWidth={1.5} className="text-[#c8a882]" /> Wishlist
        </h1>
        <p className="text-[13px] text-gray-500">
          {items.length} saved item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <Heart size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
          <p className="text-[14px] text-gray-400 mb-1">Your wishlist is empty</p>
          <p className="text-[12px] text-gray-300 mb-5">Click the ♡ on any product to save it here</p>
          <Link href="/collections/all"
            className="inline-flex px-6 py-2.5 bg-[#1a1a1a] text-white text-[11px] tracking-widests uppercase no-underline hover:bg-gray-800 transition-colors">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => {
            const p = item.product
            if (!p) return null
            const onSale = p.comparePrice && Number(p.comparePrice) > Number(p.price)
            return (
              <div key={item.id} className="bg-white border border-gray-200 group">
                <Link href={`/products/${p.slug ?? p.id}`}
                  className="block aspect-[3/4] overflow-hidden bg-[#f5f2ed] relative no-underline">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={32} strokeWidth={1} className="text-gray-200" /></div>
                  }
                  {p.badge && (
                    <span className="absolute top-2 left-2 bg-[#1a1a1a] text-white text-[9px] font-semibold tracking-widests uppercase px-2 py-0.5">{p.badge}</span>
                  )}
                  <button onClick={e => { e.preventDefault(); remove(item.productId) }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer hover:bg-red-50">
                    <X size={13} className="text-gray-500" />
                  </button>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${p.slug ?? p.id}`} className="no-underline">
                    <p className="text-[13px] font-medium text-[#1a1a1a] hover:underline mb-1">{p.name}</p>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={`text-[14px] font-semibold ${onSale ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
                      ${Number(p.price).toFixed(2)}
                    </span>
                    {onSale && <span className="text-[12px] text-gray-400 line-through">${Number(p.comparePrice).toFixed(2)}</span>}
                  </div>
                  {item.variant && <p className="text-[11px] text-gray-400 mb-3">{item.variant.size} · {item.variant.color}</p>}
                  <div className="flex gap-2">
                    <Link href={`/products/${p.slug ?? p.id}`}
                      className="flex-1 h-10 border border-[#1a1a1a] text-[#1a1a1a] text-[11px] tracking-widests uppercase no-underline hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center justify-center">
                      View Product
                    </Link>
                    <button onClick={() => remove(item.productId)}
                      className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:border-red-200 hover:bg-red-50 transition-colors bg-white cursor-pointer">
                      <X size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}