'use client'
// Save as: src/app/admin/products/new/page.tsx (REPLACE existing)
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, Plus, X, Image as ImageIcon,
  ChevronDown, ChevronUp, Check, Trash2
} from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

const CATEGORIES = ['Dresses','Tops','Pants','Jeans','Jackets','Sets','Accessories','Shoes']
const SIZES      = ['XS','S','M','L','XL','XXL','One Size','25','26','27','28','29','30','31','32']
const COLORS_PRE = [
  { name: 'Onyx',    hex: '#1a1a1a' },
  { name: 'Caramel', hex: '#c8a882' },
  { name: 'Cream',   hex: '#d4cfc8' },
  { name: 'Mocha',   hex: '#8b6f5e' },
  { name: 'Sand',    hex: '#e8d5c4' },
  { name: 'Indigo',  hex: '#4a5568' },
  { name: 'Gold',    hex: '#c8a882' },
  { name: 'Sage',    hex: '#4a6741' },
  { name: 'White',   hex: '#f9f9f9' },
  { name: 'Blush',   hex: '#f9b8b8' },
]

interface Variant {
  size: string; color: string; colorHex: string; sku: string; inventory: number
}

export default function NewProductPage() {
  const router = useRouter()

  const [name,         setName]         = useState('')
  const [slug,         setSlug]         = useState('')
  const [isSlugEdited, setIsSlugEdited] = useState(false)
  const [description,  setDescription]  = useState('')
  const [details,      setDetails]      = useState([''])
  const [price,        setPrice]        = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [category,     setCategory]     = useState('Dresses')
  const [badge,        setBadge]        = useState('')
  const [images,       setImages]       = useState([''])
  const [isActive,     setIsActive]     = useState(true)
  const [variants,     setVariants]     = useState<Variant[]>([])
  const [variantOpen,  setVariantOpen]  = useState(true)
  const [newVarOpen,   setNewVarOpen]   = useState(false)
  const [newVar,       setNewVar]       = useState<Variant>({ size: 'S', color: 'Onyx', colorHex: '#1a1a1a', sku: '', inventory: 0 })
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [selectedVars, setSelectedVars] = useState<Set<number>>(new Set())

  const autoSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const addDetail    = () => setDetails(p => [...p, ''])
  const removeDetail = (i: number) => setDetails(p => p.filter((_, j) => j !== i))
  const setDetail    = (i: number, v: string) => setDetails(p => p.map((d, j) => j === i ? v : d))

  const addImage    = () => setImages(p => [...p, ''])
  const removeImage = (i: number) => setImages(p => p.filter((_, j) => j !== i))
  const setImage    = (i: number, v: string) => setImages(p => p.map((img, j) => j === i ? v : img))

  const addVariant = () => {
    if (!newVar.sku.trim()) { alert('Please enter a SKU for this variant'); return }
    setVariants(p => [...p, { ...newVar }])
    setNewVar({ size: 'S', color: 'Onyx', colorHex: '#1a1a1a', sku: '', inventory: 0 })
    setNewVarOpen(false)
  }


  useEffect(() => {
  if (!isSlugEdited) {
    setSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    )
  }
}, [name])

  const removeVariant   = (i: number) => setVariants(p => p.filter((_, j) => j !== i))
  const updateVariant   = (i: number, key: keyof Variant, value: any) =>
    setVariants(p => p.map((v, j) => j === i ? { ...v, [key]: value } : v))

  const bulkSetInventory = () => {
    const val = prompt(`Set inventory for ${selectedVars.size} selected variants:`)
    if (val === null) return
    const num = parseInt(val)
    if (isNaN(num)) return
    setVariants(p => p.map((v, i) => selectedVars.has(i) ? { ...v, inventory: num } : v))
    setSelectedVars(new Set())
  }

  const save = async () => {
    if (!name.trim() || !price) { alert('Product name and price are required'); return }
    setSaving(true)
    try {
      // 1. Create product
      const prodRes  = await fetch('/api/admin/products', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name,
          slug:         slug || autoSlug(name),
          description,
          details:      details.filter(Boolean),
          price:        parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          category,
          badge:        badge || null,
          images:       images.filter(Boolean),
          isActive,
        }),
      })
      const prodData = await prodRes.json()
      if (!prodRes.ok) { alert(prodData.error ?? 'Failed to save product'); setSaving(false); return }

      // 2. Save variants
      if (variants.length > 0) {
        await fetch('/api/admin/variants', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ productId: prodData.product.id, variants }),
        })
      }

      setSaved(true)
      setTimeout(() => router.push(`/admin/products/${prodData.product.id}`), 800)
    } catch (err: any) {
      alert(err.message)
      setSaving(false)
    }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-200 mb-4">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-[14px] font-semibold text-[#1a1a1a]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )



  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/products"
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#1a1a1a] no-underline text-[13px] transition-colors">
            <ArrowLeft size={14} /> Products
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[13px] text-[#1a1a1a] font-medium">Add product</span>
        </div>
        <button onClick={save} disabled={saving || saved}
          className={`flex items-center gap-2 px-5 py-2.5 text-[12px] font-medium rounded-lg border-none cursor-pointer transition-all disabled:opacity-60
            ${saved ? 'bg-[#4a6741] text-white' : 'bg-[#1a1a1a] text-white hover:bg-gray-800'}`}>
          {saved ? <><Check size={14} /> Saved!</> : saving ? 'Saving...' : <><Save size={14} /> Save</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── LEFT ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Title + description */}
          {/* Title + description */}
<Section title="Product Information">
  <div className="space-y-4">
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
        Title <span className="text-red-500">*</span>
      </label>
      <input
  value={name}
  onChange={e => setName(e.target.value)}     // generate slug after leaving input
        placeholder="e.g. Silk Wrap Midi Dress"
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a] transition-colors"
      />
    </div>
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
        Description
      </label>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}  // just update description
        rows={5}
        placeholder="Describe the product in detail..."
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a] resize-none transition-colors"
      />
    </div>
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase">
          Product Details (bullet points)
        </label>
        <button onClick={addDetail}
          className="text-[12px] text-[#1a1a1a] font-medium hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1">
          <Plus size={12} /> Add bullet
        </button>
      </div>
      <div className="space-y-2">
        {details.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-gray-300 shrink-0">—</span>
            <input
              value={d}
              onChange={e => setDetail(i, e.target.value)}
              placeholder={`e.g. Fabric: 100% Silk`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]"
            />
            {details.length > 1 && (
              <button
                onClick={() => removeDetail(i)}
                className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
</Section>

          {/* Media */}
          <Section title="Media">
            <div className="space-y-2.5">
              {images.map((img, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center">
                    {img
                      ? <img src={img} alt="" className="w-full h-full object-cover"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                      : <ImageIcon size={18} strokeWidth={1} className="text-gray-300" />
                    }
                  </div>
                  <ImageUpload
  images={images}
  onChange={setImages}
  maxImages={10}
/>
                </div>
              ))}
              <button onClick={addImage}
                className="flex items-center gap-2 text-[13px] text-[#1a1a1a] font-medium hover:underline bg-transparent border-none cursor-pointer mt-1">
                <Plus size={14} /> Add another image
              </button>
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">$</span>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">Compare-at Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">$</span>
                  <input type="number" value={comparePrice} onChange={e => setComparePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Set higher than price to show as "on sale"</p>
              </div>
            </div>
          </Section>

          {/* Variants */}
          <div className="bg-white rounded-xl border border-gray-200 mb-4">
            <button onClick={() => setVariantOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-transparent border-x-0 border-t-0 cursor-pointer">
              <h2 className="text-[14px] font-semibold text-[#1a1a1a]">
                Variants <span className="text-gray-400 font-normal text-[13px]">({variants.length})</span>
              </h2>
              {variantOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {variantOpen && (
              <div className="p-5">

                {/* Bulk action bar */}
                {selectedVars.size > 0 && (
                  <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-[12px] text-blue-700 font-medium">{selectedVars.size} selected</span>
                    <button onClick={bulkSetInventory}
                      className="text-[12px] text-blue-600 font-medium hover:underline bg-transparent border-none cursor-pointer">
                      Set inventory
                    </button>
                    <button onClick={() => setSelectedVars(new Set())}
                      className="text-[12px] text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer ml-auto">
                      Clear
                    </button>
                  </div>
                )}

                {/* Variant rows */}
                {variants.length > 0 && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-2 pr-3 w-8">
                            <input type="checkbox"
                              checked={selectedVars.size === variants.length && variants.length > 0}
                              onChange={() => setSelectedVars(
                                selectedVars.size === variants.length ? new Set() : new Set(variants.map((_, i) => i))
                              )}
                              className="w-3.5 h-3.5 accent-[#1a1a1a] cursor-pointer" />
                          </th>
                          {['Color', 'Size', 'SKU', 'Inventory', ''].map(h => (
                            <th key={h} className="pb-2 pr-4 text-[11px] font-semibold text-gray-400 tracking-wide uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {variants.map((v, i) => (
                          <tr key={i} className={selectedVars.has(i) ? 'bg-blue-50/30' : ''}>
                            <td className="py-2.5 pr-3">
                              <input type="checkbox" checked={selectedVars.has(i)}
                                onChange={() => setSelectedVars(prev => {
                                  const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next
                                })}
                                className="w-3.5 h-3.5 accent-[#1a1a1a] cursor-pointer" />
                            </td>
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full border border-gray-200 shrink-0" style={{ background: v.colorHex }} />
                                <input value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-200 rounded text-[12px] outline-none focus:border-[#1a1a1a]" />
                                <input type="color" value={v.colorHex} onChange={e => updateVariant(i, 'colorHex', e.target.value)}
                                  className="w-6 h-6 border-none rounded cursor-pointer p-0 bg-transparent" />
                              </div>
                            </td>
                            <td className="py-2.5 pr-4">
                              <select value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)}
                                className="px-2 py-1 border border-gray-200 rounded text-[12px] outline-none bg-white">
                                {SIZES.map(s => <option key={s}>{s}</option>)}
                              </select>
                            </td>
                            <td className="py-2.5 pr-4">
                              <input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)}
                                className="w-28 px-2 py-1 border border-gray-200 rounded text-[12px] font-mono outline-none focus:border-[#1a1a1a]" />
                            </td>
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-1">
                                <button onClick={() => updateVariant(i, 'inventory', Math.max(0, v.inventory - 1))}
                                  className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center bg-white cursor-pointer hover:bg-gray-100 text-gray-600">−</button>
                                <input type="number" value={v.inventory}
                                  onChange={e => updateVariant(i, 'inventory', Math.max(0, parseInt(e.target.value) || 0))}
                                  className="w-14 text-center border border-gray-200 rounded text-[12px] py-1 outline-none focus:border-[#1a1a1a]" />
                                <button onClick={() => updateVariant(i, 'inventory', v.inventory + 1)}
                                  className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center bg-white cursor-pointer hover:bg-gray-100 text-gray-600">+</button>
                              </div>
                            </td>
                            <td className="py-2.5">
                              <button onClick={() => removeVariant(i)}
                                className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add variant form */}
                {newVarOpen ? (
                  <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
                    <p className="text-[12px] font-semibold text-gray-600 tracking-wide">New Variant</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Size</label>
                        <select value={newVar.size} onChange={e => setNewVar(p => ({ ...p, size: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none bg-white">
                          {SIZES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Color</label>
                        <div className="flex gap-2">
                          <select value={newVar.color}
                            onChange={e => {
                              const col = COLORS_PRE.find(c => c.name === e.target.value)
                              setNewVar(p => ({ ...p, color: e.target.value, colorHex: col?.hex ?? p.colorHex }))
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none bg-white">
                            {COLORS_PRE.map(c => <option key={c.name}>{c.name}</option>)}
                          </select>
                          <input type="color" value={newVar.colorHex}
                            onChange={e => setNewVar(p => ({ ...p, colorHex: e.target.value }))}
                            className="w-10 h-[38px] border border-gray-300 rounded-lg cursor-pointer p-0.5 bg-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">SKU <span className="text-red-400">*</span></label>
                        <input value={newVar.sku} onChange={e => setNewVar(p => ({ ...p, sku: e.target.value }))}
                          placeholder="e.g. DRESS-S-BLK"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] font-mono outline-none focus:border-[#1a1a1a]" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Inventory</label>
                        <input type="number" value={newVar.inventory}
                          onChange={e => setNewVar(p => ({ ...p, inventory: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setNewVarOpen(false)}
                        className="px-4 py-2 text-[12px] border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white text-gray-600">Cancel</button>
                      <button onClick={addVariant}
                        className="px-4 py-2 text-[12px] bg-[#1a1a1a] text-white rounded-lg border-none cursor-pointer hover:bg-gray-800">Add Variant</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setNewVarOpen(true)}
                    className="flex items-center gap-2 text-[13px] text-[#1a1a1a] font-medium hover:underline bg-transparent border-none cursor-pointer">
                    <Plus size={14} /> Add variant
                  </button>
                )}
              </div>
            )}
          </div>

          {/* URL slug */}
          <Section title="Search Engine & URL">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">URL Handle (slug)</label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-[12px] text-gray-400">/products/</span>
                <input value={slug} onChange={e => setSlug(e.target.value)}
                  placeholder="product-url-handle"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-r-lg text-[13px] font-mono outline-none focus:border-[#1a1a1a]" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">Auto-generated from title. Customise if needed.</p>
            </div>
          </Section>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-4">

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-3">Status</h2>
            <select value={isActive ? 'active' : 'draft'}
              onChange={e => setIsActive(e.target.value === 'active')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none bg-white focus:border-[#1a1a1a]">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <p className="text-[11px] text-gray-400 mt-2">
              {isActive ? 'Visible on your store.' : 'Hidden from your store.'}
            </p>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-4">Organization</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none bg-white focus:border-[#1a1a1a]">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">Badge / Tag</label>
                <select value={badge} onChange={e => setBadge(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none bg-white focus:border-[#1a1a1a]">
                  <option value="">None</option>
                  <option>New</option>
                  <option>Best Seller</option>
                  <option>Sale</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image preview */}
          {images[0] && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="aspect-[3/4] bg-[#f5f2ed]">
                <img src={images[0]} alt={name} className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
              </div>
              <div className="p-3">
                <p className="text-[11px] text-gray-400">Preview — first image</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom save */}
      <div className="mt-6 flex items-center justify-between py-4 border-t border-gray-200">
        <Link href="/admin/products" className="text-[13px] text-gray-500 hover:text-gray-900 no-underline">
          ← Discard and go back
        </Link>
        <button onClick={save} disabled={saving || saved}
          className={`flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium rounded-lg border-none cursor-pointer transition-all disabled:opacity-60
            ${saved ? 'bg-[#4a6741] text-white' : 'bg-[#1a1a1a] text-white hover:bg-gray-800'}`}>
          {saved ? <><Check size={14} /> Saved!</> : saving ? 'Saving...' : <><Save size={14} /> Save Product</>}
        </button>
      </div>
    </div>
  )
}