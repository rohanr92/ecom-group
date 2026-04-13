'use client'
// Save as: src/app/admin/login/page.tsx (NEW FILE)
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [attempts, setAttempts] = useState(0)

  const submit = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    if (attempts >= 5) { setError('Too many failed attempts. Please try again later.'); return }

    setLoading(true)
    setError('')

    try {
      const res  = await fetch('/api/admin/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setAttempts(a => a + 1)
        setError(data.error ?? 'Invalid credentials')
        setPassword('')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={26} strokeWidth={1.5} className="text-white" />
          </div>
          <h1 className="text-[20px] font-semibold text-[#1a1a1a]">Admin Portal</h1>
          <p className="text-[13px] text-gray-500 mt-1">Solomon & Sage</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-[#1a1a1a] mb-5">Sign in to continue</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[12px] tracking-wide flex items-center gap-2">
              <Lock size={13} strokeWidth={1.5} /> {error}
            </div>
          )}

          {attempts >= 3 && attempts < 5 && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-[12px]">
              ⚠️ {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining before lockout
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="admin@solomonandsage.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-[13px] outline-none focus:border-[#1a1a1a] transition-colors bg-white"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-widests uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl text-[13px] outline-none focus:border-[#1a1a1a] transition-colors bg-white"
                  autoComplete="current-password"
                />
                <button
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={loading || attempts >= 5}
              className="w-full h-11 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-xl border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : 'Sign In'
              }
            </button>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <ShieldCheck size={12} strokeWidth={1.5} className="text-gray-400" />
          <p className="text-[11px] text-gray-400 tracking-wide">
            Protected area — unauthorized access is prohibited
          </p>
        </div>
      </div>
    </div>
  )
}