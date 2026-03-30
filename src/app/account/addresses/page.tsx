// Save as: src/app/account/addresses/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Check, X, Save } from 'lucide-react'

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

const blankAddr = { label: 'Home', firstName: '', lastName: '', street: '', street2: '', city: '', state: '', zip: '', country: 'United States', phone: '', isDefault: false }

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState<any>(null)
  const [saving,    setSaving]    = useState(false)

  const load = () => {
    fetch('/api/account/addresses').then(r => r.json()).then(d => {
      setAddresses(d.addresses ?? [])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    const method = editing.id ? 'PATCH' : 'POST'
    await fetch('/api/account/addresses', {
      method, headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify(editing),
    })
    await load()
    setEditing(null)
    setSaving(false)
  }

  const deleteAddr = async (id: string) => {
    if (!confirm('Delete this address?')) return
    await fetch('/api/account/addresses', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ id }),
    })
    await load()
  }

  const setDefault = async (id: string) => {
    await fetch('/api/account/addresses', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ id, isDefault: true }),
    })
    await load()
  }

  const inp = "w-full px-3 py-2.5 border border-gray-300 text-[13px] text-[#1a1a1a] tracking-wide outline-none focus:border-[#1a1a1a] transition-colors bg-white"
  const lbl = "block text-[11px] font-semibold text-gray-500 tracking-widests uppercase mb-1.5"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white border border-gray-200 p-5">
        <div>
          <h1 className="text-[18px] font-semibold text-[#1a1a1a]">Address Book</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{addresses.length} saved addresses</p>
        </div>
        <button onClick={() => setEditing({ ...blankAddr })}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white text-[11px] tracking-widests uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors">
          <Plus size={13} /> Add Address
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-[13px] text-gray-400">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <MapPin size={32} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
          <p className="text-[14px] text-gray-400 mb-4">No saved addresses yet</p>
          <button onClick={() => setEditing({ ...blankAddr })}
            className="px-6 py-2.5 bg-[#1a1a1a] text-white text-[11px] tracking-widests uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors">
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(a => (
            <div key={a.id} className={`bg-white border p-5 ${a.isDefault ? 'border-[#1a1a1a]' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#1a1a1a] tracking-wide">{a.label}</span>
                  {a.isDefault && (
                    <span className="text-[10px] bg-[#1a1a1a] text-white px-2 py-0.5 font-semibold tracking-wider">DEFAULT</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing({ ...a })}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => deleteAddr(a.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 bg-transparent border-none cursor-pointer hover:bg-red-50 rounded">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="text-[13px] text-gray-600 leading-relaxed space-y-0.5">
                <p className="font-medium text-[#1a1a1a]">{a.firstName} {a.lastName}</p>
                <p>{a.street}{a.street2 ? `, ${a.street2}` : ''}</p>
                <p>{a.city}, {a.state} {a.zip}</p>
                <p>{a.country}</p>
                {a.phone && <p className="text-gray-400">{a.phone}</p>}
              </div>
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)}
                  className="mt-3 text-[12px] text-[#1a1a1a] underline hover:no-underline bg-transparent border-none cursor-pointer">
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-[#1a1a1a]">{editing.id ? 'Edit Address' : 'Add Address'}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className={lbl}>Label</label>
                <select value={editing.label} onChange={e => setEditing((p: any) => ({ ...p, label: e.target.value }))}
                  className={inp}>
                  {['Home', 'Work', 'Other'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>First Name</label>
                  <input value={editing.firstName} onChange={e => setEditing((p: any) => ({ ...p, firstName: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Last Name</label>
                  <input value={editing.lastName} onChange={e => setEditing((p: any) => ({ ...p, lastName: e.target.value }))} className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Street Address</label>
                <input value={editing.street} onChange={e => setEditing((p: any) => ({ ...p, street: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className={lbl}>Apt, Suite (optional)</label>
                <input value={editing.street2 ?? ''} onChange={e => setEditing((p: any) => ({ ...p, street2: e.target.value }))} className={inp} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>City</label>
                  <input value={editing.city} onChange={e => setEditing((p: any) => ({ ...p, city: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className={lbl}>State</label>
                  <select value={editing.state} onChange={e => setEditing((p: any) => ({ ...p, state: e.target.value }))} className={inp}>
                    <option value="">—</option>
                    {US_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>ZIP</label>
                  <input value={editing.zip} onChange={e => setEditing((p: any) => ({ ...p, zip: e.target.value }))} className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Phone (optional)</label>
                <input type="tel" value={editing.phone ?? ''} onChange={e => setEditing((p: any) => ({ ...p, phone: e.target.value }))} className={inp} />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={editing.isDefault}
                  onChange={e => setEditing((p: any) => ({ ...p, isDefault: e.target.checked }))}
                  className="w-4 h-4 accent-[#1a1a1a]" />
                <span className="text-[13px] text-gray-700">Set as default address</span>
              </label>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-gray-300 text-[13px] text-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}