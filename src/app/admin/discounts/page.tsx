'use client'
import { useState, useEffect } from 'react'
import { Plus, X, Save, Trash2, Tag, Check, Percent, Search, AlertCircle, CheckCircle2 } from 'lucide-react'

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

// ── Promo Codes Tab ───────────────────────────────────────────────
function PromoCodesTab() {
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/discounts')
    const d = await res.json()
    setPromos(d.promos ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    const method = editing.id ? 'PATCH' : 'POST'
    await fetch('/api/admin/discounts', {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editing,
        value: parseFloat(editing.value),
        minOrder: editing.minOrder ? parseFloat(editing.minOrder) : null,
        usesLeft: editing.usesLeft ? parseInt(editing.usesLeft) : null,
      }),
    })
    await load()
    setEditing(null)
    setSaving(false)
    showToast('Promo code saved', 'success')
  }

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return
    await fetch('/api/admin/discounts', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
    showToast('Deleted', 'success')
  }

  const toggle = async (promo: any) => {
    await fetch('/api/admin/discounts', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: promo.id, isActive: !promo.isActive }),
    })
    await load()
  }

  const blankPromo = { code: '', type: 'PERCENT', value: '', minOrder: '', usesLeft: '', isActive: true }

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing(blankPromo)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800">
          <Plus size={14} /> New Promo Code
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-[13px]">No promo codes yet</div>
      ) : (
        <div className="space-y-3">
          {promos.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[14px] font-bold text-[#1a1a1a]">{p.code}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[11px] bg-[#f8f6f1] text-[#1a1a1a] px-2 py-0.5 rounded">
                    {p.type === 'PERCENT' ? `${p.value}% off` : `$${p.value} off`}
                  </span>
                </div>
                <div className="flex gap-4 mt-1">
                  {p.minOrder && <span className="text-[11px] text-gray-400">Min order: ${p.minOrder}</span>}
                  {p.usesLeft !== null && <span className="text-[11px] text-gray-400">Uses left: {p.usesLeft}</span>}
                  {p.expiresAt && <span className="text-[11px] text-gray-400">Expires: {new Date(p.expiresAt).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(p)}
                  className={`px-3 py-1.5 text-[11px] rounded-lg border-none cursor-pointer font-medium
                    ${p.isActive ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {p.isActive ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => setEditing(p)}
                  className="px-3 py-1.5 text-[11px] bg-[#f8f6f1] text-[#1a1a1a] rounded-lg border-none cursor-pointer hover:bg-gray-200">
                  Edit
                </button>
                <button onClick={() => deletePromo(p.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg bg-transparent border-none cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold">{editing.id ? 'Edit Promo Code' : 'New Promo Code'}</h3>
              <button onClick={() => setEditing(null)} className="bg-transparent border-none cursor-pointer text-gray-400"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Code</label>
                <input value={editing.code} onChange={e => setEditing((p: any) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] font-mono outline-none focus:border-[#1a1a1a]"
                  placeholder="SUMMER20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
                  <select value={editing.type} onChange={e => setEditing((p: any) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none bg-white">
                    <option value="PERCENT">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Value {editing.type === 'PERCENT' ? '(%)' : '($)'}
                  </label>
                  <input type="number" value={editing.value} onChange={e => setEditing((p: any) => ({ ...p, value: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]"
                    placeholder="20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Min Order ($)</label>
                  <input type="number" value={editing.minOrder ?? ''} onChange={e => setEditing((p: any) => ({ ...p, minOrder: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]"
                    placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Max Uses</label>
                  <input type="number" value={editing.usesLeft ?? ''} onChange={e => setEditing((p: any) => ({ ...p, usesLeft: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]"
                    placeholder="Unlimited" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.isActive} onChange={e => setEditing((p: any) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#1a1a1a]" />
                <span className="text-[13px] text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-gray-300 text-[13px] rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#1a1a1a] text-white text-[13px] rounded-lg border-none cursor-pointer hover:bg-gray-800 flex items-center justify-center gap-2">
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sale Manager Tab ──────────────────────────────────────────────
function SaleManagerTab() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [discountPercent, setDiscountPercent] = useState('')
  const [applying, setApplying] = useState(false)
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'sale' | 'normal'>('all')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/sale')
    const d = await res.json()
    setProducts(d.products ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filterMode === 'all' ? true
      : filterMode === 'sale' ? p.badge === 'Sale'
      : p.badge !== 'Sale'
    return matchSearch && matchFilter
  })

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(p => p.id)))
    }
  }

  const applyDiscount = async () => {
    if (!selected.size) { showToast('Select at least one product', 'error'); return }
    if (!discountPercent || Number(discountPercent) <= 0 || Number(discountPercent) >= 100) {
      showToast('Enter a valid discount % (1-99)', 'error'); return
    }
    setApplying(true)
    const res = await fetch('/api/admin/sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIds: Array.from(selected),
        discountPercent: Number(discountPercent),
        action: 'apply',
      }),
    })
    const d = await res.json()
    if (d.success) {
      showToast(`${d.count} product(s) added to sale`, 'success')
      setSelected(new Set())
      setDiscountPercent('')
      await load()
    } else {
      showToast(d.error ?? 'Failed', 'error')
    }
    setApplying(false)
  }

  const removeFromSale = async () => {
    if (!selected.size) { showToast('Select at least one product', 'error'); return }
    if (!confirm(`Remove ${selected.size} product(s) from sale?`)) return
    setApplying(true)
    const res = await fetch('/api/admin/sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIds: Array.from(selected),
        action: 'remove',
      }),
    })
    const d = await res.json()
    if (d.success) {
      showToast(`${d.count} product(s) removed from sale`, 'success')
      setSelected(new Set())
      await load()
    } else {
      showToast(d.error ?? 'Failed', 'error')
    }
    setApplying(false)
  }

  const saleCount = products.filter(p => p.badge === 'Sale').length

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Products', value: products.length, color: 'bg-white' },
          { label: 'On Sale', value: saleCount, color: 'bg-red-50' },
          { label: 'Regular Price', value: products.length - saleCount, color: 'bg-white' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl border border-gray-200 p-4 text-center`}>
            <div className="text-2xl font-bold text-[#1a1a1a]">{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 border-none outline-none text-[13px] text-[#1a1a1a] bg-transparent" />
        </div>
        <div className="flex gap-1">
          {(['all', 'sale', 'normal'] as const).map(f => (
            <button key={f} onClick={() => setFilterMode(f)}
              className={`px-3 py-1.5 text-[11px] rounded-lg border-none cursor-pointer capitalize font-medium
                ${filterMode === f ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'normal' ? 'Regular' : f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
          <div className="relative">
            <input
              type="number"
              value={discountPercent}
              onChange={e => setDiscountPercent(e.target.value)}
              placeholder="% off"
              min="1" max="99"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a] text-center"
            />
          </div>
          <button onClick={applyDiscount} disabled={applying || !selected.size}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
            <Tag size={13} /> Apply Sale
          </button>
          <button onClick={removeFromSale} disabled={applying || !selected.size}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
            <X size={13} /> Remove Sale
          </button>
        </div>
      </div>

      {/* Selected count */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-2 text-[13px] text-[#1a1a1a]">
          <Check size={14} className="text-[#4a6741]" />
          <span>{selected.size} product{selected.size > 1 ? 's' : ''} selected</span>
          <button onClick={() => setSelected(new Set())}
            className="text-gray-400 hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer text-[11px] underline">
            Clear
          </button>
        </div>
      )}

      {/* Product list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-[13px]">No products found</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <input type="checkbox"
              checked={selected.size === filtered.length && filtered.length > 0}
              onChange={selectAll}
              className="w-4 h-4 accent-[#1a1a1a] cursor-pointer" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex-1">Product</span>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-24 text-right">Price</span>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-24 text-right">Original</span>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-20 text-right">Discount</span>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-16 text-center">Status</span>
          </div>

          {filtered.map((product, idx) => {
            const isOnSale = product.badge === 'Sale'
            const discount = isOnSale && product.comparePrice
              ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
              : null

            return (
              <div key={product.id}
                onClick={() => toggleSelect(product.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0
                  ${selected.has(product.id) ? 'bg-[#f8f6f1]' : 'hover:bg-gray-50'}`}>
                <input type="checkbox" checked={selected.has(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 accent-[#1a1a1a] cursor-pointer shrink-0" />

                {/* Product image + name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.name}
                        className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#1a1a1a] truncate">{product.name}</div>
                    <div className="text-[11px] text-gray-400">{product.category}</div>
                  </div>
                </div>

                {/* Current price */}
                <div className={`w-24 text-right text-[13px] font-semibold ${isOnSale ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
                  ${Number(product.price).toFixed(2)}
                </div>

                {/* Original price */}
                <div className="w-24 text-right text-[12px] text-gray-400">
                  {product.comparePrice ? `$${Number(product.comparePrice).toFixed(2)}` : '—'}
                </div>

                {/* Discount % */}
                <div className="w-20 text-right text-[12px] font-semibold text-red-600">
                  {discount ? `-${discount}%` : '—'}
                </div>

                {/* Badge */}
                <div className="w-16 flex justify-center">
                  {isOnSale ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full uppercase tracking-wide">
                      Sale
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400">Regular</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function DiscountsPage() {
  const [tab, setTab] = useState<'promos' | 'sale'>('promos')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Discounts & Sales</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Manage promo codes and product sale prices</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('promos')}
          className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg border-none cursor-pointer transition-all
            ${tab === 'promos' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'bg-transparent text-gray-500 hover:text-[#1a1a1a]'}`}>
          <Tag size={14} /> Promo Codes
        </button>
        <button onClick={() => setTab('sale')}
          className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg border-none cursor-pointer transition-all
            ${tab === 'sale' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'bg-transparent text-gray-500 hover:text-[#1a1a1a]'}`}>
          <Percent size={14} /> Sale Manager
        </button>
      </div>

      {tab === 'promos' ? <PromoCodesTab /> : <SaleManagerTab />}
    </div>
  )
}