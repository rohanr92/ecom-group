'use client'
// Save as: src/app/admin/cms/page.tsx (NEW FILE)
import { useState, useEffect } from 'react'
import {
  FileText, Globe, AlignLeft, Plus, Trash2, Save,
  ChevronDown, ChevronUp, Image, Link2, Type, AlignJustify,
  Menu, Columns, AlertCircle, CheckCircle2, Eye, EyeOff, Settings
} from 'lucide-react'
import { link } from 'fs/promises';

// ── Types ─────────────────────────────────────────────────────────
interface Section { id: string; type: string; content: any }
interface CmsPage  { id: string; slug: string; title: string; sections: Section[]; isActive: boolean; updatedAt: string }
interface NavItem  { label: string; href: string; megaMenu?: { sections: { heading: string; links: { label: string; href: string }[] }[]; featuredImage?: string; featuredLabel?: string; featuredHref?: string } }
interface FooterCol { heading: string; links: { label: string; href: string }[] }

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

const SECTION_TYPES = [
  { type: 'hero',      label: 'Hero Banner',     icon: <Image size={14} /> },
  { type: 'text',      label: 'Text Block',       icon: <Type size={14} /> },
  { type: 'rich_text', label: 'Rich Text',        icon: <AlignJustify size={14} /> },
  { type: 'image',     label: 'Image',            icon: <Image size={14} /> },
  { type: 'columns',   label: '2 Columns',        icon: <Columns size={14} /> },
  { type: 'faq',       label: 'FAQ Accordion',    icon: <AlignLeft size={14} /> },
  { type: 'cta',       label: 'Call to Action',   icon: <Link2 size={14} /> },
]

const PAGE_SLUGS = [
  { slug: 'about',          label: 'About Us' },
  { slug: 'contact',        label: 'Contact Us' },
  { slug: 'shipping',       label: 'Shipping & Delivery' },
  { slug: 'returns',        label: 'Returns & Exchanges' },
  { slug: 'faq',            label: 'FAQ' },
  { slug: 'size-guide',     label: 'Size Guide' },
  { slug: 'sustainability', label: 'Sustainability' },
  { slug: 'press',          label: 'Press' },
  { slug: 'influencers',    label: 'Influencers' },
  { slug: 'affiliate',      label: 'Affiliate Program' },
  { slug: 'gift-cards',     label: 'Gift Cards' },
  { slug: 'privacy',        label: 'Privacy Policy' },
  { slug: 'terms',          label: 'Terms of Service' },
  { slug: 'accessibility',  label: 'Accessibility' },
  { slug: 'ca-privacy',     label: 'CA Privacy Rights' },
]

