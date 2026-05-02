'use client'
// Save as: src/app/admin/settings/page.tsx
import { useState, useEffect } from 'react'
import { Save, Store, DollarSign, Truck, Mail, Shield, Code, Tag } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName:       'Solomon & Sage',
    storeEmail:      'support@solomonlawrencegroup.com',
    currency:        'USD',
    taxRate:         8,
    freeShippingMin: 150,
    standardShipping:12,
    expressShipping: 22,
    overnightShipping:38,
    timezone:        'America/New_York',
  })
  const [saved, setSaved] = useState(false)

  const [tags, setTags] = useState({
  gtmId: '',
  ga4Id: '',
  metaPixelId: '',
  tiktokPixelId: '',
  snapPixelId: '',
  customHeadScripts: '',
  customBodyScripts: '',
})
const [tagsSaved, setTagsSaved] = useState(false)
const [tagsLoading, setTagsLoading] = useState(true)

useEffect(() => {
  fetch('/api/cms/settings')
    .then(r => r.json())
    .then(d => {
      const t = d.settings?.tracking_tags
      if (t) setTags(prev => ({ ...prev, ...t }))
    })
    .catch(() => {})
    .finally(() => setTagsLoading(false))
}, [])

const saveTags = async () => {
  try {
    const res = await fetch('/api/cms/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'tracking_tags', value: tags }),
    })
    if (res.ok) {
      setTagsSaved(true)
      setTimeout(() => setTagsSaved(false), 2000)
    }
  } catch {}
}

  const save = async () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Section = ({ icon: Icon, title, children }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Icon size={16} strokeWidth={1.5} className="text-[#c8a882]" />
        <h2 className="text-[14px] font-semibold text-[#1a1a1a]">{title}</h2>
      </div>
      {children}
    </div>
  )

  const Field = ({ label, value, onChange, type = 'text', suffix }: any) => (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">{label}</label>
      <div className="flex items-center">
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a]" />
        {suffix && <span className="ml-2 text-[12px] text-gray-500">{suffix}</span>}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Settings</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Manage your store preferences</p>
        </div>
        <button onClick={save}
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium rounded-lg border-none cursor-pointer transition-all
            ${saved ? 'bg-[#4a6741] text-white' : 'bg-[#1a1a1a] text-white hover:bg-gray-800'}`}>
          <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <Section icon={Store} title="Store Details">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Store Name" value={settings.storeName}
            onChange={(v: string) => setSettings(p => ({ ...p, storeName: v }))} />
          <Field label="Store Email" value={settings.storeEmail} type="email"
            onChange={(v: string) => setSettings(p => ({ ...p, storeEmail: v }))} />
        </div>
      </Section>

      <Section icon={DollarSign} title="Currency & Tax">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">Currency</label>
            <select value={settings.currency}
              onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none bg-white">
              {['USD','EUR','GBP','CAD','AUD','JPY'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Tax Rate" value={settings.taxRate} type="number" suffix="%"
            onChange={(v: string) => setSettings(p => ({ ...p, taxRate: parseFloat(v) }))} />
        </div>
      </Section>

      <Section icon={Truck} title="Shipping Rates">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Free Shipping Minimum" value={settings.freeShippingMin} type="number" suffix="USD"
            onChange={(v: string) => setSettings(p => ({ ...p, freeShippingMin: parseFloat(v) }))} />
          <Field label="Standard Shipping" value={settings.standardShipping} type="number" suffix="USD"
            onChange={(v: string) => setSettings(p => ({ ...p, standardShipping: parseFloat(v) }))} />
          <Field label="Express Shipping" value={settings.expressShipping} type="number" suffix="USD"
            onChange={(v: string) => setSettings(p => ({ ...p, expressShipping: parseFloat(v) }))} />
          <Field label="Overnight Shipping" value={settings.overnightShipping} type="number" suffix="USD"
            onChange={(v: string) => setSettings(p => ({ ...p, overnightShipping: parseFloat(v) }))} />
        </div>
      </Section>

      <Section icon={Mail} title="Notifications">
        <div className="space-y-3">
          {[
            { label: 'New order received', checked: true },
            { label: 'Order shipped',      checked: true },
            { label: 'Low stock alert',    checked: true },
            { label: 'New customer',       checked: false },
          ].map(item => (
            <label key={item.label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4 accent-[#1a1a1a]" />
              <span className="text-[13px] text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section icon={Shield} title="Security">
        <div className="space-y-3 text-[13px] text-gray-600">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>Admin password</span>
            <button className="text-[#1a1a1a] font-medium hover:underline bg-transparent border-none cursor-pointer text-[12px]">Change password</button>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Two-factor authentication</span>
            <span className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Coming soon</span>
          </div>
        </div>
      </Section>



      <Section icon={Tag} title="Tracking & Analytics Tags">
  <p className="text-[12px] text-gray-400 mb-4 leading-relaxed">
    Add your tracking IDs here. Tags are injected server-side for best SEO and performance.
  </p>

  {tagsLoading ? (
    <div className="animate-pulse space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
    </div>
  ) : (
    <div className="space-y-4">
      {/* GTM */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
          Google Tag Manager ID
        </label>
        <input
          type="text"
          value={tags.gtmId}
          onChange={e => setTags(p => ({ ...p, gtmId: e.target.value }))}
          placeholder="GTM-XXXXXXX"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a] font-mono"
        />
        <p className="text-[11px] text-gray-400 mt-1">Recommended — manages all other tags including GA4, Meta Pixel etc.</p>
      </div>

      {/* GA4 */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
          Google Analytics 4 (GA4) ID
        </label>
        <input
          type="text"
          value={tags.ga4Id}
          onChange={e => setTags(p => ({ ...p, ga4Id: e.target.value }))}
          placeholder="G-XXXXXXXXXX"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a] font-mono"
        />
        <p className="text-[11px] text-gray-400 mt-1">Only needed if not using GTM. If using GTM, add GA4 inside GTM instead.</p>
      </div>

      {/* Meta Pixel */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
          Meta (Facebook) Pixel ID
        </label>
        <input
          type="text"
          value={tags.metaPixelId}
          onChange={e => setTags(p => ({ ...p, metaPixelId: e.target.value }))}
          placeholder="XXXXXXXXXXXXXXXX"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a] font-mono"
        />
      </div>

      {/* TikTok */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
          TikTok Pixel ID
        </label>
        <input
          type="text"
          value={tags.tiktokPixelId}
          onChange={e => setTags(p => ({ ...p, tiktokPixelId: e.target.value }))}
          placeholder="CXXXXXXXXXXXXXXXXX"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a] font-mono"
        />
      </div>

      {/* Snapchat */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
          Snapchat Pixel ID
        </label>
        <input
          type="text"
          value={tags.snapPixelId}
          onChange={e => setTags(p => ({ ...p, snapPixelId: e.target.value }))}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a] font-mono"
        />
      </div>

      {/* Custom Head Scripts */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
          Custom &lt;head&gt; Scripts
        </label>
        <textarea
          value={tags.customHeadScripts}
          onChange={e => setTags(p => ({ ...p, customHeadScripts: e.target.value }))}
          placeholder={'<!-- Paste any custom script tags here -->\n<script>...</script>'}
          rows={4}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[12px] outline-none focus:border-[#1a1a1a] font-mono resize-y"
        />
        <p className="text-[11px] text-gray-400 mt-1">Injected inside &lt;head&gt; — for verification tags, heatmaps, etc.</p>
      </div>

      {/* Custom Body Scripts */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1.5">
          Custom &lt;body&gt; Scripts
        </label>
        <textarea
          value={tags.customBodyScripts}
          onChange={e => setTags(p => ({ ...p, customBodyScripts: e.target.value }))}
          placeholder={'<!-- Paste any body scripts here -->\n<noscript>...</noscript>'}
          rows={4}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[12px] outline-none focus:border-[#1a1a1a] font-mono resize-y"
        />
        <p className="text-[11px] text-gray-400 mt-1">Injected after &lt;body&gt; opens — for GTM noscript fallback etc.</p>
      </div>

      <button
        onClick={saveTags}
        className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium rounded-lg border-none cursor-pointer transition-all
          ${tagsSaved ? 'bg-[#4a6741] text-white' : 'bg-[#1a1a1a] text-white hover:bg-gray-800'}`}>
        <Save size={14} /> {tagsSaved ? 'Saved!' : 'Save Tags'}
      </button>
    </div>
  )}
</Section>
    </div>
  )
}