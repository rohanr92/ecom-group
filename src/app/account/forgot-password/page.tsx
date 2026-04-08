'use client'
// Save as: src/app/account/forgot-password/page.tsx (NEW FILE)
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, ArrowLeft, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState('')

  const submit = async () => {
    if (!email) { setError('Please enter your email address'); return }
    setLoading(true); setError('')
    const res  = await fetch('/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ email }),
    })
    if (res.ok) setSent(true)
    else { const d = await res.json(); setError(d.error ?? 'Something went wrong') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Link href="/account/login"
            className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-[#1a1a1a] no-underline mb-8 transition-colors">
            <ArrowLeft size={13} /> Back to sign in
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#4a6741] flex items-center justify-center mx-auto mb-4">
                <Check size={24} strokeWidth={2.5} className="text-white" />
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl italic font-light text-[#1a1a1a] mb-2">
                Check your email
              </h1>
              <p className="text-[13px] text-gray-500 tracking-wide leading-relaxed">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                Check your inbox and follow the instructions.
              </p>
              <p className="text-[12px] text-gray-400 mt-4">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)}
                  className="text-[#1a1a1a] underline bg-transparent border-none cursor-pointer text-[12px]">
                  try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-[family-name:var(--font-display)] text-3xl italic font-light text-[#1a1a1a] mb-2">
                  Forgot Password?
                </h1>
                <p className="text-[13px] text-gray-500 tracking-wide">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[12px]">{error}</div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submit()}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 text-[13px] outline-none focus:border-[#1a1a1a] transition-colors" />
                  </div>
                </div>
                <button onClick={submit} disabled={loading}
                  className="w-full h-12 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-widest uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'}
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