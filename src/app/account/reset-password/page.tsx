'use client'
// Save as: src/app/account/reset-password/page.tsx (NEW FILE)
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Lock, Eye, EyeOff, Check } from 'lucide-react'

function ResetForm() {
  const router  = useRouter()
  const params  = useSearchParams()
  const token   = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [error,    setError]    = useState('')

  const submit = async () => {
    if (!password || !confirm) { setError('Please fill in all fields'); return }
    if (password !== confirm)  { setError('Passwords do not match'); return }
    if (password.length < 8)   { setError('Password must be at least 8 characters'); return }
    if (!token)                { setError('Invalid reset link. Please request a new one.'); return }

    setLoading(true); setError('')
    const res  = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ token, password }),
    })
    const data = await res.json()
    if (res.ok) {
      setDone(true)
      setTimeout(() => router.push('/account'), 2000)
    } else {
      setError(data.error ?? 'Failed to reset password')
    }
    setLoading(false)
  }

  const inp = "w-full pl-10 pr-10 py-3 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a] transition-colors"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#4a6741] flex items-center justify-center mx-auto mb-4">
                <Check size={24} strokeWidth={2.5} className="text-white" />
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl italic font-light text-[#1a1a1a] mb-2">
                Password Updated
              </h1>
              <p className="text-[13px] text-gray-500">Redirecting to your account...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-[family-name:var(--font-display)] text-3xl italic font-light text-[#1a1a1a] mb-2">
                  Reset Password
                </h1>
                <p className="text-[13px] text-gray-500 tracking-wide">Choose a new password for your account</p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[12px]">{error}</div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 tracking-widests uppercase mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters" className={inp} />
                    <button onClick={() => setShow(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 tracking-widests uppercase mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submit()}
                      placeholder="Repeat new password" className={inp} />
                  </div>
                </div>
                <button onClick={submit} disabled={loading}
                  className="w-full h-12 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-widests uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>
}