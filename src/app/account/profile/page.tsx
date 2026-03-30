// Save as: src/app/account/profile/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { Save, Check, Eye, EyeOff } from 'lucide-react'

export default function ProfilePage() {
  const [user,    setUser]    = useState<any>(null)
  const [form,    setForm]    = useState({ name: '', email: '', phone: '' })
  const [pass,    setPass]    = useState({ current: '', newPass: '', confirm: '' })
  const [showP,   setShowP]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const [passErr, setPassErr] = useState('')
  const [passSaved, setPassSaved] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setForm({ name: d.user.name ?? '', email: d.user.email, phone: d.user.phone ?? '' }) }
    })
  }, [])

  const saveProfile = async () => {
    setSaving(true); setError('')
    const res  = await fetch('/api/account/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: form.name, email: form.email, phone: form.phone }),
    })
    const data = await res.json()
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    else { setError(data.error ?? 'Failed to save') }
    setSaving(false)
  }

  const changePassword = async () => {
    if (pass.newPass !== pass.confirm) { setPassErr('Passwords do not match'); return }
    if (pass.newPass.length < 8)       { setPassErr('Password must be at least 8 characters'); return }
    setSaving(true); setPassErr('')
    const res  = await fetch('/api/account/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ currentPassword: pass.current, newPassword: pass.newPass }),
    })
    const data = await res.json()
    if (res.ok) { setPassSaved(true); setPass({ current: '', newPass: '', confirm: '' }); setTimeout(() => setPassSaved(false), 2500) }
    else { setPassErr(data.error ?? 'Failed to change password') }
    setSaving(false)
  }

  const inp = "w-full px-3 py-2.5 border border-gray-300 text-[13px] text-[#1a1a1a] tracking-wide outline-none focus:border-[#1a1a1a] transition-colors bg-white"
  const lbl = "block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5"

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 p-5">
        <h1 className="text-[18px] font-semibold text-[#1a1a1a]">Profile</h1>
      </div>

      {/* Personal info */}
      <div className="bg-white border border-gray-200 p-5">
        <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-4 pb-3 border-b border-gray-100">Personal Information</h2>
        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[12px]">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className={lbl}>Full Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name" className={inp} />
          </div>
          <div>
            <label className={lbl}>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className={inp} />
          </div>
          <div>
            <label className={lbl}>Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000" className={inp} />
          </div>
          <button onClick={saveProfile} disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-semibold tracking-widests uppercase border-none cursor-pointer transition-all disabled:opacity-50
              ${saved ? 'bg-[#4a6741] text-white' : 'bg-[#1a1a1a] text-white hover:bg-gray-800'}`}>
            {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 p-5">
        <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-4 pb-3 border-b border-gray-100">Change Password</h2>
        {passErr && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[12px]">{passErr}</div>}
        <div className="space-y-4">
          <div>
            <label className={lbl}>Current Password</label>
            <input type="password" value={pass.current} onChange={e => setPass(p => ({ ...p, current: e.target.value }))}
              placeholder="Enter current password" className={inp} />
          </div>
          <div>
            <label className={lbl}>New Password</label>
            <div className="relative">
              <input type={showP ? 'text' : 'password'} value={pass.newPass}
                onChange={e => setPass(p => ({ ...p, newPass: e.target.value }))}
                placeholder="Min. 8 characters" className={`${inp} pr-10`} />
              <button onClick={() => setShowP(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                {showP ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>Confirm New Password</label>
            <input type="password" value={pass.confirm} onChange={e => setPass(p => ({ ...p, confirm: e.target.value }))}
              placeholder="Repeat new password" className={inp} />
          </div>
          <button onClick={changePassword} disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-semibold tracking-widests uppercase border-none cursor-pointer transition-all disabled:opacity-50
              ${passSaved ? 'bg-[#4a6741] text-white' : 'bg-[#1a1a1a] text-white hover:bg-gray-800'}`}>
            {passSaved ? <><Check size={13} /> Password Updated!</> : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 p-5">
        <h2 className="text-[13px] font-semibold text-red-600 mb-3">Danger Zone</h2>
        <p className="text-[12px] text-gray-500 mb-3">Permanently delete your account and all associated data.</p>
        <button className="px-4 py-2 border border-red-200 text-red-600 text-[12px] rounded-lg cursor-pointer hover:bg-red-50 bg-white transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  )
}