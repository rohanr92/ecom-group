// Save as: src/app/admin/AdminClientLayout.tsx (REPLACE existing)
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
   LayoutDashboard, ShoppingBag, Package, Users,
  BarChart2, Tag, Layers, LayoutGrid, Settings, Menu, X,
  ChevronRight, Bell, Search, Store, LogOut,
  ShieldCheck, UserCog,
  FileText, MessageSquare,
  FolderOpen
} from 'lucide-react'

const nav = [
  { href: '/admin',            label: 'Home',        icon: LayoutDashboard },
  { href: '/admin/orders',     label: 'Orders',      icon: ShoppingBag },
  { href: '/admin/products',   label: 'Products',    icon: Package },
  { href: '/admin/customers',  label: 'Customers',   icon: Users },
  { href: '/admin/analytics',  label: 'Analytics',   icon: BarChart2 },
  { href: '/admin/discounts',  label: 'Discounts',   icon: Tag },
 { href: '/admin/inventory',   label: 'Inventory',    icon: Layers },
  { href: '/admin/collections', label: 'Collections',  icon: LayoutGrid },
  { href: '/admin/media', icon: FolderOpen, label: 'Media' },
  { href: '/admin/users',       label: 'Admin Users',  icon: UserCog },
  { href: '/admin/settings',   label: 'Settings',    icon: Settings },
   { href: '/admin/cms',     label: 'Content', icon: FileText },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
]

export default function AdminClientLayout({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode
  isAuthenticated: boolean
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open,    setOpen]    = useState(false)
  const [role,    setRole]    = useState<any>(null)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      router.replace('/admin/login')
    }
  }, [isAuthenticated, isLoginPage, router])

  // Load role info from cookie via API
  useEffect(() => {
    if (isAuthenticated && !isLoginPage) {
      fetch('/api/admin/auth/check')
        .then(r => r.json())
        .then(d => { if (d.admin) setRole(d.role) })
        .catch(() => {})
    }
  }, [isAuthenticated, isLoginPage])

  if (isLoginPage) return <>{children}</>

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f6f6f7] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400 text-[13px]">
          <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Verifying access...
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  // Check if user has permission for a nav item
  const hasAccess = (href: string) => {
    if (!role || role.role === 'owner') return true
    const perms = role.permissions ?? []
    if (perms.includes('all')) return true
    const map: Record<string, string> = {
      '/admin/orders':    'orders.view',
      '/admin/products':  'products.view',
      '/admin/customers': 'customers.view',
      '/admin/analytics': 'analytics.view',
      '/admin/discounts': 'discounts.view',
      '/admin/inventory': 'inventory.view',
      '/admin/users':     'users.manage',
      '/admin/settings':     'settings.view',
      '/admin/collections':  'products.view',
      
    }
    return !map[href] || perms.includes(map[href])
  }

  return (
    <div className="min-h-screen flex bg-[#f6f6f7]">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[240px] bg-[#1a1a1a] flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                <ShieldCheck size={16} strokeWidth={1.5} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold tracking-wide text-[13px]">Solomon Lawrence</p>
                <p className="text-white/40 text-[10px] tracking-wide">Admin Dashboard</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="lg:hidden text-white/40 hover:text-white bg-transparent border-none cursor-pointer">
              <X size={16} />
            </button>
          </div>

          {/* Role badge */}
          {role && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-white/40">Signed in as</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                ${role.role === 'owner'   ? 'bg-white text-[#1a1a1a]' :
                  role.role === 'manager' ? 'bg-purple-500 text-white' :
                  role.role === 'editor'  ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'}`}>
                {role.role}
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => {
            const active  = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            const allowed = hasAccess(item.href)
            if (!allowed) return null
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] tracking-wide no-underline transition-colors group
                  ${active
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={16} strokeWidth={1.5}
                  className={active ? 'text-white' : 'text-white/50 group-hover:text-white'} />
                {item.label}
                {active && <ChevronRight size={12} className="ml-auto text-white/30" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-1">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/5 no-underline transition-colors">
            <Store size={16} strokeWidth={1.5} /> View Store
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-red-400 hover:text-red-300 hover:bg-white/5 bg-transparent border-none cursor-pointer transition-colors text-left">
            <LogOut size={16} strokeWidth={1.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 sticky top-0 z-30">
          <button onClick={() => setOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer">
            <Menu size={20} />
          </button>
          <div className="flex-1 max-w-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <Search size={14} strokeWidth={1.5} className="text-gray-400" />
              <input placeholder="Search..."
                className="bg-transparent border-none outline-none text-[13px] text-gray-600 placeholder:text-gray-400 w-full" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer">
              <Bell size={18} strokeWidth={1.5} />
            </button>
            {role && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[10px] font-bold">
                  {role.name?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <span className="text-[12px] text-gray-600 font-medium">{role.name ?? 'Admin'}</span>
              </div>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-red-200 hover:bg-red-50 transition-colors">
              <LogOut size={13} strokeWidth={1.5} /> Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}