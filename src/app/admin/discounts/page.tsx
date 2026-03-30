// Save as: src/app/admin/discounts/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { Plus, X, Save, Trash2, Tag, Check } from 'lucide-react'

export default function DiscountsPage() {
  const [promos,   setPromos]   = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<any>(null)
  const [saving,   setSaving]   = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/discounts')
    const d   = await res.json()
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
        value:    parseFloat(editing.value),
        minOrder: editing.minOrder ? parseFloat(editing.minOrder) : null,
        usesLeft: editing.usesLeft ? parseInt(editing.usesLeft) : null,
      }),
    })
    await load()
    setEditing(null)
    setSaving(false)
  }

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return
    await fetch('/api/admin/discounts', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Discounts</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{promos.length} promo codes</p>
        </div>
        <button onClick={() => setEditing(blankPromo)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800">
          <Plus size={14} /> Create Code
        </button>
      </div>

      {/* Promo list */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-[13px] text-gray-400">Loading...</div>
        ) : promos.map(p => (
          <div key={p.id} className={`bg-white rounded-xl border ${p.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'} p-4 flex items-center gap-4`}>
            <div className="w-10 h-10 bg-[#f5f2ed] rounded-xl flex items-center justify-center shrink-0">
              <Tag size={16} strokeWidth={1.5} className="text-[#c8a882]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-[#1a1a1a] font-mono">{p.code}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="text-[12px] text-gray-500">
                  {p.type === 'PERCENT' ? `${p.value}% off` : `$${p.value} off`}
                </span>
                {p.minOrder && <span className="text-[12px] text-gray-400">Min. ${p.minOrder}</span>}
                {p.usesLeft !== null && <span className="text-[12px] text-gray-400">{p.usesLeft} uses left</span>}
                {p.expiresAt && <span className="text-[12px] text-gray-400">Expires {new Date(p.expiresAt).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggle(p)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors
                  ${p.isActive ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>
                <Check size={13} />
              </button>
              <button onClick={() => setEditing({ ...p, value: String(p.value), minOrder: String(p.minOrder ?? ''), usesLeft: String(p.usesLeft ?? '') })}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center border-none cursor-pointer">
                <Tag size={13} className="text-gray-600" />
              </button>
              <button onClick={() => deletePromo(p.id)}
                className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center border-none cursor-pointer">
                <Trash2 size={13} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {!loading && promos.length === 0 && (
          <div className="p-12 text-center text-[13px] text-gray-400">No promo codes yet. Create your first one!</div>
        )}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-[#1a1a1a]">
                {editing.id ? 'Edit Promo Code' : 'Create Promo Code'}
              </h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">Code</label>
                <input value={editing.code} onChange={e => setEditing((p: any) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SAVE20"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] font-mono outline-none focus:border-[#1a1a1a]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">Type</label>
                  <select value={editing.type} onChange={e => setEditing((p: any) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none bg-white">
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
                    Value {editing.type === 'PERCENT' ? '(%)' : '($)'}
                  </label>
                  <input type="number" value={editing.value} onChange={e => setEditing((p: any) => ({ ...p, value: e.target.value }))}
                    placeholder="10"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">Min Order ($)</label>
                  <input type="number" value={editing.minOrder} onChange={e => setEditing((p: any) => ({ ...p, minOrder: e.target.value }))}
                    placeholder="50 (optional)"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">Max Uses</label>
                  <input type="number" value={editing.usesLeft} onChange={e => setEditing((p: any) => ({ ...p, usesLeft: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]" />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={editing.isActive}
                  onChange={e => setEditing((p: any) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#1a1a1a]" />
                <span className="text-[13px] text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-gray-300 text-[13px] text-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}