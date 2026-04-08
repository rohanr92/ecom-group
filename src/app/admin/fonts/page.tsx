'use client'
import { useState, useEffect } from 'react'
import { Save, AlertCircle, CheckCircle2, Type } from 'lucide-react'

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

const DISPLAY_FONTS = [
  { label: 'Cormorant Garamond (Default)', value: 'Cormorant Garamond, serif' },
  { label: 'Playfair Display', value: 'var(--google-playfair)' },
  { label: 'Lora', value: 'var(--google-lora)' },
  { label: 'Merriweather', value: 'var(--google-merriweather)' },
  { label: 'Crimson Text', value: 'var(--google-crimson)' },
  { label: 'EB Garamond', value: 'var(--google-garamond)' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
]

const BODY_FONTS = [
  { label: 'Jost (Default)', value: 'Jost, sans-serif' },
  { label: 'Nunito', value: 'var(--google-nunito)' },
  { label: 'Raleway', value: 'var(--google-raleway)' },
  { label: 'Josefin Sans', value: 'var(--google-josefin)' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Helvetica Neue', value: 'Helvetica Neue, Arial, sans-serif' },
  { label: 'System UI', value: 'system-ui, sans-serif' },
]

const input = "w-full px-3 py-2 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a] transition-colors"
const select = "w-full px-3 py-2 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a] transition-colors bg-white"

export default function FontPage() {
  const [toast,   setToast]   = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(true)

  // Display font settings
  const [displayFont,     setDisplayFont]     = useState('Cormorant Garamond, serif')
  const [displaySizeBase, setDisplaySizeBase] = useState('32')
  const [displayWeight,   setDisplayWeight]   = useState('300')
  const [displayStyle,    setDisplayStyle]    = useState('italic')

  // Body font settings
  const [bodyFont,     setBodyFont]     = useState('Jost, sans-serif')
  const [bodySizeBase, setBodySizeBase] = useState('14')
  const [bodyWeight,   setBodyWeight]   = useState('400')
  const [bodyTracking, setBodyTracking] = useState('0.02')

  // Nav font settings
  const [navFont,    setNavFont]    = useState('')
  const [navSize,    setNavSize]    = useState('13')
  const [navTracking, setNavTracking] = useState('0.04')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/admin/cms/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const f = d.settings?.font_settings
        if (f) {
          if (f.displayFont)     setDisplayFont(f.displayFont)
          if (f.displaySizeBase) setDisplaySizeBase(f.displaySizeBase)
          if (f.displayWeight)   setDisplayWeight(f.displayWeight)
          if (f.displayStyle)    setDisplayStyle(f.displayStyle)
          if (f.bodyFont)        setBodyFont(f.bodyFont)
          if (f.bodySizeBase)    setBodySizeBase(f.bodySizeBase)
          if (f.bodyWeight)      setBodyWeight(f.bodyWeight)
          if (f.bodyTracking)    setBodyTracking(f.bodyTracking)
          if (f.navFont)         setNavFont(f.navFont)
          if (f.navSize)         setNavSize(f.navSize)
          if (f.navTracking)     setNavTracking(f.navTracking)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const value = {
        displayFont, displaySizeBase, displayWeight, displayStyle,
        bodyFont, bodySizeBase, bodyWeight, bodyTracking,
        navFont, navSize, navTracking,
      }
      const res = await fetch('/api/admin/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key: 'font_settings', value }),
      })
      if (res.ok) showToast('Font settings saved — refresh the site to see changes', 'success')
      else showToast('Failed to save', 'error')
    } catch {
      showToast('Failed to save', 'error')
    }
    setSaving(false)
  }

  // Live preview style
  const previewDisplayStyle = {
    fontFamily: displayFont,
    fontSize: `${displaySizeBase}px`,
    fontWeight: displayWeight,
    fontStyle: displayStyle,
  }
  const previewBodyStyle = {
    fontFamily: bodyFont,
    fontSize: `${bodySizeBase}px`,
    fontWeight: bodyWeight,
    letterSpacing: `${bodyTracking}em`,
  }

  if (loading) return (
    <div className="p-6">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="bg-white border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-[#1a1a1a] flex items-center gap-2">
            <Type size={18} strokeWidth={1.5} className="text-[#c8a882]" />
            Font Settings
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Control typography across the entire website</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-semibold border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {saving
            ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save size={13} />}
          Save Font Settings
        </button>
      </div>

      {/* Live Preview */}
      <div className="bg-white border border-gray-200 p-5">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-4">Live Preview</p>
        <div className="border border-dashed border-gray-200 p-6 space-y-3 bg-[#fafaf8]">
          <p style={{ ...previewDisplayStyle, margin: 0 }}>
            Solomon & Sage — Display Font Preview
          </p>
          <p style={{ ...previewBodyStyle, margin: 0, color: '#555' }}>
            Body text preview — The quick brown fox jumps over the lazy dog. Shop our new arrivals collection.
          </p>
          <p style={{ fontFamily: navFont || bodyFont, fontSize: `${navSize}px`, letterSpacing: `${navTracking}em`, textTransform: 'uppercase', margin: 0, color: '#1a1a1a' }}>
            New · Best Sellers · Clothing · Dresses · Tops · Sale
          </p>
        </div>
      </div>

      {/* Display Font */}
      <div className="bg-white border border-gray-200 p-5 space-y-4">
        <p className="text-[14px] font-semibold text-[#1a1a1a]">Display Font</p>
        <p className="text-[12px] text-gray-500 -mt-2">Used for headings, hero titles, product names, section headers</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Font Family</label>
            <select value={displayFont} onChange={e => setDisplayFont(e.target.value)} className={select}>
              {DISPLAY_FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Custom Font (overrides above)</label>
            <input value={displayFont} onChange={e => setDisplayFont(e.target.value)} className={input} placeholder="e.g. 'Playfair Display', serif" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Base Size (px)</label>
            <input type="number" value={displaySizeBase} onChange={e => setDisplaySizeBase(e.target.value)} className={input} min="16" max="72" />
            <p className="text-[10px] text-gray-400 mt-1">Sections scale up/down from this base</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Font Weight</label>
            <select value={displayWeight} onChange={e => setDisplayWeight(e.target.value)} className={select}>
              <option value="100">100 — Thin</option>
              <option value="200">200 — Extra Light</option>
              <option value="300">300 — Light</option>
              <option value="400">400 — Regular</option>
              <option value="500">500 — Medium</option>
              <option value="600">600 — Semi Bold</option>
              <option value="700">700 — Bold</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Font Style</label>
            <select value={displayStyle} onChange={e => setDisplayStyle(e.target.value)} className={select}>
              <option value="italic">Italic</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Body Font */}
      <div className="bg-white border border-gray-200 p-5 space-y-4">
        <p className="text-[14px] font-semibold text-[#1a1a1a]">Body Font</p>
        <p className="text-[12px] text-gray-500 -mt-2">Used for descriptions, prices, labels, buttons, general text</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Font Family</label>
            <select value={bodyFont} onChange={e => setBodyFont(e.target.value)} className={select}>
              {BODY_FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Custom Font (overrides above)</label>
            <input value={bodyFont} onChange={e => setBodyFont(e.target.value)} className={input} placeholder="e.g. 'Inter', sans-serif" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Base Size (px)</label>
            <input type="number" value={bodySizeBase} onChange={e => setBodySizeBase(e.target.value)} className={input} min="10" max="24" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Font Weight</label>
            <select value={bodyWeight} onChange={e => setBodyWeight(e.target.value)} className={select}>
              <option value="300">300 — Light</option>
              <option value="400">400 — Regular</option>
              <option value="500">500 — Medium</option>
              <option value="600">600 — Semi Bold</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Letter Spacing (em)</label>
            <input type="number" value={bodyTracking} onChange={e => setBodyTracking(e.target.value)} className={input} step="0.01" min="0" max="0.3" />
            <p className="text-[10px] text-gray-400 mt-1">Default: 0.02em</p>
          </div>
        </div>
      </div>

      {/* Nav Font */}
      <div className="bg-white border border-gray-200 p-5 space-y-4">
        <p className="text-[14px] font-semibold text-[#1a1a1a]">Navigation Font</p>
        <p className="text-[12px] text-gray-500 -mt-2">Used for nav links, labels, badges. Leave blank to use body font.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Font Family (optional)</label>
            <input value={navFont} onChange={e => setNavFont(e.target.value)} className={input} placeholder="Leave blank to use body font" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Size (px)</label>
            <input type="number" value={navSize} onChange={e => setNavSize(e.target.value)} className={input} min="10" max="18" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-widests uppercase text-gray-500 mb-1.5">Letter Spacing (em)</label>
            <input type="number" value={navTracking} onChange={e => setNavTracking(e.target.value)} className={input} step="0.01" min="0" max="0.3" />
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-[#f8f6f1] border border-[#e8e0d0] p-4 text-[12px] text-[#6b5d4f] space-y-1">
        <p className="font-semibold text-[#1a1a1a]">How it works:</p>
        <p>Changes save to the database and apply site-wide via CSS variables. The site loads font settings on every page visit.</p>
        <p>You can use any Google Font name or system font. Custom fonts must be available in the browser.</p>
        <p className="font-semibold text-[#1a1a1a] mt-2">Available Google Fonts (pre-loaded):</p>
        <p>Playfair Display, Lora, Merriweather, Crimson Text, EB Garamond, Nunito, Raleway, Josefin Sans</p>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white text-[12px] font-semibold border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {saving
            ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save size={13} />}
          Save Font Settings
        </button>
      </div>
    </div>
  )
}
