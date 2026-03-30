// Save as: src/app/account/ClientAccountLayout.tsx (NEW FILE)
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  LayoutDashboard, ShoppingBag, RotateCcw,
  Heart, User, MapPin, LogOut, ChevronRight
} from 'lucide-react'

const nav = [
  { href: '/account',           label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/account/orders',    label: 'Order History', icon: ShoppingBag },
  { href: '/account/returns',   label: 'Returns',       icon: RotateCcw },
  { href: '/account/wishlist',  label: 'Wishlist',      icon: Heart },
  { href: '/account/profile',   label: 'Profile',       icon: User },
  { href: '/account/addresses', label: 'Address Book',  icon: MapPin },
]

const BARE_PAGES = ['/account/login', '/account/register', '/account/forgot-password']

export default function ClientAccountLayout({
  children,
  token,
}: {
  children: React.ReactNode
  token: string | null
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const [user, setUser] = useState<any>(null)

  const isBare      = BARE_PAGES.includes(pathname)
  const isProtected = !isBare

  // If no token and on a protected page → redirect instantly before render
  useEffect(() => {
    if (!token && isProtected) {
      router.replace(`/account/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [token, isProtected, pathname, router])

  // Fetch user info only when we have a token
  useEffect(() => {
    if (token && !isBare) {
      fetch('/api/auth/me').then(r => r.json()).then(d => {
        if (d.user) setUser(d.user)
      })
    }
  }, [token, isBare])

  // Bare pages (login/register) — no sidebar, just render
  if (isBare) {
    return <>{children}</>
  }

  // No token on protected page — render nothing while redirect happens
  if (!token) {
    return null
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f1]">
      <Navbar />
      <div className="max-container px-4 md:px-10 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[14px] font-semibold shrink-0">
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{user?.name ?? 'My Account'}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email ?? ''}</p>
                </div>
              </div>

              <nav className="space-y-0.5">
                {nav.map(item => {
                  const active = pathname === item.href ||
                    (item.href !== '/account' && pathname.startsWith(item.href))
                  return (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 text-[13px] tracking-wide no-underline transition-colors rounded-lg
                        ${active
                          ? 'bg-[#1a1a1a] text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a1a1a]'}`}>
                      <item.icon size={15} strokeWidth={1.5} />
                      {item.label}
                      {active && <ChevronRight size={12} className="ml-auto" />}
                    </Link>
                  )
                })}

                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors rounded-lg bg-transparent border-none cursor-pointer text-left mt-2 pt-3 border-t border-gray-100">
                  <LogOut size={15} strokeWidth={1.5} />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            {children}
          </main>

        </div>
      </div>
      <Footer />
    </div>
  )
}