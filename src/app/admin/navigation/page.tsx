'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Image as ImageIcon, Link as LinkIcon, Menu, AlertCircle, CheckCircle2, GripVertical } from 'lucide-react'

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

export default function NavigationPage() {
  const [tab, setTab] = useState<'women' | 'men'>('women')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState<string | null>(null)



  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/nav?tab=${tab}`)
    const d = await res.json()
    setItems(d.items ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  const updateItem = async (id: string, data: any) => {
    setSaving(id)
    const res = await fetch('/api/admin/nav', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'item', id, ...data }),
    })
    if (res.ok) { showToast('Saved', 'success'); load() }
    else showToast('Failed to save', 'error')
    setSaving(null)
  }

  const updateSection = async (id: string, data: any) => {
    await fetch('/api/admin/nav', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'section', id, ...data }),
    })
    showToast('Section saved', 'success')
    load()
  }

  const updateLink = async (id: string, data: any) => {
    await fetch('/api/admin/nav', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'link', id, ...data }),
    })
    showToast('Link saved', 'success')
    load()
  }

  const updateFeatured = async (navItemId: string, data: any) => {
    await fetch('/api/admin/nav', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'featured', navItemId, ...data }),
    })
    showToast('Featured image saved', 'success')
    load()
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this nav item?')) return
    await fetch('/api/admin/nav', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'item', id }),
    })
    showToast('Deleted', 'success')
    load()
  }

  const deleteSection = async (id: string) => {
    await fetch('/api/admin/nav', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'section', id }),
    })
    showToast('Section deleted', 'success')
    load()
  }

  const deleteLink = async (id: string) => {
    await fetch('/api/admin/nav', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'link', id }),
    })
    showToast('Link deleted', 'success')
    load()
  }

 // Modal state
  const [modal, setModal] = useState<{
    type: 'navItem' | 'section' | 'link'
    navItemId?: string
    sectionId?: string
    position: number
  } | null>(null)
  const [modalLabel, setModalLabel] = useState('')
  const [modalHref, setModalHref] = useState('')

  const openAddNavItem = () => {
    setModalLabel('')
    setModalHref('')
    setModal({ type: 'navItem', position: items.length })
  }

  const openAddSection = (navItemId: string, position: number) => {
    setModalLabel('')
    setModalHref('')
    setModal({ type: 'section', navItemId, position })
  }

  const openAddLink = (sectionId: string, position: number) => {
    setModalLabel('')
    setModalHref('')
    setModal({ type: 'link', sectionId, position })
  }

  const handleModalSubmit = async () => {
    if (!modalLabel.trim() || !modal) return
    if (modal.type === 'navItem') {
      await fetch('/api/admin/nav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: modalLabel, href: modalHref, tab, position: modal.position }),
      })
      showToast(`"${modalLabel}" added`, 'success')
    }
    if (modal.type === 'section') {
      await fetch('/api/admin/nav/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ navItemId: modal.navItemId, heading: modalLabel, position: modal.position }),
      })
      showToast('Section added', 'success')
    }
    if (modal.type === 'link') {
      const href = modalHref || `/collections/${modalLabel.toLowerCase().replace(/\s+/g, '-')}`
      await fetch('/api/admin/nav/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: modal.sectionId, label: modalLabel, href, position: modal.position }),
      })
      showToast('Link added', 'success')
    }
    setModal(null)
    load()
  }

  return (
    <div className="p-6 space-y-5">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="bg-white border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-[#1a1a1a] flex items-center gap-2">
            <Menu size={18} strokeWidth={1.5} className="text-[#c8a882]" /> Navigation
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage navbar menu items, sections, links and featured images</p>
        </div>
        <div className="flex gap-2">
            <button onClick={openAddNavItem}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800">
            <Plus size={13} /> Add Nav Item
          </button>
        </div>
      </div>

      {/* Seed button */}
      <div className="bg-[#f8f6f1] border border-[#e8e0d0] px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[12px] text-[#6b5d4f]">First time? Seed the nav with your existing menu data.</p>
        <button
          onClick={async () => {
            if (!confirm('This will replace all nav data with the default menu. Continue?')) return
            const res = await fetch('/api/admin/nav/seed', { method: 'POST' })
            if (res.ok) { showToast('Nav seeded successfully!', 'success'); load() }
            else showToast('Seed failed', 'error')
          }}
          className="px-4 py-2 border border-[#c8a882] text-[#6b5d4f] text-[12px] bg-white cursor-pointer hover:bg-[#f0e8d8]">
          Seed Default Nav
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex border-b border-gray-200 bg-white">
        {(['women', 'men'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-3.5 text-[13px] tracking-wide border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 capitalize
              ${tab === t ? 'border-b-[#1a1a1a] text-[#1a1a1a] font-semibold' : 'border-b-transparent text-gray-400 hover:text-[#1a1a1a]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Nav items */}
      {loading ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <NavItemEditor
              key={item.id + item.sections.length}
              item={item}
              expanded={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              onUpdateItem={(data: any) => updateItem(item.id, data)}
              onUpdateSection={updateSection}
              onUpdateLink={updateLink}
              onUpdateFeatured={(data: any) => updateFeatured(item.id, data)}
              onDeleteItem={() => deleteItem(item.id)}
              onDeleteSection={deleteSection}
              onDeleteLink={deleteLink}
              onAddSection={() => openAddSection(item.id, item.sections.length)}
onAddLink={openAddLink}
              saving={saving === item.id}
              showToast={showToast}
            />
          ))}
        </div>
      )}


{/* Add Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md p-6 shadow-xl">
            <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-4">
              {modal.type === 'navItem' ? 'Add Nav Item' :
               modal.type === 'section' ? 'Add Section' : 'Add Link'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                  {modal.type === 'section' ? 'Section Heading' : 'Label'} *
                </label>
                <input
                  autoFocus
                  value={modalLabel}
                  onChange={e => setModalLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleModalSubmit()}
                  placeholder={
                    modal.type === 'navItem' ? 'e.g. Tops' :
                    modal.type === 'section' ? 'e.g. Shop By Category' :
                    'e.g. Mini Dresses'
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]"
                />
              </div>
              {modal.type !== 'section' && (
                <div>
                  <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">
                    Link URL
                  </label>
                  <input
                    value={modalHref}
                    onChange={e => setModalHref(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleModalSubmit()}
                    placeholder={
                      modal.type === 'navItem'
                        ? 'e.g. /collections?category=Tops'
                        : 'e.g. /collections/mini-dresses (auto-generated if empty)'
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a]"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)}
                className="px-4 py-2.5 border border-gray-300 text-[12px] text-gray-600 bg-white cursor-pointer hover:border-[#1a1a1a]">
                Cancel
              </button>
              <button onClick={handleModalSubmit} disabled={!modalLabel.trim()}
                className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50">
                Add
              </button>
            </div>
          </div>
        </div>
      )}



      
    </div>
  )
}

function NavItemEditor({ item, expanded, onToggle, onUpdateItem, onUpdateSection, onUpdateLink, onUpdateFeatured, onDeleteItem, onDeleteSection, onDeleteLink, onAddSection, onAddLink, saving, showToast }: any) {
  const [label, setLabel] = useState(item.label)
  const [href, setHref] = useState(item.href ?? '')
  const [isSale, setIsSale] = useState(item.isSale)
  const [isActive, setIsActive] = useState(item.isActive)

  // Featured state
  const [featImg, setFeatImg] = useState(item.featured?.image ?? '')
  const [featLabel, setFeatLabel] = useState(item.featured?.label ?? '')
  const [featHref, setFeatHref] = useState(item.featured?.href ?? '')

  // Section/link inline editing
  const [sectionHeadings, setSectionHeadings] = useState<Record<string, string>>(
    Object.fromEntries(item.sections.map((s: any) => [s.id, s.heading]))
  )
  const [linkData, setLinkData] = useState<Record<string, { label: string; href: string }>>(
    Object.fromEntries(
      item.sections.flatMap((s: any) => s.links.map((l: any) => [l.id, { label: l.label, href: l.href }]))
    )
  )

  return (
    <div className="bg-white border border-gray-200">
      {/* Item header */}
      <div className="px-5 py-4 flex items-center gap-4">
        <GripVertical size={16} className="text-gray-300 cursor-grab shrink-0" />
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-gray-400 tracking-widest uppercase mb-1">Label</label>
            <input value={label} onChange={e => setLabel(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-200 text-[13px] outline-none focus:border-[#1a1a1a]" />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 tracking-widest uppercase mb-1">Link URL</label>
            <input value={href} onChange={e => setHref(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-200 text-[13px] outline-none focus:border-[#1a1a1a]" />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 text-[11px] text-red-500 cursor-pointer">
            <input type="checkbox" checked={isSale} onChange={e => setIsSale(e.target.checked)} className="accent-red-500" />
            Sale
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-gray-500 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-[#1a1a1a]" />
            Active
          </label>
          <button onClick={() => onUpdateItem({ label, href, isSale, isActive })} disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#4a6741] text-white text-[11px] border-none cursor-pointer hover:bg-[#3d5636] disabled:opacity-50">
            <Save size={11} /> {saving ? '...' : 'Save'}
          </button>
          <button onClick={onDeleteItem}
            className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer">
            <Trash2 size={14} />
          </button>
          <button onClick={onToggle}
            className="text-gray-400 bg-transparent border-none cursor-pointer">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50">

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-[#1a1a1a] tracking-wide">Menu Sections</p>
              <button onClick={onAddSection}
                className="flex items-center gap-1 text-[11px] text-[#1a1a1a] border border-gray-300 px-2.5 py-1 bg-white cursor-pointer hover:border-[#1a1a1a]">
                <Plus size={11} /> Add Section
              </button>
            </div>

            <div className="space-y-3">
              {item.sections.map((section: any) => (
                <div key={section.id} className="bg-white border border-gray-200 p-4">
                  {/* Section heading */}
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      value={sectionHeadings[section.id] ?? section.heading}
                      onChange={e => setSectionHeadings(p => ({ ...p, [section.id]: e.target.value }))}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 text-[12px] font-semibold outline-none focus:border-[#1a1a1a]"
                      placeholder="Section heading"
                    />
                    <button onClick={() => onUpdateSection(section.id, { heading: sectionHeadings[section.id] })}
                      className="px-2.5 py-1.5 bg-[#1a1a1a] text-white text-[11px] border-none cursor-pointer hover:bg-gray-800">
                      Save
                    </button>
                    <button onClick={() => onDeleteSection(section.id)}
                      className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Links */}
                  <div className="space-y-2 ml-3">
                    {section.links.map((link: any) => (
                      <div key={link.id} className="flex items-center gap-2">
                        <input
                          value={linkData[link.id]?.label ?? link.label}
                          onChange={e => setLinkData(p => ({ ...p, [link.id]: { ...p[link.id], label: e.target.value } }))}
                          className="flex-1 px-2 py-1 border border-gray-200 text-[12px] outline-none focus:border-[#1a1a1a]"
                          placeholder="Link label"
                        />
                        <input
                          value={linkData[link.id]?.href ?? link.href}
                          onChange={e => setLinkData(p => ({ ...p, [link.id]: { ...p[link.id], href: e.target.value } }))}
                          className="flex-1 px-2 py-1 border border-gray-200 text-[12px] font-mono outline-none focus:border-[#1a1a1a]"
                          placeholder="/collections/..."
                        />
                        <button onClick={() => onUpdateLink(link.id, linkData[link.id])}
                          className="px-2 py-1 bg-gray-100 text-[11px] border border-gray-200 cursor-pointer hover:bg-gray-200">
                          Save
                        </button>
                        <button onClick={() => onDeleteLink(link.id)}
                          className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => onAddLink(section.id, section.links.length)}
                      className="flex items-center gap-1 text-[11px] text-gray-400 bg-transparent border-none cursor-pointer hover:text-[#1a1a1a] mt-1">
                      <Plus size={11} /> Add link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured image */}
          <div className="bg-white border border-gray-200 p-4">
            <p className="text-[12px] font-semibold text-[#1a1a1a] tracking-wide mb-3 flex items-center gap-2">
              <ImageIcon size={13} className="text-[#c8a882]" /> Featured Image
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex gap-3">
                {featImg && (
                  <img src={featImg} alt="" className="w-16 aspect-[3/4] object-cover border border-gray-200 shrink-0" />
                )}
                <div className="flex-1 space-y-2">
                  <input value={featImg} onChange={e => setFeatImg(e.target.value)}
                    placeholder="Image URL"
                    className="w-full px-2.5 py-1.5 border border-gray-200 text-[12px] font-mono outline-none focus:border-[#1a1a1a]" />
                  <input value={featLabel} onChange={e => setFeatLabel(e.target.value)}
                    placeholder="Button label (e.g. Shop New Arrivals)"
                    className="w-full px-2.5 py-1.5 border border-gray-200 text-[12px] outline-none focus:border-[#1a1a1a]" />
                  <input value={featHref} onChange={e => setFeatHref(e.target.value)}
                    placeholder="Link URL"
                    className="w-full px-2.5 py-1.5 border border-gray-200 text-[12px] font-mono outline-none focus:border-[#1a1a1a]" />
                </div>
              </div>
              <button onClick={() => onUpdateFeatured({ image: featImg, label: featLabel, href: featHref })}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 w-fit">
                <Save size={12} /> Save Featured Image
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  )
}