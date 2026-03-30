// Save as: src/app/admin/settings/page.tsx
'use client'
import { useState } from 'react'
import { Save, Store, DollarSign, Truck, Mail, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName:       'Solomon Lawrence',
    storeEmail:      'orders@solomonlawrence.com',
    currency:        'USD',
    taxRate:         8,
    freeShippingMin: 150,
    standardShipping:12,
    expressShipping: 22,
    overnightShipping:38,
    timezone:        'America/New_York',
  })
  const [saved, setSaved] = useState(false)

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
    </div>
  )
}