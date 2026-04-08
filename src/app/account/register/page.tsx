'use client'
// Save as: src/app/account/register/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', emailOptIn: true })
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const submit = async () => {
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true); setError('')
    const res  = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/account')
      router.refresh()
    } else {
      setError(data.error ?? 'Registration failed')
      setLoading(false)
    }
  }

  const inp = "w-full px-4 py-3 border border-gray-300 text-[13px] text-[#1a1a1a] tracking-wide outline-none focus:border-[#1a1a1a] transition-colors bg-white placeholder:text-gray-300"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl italic font-light text-[#1a1a1a] mb-2">
              Create Account
            </h1>
            <p className="text-[13px] text-gray-500 tracking-wide">
              Join Solomon & Sage for a better experience
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[12px] tracking-wide">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">Full Name</label>
              <div className="relative">
                <User size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name" className={`${inp} pl-10`} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com" className={`${inp} pl-10`} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 8 characters" className={`${inp} pl-10 pr-10`} />
                <button onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="password" value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="Repeat password" className={`${inp} pl-10`} />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input type="checkbox" checked={form.emailOptIn}
                onChange={e => setForm(p => ({ ...p, emailOptIn: e.target.checked }))}
                className="w-3.5 h-3.5 accent-[#1a1a1a] mt-0.5 shrink-0" />
              <span className="text-[12px] text-gray-500 tracking-wide leading-relaxed">
                Sign me up for emails about new arrivals, sales, and exclusive offers. Unsubscribe anytime.
              </span>
            </label>

            <button onClick={submit} disabled={loading}
              className="w-full h-12 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-widest uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-[11px] text-gray-400 tracking-wide text-center leading-relaxed">
              By creating an account you agree to our{' '}
              <Link href="/policies/terms" className="text-[#1a1a1a] underline">Terms of Service</Link>{' '}and{' '}
              <Link href="/policies/privacy" className="text-[#1a1a1a] underline">Privacy Policy</Link>.
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-gray-500 tracking-wide">
              Already have an account?{' '}
              <Link href="/account/login" className="text-[#1a1a1a] font-medium underline hover:no-underline">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}