// Save as: src/app/admin/products/page.tsx (REPLACE existing)
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Package, ChevronDown, X, Edit2, Trash2, Tag } from 'lucide-react'
import { memo } from 'react';
const CATEGORIES = ['All', 'Dresses', 'Tops', 'Pants', 'Jeans', 'Jackets', 'Sets', 'Accessories']
const STATUSES   = ['All', 'Active', 'Draft']
const BADGES     = ['All', 'New', 'Best Seller', 'Sale', 'None']





export default function ProductsListPage() {
  const [products,   setProducts]   = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [category,   setCategory]   = useState('All')
  const [status,     setStatus]     = useState('All')
  const [selected,   setSelected]   = useState<Set<string>>(new Set())
  const [deleting,   setDeleting]   = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

 const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()

if (debouncedSearch && debouncedSearch.trim()) {
  params.set('search', debouncedSearch.trim())
}
    

    
    if (category !== 'All')        params.set('category', category)
    const res = await fetch(`/api/admin/products?${params}`)
    const d   = await res.json()
    let list   = d.products ?? []
    if (status === 'Active') list = list.filter((p: any) =>  p.isActive)
    if (status === 'Draft')  list = list.filter((p: any) => !p.isActive)
    setProducts(list)
    setLoading(false)
}
  

useEffect(() => {
    const t = setTimeout(() => {
        setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(t)
}, [search])


useEffect(() => {
    const t = setTimeout(() => {
        setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(t)
}, [search])


  useEffect(() => {
  load()
}, [debouncedSearch, category, status])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map(p => p.id)))
    }
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} products? This cannot be undone.`)) return
    setDeleting(true)
    await Promise.all([...selected].map(id =>
      fetch('/api/admin/products', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      })
    ))
    setSelected(new Set())
    await load()
    setDeleting(false)
  }

  const deleteOne = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this product?')) return
    await fetch('/api/admin/products', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    })
    await load()
  }

  const totalInventory = (p: any) =>
    p.variants?.reduce((s: number, v: any) => s + (v.inventory ?? 0), 0) ?? 0

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Products</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{products.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={bulkDelete} disabled={deleting}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-red-700 disabled:opacity-50">
              <Trash2 size={14} />
              Delete {selected.size} selected
            </button>
          )}
          <Link href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-lg no-underline hover:bg-gray-800 transition-colors">
            <Plus size={14} /> Add Product
          </Link>
        </div>
      </div>

      {/* ── Filters bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        {/* Status tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setSelected(new Set()) }}
              className={`px-5 py-3 text-[13px] whitespace-nowrap border-none cursor-pointer border-b-2 transition-colors bg-white
                ${status === s ? 'border-[#1a1a1a] text-[#1a1a1a] font-medium' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Search + filter row */}
        <div className="flex items-center gap-3 p-3">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent border-none outline-none text-[13px] text-gray-700 placeholder:text-gray-400 flex-1"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <button onClick={() => setFilterOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white cursor-pointer hover:border-gray-400 transition-colors">
              <Filter size={13} strokeWidth={1.5} />
              {category !== 'All' ? category : 'Category'}
              <ChevronDown size={13} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                {CATEGORIES.map(c => (
                  <button key={c}
                    onClick={() => { setCategory(c); setFilterOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors
                      ${category === c ? 'text-[#1a1a1a] font-medium' : 'text-gray-600'}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active filters chips */}
        {(category !== 'All' || status !== 'All') && (
          <div className="flex items-center gap-2 px-3 pb-3 flex-wrap">
            {category !== 'All' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-[12px] rounded-full">
                Category: {category}
                <button onClick={() => setCategory('All')} className="text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            )}
            {status !== 'All' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-[12px] rounded-full">
                Status: {status}
                <button onClick={() => setStatus('All')} className="text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer">
                  <X size={11} />
                </button>
              </span>
            )}
            <button onClick={() => { setCategory('All'); setStatus('All') }}
              className="text-[12px] text-gray-500 hover:text-red-500 bg-transparent border-none cursor-pointer">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Products table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-b border-blue-100">
            <span className="text-[13px] text-blue-700 font-medium">{selected.size} selected</span>
            <button onClick={bulkDelete} disabled={deleting}
              className="text-[12px] text-red-600 font-medium hover:underline bg-transparent border-none cursor-pointer disabled:opacity-50">
              Delete selected
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-[13px] text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <Package size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
            <p className="text-[14px] text-gray-400 mb-1">No products found</p>
            <p className="text-[12px] text-gray-300">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox"
                    checked={selected.size === products.length && products.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-[#1a1a1a] cursor-pointer" />
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">Product</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">Inventory</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">Category</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">Price</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">Variants</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => {
                const inv = totalInventory(p)
                return (
                  <tr key={p.id}
                    className={`hover:bg-gray-50 transition-colors group ${selected.has(p.id) ? 'bg-blue-50/40' : ''}`}>
                    {/* Checkbox */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 accent-[#1a1a1a] cursor-pointer" />
                    </td>

                    {/* Product name + image */}
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 no-underline">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f5f2ed] shrink-0">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            : <Package size={16} strokeWidth={1} className="text-gray-300 m-auto mt-2.5" />
                          }
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#1a1a1a] hover:underline">{p.name}</p>
                          {p.badge && (
                            <span className="text-[10px] bg-[#f5f2ed] text-[#c8a882] px-1.5 py-0.5 rounded font-medium">{p.badge}</span>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>

                    {/* Inventory */}
                    <td className="px-4 py-3">
                      <span className={`text-[13px] font-medium ${inv === 0 ? 'text-red-600' : inv <= 10 ? 'text-amber-600' : 'text-[#1a1a1a]'}`}>
                        {inv} in stock
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-[13px] text-gray-600">{p.category}</td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">${Number(p.price).toFixed(2)}</p>
                      {p.comparePrice && (
                        <p className="text-[11px] text-gray-400 line-through">${Number(p.comparePrice).toFixed(2)}</p>
                      )}
                    </td>

                    {/* Variants count */}
                    <td className="px-4 py-3 text-[13px] text-gray-500">
                      {p.variants?.length ?? 0} variants
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/products/${p.id}`}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1a1a1a] no-underline transition-colors">
                          <Edit2 size={13} />
                        </Link>
                        <button onClick={e => deleteOne(p.id, e)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}