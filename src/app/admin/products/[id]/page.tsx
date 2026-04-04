// Save as: src/app/admin/products/[id]/page.tsx (REPLACE)
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save, Trash2, ArrowLeft, Plus, X, Eye, EyeOff,
  Copy, Package, AlertCircle, CheckCircle2, FileText
} from 'lucide-react'

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

export default function ProductDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const id       = params?.id as string

  const [product,       setProduct]       = useState<any>(null)
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [duplicating,   setDuplicating]   = useState(false)
  const [togglingDraft, setTogglingDraft] = useState(false)
  const [toast,         setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Form state
  const [name,         setName]         = useState('')
  const [description,  setDescription]  = useState('')
  const [price,        setPrice]        = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [category,     setCategory]     = useState('')
  const [badge,        setBadge]        = useState('')
  const [images,       setImages]       = useState<string[]>([])
  const [details,      setDetails]      = useState<string[]>([])
  const [isActive,     setIsActive]     = useState(true)
  const [variants,     setVariants]     = useState<any[]>([])
  const [newImage,     setNewImage]     = useState('')
  const [newDetail,    setNewDetail]    = useState('')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!id || id === 'new') { setLoading(false); return }
    fetch(`/api/admin/products/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.product) {
          const p = d.product
          setProduct(p)
          setName(p.name ?? '')
          setDescription(p.description ?? '')
          setPrice(String(p.price ?? ''))
          setComparePrice(p.comparePrice ? String(p.comparePrice) : '')
          setCategory(p.category ?? '')
          setBadge(p.badge ?? '')
          setImages(Array.isArray(p.images) ? p.images : [])
          setDetails(Array.isArray(p.details) ? p.details : [])
          setIsActive(p.isActive ?? true)
          setVariants(p.variants ?? [])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          id, name, description, price, comparePrice,
          category, badge, images, details, isActive,
        }),
      })
      const d = await res.json()
      if (res.ok) {
        setProduct(d.product)
        showToast('Product saved', 'success')
      } else showToast(d.error, 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/products', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      })
      if (res.ok) router.push('/admin/products')
      else showToast('Failed to delete', 'error')
    } finally { setDeleting(false) }
  }

  const handleDuplicate = async () => {
    if (!confirm(`Duplicate "${name}"? It will be saved as a Draft.`)) return
    setDuplicating(true)
    try {
      const res = await fetch('/api/admin/products', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'duplicate', productId: id }),
      })
      const d = await res.json()
      if (res.ok) {
        showToast(`Duplicated as "${d.product.name}"`, 'success')
        setTimeout(() => router.push(`/admin/products/${d.product.id}`), 1000)
      } else showToast(d.error, 'error')
    } finally { setDuplicating(false) }
  }

  const handleToggleDraft = async () => {
    const action = isActive ? 'setDraft' : 'publish'
    const label  = isActive ? `Set "${name}" as Draft? It will be hidden from the store.` : `Publish "${name}"? It will be visible on the store.`
    if (!confirm(label)) return
    setTogglingDraft(true)
    try {
      const res = await fetch('/api/admin/products', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, action }),
      })
      const d = await res.json()
      if (res.ok) {
        setIsActive(d.product.isActive)
        setProduct((prev: any) => ({ ...prev, isActive: d.product.isActive }))
        showToast(d.product.isActive ? 'Product published' : 'Set as draft', 'success')
      } else showToast(d.error, 'error')
    } finally { setTogglingDraft(false) }
  }

  if (loading) return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 p-12 text-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-5">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="bg-white border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/products"
            className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-[#1a1a1a] no-underline transition-colors">
            <ArrowLeft size={15} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-[16px] font-semibold text-[#1a1a1a] flex items-center gap-2">
              <Package size={16} strokeWidth={1.5} className="text-[#c8a882]" />
              {name || 'New Product'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-[#4a6741]/10 text-[#4a6741]' : 'bg-gray-100 text-gray-500'}`}>
                {isActive ? 'Active' : 'Draft'}
              </span>
              {product?.slug && <span className="text-[11px] text-gray-400 font-mono">/{product.slug}</span>}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preview */}
          {product?.slug && (
            <a href={`/products/${product.slug}`} target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] text-gray-600 no-underline hover:border-[#1a1a1a] transition-colors">
              <Eye size={13} /> Preview
            </a>
          )}

          {/* Draft / Publish toggle */}
          <button onClick={handleToggleDraft} disabled={togglingDraft}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] border cursor-pointer transition-colors disabled:opacity-50
              ${isActive
                ? 'border-gray-300 text-gray-600 bg-white hover:border-[#1a1a1a]'
                : 'border-[#4a6741] text-[#4a6741] bg-[#4a6741]/5 hover:bg-[#4a6741]/10'}`}>
            {togglingDraft
              ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : isActive ? <><EyeOff size={13} /> Set as Draft</> : <><Eye size={13} /> Publish</>}
          </button>

          {/* Duplicate */}
          <button onClick={handleDuplicate} disabled={duplicating}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] border border-gray-300 text-gray-600 bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors disabled:opacity-50">
            {duplicating
              ? <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <><Copy size={13} /> Duplicate</>}
          </button>

          {/* Delete */}
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] border border-gray-200 text-red-500 bg-white cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50">
            {deleting
              ? <div className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
              : <><Trash2 size={13} /> Delete</>}
          </button>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50">
            {saving
              ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Save size={13} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Draft warning banner */}
      {!isActive && (
        <div className="bg-amber-50 border border-amber-200 px-5 py-3 flex items-center gap-3">
          <FileText size={15} className="text-amber-600 shrink-0" />
          <p className="text-[12px] text-amber-700">
            This product is a <strong>Draft</strong> — it is not visible on the store. Click <strong>Publish</strong> to make it live.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic info */}
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Product Information</h2>
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Product Name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]"
                placeholder="Product name" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a] resize-none"
                placeholder="Product description" />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Price ($) *</label>
                <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01"
                  className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]"
                  placeholder="0.00" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Compare at Price ($)</label>
                <input value={comparePrice} onChange={e => setComparePrice(e.target.value)} type="number" step="0.01"
                  className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]"
                  placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Images</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square group">
                  <img src={img} alt="" className="w-full h-full object-cover border border-gray-200" />
                  <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-white/90 flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                    <X size={10} className="text-red-500" />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-[#1a1a1a] text-white text-[8px] px-1.5 py-0.5">Main</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newImage} onChange={e => setNewImage(e.target.value)}
                placeholder="Paste image URL..."
                className="flex-1 px-3 py-2 border border-gray-300 text-[12px] outline-none focus:border-[#1a1a1a]" />
              <button onClick={() => { if (newImage.trim()) { setImages(p => [...p, newImage.trim()]); setNewImage('') } }}
                className="px-3 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 flex items-center gap-1">
                <Plus size={13} /> Add
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Product Details</h2>
            <div className="space-y-2">
              {details.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#c8a882] text-sm">—</span>
                  <p className="flex-1 text-[13px] text-[#1a1a1a]">{d}</p>
                  <button onClick={() => setDetails(prev => prev.filter((_, idx) => idx !== i))}
                    className="border-none bg-transparent cursor-pointer text-gray-400 hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newDetail} onChange={e => setNewDetail(e.target.value)}
                placeholder="e.g. Fabric: 100% Silk"
                onKeyDown={e => { if (e.key === 'Enter' && newDetail.trim()) { setDetails(p => [...p, newDetail.trim()]); setNewDetail('') } }}
                className="flex-1 px-3 py-2 border border-gray-300 text-[12px] outline-none focus:border-[#1a1a1a]" />
              <button onClick={() => { if (newDetail.trim()) { setDetails(p => [...p, newDetail.trim()]); setNewDetail('') } }}
                className="px-3 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 flex items-center gap-1">
                <Plus size={13} /> Add
              </button>
            </div>
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="bg-white border border-gray-200 p-5">
              <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide mb-4">Variants ({variants.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Size', 'Color', 'SKU', 'Price', 'Stock'].map(h => (
                        <th key={h} className="text-left py-2 pr-4 text-[11px] font-semibold tracking-widests uppercase text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {variants.map((v: any) => (
                      <tr key={v.id}>
                        <td className="py-2.5 pr-4 text-[#1a1a1a]">{v.size || '—'}</td>
                        <td className="py-2.5 pr-4 text-[#1a1a1a]">{v.color || '—'}</td>
                        <td className="py-2.5 pr-4 text-gray-400 font-mono">{v.sku || '—'}</td>
                        <td className="py-2.5 pr-4 text-[#1a1a1a]">${Number(v.price).toFixed(2)}</td>
                        <td className="py-2.5 text-[#1a1a1a]">{v.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-[#1a1a1a]">{isActive ? 'Active' : 'Draft'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {isActive ? 'Visible on store' : 'Hidden from store'}
                </p>
              </div>
              <button onClick={() => setIsActive(a => !a)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none
                  ${isActive ? 'bg-[#4a6741]' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isActive ? 'left-5.5' : 'left-0.5'}`}
                  style={{ left: isActive ? '22px' : '2px' }} />
              </button>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Organization</h2>
            <div>
              <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Category</label>
              <input value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-[12px] outline-none focus:border-[#1a1a1a]"
                placeholder="e.g. Dresses" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Badge</label>
              <select value={badge} onChange={e => setBadge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-[12px] outline-none focus:border-[#1a1a1a] bg-white cursor-pointer">
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Sale">Sale</option>
                <option value="Limited">Limited</option>
              </select>
            </div>
            {product?.slug && (
              <div>
                <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">URL Slug</label>
                <p className="text-[11px] text-gray-400 font-mono bg-gray-50 px-3 py-2 border border-gray-200 break-all">
                  /products/{product.slug}
                </p>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-gray-200 p-5 space-y-2">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide mb-3">Quick Actions</h2>
            <button onClick={handleDuplicate} disabled={duplicating}
              className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-[12px] text-[#1a1a1a] bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors disabled:opacity-50 text-left">
              <Copy size={13} className="text-gray-400" />
              {duplicating ? 'Duplicating...' : 'Duplicate product (saves as Draft)'}
            </button>
            <button onClick={handleToggleDraft} disabled={togglingDraft}
              className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-[12px] text-[#1a1a1a] bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors disabled:opacity-50 text-left">
              {isActive ? <EyeOff size={13} className="text-gray-400" /> : <Eye size={13} className="text-[#4a6741]" />}
              {togglingDraft ? 'Updating...' : isActive ? 'Set as Draft (hide from store)' : 'Publish (show on store)'}
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="w-full flex items-center gap-2 px-3 py-2.5 border border-red-100 text-[12px] text-red-500 bg-white cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50 text-left">
              <Trash2 size={13} />
              {deleting ? 'Deleting...' : 'Delete product permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}