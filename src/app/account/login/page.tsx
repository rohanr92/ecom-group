// Save as: src/app/account/login/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

function LoginForm() {
  const router      = useRouter()
  const params      = useSearchParams()
  const redirect    = params.get('redirect') ?? '/account'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const submit = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    const res  = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) {
      router.push(redirect)
      router.refresh()
    } else {
      setError(data.error ?? 'Login failed')
      setLoading(false)
    }
  }

  const inp = "w-full px-4 py-3 border border-gray-300 text-[13px] text-[#1a1a1a] tracking-wide outline-none focus:border-[#1a1a1a] transition-colors bg-white placeholder:text-gray-300"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl italic font-light text-[#1a1a1a] mb-2">
              Sign In
            </h1>
            <p className="text-[13px] text-gray-500 tracking-wide">
              Welcome back to Solomon Lawrence
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[12px] tracking-wide">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="you@example.com"
                  className={`${inp} pl-10`} />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase">Password</label>
                <Link href="/account/forgot-password" className="text-[11px] text-[#1a1a1a] underline hover:no-underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="Your password"
                  className={`${inp} pl-10 pr-10`} />
                <button onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button onClick={submit} disabled={loading}
              className="w-full h-12 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-widest uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-gray-500 tracking-wide">
              Don't have an account?{' '}
              <Link href="/account/register" className="text-[#1a1a1a] font-medium underline hover:no-underline">
                Create one
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative text-center"><span className="bg-white px-4 text-[11px] text-gray-400 tracking-wide">or</span></div>
          </div>

          <Link href="/account/register"
            className="flex items-center justify-center w-full h-12 border border-gray-300 text-[#1a1a1a] text-[11px] font-semibold tracking-widest uppercase no-underline hover:border-[#1a1a1a] transition-colors">
            Create Account
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}