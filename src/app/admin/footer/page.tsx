'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, ChevronDown, ChevronUp, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

export default function FooterAdminPage() {
  const [columns, setColumns] = useState<any[]>([])
  const [social, setSocial] = useState({ instagram: '', facebook: '', pinterest: '', youtube: '' })
  const [bottomLinks, setBottomLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/footer')
    const d = await res.json()
    setColumns(d.columns ?? [])
    if (d.settings?.social_links) setSocial(prev => ({ ...prev, ...d.settings.social_links }))
    if (d.settings?.bottom_links) setBottomLinks(d.settings.bottom_links)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveColumn = async (col: any) => {
    await fetch('/api/admin/footer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'column', id: col.id, heading: col.heading }),
    })
    showToast('Column saved', 'success')
  }

  const saveLink = async (link: any) => {
    await fetch('/api/admin/footer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'link', id: link.id, label: link.label, href: link.href, openInNewTab: link.openInNewTab }),
    })
    showToast('Link saved', 'success')
  }

  const addColumn = async () => {
    const res = await fetch('/api/admin/footer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'column', heading: 'New Column', position: columns.length }),
    })
    const d = await res.json()
    if (d.column) { setColumns(prev => [...prev, { ...d.column, links: [] }]); showToast('Column added', 'success') }
  }

  const deleteColumn = async (id: string) => {
    if (!confirm('Delete this column and all its links?')) return
    await fetch('/api/admin/footer', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'column', id }),
    })
    setColumns(prev => prev.filter(c => c.id !== id))
    showToast('Column deleted', 'success')
  }

  const addLink = async (columnId: string) => {
    const col = columns.find(c => c.id === columnId)
    const res = await fetch('/api/admin/footer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'link', columnId, label: 'New Link', href: '#', position: col?.links?.length ?? 0 }),
    })
    const d = await res.json()
    if (d.link) {
      setColumns(prev => prev.map(c => c.id === columnId ? { ...c, links: [...(c.links ?? []), d.link] } : c))
      showToast('Link added', 'success')
    }
  }

  const deleteLink = async (columnId: string, linkId: string) => {
    await fetch('/api/admin/footer', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'link', id: linkId }),
    })
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, links: c.links.filter((l: any) => l.id !== linkId) } : c))
    showToast('Link deleted', 'success')
  }

  const saveSocial = async () => {
    await fetch('/api/admin/footer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'settings', key: 'social_links', value: social }),
    })
    showToast('Social links saved', 'success')
  }

  const saveBottomLinks = async () => {
    await fetch('/api/admin/footer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'settings', key: 'bottom_links', value: bottomLinks }),
    })
    showToast('Bottom links saved', 'success')
  }

  const updateLinkLocal = (columnId: string, linkId: string, field: string, value: any) => {
    setColumns(prev => prev.map(c =>
      c.id === columnId ? {
        ...c,
        links: c.links.map((l: any) => l.id === linkId ? { ...l, [field]: value } : l)
      } : c
    ))
  }

  const updateColumnLocal = (id: string, field: string, value: any) => {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[200px]">
      <div className="animate-spin w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Footer Management</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Manage footer columns, links, social media and bottom bar</p>
        </div>
        <button onClick={addColumn}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800">
          <Plus size={14} /> Add Column
        </button>
      </div>

      {/* Link Columns */}
      <div className="space-y-3 mb-8">
        <h2 className="text-[13px] font-semibold text-gray-500 tracking-wide uppercase">Link Columns</h2>
        {columns.map(col => (
          <div key={col.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Column header */}
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => setExpanded(expanded === col.id ? null : col.id)}
                className="text-gray-400 bg-transparent border-none cursor-pointer p-0 flex">
                {expanded === col.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <input
                value={col.heading}
                onChange={e => updateColumnLocal(col.id, 'heading', e.target.value)}
                className="flex-1 text-[14px] font-semibold text-[#1a1a1a] border-none outline-none bg-transparent"
                placeholder="Column heading"
              />
              <span className="text-[11px] text-gray-400">{col.links?.length ?? 0} links</span>
              <button onClick={() => saveColumn(col)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] text-white text-[11px] rounded-lg border-none cursor-pointer hover:bg-gray-800">
                <Save size={12} /> Save
              </button>
              <button onClick={() => deleteColumn(col.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg bg-transparent border-none cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>

            {/* Links */}
            {expanded === col.id && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                {col.links?.map((link: any) => (
                  <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Label</label>
                        <input
                          value={link.label}
                          onChange={e => updateLinkLocal(col.id, link.id, 'label', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-[12px] outline-none focus:border-[#1a1a1a]"
                          placeholder="Link text"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">URL</label>
                        <input
                          value={link.href}
                          onChange={e => updateLinkLocal(col.id, link.id, 'href', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-[12px] outline-none focus:border-[#1a1a1a] font-mono"
                          placeholder="/page or https://..."
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={link.openInNewTab ?? false}
                          onChange={e => updateLinkLocal(col.id, link.id, 'openInNewTab', e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#1a1a1a]" />
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">New tab</span>
                      </label>
                      <button onClick={() => saveLink(link)}
                        className="p-1.5 bg-[#1a1a1a] text-white rounded border-none cursor-pointer hover:bg-gray-800">
                        <Save size={12} />
                      </button>
                      <button onClick={() => deleteLink(col.id, link.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded bg-transparent border-none cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => addLink(col.id)}
                  className="flex items-center gap-2 text-[12px] text-gray-500 hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer py-1">
                  <Plus size={13} /> Add Link
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Social Media Links</h2>
          <button onClick={saveSocial}
            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] text-white text-[11px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800">
            <Save size={12} /> Save Social
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'instagram', label: 'Instagram' },
            { key: 'facebook', label: 'Facebook' },
            { key: 'pinterest', label: 'Pinterest' },
            { key: 'youtube', label: 'YouTube' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
              <input
                value={(social as any)[key]}
                onChange={e => setSocial(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={`https://${key}.com/...`}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1a1a1a] font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Bottom Bar Links</h2>
          <button onClick={saveBottomLinks}
            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] text-white text-[11px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800">
            <Save size={12} /> Save
          </button>
        </div>
        <div className="space-y-2">
          {bottomLinks.map((link: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <input
                value={link.label}
                onChange={e => setBottomLinks(prev => prev.map((l, j) => j === i ? { ...l, label: e.target.value } : l))}
                placeholder="Label"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1a1a1a]"
              />
              <input
                value={link.href}
                onChange={e => setBottomLinks(prev => prev.map((l, j) => j === i ? { ...l, href: e.target.value } : l))}
                placeholder="/page"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1a1a1a] font-mono"
              />
              <button onClick={() => setBottomLinks(prev => prev.filter((_, j) => j !== i))}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg bg-transparent border-none cursor-pointer">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setBottomLinks(prev => [...prev, { label: 'New Link', href: '#' }])}
            className="flex items-center gap-2 text-[12px] text-gray-500 hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer py-1">
            <Plus size={13} /> Add Link
          </button>
        </div>
      </div>
    </div>
  )
}