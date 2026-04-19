'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save, Trash2, ArrowLeft, Plus, X, Eye, EyeOff,
  Copy, Package, AlertCircle, CheckCircle2, FileText, Image
} from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

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
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [togglingDraft, setTogglingDraft] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [category, setCategory] = useState('')
  const [badge, setBadge] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [details, setDetails] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [variants, setVariants] = useState<any[]>([])
  const [newDetail, setNewDetail] = useState('')
  const [addingVariant, setAddingVariant] = useState(false)
  const [savingVariants, setSavingVariants] = useState(false)
  const [newVariant, setNewVariant] = useState({ size: 'S', color: '', colorHex: '#1a1a1a', sku: '', inventory: 0 })
  const [expandedColor, setExpandedColor] = useState<string | null>(null)
  const [isGrouped, setIsGrouped] = useState(true)
const [tags, setTags] = useState<string[]>([])
const [tagInput, setTagInput] = useState('')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Group variants by color for image assignment
  const colorGroups = variants.reduce((acc: any, v: any) => {
    if (!v.color) return acc
    if (!acc[v.color]) acc[v.color] = { color: v.color, colorHex: v.colorHex, images: v.images || [] }
    return acc
  }, {})

  const updateColorImages = (color: string, newImages: string[]) => {
    setVariants(prev => prev.map(v => v.color === color ? { ...v, images: newImages } : v))
  }

  const saveVariants = async () => {
    setSavingVariants(true)
    try {
      const res = await fetch('/api/admin/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, variants, replace: true }),
      })
      const d = await res.json()
      if (res.ok) showToast('Variants saved', 'success')
      else showToast(d.error ?? 'Failed to save variants', 'error')
    } finally { setSavingVariants(false) }
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
          setIsGrouped(p.isGrouped ?? true)
