'use client'
// Save as: src/app/admin/inventory/page.tsx
import { useState, useEffect } from 'react'
import { AlertTriangle, Search, Save } from 'lucide-react'

export default function InventoryPage() {
  const [variants, setVariants] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [edits,    setEdits]    = useState<Record<string, number>>({})
  const [saving,   setSaving]   = useState(false)
  const [filter,   setFilter]   = useState<'all' | 'low' | 'out'>('all')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/inventory')
    const d   = await res.json()
    setVariants(d.variants ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveAll = async () => {
    setSaving(true)
    await Promise.all(
      Object.entries(edits).map(([id, inventory]) =>
        fetch('/api/admin/inventory', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, inventory }),
        })
      )
    )
    setEdits({})
    await load()
    setSaving(false)
  }

  const filtered = variants.filter(v => {
    const qty = edits[v.id] ?? v.inventory
    const matchesSearch = !search ||
      v.product.name.toLowerCase().includes(search.toLowerCase()) ||
      v.sku.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'low' ? qty <= 5 && qty > 0 :
      filter === 'out' ? qty === 0 : true
    return matchesSearch && matchesFilter
  })

  const low = variants.filter(v => (edits[v.id] ?? v.inventory) <= 5).length
  const out = variants.filter(v => (edits[v.id] ?? v.inventory) === 0).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Inventory</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{variants.length} variants · {low} low · {out} out of stock</p>
        </div>
        {Object.keys(edits).length > 0 && (
          <button onClick={saveAll} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4a6741] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-green-800 disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : `Save ${Object.keys(edits).length} changes`}
          </button>
        )}
      </div>

      {/* Alert banners */}
      {low > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-[13px] text-amber-700">
          <AlertTriangle size={14} />
          {low} variants are low on stock (5 or fewer units). Consider restocking soon.
        </div>
      )}

      {/* Filters + search */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { key: 'all', label: `All (${variants.length})` },
            { key: 'low', label: `Low Stock (${low})` },
            { key: 'out', label: `Out of Stock (${out})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`px-4 py-3 text-[12px] font-medium whitespace-nowrap border-none cursor-pointer border-b-2 transition-colors bg-white
                ${filter === f.key ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Search size={14} className="text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="bg-transparent border-none outline-none text-[13px] text-gray-600 placeholder:text-gray-400 flex-1" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[13px] text-gray-400">Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-gray-400">No variants found</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Product', 'SKU', 'Size', 'Color', 'Stock', 'Update'].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(v => {
                const qty     = edits[v.id] ?? v.inventory
                const edited  = edits[v.id] !== undefined
                const stockColor =
                  qty === 0 ? 'text-red-600 bg-red-50' :
                  qty <= 5  ? 'text-amber-600 bg-amber-50' :
                  'text-green-700 bg-green-50'

                return (
                  <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${edited ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-4 py-3 text-[13px] font-medium text-[#1a1a1a] max-w-[200px] truncate">
                      {v.product.name}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-500 font-mono">{v.sku}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{v.size}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                          style={{ background: v.colorHex }} />
                        <span className="text-[12px] text-gray-600">{v.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${stockColor}`}>
                        {qty} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEdits(e => ({ ...e, [v.id]: Math.max(0, (e[v.id] ?? v.inventory) - 1) }))}
                          className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center bg-white cursor-pointer hover:bg-gray-100 text-gray-600 text-lg leading-none">−</button>
                        <input type="number" value={edits[v.id] ?? v.inventory}
                          onChange={e => setEdits(ed => ({ ...ed, [v.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                          className="w-16 text-center border border-gray-300 rounded text-[13px] py-1 outline-none focus:border-[#1a1a1a]" />
                        <button onClick={() => setEdits(e => ({ ...e, [v.id]: (e[v.id] ?? v.inventory) + 1 }))}
                          className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center bg-white cursor-pointer hover:bg-gray-100 text-gray-600 text-lg leading-none">+</button>
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