export default function CmsAdminPage() {
  const [tab,   setTab]   = useState<'pages' | 'header' | 'footer'>('pages')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)

  // Pages state
  const [pages,       setPages]       = useState<CmsPage[]>([])
  const [activePage,  setActivePage]  = useState<CmsPage | null>(null)
  const [editTitle,   setEditTitle]   = useState('')
  const [editSections,setEditSections]= useState<Section[]>([])
  const [expanded,    setExpanded]    = useState<string | null>(null)

  // Header nav state
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [expandedNav, setExpandedNav] = useState<number | null>(null)

  // Footer state
  const [footerCols,    setFooterCols]    = useState<FooterCol[]>([])
  const [footerTagline, setFooterTagline] = useState('Solomon & Sage Group')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load data ──────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/cms/pages').then(r => r.json()).then(d => setPages(d.pages ?? []))
    fetch('/api/admin/cms/settings').then(r => r.json()).then(d => {
      const s = d.settings ?? {}
      if (s.footer_cols) setFooterCols(s.footer_cols)
      else setFooterCols(defaultFooterCols)
      if (s.footer_tagline) setFooterTagline(s.footer_tagline)
    })
    fetch('/api/admin/nav?tab=women').then(r => r.json()).then(d => {
      const items = d.items ?? []
      setNavItems(items.map((item: any) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        isSale: item.isSale,
        megaMenu: item.sections?.length ? {
          sections: item.sections.map((s: any) => ({
            id: s.id,
            heading: s.heading,
            links: s.links.map((l: any) => ({ id: l.id, label: l.label, href: l.href }))
          })),
          featuredImage: item.featured?.image ?? '',
          featuredLabel: item.featured?.label ?? '',
          featuredHref: item.featured?.href ?? '',
        } : undefined
      })))
    })
  }, [])

  // ── Select page ────────────────────────────────────────────────
  const selectPage = (slug: string) => {
    const existing = pages.find(p => p.slug === slug)
    const meta     = PAGE_SLUGS.find(p => p.slug === slug)!
    if (existing) {
      setActivePage(existing)
      setEditTitle(existing.title)
      setEditSections(existing.sections as Section[])
    } else {
      setActivePage({ id: '', slug, title: meta.label, sections: [], isActive: true, updatedAt: '' })
      setEditTitle(meta.label)
      setEditSections([])
    }
  }

  // ── Save page ──────────────────────────────────────────────────
  const savePage = async () => {
    if (!activePage) return
    setSaving(true)
    try {
      const res  = await fetch('/api/admin/cms/pages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug: activePage.slug, title: editTitle, sections: editSections }),
      })
      if (res.ok) {
        showToast('Page saved — changes are live', 'success')
        const d = await fetch('/api/admin/cms/pages').then(r => r.json())
        setPages(d.pages ?? [])
      } else showToast('Failed to save page', 'error')
    } finally { setSaving(false) }
  }

  // ── Save header nav ────────────────────────────────────────────
  const saveNav = async () => {
    setSaving(true)
    try {
      for (const item of navItems) {
        if (!(item as any).id) continue
        await fetch('/api/admin/nav', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'item', id: (item as any).id, label: item.label, href: item.href })
        })
        if (item.megaMenu) {
          await fetch('/api/admin/nav', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'featured', navItemId: (item as any).id, image: item.megaMenu.featuredImage ?? '', label: item.megaMenu.featuredLabel ?? '', href: item.megaMenu.featuredHref ?? '' })
          })
          for (const sec of item.megaMenu.sections ?? []) {
            for (const lnk of (sec as any).links ?? []) {
              if ((lnk as any).id) {
                // Update existing link
                await fetch('/api/admin/nav', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'link', id: (lnk as any).id, label: lnk.label, href: lnk.href })
                })
              } else {
                // Create new link
                await fetch('/api/admin/nav', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'link', sectionId: (sec as any).id, label: lnk.label, href: lnk.href })
                })
              }
            }
          }
        }
      }
      showToast('Navigation saved — live immediately', 'success')
    } catch {
      showToast('Failed to save navigation', 'error')
    }
    setSaving(false)
  }

  // ── Save footer ────────────────────────────────────────────────
  const saveFooter = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/cms/settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key: 'footer_cols', value: footerCols }),
      })
      await fetch('/api/admin/cms/settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key: 'footer_tagline', value: footerTagline }),
      })
      showToast('Footer saved — live immediately', 'success')
    } catch { showToast('Failed to save footer', 'error') }
    finally { setSaving(false) }
  }

  // ── Section helpers ────────────────────────────────────────────
  const addSection = (type: string) => {
    const defaults: Record<string, any> = {
      hero:      { title: 'New Section', subtitle: '', image: '', ctaText: 'Shop Now', ctaHref: '/collections/all' },
      text:      { heading: '', body: 'Enter your text here...' },
      rich_text: { body: 'Enter your content here...' },
      image:     { src: '', alt: '', caption: '' },
      columns:   { left: 'Left column content', right: 'Right column content' },
      faq:       { items: [{ q: 'Question?', a: 'Answer.' }] },
      cta:       { heading: 'Ready to Shop?', body: '', buttonText: 'Shop Now', buttonHref: '/collections/all' },
    }
    const newSec: Section = { id: crypto.randomUUID(), type, content: defaults[type] ?? {} }
    setEditSections(prev => [...prev, newSec])
    setExpanded(newSec.id)
  }

  const removeSection = (id: string) => setEditSections(prev => prev.filter(s => s.id !== id))

  const updateSection = (id: string, content: any) =>
    setEditSections(prev => prev.map(s => s.id === id ? { ...s, content } : s))

  const moveSection = (id: string, dir: 'up' | 'down') => {
    setEditSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  // ── Section editor ─────────────────────────────────────────────
  function SectionEditor({ section }: { section: Section }) {
    const c = section.content
    return (
      <div style={{ padding: '16px', background: '#fafafa', borderTop: '1px solid #e8e4de' }}>
       {section.type === 'text' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div>
      <label style={labelStyle}>Heading</label>
      <input value={c.heading ?? ''} onChange={e => updateSection(section.id, { ...c, heading: e.target.value })} style={inputStyle} />
    </div>

    {/* Heading style options */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
      <div>
        <label style={labelStyle}>Font Family</label>
       <select value={c.headingFont ?? 'display'} onChange={e => updateSection(section.id, { ...c, headingFont: e.target.value })}
  style={{ ...inputStyle, padding: '7px 10px' }}>
  <option value="display">Display — Site Default</option>
  <option value="body">Body — Site Default</option>
  <option value="var(--google-playfair)">Playfair Display</option>
  <option value="var(--google-lora)">Lora</option>
  <option value="var(--google-merriweather)">Merriweather</option>
  <option value="var(--google-crimson)">Crimson Text</option>
  <option value="var(--google-garamond)">EB Garamond</option>
  <option value="var(--google-nunito)">Nunito</option>
  <option value="var(--google-raleway)">Raleway</option>
  <option value="var(--google-josefin)">Josefin Sans</option>
  <option value="Georgia, serif">Georgia</option>
  <option value="'Times New Roman', serif">Times New Roman</option>
  <option value="Arial, sans-serif">Arial</option>
  <option value="Helvetica, sans-serif">Helvetica</option>
  <option value="Verdana, sans-serif">Verdana</option>
  <option value="'Courier New', monospace">Courier New</option>
  <option value="cursive">Cursive</option>
</select>
      </div>
      <div>
        <label style={labelStyle}>Font Size</label>
        <select value={c.headingSize ?? '32px'} onChange={e => updateSection(section.id, { ...c, headingSize: e.target.value })}
          style={{ ...inputStyle, padding: '7px 10px' }}>
          {['14px','16px','18px','20px','24px','28px','32px','36px','42px','48px','56px','64px'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Font Weight</label>
        <select value={c.headingWeight ?? '400'} onChange={e => updateSection(section.id, { ...c, headingWeight: e.target.value })}
          style={{ ...inputStyle, padding: '7px 10px' }}>
          <option value="300">Light (300)</option>
          <option value="400">Regular (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semibold (600)</option>
          <option value="700">Bold (700)</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Text Align</label>
        <select value={c.headingAlign ?? 'left'} onChange={e => updateSection(section.id, { ...c, headingAlign: e.target.value })}
          style={{ ...inputStyle, padding: '7px 10px' }}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>

    {/* Heading color + style */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
      <div>
        <label style={labelStyle}>Text Color</label>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input type="color" value={c.headingColor ?? '#1a1a1a'} onChange={e => updateSection(section.id, { ...c, headingColor: e.target.value })}
            style={{ width: '36px', height: '34px', border: '1px solid #ddd', cursor: 'pointer', padding: '2px' }} />
          <input value={c.headingColor ?? '#1a1a1a'} onChange={e => updateSection(section.id, { ...c, headingColor: e.target.value })}
            style={{ ...inputStyle, flex: 1 }} placeholder="#1a1a1a" />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Italic</label>
        <select value={c.headingItalic ?? 'italic'} onChange={e => updateSection(section.id, { ...c, headingItalic: e.target.value })}
          style={{ ...inputStyle, padding: '7px 10px' }}>
          <option value="normal">Normal</option>
          <option value="italic">Italic</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Text Transform</label>
        <select value={c.headingTransform ?? 'none'} onChange={e => updateSection(section.id, { ...c, headingTransform: e.target.value })}
          style={{ ...inputStyle, padding: '7px 10px' }}>
          <option value="none">None</option>
          <option value="uppercase">UPPERCASE</option>
          <option value="lowercase">lowercase</option>
          <option value="capitalize">Capitalize</option>
        </select>
      </div>
    </div>

    {/* Live heading preview */}
    {c.heading && (
      <div style={{ padding: '12px 16px', border: '1px solid #e8e4de', background: '#fafafa', textAlign: c.headingAlign ?? 'left' }}>
        <p style={{ fontFamily: c.headingFont === 'display' ? 'var(--font-display)' : c.headingFont === 'body' ? 'var(--font-body)' : (c.headingFont ?? 'var(--font-display)'), fontSize: c.headingSize ?? '32px', fontWeight: c.headingWeight ?? '400', fontStyle: c.headingItalic ?? 'italic', color: c.headingColor ?? '#1a1a1a', textTransform: (c.headingTransform ?? 'none') as any, margin: 0 }}>
          {c.heading}
        </p>
      </div>
    )}

    <div>
      <label style={labelStyle}>Body Text</label>
      <textarea value={c.body ?? ''} onChange={e => updateSection(section.id, { ...c, body: e.target.value })} rows={5}
        style={{ ...inputStyle, resize: 'vertical', whiteSpace: 'pre-wrap' }} />
    </div>

    {/* Body options */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
      <div>
        <label style={labelStyle}>Body Font Size</label>
        <select value={c.bodySize ?? '14px'} onChange={e => updateSection(section.id, { ...c, bodySize: e.target.value })}
          style={{ ...inputStyle, padding: '7px 10px' }}>
          {['12px','13px','14px','15px','16px','18px','20px'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Body Align</label>
        <select value={c.bodyAlign ?? 'left'} onChange={e => updateSection(section.id, { ...c, bodyAlign: e.target.value })}
          style={{ ...inputStyle, padding: '7px 10px' }}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Body Color</label>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input type="color" value={c.bodyColor ?? '#666666'} onChange={e => updateSection(section.id, { ...c, bodyColor: e.target.value })}
            style={{ width: '36px', height: '34px', border: '1px solid #ddd', cursor: 'pointer', padding: '2px' }} />
          <input value={c.bodyColor ?? '#666666'} onChange={e => updateSection(section.id, { ...c, bodyColor: e.target.value })}
            style={{ ...inputStyle, flex: 1 }} />
        </div>
      </div>
    </div>
  </div>
)}
       {section.type === 'rich_text' && (
  <div>
    <label style={labelStyle}>Content</label>
    {/* Formatting toolbar */}
    <div style={{ display:'flex', gap:'4px', marginBottom:'6px', flexWrap:'wrap' }}>
      {[
        { label: 'B', title: 'Bold', wrap: ['<strong>', '</strong>'] },
        { label: 'I', title: 'Italic', wrap: ['<em>', '</em>'] },
        { label: 'U', title: 'Underline', wrap: ['<u>', '</u>'] },
        { label: '• List', title: 'Bullet List', wrap: ['<ul>\n  <li>', '</li>\n</ul>'] },
        { label: '1. List', title: 'Numbered List', wrap: ['<ol>\n  <li>', '</li>\n</ol>'] },
        { label: 'H2', title: 'Heading 2', wrap: ['<h2>', '</h2>'] },
        { label: 'H3', title: 'Heading 3', wrap: ['<h3>', '</h3>'] },
        { label: 'Link', title: 'Link', wrap: ['<a href="URL">', '</a>'] },
        { label: '—', title: 'Divider', wrap: ['<hr/>', ''] },
        { label: 'BR', title: 'Line Break', wrap: ['<br/>', ''] },
      ].map(btn => (
        <button key={btn.label} title={btn.title}
          onClick={() => {
            const ta = document.getElementById(`rte-${section.id}`) as HTMLTextAreaElement
            if (!ta) return
            const start = ta.selectionStart
            const end   = ta.selectionEnd
            const selected = ta.value.substring(start, end)
            const newVal = ta.value.substring(0, start) + btn.wrap[0] + selected + btn.wrap[1] + ta.value.substring(end)
            updateSection(section.id, { ...c, body: newVal })
          }}
          style={{ padding:'4px 10px', border:'1px solid #ddd', background:'#fff', fontFamily:'var(--font-body)', fontSize:'11px', cursor:'pointer', fontWeight: btn.label === 'B' ? 700 : btn.label === 'I' ? undefined : 400, fontStyle: btn.label === 'I' ? 'italic' : 'normal' }}>
          {btn.label}
        </button>
      ))}
    </div>
    <textarea
      id={`rte-${section.id}`}
      value={c.body ?? ''}
      onChange={e => updateSection(section.id, { ...c, body: e.target.value })}
      rows={10}
      style={{ ...inputStyle, resize:'vertical', fontFamily:'monospace', fontSize:'12px' }}
      placeholder="Type content here, or use the toolbar above to format. Supports HTML tags." />
    {/* Live preview */}
    {c.body && (
      <div style={{ marginTop:'8px', padding:'12px', border:'1px solid #e8e4de', background:'#fafafa' }}>
        <p style={{ fontFamily:'var(--font-body)', fontSize:'10px', color:'#aaa', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Preview</p>
        <div style={{ fontFamily:'var(--font-body)', fontSize:'13px', color:'var(--color-mid)', lineHeight:1.8 }}
          dangerouslySetInnerHTML={{ __html: c.body }} />
      </div>
    )}
  </div>
)}
        {section.type === 'hero' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label style={labelStyle}>Title</label><input value={c.title ?? ''} onChange={e => updateSection(section.id, { ...c, title: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Subtitle</label><input value={c.subtitle ?? ''} onChange={e => updateSection(section.id, { ...c, subtitle: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Image URL</label><input value={c.image ?? ''} onChange={e => updateSection(section.id, { ...c, image: e.target.value })} style={inputStyle} placeholder="https://..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Button Text</label><input value={c.ctaText ?? ''} onChange={e => updateSection(section.id, { ...c, ctaText: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Button Link</label><input value={c.ctaHref ?? ''} onChange={e => updateSection(section.id, { ...c, ctaHref: e.target.value })} style={inputStyle} /></div>
            </div>
          </div>
        )}
        {section.type === 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label style={labelStyle}>Image URL</label><input value={c.src ?? ''} onChange={e => updateSection(section.id, { ...c, src: e.target.value })} style={inputStyle} placeholder="https://..." /></div>
            <div><label style={labelStyle}>Alt Text</label><input value={c.alt ?? ''} onChange={e => updateSection(section.id, { ...c, alt: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Caption (optional)</label><input value={c.caption ?? ''} onChange={e => updateSection(section.id, { ...c, caption: e.target.value })} style={inputStyle} /></div>
            {c.src && <img src={c.src} alt={c.alt} style={{ maxHeight: '120px', objectFit: 'cover', borderRadius: '4px' }} />}
          </div>
        )}
        {section.type === 'columns' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={labelStyle}>Left Column</label><textarea value={c.left ?? ''} onChange={e => updateSection(section.id, { ...c, left: e.target.value })} rows={5} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div><label style={labelStyle}>Right Column</label><textarea value={c.right ?? ''} onChange={e => updateSection(section.id, { ...c, right: e.target.value })} rows={5} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          </div>
        )}
        {section.type === 'faq' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(c.items ?? []).map((item: any, i: number) => (
              <div key={i} style={{ border: '1px solid #e8e4de', padding: '12px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FAQ {i + 1}</span>
                  <button onClick={() => { const items = [...c.items]; items.splice(i, 1); updateSection(section.id, { ...c, items }) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b' }}><Trash2 size={12} /></button>
                </div>
                <input value={item.q} onChange={e => { const items = [...c.items]; items[i] = { ...item, q: e.target.value }; updateSection(section.id, { ...c, items }) }}
                  placeholder="Question" style={{ ...inputStyle, marginBottom: '8px' }} />
                <textarea value={item.a} onChange={e => { const items = [...c.items]; items[i] = { ...item, a: e.target.value }; updateSection(section.id, { ...c, items }) }}
                  placeholder="Answer" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            ))}
            <button onClick={() => updateSection(section.id, { ...c, items: [...(c.items ?? []), { q: '', a: '' }] })}
              style={{ ...btnOutlineStyle }}>+ Add FAQ Item</button>
          </div>
        )}
        {section.type === 'cta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label style={labelStyle}>Heading</label><input value={c.heading ?? ''} onChange={e => updateSection(section.id, { ...c, heading: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Body Text (optional)</label><textarea value={c.body ?? ''} onChange={e => updateSection(section.id, { ...c, body: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Button Text</label><input value={c.buttonText ?? ''} onChange={e => updateSection(section.id, { ...c, buttonText: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Button Link</label><input value={c.buttonHref ?? ''} onChange={e => updateSection(section.id, { ...c, buttonHref: e.target.value })} style={inputStyle} /></div>
            </div>
          </div>
        )}
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
            <Settings size={18} strokeWidth={1.5} className="text-[#c8a882]" /> Content Management
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Edit pages, header navigation, and footer — changes go live immediately</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {([
          { key: 'pages',  label: 'Pages',      icon: <FileText size={14} /> },
          { key: 'header', label: 'Header Menu', icon: <Menu size={14} /> },
          { key: 'footer', label: 'Footer',      icon: <AlignLeft size={14} /> },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-6 py-3.5 text-[13px] tracking-wide border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0
              ${tab === t.key ? 'border-b-[#1a1a1a] text-[#1a1a1a] font-semibold' : 'border-b-transparent text-gray-400 hover:text-[#1a1a1a]'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ═══ PAGES TAB ═══════════════════════════════════════════ */}
      {tab === 'pages' && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Page list sidebar */}
          <div className="bg-white border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">Pages</p>
            </div>
            <div className="divide-y divide-gray-100">
              {PAGE_SLUGS.map(p => {
                const saved = pages.find(pg => pg.slug === p.slug)
                return (
                  <button key={p.slug} onClick={() => selectPage(p.slug)}
                    className={`w-full text-left px-4 py-3 text-[13px] flex items-center justify-between cursor-pointer border-none transition-colors
                      ${activePage?.slug === p.slug ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#1a1a1a] hover:bg-gray-50'}`}>
                    <span>{p.label}</span>
                    {saved && <span className="text-[10px] opacity-60">●</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Page editor */}
          <div className="bg-white border border-gray-200">
            {!activePage ? (
              <div className="p-12 text-center">
                <FileText size={36} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
                <p className="text-[14px] text-gray-400">Select a page to edit</p>
              </div>
            ) : (
              <>
                {/* Page header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-400 tracking-widest uppercase mb-1">/{activePage.slug}</p>
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                      className="text-[16px] font-semibold text-[#1a1a1a] border-none outline-none bg-transparent w-full"
                      placeholder="Page title" />
                  </div>
                  <div className="flex gap-2">
                    <a href={`/${activePage.slug}`} target="_blank"
                      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] text-gray-600 no-underline hover:border-[#1a1a1a] transition-colors">
                      <Eye size={13} /> Preview
                    </a>
                    <button onClick={savePage} disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50">
                      {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={13} />}
                      Save Page
                    </button>
                  </div>
                </div>

                {/* Sections */}
                <div className="p-5 space-y-3">
                  {editSections.length === 0 && (
                    <div className="py-8 text-center border border-dashed border-gray-200">
                      <p className="text-[13px] text-gray-400 mb-1">No sections yet</p>
                      <p className="text-[11px] text-gray-300">Add a section below to start building this page</p>
                    </div>
                  )}

                  {editSections.map((section, idx) => (
                    <div key={section.id} className="border border-gray-200">
                      <div className="px-4 py-3 flex items-center gap-3 bg-gray-50">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveSection(section.id, 'up')} disabled={idx === 0}
                            className="border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-700 disabled:opacity-30 p-0 leading-none">
                            <ChevronUp size={12} />
                          </button>
                          <button onClick={() => moveSection(section.id, 'down')} disabled={idx === editSections.length - 1}
                            className="border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-700 disabled:opacity-30 p-0 leading-none">
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-[#1a1a1a]">
                            {SECTION_TYPES.find(t => t.type === section.type)?.label ?? section.type}
                          </p>
                        </div>
                        <button onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                          className="text-[12px] text-gray-500 border border-gray-200 px-3 py-1 bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors">
                          {expanded === section.id ? 'Close' : 'Edit'}
                        </button>
                        <button onClick={() => removeSection(section.id)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-300 cursor-pointer transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {expanded === section.id && <SectionEditor section={section} />}
                    </div>
                  ))}

                  {/* Add section */}
                  <div className="border border-dashed border-gray-300 p-4">
                    <p className="text-[11px] font-semibold tracking-widests uppercase text-gray-400 mb-3">Add Section</p>
                    <div className="flex flex-wrap gap-2">
                      {SECTION_TYPES.map(t => (
                        <button key={t.type} onClick={() => addSection(t.type)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white text-[12px] text-[#1a1a1a] cursor-pointer hover:border-[#1a1a1a] hover:bg-gray-50 transition-colors">
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ HEADER NAB TAB ══════════════════════════════════════ */}
      {tab === 'header' && (
        <div className="space-y-4">
          <div className="bg-[#f8f6f1] border border-[#e8e0d0] px-5 py-3.5 text-[12px] text-[#6b5d4f] leading-relaxed">
            <strong>Header Navigation:</strong> Edit your main navigation links, mega menu sections and featured images. Changes go live immediately after saving.
          </div>

          <div className="bg-white border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Navigation Items</h2>
              <div className="flex gap-2">
                <button onClick={() => setNavItems(prev => [...prev, { label: 'New Link', href: '/collections/new' }])}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] text-[#1a1a1a] bg-white cursor-pointer hover:border-[#1a1a1a] transition-colors">
                  <Plus size={13} /> Add Link
                </button>
                <button onClick={saveNav} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50">
                  {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={13} />}
                  Save Navigation
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {navItems.map((item, idx) => (
                <div key={idx}>
                  {/* Nav item row */}
                  <div className="px-5 py-3 flex items-center gap-4">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => { if (idx === 0) return; const n = [...navItems]; [n[idx], n[idx-1]] = [n[idx-1], n[idx]]; setNavItems(n) }}
                        className="border-none bg-transparent cursor-pointer text-gray-300 hover:text-gray-600 p-0 disabled:opacity-20" disabled={idx === 0}>
                        <ChevronUp size={12} />
                      </button>
                      <button onClick={() => { if (idx === navItems.length-1) return; const n = [...navItems]; [n[idx], n[idx+1]] = [n[idx+1], n[idx]]; setNavItems(n) }}
                        className="border-none bg-transparent cursor-pointer text-gray-300 hover:text-gray-600 p-0 disabled:opacity-20" disabled={idx === navItems.length-1}>
                        <ChevronDown size={12} />
                      </button>
                    </div>
                    <input value={item.label}
                      onChange={e => { const n = [...navItems]; n[idx] = { ...n[idx], label: e.target.value }; setNavItems(n) }}
                      className="text-[13px] font-medium border border-gray-200 px-2 py-1.5 outline-none focus:border-[#1a1a1a] w-32" />
                    <input value={item.href}
                      onChange={e => { const n = [...navItems]; n[idx] = { ...n[idx], href: e.target.value }; setNavItems(n) }}
                      className="text-[12px] border border-gray-200 px-2 py-1.5 outline-none focus:border-[#1a1a1a] flex-1 text-gray-500 font-mono" placeholder="/collections/..." />
                    <button onClick={() => setExpandedNav(expandedNav === idx ? null : idx)}
                      className="text-[11px] border border-gray-200 px-3 py-1.5 bg-white cursor-pointer hover:border-[#1a1a1a] text-gray-600 tracking-wide whitespace-nowrap">
                      {expandedNav === idx ? 'Hide Mega Menu' : 'Edit Mega Menu'}
                    </button>
                    <button onClick={() => setNavItems(prev => prev.filter((_, i) => i !== idx))}
                      className="w-7 h-7 flex items-center justify-center border border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-300 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Mega menu editor */}
                  {expandedNav === idx && (
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-4">
                      <p className="text-[11px] font-semibold tracking-widests uppercase text-gray-500">Mega Menu for "{item.label}"</p>

                      {/* Featured image */}
                      <div className="bg-white border border-gray-200 p-4">
                        <p className="text-[12px] font-semibold text-[#1a1a1a] mb-3">Featured Image (right panel)</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] text-gray-500 block mb-1">Image URL</label>
                            <input value={item.megaMenu?.featuredImage ?? ''}
                              onChange={e => { const n = [...navItems]; n[idx] = { ...n[idx], megaMenu: { ...(n[idx].megaMenu ?? { sections: [] }), featuredImage: e.target.value } }; setNavItems(n) }}
                              className="w-full text-[12px] border border-gray-200 px-2 py-1.5 outline-none focus:border-[#1a1a1a]" placeholder="https://..." />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 block mb-1">Label</label>
                            <input value={item.megaMenu?.featuredLabel ?? ''}
                              onChange={e => { const n = [...navItems]; n[idx] = { ...n[idx], megaMenu: { ...(n[idx].megaMenu ?? { sections: [] }), featuredLabel: e.target.value } }; setNavItems(n) }}
                              className="w-full text-[12px] border border-gray-200 px-2 py-1.5 outline-none focus:border-[#1a1a1a]" placeholder="Shop Now" />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 block mb-1">Link</label>
                            <input value={item.megaMenu?.featuredHref ?? ''}
                              onChange={e => { const n = [...navItems]; n[idx] = { ...n[idx], megaMenu: { ...(n[idx].megaMenu ?? { sections: [] }), featuredHref: e.target.value } }; setNavItems(n) }}
                              className="w-full text-[12px] border border-gray-200 px-2 py-1.5 outline-none focus:border-[#1a1a1a]" placeholder="/collections/..." />
                          </div>
                        </div>
                      </div>

                      {/* Sections */}
                      {(item.megaMenu?.sections ?? []).map((sec, si) => (
                        <div key={si} className="bg-white border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <input value={sec.heading}
                              onChange={e => { const n = [...navItems]; n[idx].megaMenu!.sections[si].heading = e.target.value; setNavItems(n) }}
                              className="text-[13px] font-semibold border border-gray-200 px-2 py-1 outline-none focus:border-[#1a1a1a]" placeholder="Section Heading" />
                            <button onClick={async () => {
                              if ((sec as any).id) {
                                await fetch('/api/admin/nav', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ type: 'section', id: (sec as any).id })
                                })
                              }
                              const n = [...navItems]; n[idx].megaMenu!.sections.splice(si, 1); setNavItems(n)
                            }}
                              className="border-none bg-transparent cursor-pointer text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                          </div>
                          <div className="space-y-2">
                            {sec.links.map((link, li) => (
                              <div key={li} className="flex gap-2 items-center">
                                <input value={link.label}
                                  onChange={e => { const n = [...navItems]; n[idx].megaMenu!.sections[si].links[li].label = e.target.value; setNavItems(n) }}
                                  className="text-[12px] border border-gray-200 px-2 py-1 outline-none focus:border-[#1a1a1a] w-36" placeholder="Link label" />
                                <input value={link.href}
                                  onChange={e => { const n = [...navItems]; n[idx].megaMenu!.sections[si].links[li].href = e.target.value; setNavItems(n) }}
                                  className="text-[12px] border border-gray-200 px-2 py-1 outline-none focus:border-[#1a1a1a] flex-1 font-mono text-gray-500" placeholder="/collections/..." />
                                <button onClick={async () => {
                                  if ((link as any).id) {
                                    await fetch('/api/admin/nav', {
                                      method: 'DELETE',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ type: 'link', id: (link as any).id })
                                    })
                                  }
                                  const n = [...navItems]; n[idx].megaMenu!.sections[si].links.splice(li, 1); setNavItems(n)
                                }}
                                  className="border-none bg-transparent cursor-pointer text-gray-300 hover:text-red-400"><Trash2 size={12} /></button>
                              </div>
                            ))}
                            <button onClick={() => { const n = [...navItems]; n[idx].megaMenu!.sections[si].links.push({ label: 'New Link', href: '#' }); setNavItems(n) }}
                              className="text-[11px] text-gray-500 border border-dashed border-gray-300 px-3 py-1 bg-transparent cursor-pointer hover:border-gray-500 w-full">
                              + Add Link
                            </button>
                          </div>
                        </div>
                      ))}

                      <button onClick={() => { const n = [...navItems]; if (!n[idx].megaMenu) n[idx].megaMenu = { sections: [] }; n[idx].megaMenu!.sections.push({ heading: 'New Section', links: [] }); setNavItems(n) }}
                        className="text-[12px] border border-dashed border-gray-300 px-4 py-2 bg-transparent cursor-pointer hover:border-[#1a1a1a] text-gray-600 w-full">
                        + Add Mega Menu Section
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ FOOTER TAB ══════════════════════════════════════════ */}
      {tab === 'footer' && (
        <div className="space-y-4">
          <div className="bg-[#f8f6f1] border border-[#e8e0d0] px-5 py-3.5 text-[12px] text-[#6b5d4f] leading-relaxed">
            <strong>Footer:</strong> Edit your footer columns and links. Add, remove, or reorder links in each column.
          </div>

          <div className="bg-white border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Footer Columns</h2>
              <button onClick={saveFooter} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50">
                {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={13} />}
                Save Footer
              </button>
            </div>

            {/* Tagline */}
            <div className="px-5 py-4 border-b border-gray-100">
              <label className="text-[11px] font-semibold tracking-widests uppercase text-gray-500 block mb-2">Brand Tagline / Copyright Text</label>
              <input value={footerTagline} onChange={e => setFooterTagline(e.target.value)}
                className="w-full max-w-md text-[13px] border border-gray-200 px-3 py-2 outline-none focus:border-[#1a1a1a]" />
            </div>

            {/* Columns */}
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {footerCols.map((col, ci) => (
                  <div key={ci} className="border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <input value={col.heading} onChange={e => { const c = [...footerCols]; c[ci].heading = e.target.value; setFooterCols(c) }}
                        className="text-[12px] font-bold border border-gray-200 px-2 py-1 outline-none focus:border-[#1a1a1a] uppercase tracking-wide w-full" />
                    </div>
                    <div className="space-y-2">
                      {col.links.map((link, li) => (
                        <div key={li} className="flex flex-col gap-1">
                          <div className="flex gap-1 items-center">
                            <input value={link.label} onChange={e => { const c = [...footerCols]; c[ci].links[li].label = e.target.value; setFooterCols(c) }}
                              className="text-[11px] border border-gray-200 px-2 py-1 outline-none focus:border-[#1a1a1a] flex-1" placeholder="Label" />
                            <button onClick={() => { const c = [...footerCols]; c[ci].links.splice(li, 1); setFooterCols(c) }}
                              className="border-none bg-transparent cursor-pointer text-gray-300 hover:text-red-400 shrink-0"><Trash2 size={11} /></button>
                          </div>
                          <input value={link.href} onChange={e => { const c = [...footerCols]; c[ci].links[li].href = e.target.value; setFooterCols(c) }}
                            className="text-[10px] border border-gray-100 px-2 py-1 outline-none focus:border-[#1a1a1a] font-mono text-gray-400 w-full" placeholder="/path" />
                        </div>
                      ))}
                      <button onClick={() => { const c = [...footerCols]; c[ci].links.push({ label: 'New Link', href: '#' }); setFooterCols(c) }}
                        className="text-[11px] text-gray-400 border border-dashed border-gray-200 px-2 py-1 bg-transparent cursor-pointer hover:border-gray-400 w-full">
                        + Add Link
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setFooterCols(prev => [...prev, { heading: 'NEW COLUMN', links: [] }])}
                  className="border border-dashed border-gray-300 p-4 bg-transparent cursor-pointer hover:border-[#1a1a1a] text-[12px] text-gray-400 flex items-center justify-center gap-2 min-h-[120px]">
                  <Plus size={14} /> Add Column
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px',
  textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', marginBottom: '6px'
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #ddd',
  fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box'
}
const btnOutlineStyle: React.CSSProperties = {
  padding: '8px 16px', border: '1px solid #ddd', background: '#fff',
  fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.1em',
  textTransform: 'uppercase', cursor: 'pointer', color: '#1a1a1a'
}

// ── Default data ───────────────────────────────────────────────────
const defaultNav: NavItem[] = [
  { label: 'New',          href: '/collections/new' },
  { label: 'Best Sellers', href: '/collections/best-sellers' },
  { label: 'Clothing',     href: '/collections/clothing' },
  { label: 'Dresses',      href: '/collections/dresses' },
  { label: 'Tops',         href: '/collections/tops' },
  { label: 'Jeans',        href: '/collections/jeans' },
  { label: 'Accessories',  href: '/collections/accessories' },
  { label: 'Sale',         href: '/collections/sale' },
]

const defaultFooterCols: FooterCol[] = [
  { heading: 'YOUR ORDER',   links: [{ label: 'Track Order', href: '/track' }, { label: 'Shipping & Delivery', href: '/shipping' }, { label: 'Returns & Exchanges', href: '/returns' }, { label: 'Size Guide', href: '/size-guide' }, { label: 'FAQ', href: '/faq' }] },
  { heading: 'HELP & INFO',  links: [{ label: 'Contact Us', href: '/contact' }, { label: 'About Us', href: '/about' }, { label: 'Job Opportunities', href: '/jobs' }, { label: 'Affiliate Program', href: '/affiliate' }, { label: 'Gift Cards', href: '/gift-cards' }] },
  { heading: 'ABOUT Solomon & Sage', links: [{ label: 'Our Story', href: '/about' }, { label: 'Sustainability', href: '/sustainability' }, { label: 'Press', href: '/press' }, { label: 'Free People King', href: '#' }, { label: 'Influencers', href: '/influencers' }] },
  { heading: 'RETAILERS',    links: [{ label: 'Nordstrom', href: '#' }, { label: "Macy's", href: '#' }, { label: "Kohl's", href: '#' }, { label: 'JCPenney', href: '#' }, { label: 'Find a Store', href: '#' }] },
]