setTags(p.tags ?? [])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ id, name, description, price, comparePrice, category, badge, images, details, isActive, isGrouped, tags }),
      })
      const d = await res.json()
      if (res.ok) { setProduct(d.product); showToast('Product saved', 'success') }
      else showToast(d.error, 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (res.ok) router.push('/admin/products')
      else showToast('Failed to delete', 'error')
    } finally { setDeleting(false) }
  }

  const handleDuplicate = async () => {
    if (!confirm(`Duplicate "${name}"? It will be saved as a Draft.`)) return
    setDuplicating(true)
    try {
      const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'duplicate', productId: id }) })
      const d = await res.json()
      if (res.ok) { showToast(`Duplicated as "${d.product.name}"`, 'success'); setTimeout(() => router.push(`/admin/products/${d.product.id}`), 1000) }
      else showToast(d.error, 'error')
    } finally { setDuplicating(false) }
  }

  const handleToggleDraft = async () => {
    const action = isActive ? 'setDraft' : 'publish'
    if (!confirm(isActive ? `Set "${name}" as Draft?` : `Publish "${name}"?`)) return
    setTogglingDraft(true)
    try {
      const res = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
      const d = await res.json()
      if (res.ok) { setIsActive(d.product.isActive); setProduct((prev: any) => ({ ...prev, isActive: d.product.isActive })); showToast(d.product.isActive ? 'Product published' : 'Set as draft', 'success') }
      else showToast(d.error, 'error')
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
          <Link href="/admin/products" className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-[#1a1a1a] no-underline transition-colors">
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
        <div className="flex items-center gap-2 flex-wrap">
          {product?.slug && (
            <a href={`/products/${product.slug}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] text-gray-600 no-underline hover:border-[#1a1a1a] transition-colors">
              <Eye size={13} /> Preview
            </a>
          )}
          <button onClick={handleToggleDraft} disabled={togglingDraft}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] border cursor-pointer transition-colors disabled:opacity-50 ${isActive ? 'border-gray-300 text-gray-600 bg-white hover:border-[#1a1a1a]' : 'border-[#4a6741] text-[#4a6741] bg-[#4a6741]/5'}`}>
            {togglingDraft ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : isActive ? <><EyeOff size={13} /> Set as Draft</> : <><Eye size={13} /> Publish</>}
          </button>
          <button onClick={handleDuplicate} disabled={duplicating}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] border border-gray-300 text-gray-600 bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors disabled:opacity-50">
            {duplicating ? <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <><Copy size={13} /> Duplicate</>}
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] border border-gray-200 text-red-500 bg-white cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50">
            {deleting ? <div className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" /> : <><Trash2 size={13} /> Delete</>}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50">
            {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={13} /> Save Changes</>}
          </button>
        </div>
      </div>

      {!isActive && (
        <div className="bg-amber-50 border border-amber-200 px-5 py-3 flex items-center gap-3">
          <FileText size={15} className="text-amber-600 shrink-0" />
          <p className="text-[12px] text-amber-700">This product is a <strong>Draft</strong> — not visible on the store. Click <strong>Publish</strong> to make it live.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Product Info */}
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Product Information</h2>
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Product Name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]" placeholder="Product name" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a] resize-none" placeholder="Product description" />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Price ($) *</label>
                <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01"
                  className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Compare at Price ($)</label>
                <input value={comparePrice} onChange={e => setComparePrice(e.target.value)} type="number" step="0.01"
                  className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]" placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* All Images */}
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">All Product Images</h2>
            <p className="text-[11px] text-gray-400">These are all images for this product. Assign specific images to each color variant below.</p>
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
            <ImageUpload images={images} onChange={setImages} maxImages={50} />
          </div>

          {/* Color Image Assignment */}
          {Object.keys(colorGroups).length > 0 && (
            <div className="bg-white border border-gray-200 p-5 space-y-4">
              <div>
                <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Color Image Assignment</h2>
                <p className="text-[11px] text-gray-400 mt-1">Assign specific images to each color. When a customer selects a color, these images will show.</p>
              </div>

              <div className="space-y-3">
                {Object.values(colorGroups).map((group: any) => (
                  <div key={group.color} className="border border-gray-200">
                    {/* Color header */}
                    <button
                      onClick={() => setExpandedColor(expandedColor === group.color ? null : group.color)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border-none text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-gray-300" style={{ background: group.colorHex }} />
                        <span className="text-[13px] font-medium text-[#1a1a1a]">{group.color}</span>
                        <span className="text-[11px] text-gray-400">({group.images.length} images assigned)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {group.images.length === 0 && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5">No images assigned</span>
                        )}
                        <Image size={13} className="text-gray-400" />
                      </div>
                    </button>

                    {/* Expanded image assignment */}
                    {expandedColor === group.color && (
                      <div className="p-4 space-y-3 border-t border-gray-200">
                        {/* Assigned images — draggable to reorder */}
                        {group.images.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1.5 tracking-wide">Drag to reorder. First image shows in product grid.</p>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                              {group.images.map((img: string, i: number) => (
                                <div key={img}
                                  draggable
                                  onDragStart={e => e.dataTransfer.setData('text/plain', String(i))}
                                  onDragOver={e => e.preventDefault()}
                                  onDrop={e => {
                                    e.preventDefault()
                                    const from = parseInt(e.dataTransfer.getData('text/plain'))
                                    const to = i
                                    if (from === to) return
                                    const newImgs = [...group.images]
                                    const [moved] = newImgs.splice(from, 1)
                                    newImgs.splice(to, 0, moved)
                                    updateColorImages(group.color, newImgs)
                                  }}
                                  className="relative aspect-square group cursor-grab active:cursor-grabbing">
                                  {i === 0 && (
                                    <div className="absolute top-0.5 left-0.5 bg-[#4a6741] text-white text-[8px] px-1 z-10 leading-4">1st</div>
                                  )}
                                  <img src={img} alt="" className="w-full h-full object-cover border border-gray-200" />
                                  <button
                                    onClick={() => updateColorImages(group.color, group.images.filter((_: string, idx: number) => idx !== i))}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={8} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pick from all images */}
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Pick from product images:</p>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {images.map((img, i) => {
                              const isAssigned = group.images.includes(img)
                              return (
                                <button key={i} onClick={() => {
                                  if (isAssigned) {
                                    updateColorImages(group.color, group.images.filter((x: string) => x !== img))
                                  } else {
                                    updateColorImages(group.color, [...group.images, img])
                                  }
                                }}
                                  className={`relative aspect-square border-2 cursor-pointer p-0 transition-all ${isAssigned ? 'border-[#4a6741]' : 'border-transparent hover:border-gray-300'}`}>
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                  {isAssigned && (
                                    <div className="absolute inset-0 bg-[#4a6741]/20 flex items-center justify-center">
                                      <CheckCircle2 size={16} className="text-[#4a6741]" />
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                          {images.length === 0 && (
                            <p className="text-[11px] text-gray-400">No product images uploaded yet. Add images above first.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Variants ({variants.length})</h2>
              <button onClick={() => setAddingVariant(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] text-white text-[11px] border-none cursor-pointer hover:bg-gray-800">
                <Plus size={12} /> Add Variant
              </button>
            </div>
            {variants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Color', 'Size', 'SKU', 'Inventory', ''].map(h => (
                        <th key={h} className="text-left py-2 pr-4 text-[11px] font-semibold tracking-widest uppercase text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {variants.map((v: any, i: number) => (
                      <tr key={v.id ?? i}>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border border-gray-200 shrink-0" style={{ background: v.colorHex || '#1a1a1a' }} />
                            <input value={v.color || ''} onChange={e => setVariants(prev => prev.map((x, j) => j === i ? { ...x, color: e.target.value } : x))}
                              className="w-20 px-2 py-1 border border-gray-200 text-[12px] outline-none focus:border-[#1a1a1a]" />
                            <input type="color" value={v.colorHex || '#1a1a1a'} onChange={e => setVariants(prev => prev.map((x, j) => j === i ? { ...x, colorHex: e.target.value } : x))}
                              className="w-6 h-6 border-none rounded cursor-pointer p-0 bg-transparent" />
                          </div>
                        </td>
                        <td className="py-2.5 pr-4">
                          <select value={v.size || ''} onChange={e => setVariants(prev => prev.map((x, j) => j === i ? { ...x, size: e.target.value } : x))}
                            className="px-2 py-1 border border-gray-200 text-[12px] outline-none bg-white">
                            {['XS','S','M','L','XL','XXL','One Size','25','26','27','28','29','30','31','32'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="py-2.5 pr-4">
                          <input value={v.sku || ''} onChange={e => setVariants(prev => prev.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))}
                            className="w-28 px-2 py-1 border border-gray-200 text-[12px] font-mono outline-none focus:border-[#1a1a1a]" />
                        </td>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setVariants(prev => prev.map((x, j) => j === i ? { ...x, inventory: Math.max(0, (x.inventory ?? 0) - 1) } : x))}
                              className="w-6 h-6 border border-gray-200 flex items-center justify-center bg-white cursor-pointer hover:bg-gray-100 text-gray-600">−</button>
                            <input type="number" value={v.inventory ?? 0} onChange={e => setVariants(prev => prev.map((x, j) => j === i ? { ...x, inventory: Math.max(0, parseInt(e.target.value) || 0) } : x))}
                              className="w-14 text-center border border-gray-200 text-[12px] py-1 outline-none focus:border-[#1a1a1a]" />
                            <button onClick={() => setVariants(prev => prev.map((x, j) => j === i ? { ...x, inventory: (x.inventory ?? 0) + 1 } : x))}
                              className="w-6 h-6 border border-gray-200 flex items-center justify-center bg-white cursor-pointer hover:bg-gray-100 text-gray-600">+</button>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <button onClick={() => setVariants(prev => prev.filter((_, j) => j !== i))}
                            className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer">
                            <X size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {addingVariant && (
              <div className="border border-dashed border-gray-300 p-4 space-y-3">
                <p className="text-[12px] font-semibold text-gray-600">New Variant</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Size</label>
                    <select value={newVariant.size} onChange={e => setNewVariant(p => ({ ...p, size: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-[13px] outline-none bg-white">
                      {['XS','S','M','L','XL','XXL','One Size','25','26','27','28','29','30','31','32'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Color</label>
                    <div className="flex gap-2">
                      <input value={newVariant.color} onChange={e => setNewVariant(p => ({ ...p, color: e.target.value }))}
                        placeholder="e.g. Caramel" className="flex-1 px-3 py-2 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]" />
                      <input type="color" value={newVariant.colorHex} onChange={e => setNewVariant(p => ({ ...p, colorHex: e.target.value }))}
                        className="w-10 h-[38px] border border-gray-300 cursor-pointer p-0.5 bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">SKU *</label>
                    <input value={newVariant.sku} onChange={e => setNewVariant(p => ({ ...p, sku: e.target.value }))}
                      placeholder="e.g. PROD-S-BLK" className="w-full px-3 py-2 border border-gray-300 text-[13px] font-mono outline-none focus:border-[#1a1a1a]" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Inventory</label>
                    <input type="number" value={newVariant.inventory} onChange={e => setNewVariant(p => ({ ...p, inventory: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAddingVariant(false)}
                    className="px-4 py-2 text-[12px] border border-gray-300 cursor-pointer hover:bg-gray-50 bg-white text-gray-600">Cancel</button>
                  <button onClick={() => {
                    if (!newVariant.sku.trim()) { alert('SKU is required'); return }
                    setVariants(prev => [...prev, { ...newVariant, images: [] }])
                    setNewVariant({ size: 'S', color: '', colorHex: '#1a1a1a', sku: '', inventory: 0 })
                    setAddingVariant(false)
                  }} className="px-4 py-2 text-[12px] bg-[#1a1a1a] text-white border-none cursor-pointer hover:bg-gray-800">Add Variant</button>
                </div>
              </div>
            )}
            {variants.length > 0 && (
              <button onClick={saveVariants} disabled={savingVariants}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#4a6741] text-white text-[12px] border-none cursor-pointer hover:bg-[#3d5636] disabled:opacity-50">
                {savingVariants ? 'Saving...' : <><Save size={12} /> Save Variants</>}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-[#1a1a1a]">{isActive ? 'Active' : 'Draft'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{isActive ? 'Visible on store' : 'Hidden from store'}</p>
              </div>
              <button onClick={() => setIsActive(a => !a)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none ${isActive ? 'bg-[#4a6741]' : 'bg-gray-200'}`}>
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: isActive ? '22px' : '2px' }} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Organization</h2>
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Category</label>
              <input value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-[12px] outline-none focus:border-[#1a1a1a]" placeholder="e.g. Dresses" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">Badge</label>
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
                <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">URL Slug</label>
                <p className="text-[11px] text-gray-400 font-mono bg-gray-50 px-3 py-2 border border-gray-200 break-all">/products/{product.slug}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-200 p-4 space-y-3">
            <h3 className="text-[12px] font-semibold tracking-widest uppercase text-gray-500">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-[11px] text-gray-600 rounded">
                  {tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))}
                    className="text-gray-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-0 leading-none">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    const t = tagInput.trim().toLowerCase().replace(/,/g, '')
                    if (t && !tags.includes(t)) setTags([...tags, t])
                    setTagInput('')
                  }
                }}
                placeholder="Add tag + Enter"
                className="flex-1 px-2 py-1.5 border border-gray-200 text-[12px] outline-none focus:border-[#1a1a1a]" />
              <button onClick={() => {
                const t = tagInput.trim().toLowerCase().replace(/,/g, '')
                if (t && !tags.includes(t)) setTags([...tags, t])
                setTagInput('')
              }} className="px-2 py-1.5 bg-[#1a1a1a] text-white text-[11px] border-none cursor-pointer">Add</button>
            </div>
            <p className="text-[10px] text-gray-400">Press Enter or comma to add a tag</p>
          </div>

          {/* Display / Grouping */}
          <div className="bg-white border border-gray-200 p-4 space-y-3">
            <h3 className="text-[12px] font-semibold tracking-widest uppercase text-gray-500">Display</h3>
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 shrink-0">
                <div onClick={() => setIsGrouped(!isGrouped)}
                  className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${isGrouped ? 'bg-[#1a1a1a]' : 'bg-gray-300'}`}>
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: isGrouped ? '18px' : '2px' }} />
                </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#1a1a1a]">Group by color</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {isGrouped ? 'Colors shown as swatches on one card' : 'Each color shown as separate card'}
                </p>
              </div>
            </label>
          </div>

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