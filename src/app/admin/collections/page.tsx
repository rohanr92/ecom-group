// Save as: src/app/admin/collections/page.tsx (REPLACE entire file)
'use client'
import { useState, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp,
  LayoutGrid, Layers, Save, Search, Package, Home, ShoppingCart,
  AlertCircle, CheckCircle2, Eye, EyeOff
} from 'lucide-react'

interface Product { id: string; name: string; images: string[]; price: number; category?: string }
interface Collection {
  id: string; name: string; slug: string; description?: string
  image?: string; isActive: boolean; _count: { products: number }
}
interface Slot {
  slot: string; label: string
  collection: { id: string; name: string; slug: string } | null
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

export default function CollectionsPage() {
  const [tab,          setTab]          = useState<'collections' | 'slots'>('collections')
  const [collections,  setCollections]  = useState<Collection[]>([])
  const [slots,        setSlots]        = useState<Slot[]>([])
  const [allProducts,  setAllProducts]  = useState<Product[]>([])
  const [loading,      setLoading]      = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [toast,        setToast]        = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Create form
  const [showCreate,    setShowCreate]    = useState(false)
  const [newName,       setNewName]       = useState('')
  const [newDesc,       setNewDesc]       = useState('')
  const [newImage,      setNewImage]      = useState('')
  const [newProducts,   setNewProducts]   = useState<string[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [creating,      setCreating]      = useState(false)

  // Edit state
  const [editId,       setEditId]       = useState<string | null>(null)
  const [editName,     setEditName]     = useState('')
  const [editDesc,     setEditDesc]     = useState('')
  const [editImage,    setEditImage]    = useState('')
  const [editProducts, setEditProducts] = useState<string[]>([])
  const [saving,       setSaving]       = useState(false)
  const [expandedEdit, setExpandedEdit] = useState<string | null>(null)
  const [savingSlot,   setSavingSlot]   = useState<string | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load collections + products
  const loadCollections = async () => {
    setLoading(true)
    try {
      const [cRes, pRes] = await Promise.all([
        fetch('/api/admin/collections'),
        fetch('/api/admin/products?limit=500'),
      ])
      const cData = await cRes.json()
      const pData = await pRes.json()
      setCollections(cData.collections ?? [])
      setAllProducts(pData.products ?? [])
    } catch {
      showToast('Failed to load collections', 'error')
    }
    setLoading(false)
  }

  // Load slots separately — calls the slots API which initializes defaults
  const loadSlots = async () => {
    setSlotsLoading(true)
    try {
      const res  = await fetch('/api/admin/collections/slots')
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch {
      showToast('Failed to load slots', 'error')
    }
    setSlotsLoading(false)
  }

  useEffect(() => {
    loadCollections()
  }, [])

  // Load slots when switching to slots tab
  useEffect(() => {
    if (tab === 'slots') loadSlots()
  }, [tab])

  // ── Create ──────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/collections', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: newName, description: newDesc, image: newImage, productIds: newProducts }),
      })
      const d = await res.json()
      if (!res.ok) { showToast(d.error, 'error'); return }
      showToast(`"${newName}" created`, 'success')
      setNewName(''); setNewDesc(''); setNewImage(''); setNewProducts([])
      setShowCreate(false)
      loadCollections()
    } finally { setCreating(false) }
  }

  // ── Save edit ───────────────────────────────────────────────────
  const handleSaveEdit = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/collections', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, name: editName, description: editDesc, image: editImage, productIds: editProducts.length > 0 ? editProducts : undefined }),
      })
      const d = await res.json()
      if (!res.ok) { showToast(d.error, 'error'); return }
      showToast('Collection saved', 'success')
      setEditId(null); setExpandedEdit(null)
      loadCollections()
    } finally { setSaving(false) }
  }

  // ── Toggle active ───────────────────────────────────────────────
  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch('/api/admin/collections', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, isActive: !isActive }),
    })
    loadCollections()
  }

  // ── Delete ──────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch('/api/admin/collections', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    })
    if (res.ok) { showToast('Deleted', 'success'); loadCollections() }
    else showToast('Failed to delete', 'error')
  }

  // ── Assign slot ─────────────────────────────────────────────────
  const handleSlotChange = async (slot: string, collectionId: string) => {
    setSavingSlot(slot)
    try {
      const res = await fetch('/api/admin/collections/slots', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slot, collectionId: collectionId || null }),
      })
      if (res.ok) {
        showToast('Slot updated — live immediately', 'success')
        loadSlots()
      } else showToast('Failed to update slot', 'error')
    } finally { setSavingSlot(null) }
  }

  // ── Product picker ──────────────────────────────────────────────
  const filteredProducts = allProducts.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  function ProductPicker({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
    const toggle = (id: string) =>
      onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-2 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded outline-none focus:border-[#1a1a1a]" />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
          {filteredProducts.length === 0
            ? <p className="py-6 text-center text-[12px] text-gray-400">No products found</p>
            : filteredProducts.map(p => (
              <label key={p.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 transition-colors
                  ${selected.includes(p.id) ? 'bg-[#1a1a1a] border-[#1a1a1a]' : 'border-gray-300'}`}>
                  {selected.includes(p.id) && <Check size={10} strokeWidth={3} className="text-white" />}
                </div>
                <input type="checkbox" className="sr-only" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-8 h-8 object-cover rounded shrink-0 bg-gray-100" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#1a1a1a] font-medium truncate">{p.name}</p>
                  {p.category && <p className="text-[10px] text-gray-400">{p.category}</p>}
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">${Number(p.price).toFixed(2)}</span>
              </label>
            ))}
        </div>
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500">
          {selected.length} product{selected.length !== 1 ? 's' : ''} selected
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="bg-white border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-[#1a1a1a] flex items-center gap-2">
            <Layers size={18} strokeWidth={1.5} className="text-[#c8a882]" /> Collections
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Create collections and assign them to homepage / cart display slots
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white text-[12px] tracking-wide border-none cursor-pointer hover:bg-gray-800 transition-colors">
          <Plus size={14} /> New Collection
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {(['collections', 'slots'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-3.5 text-[13px] tracking-wide border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 capitalize
              ${tab === t ? 'border-b-[#1a1a1a] text-[#1a1a1a] font-semibold' : 'border-b-transparent text-gray-400 hover:text-[#1a1a1a]'}`}>
            {t === 'slots' ? 'Display Slots' : 'Collections'}
            {t === 'collections' && collections.length > 0 && (
              <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{collections.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ COLLECTIONS TAB ══════════════════════════════════════════ */}
      {tab === 'collections' && (
        <div className="space-y-4">
          {/* Create form */}
          {showCreate && (
            <div className="bg-white border border-[#c8a882] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#1a1a1a]">New Collection</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Name *</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Summer Arrivals"
                    className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Cover Image URL</label>
                  <input value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="https://..."
                    className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Description</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} placeholder="Optional..."
                  className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a] resize-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">
                  Products ({newProducts.length} selected)
                </label>
                <ProductPicker selected={newProducts} onChange={setNewProducts} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCreate} disabled={creating || !newName.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50">
                  {creating
                    ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Plus size={14} />}
                  Create Collection
                </button>
                <button onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 border border-gray-300 text-[#1a1a1a] text-[12px] bg-white cursor-pointer hover:border-[#1a1a1a]">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin mx-auto" />
            </div>
          ) : collections.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <Layers size={36} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
              <p className="text-[14px] text-gray-400 mb-1">No collections yet</p>
              <p className="text-[12px] text-gray-300 mb-5">Create your first collection to get started</p>
              <button onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800">
                <Plus size={14} /> New Collection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map(col => (
                <div key={col.id} className="bg-white border border-gray-200">
                  <div className="p-4 flex items-center gap-4">
                    <button onClick={() => toggleActive(col.id, col.isActive)} title={col.isActive ? 'Deactivate' : 'Activate'}
                      className={`w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer transition-colors shrink-0
                        ${col.isActive ? 'bg-[#4a6741]/10 text-[#4a6741]' : 'bg-gray-100 text-gray-400'}`}>
                      {col.isActive ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      {editId === col.id ? (
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          className="w-full max-w-xs px-2 py-1 border border-gray-300 text-[14px] outline-none focus:border-[#1a1a1a] font-semibold" />
                      ) : (
                        <p className={`text-[14px] font-semibold text-[#1a1a1a] ${!col.isActive ? 'opacity-50' : ''}`}>{col.name}</p>
                      )}
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-gray-400">/{col.slug}</span>
                        <span className="text-[11px] text-gray-400">·</span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Package size={10} /> {col._count.products} products
                        </span>
                        {!col.isActive && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Inactive</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {editId === col.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(col.id)} disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a6741] text-white text-[11px] border-none cursor-pointer hover:bg-[#3d5636] disabled:opacity-50">
                            {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={12} />}
                            Save
                          </button>
                          <button onClick={() => { setEditId(null); setExpandedEdit(null) }}
                            className="px-3 py-1.5 border border-gray-300 text-gray-600 text-[11px] bg-white cursor-pointer">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(col.id); setEditName(col.name); setEditDesc(col.description ?? ''); setEditImage(col.image ?? ''); setEditProducts([]); setExpandedEdit(col.id) }}
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:border-[#1a1a1a] cursor-pointer">
                            <Pencil size={13} strokeWidth={1.5} />
                          </button>
                          <button onClick={() => handleDelete(col.id, col.name)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:text-red-500 cursor-pointer">
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                          <button onClick={() => setExpandedEdit(expandedEdit === col.id ? null : col.id)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white text-gray-500 cursor-pointer">
                            {expandedEdit === col.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {expandedEdit === col.id && editId === col.id && (
                    <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Description</label>
                          <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
                            className="w-full px-3 py-2 border border-gray-300 text-[12px] outline-none focus:border-[#1a1a1a] resize-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Cover Image URL</label>
                          <input value={editImage} onChange={e => setEditImage(e.target.value)} placeholder="https://..."
                            className="w-full px-3 py-2 border border-gray-300 text-[12px] outline-none focus:border-[#1a1a1a]" />
                          {editImage && <img src={editImage} alt="preview" className="mt-2 w-full h-24 object-cover rounded border border-gray-200" />}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">
                          Add / change products ({editProducts.length} selected — leave empty to keep existing)
                        </label>
                        <ProductPicker selected={editProducts} onChange={setEditProducts} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ SLOTS TAB ════════════════════════════════════════════════ */}
      {tab === 'slots' && (
        <div className="space-y-4">
          <div className="bg-[#f8f6f1] border border-[#e8e0d0] px-5 py-3.5 text-[12px] text-[#6b5d4f] leading-relaxed">
            <strong>How to use:</strong> Select a collection from the dropdown for each slot.
            The homepage and cart will show those products immediately. If no collection is selected, that grid is hidden.
          </div>

          {slotsLoading ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[12px] text-gray-400">Loading slots...</p>
            </div>
          ) : (
            <>
              {/* Homepage slots */}
              <div className="bg-white border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <Home size={15} strokeWidth={1.5} className="text-[#c8a882]" />
                  <h2 className="text-[13px] font-semibold text-[#1a1a1a]">Homepage Slots</h2>
                  <span className="text-[11px] text-gray-400 ml-1">— 3 product grids on the homepage</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {slots.filter(s => s.slot.startsWith('homepage')).length === 0 ? (
                    <p className="px-5 py-4 text-[13px] text-gray-400">No slots found — try refreshing</p>
                  ) : slots.filter(s => s.slot.startsWith('homepage')).map(slot => (
                    <SlotRow key={slot.slot} slot={slot} collections={collections}
                      saving={savingSlot === slot.slot}
                      onChange={collectionId => handleSlotChange(slot.slot, collectionId)} />
                  ))}
                </div>
              </div>

              {/* Cart slots */}
              <div className="bg-white border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <ShoppingCart size={15} strokeWidth={1.5} className="text-[#c8a882]" />
                  <h2 className="text-[13px] font-semibold text-[#1a1a1a]">Cart Page Slots</h2>
                  <span className="text-[11px] text-gray-400 ml-1">— 2 product carousels on the cart page</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {slots.filter(s => s.slot.startsWith('cart')).length === 0 ? (
                    <p className="px-5 py-4 text-[13px] text-gray-400">No slots found — try refreshing</p>
                  ) : slots.filter(s => s.slot.startsWith('cart')).map(slot => (
                    <SlotRow key={slot.slot} slot={slot} collections={collections}
                      saving={savingSlot === slot.slot}
                      onChange={collectionId => handleSlotChange(slot.slot, collectionId)} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Slot Row ───────────────────────────────────────────────────────
function SlotRow({ slot, collections, saving, onChange }: {
  slot: Slot; collections: Collection[]
  saving: boolean; onChange: (collectionId: string) => void
}) {
  const [selected, setSelected] = useState(slot.collection?.id ?? '')

  // Sync if slot changes externally
  useEffect(() => { setSelected(slot.collection?.id ?? '') }, [slot.collection?.id])

  const handleChange = (val: string) => {
    setSelected(val)
    onChange(val)
  }

  return (
    <div className="px-5 py-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1a1a1a]">{slot.label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{slot.slot}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <select value={selected} onChange={e => handleChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 text-[12px] outline-none focus:border-[#1a1a1a] bg-white min-w-[240px] cursor-pointer">
          <option value="">— Not assigned (hidden on site) —</option>
          {collections.filter(c => c.isActive).map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c._count.products} products)</option>
          ))}
        </select>
        {saving ? (
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#4a6741] rounded-full animate-spin" />
        ) : slot.collection ? (
          <span className="flex items-center gap-1 text-[11px] text-[#4a6741] font-medium whitespace-nowrap">
            <Check size={12} strokeWidth={2.5} /> Live
          </span>
        ) : (
          <span className="text-[11px] text-gray-400 whitespace-nowrap">Not set</span>
        )}
      </div>
    </div>
  )
}