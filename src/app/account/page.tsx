// Save as: src/app/account/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, RotateCcw, Heart, MapPin, ArrowRight, Package, Clock } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
}

export default function AccountDashboard() {
  const [user,    setUser]    = useState<any>(null)
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/account/orders').then(r => r.json()),
    ]).then(([userData, ordersData]) => {
      setUser(userData.user)
      setOrders(ordersData.orders?.slice(0, 3) ?? [])
      setLoading(false)
    })
  }, [])

  const now  = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-4">
      {/* Welcome */}
      <div className="bg-white border border-gray-200 p-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl italic font-light text-[#1a1a1a] mb-1">
          {greeting}, {user?.name?.split(' ')[0] ?? 'there'}.
        </h1>
        <p className="text-[13px] text-gray-500 tracking-wide">
          Welcome to your Solomon Lawrence account.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/account/orders',    icon: ShoppingBag, label: 'Orders',   count: orders.length },
          { href: '/account/returns',   icon: RotateCcw,   label: 'Returns',  count: null },
          { href: '/account/wishlist',  icon: Heart,       label: 'Wishlist', count: null },
          { href: '/account/addresses', icon: MapPin,       label: 'Addresses',count: null },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-white border border-gray-200 p-4 flex flex-col items-center gap-2 no-underline hover:border-[#1a1a1a] transition-colors group text-center">
            <item.icon size={20} strokeWidth={1.5} className="text-[#c8a882] group-hover:text-[#1a1a1a] transition-colors" />
            <span className="text-[12px] font-medium text-[#1a1a1a] tracking-wide">{item.label}</span>
            {item.count !== null && (
              <span className="text-[11px] text-gray-400">{item.count} total</span>
            )}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Recent Orders</h2>
          <Link href="/account/orders"
            className="text-[12px] text-[#1a1a1a] flex items-center gap-1 no-underline hover:gap-2 transition-all">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[13px] text-gray-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={32} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
            <p className="text-[13px] text-gray-400 mb-4">No orders yet</p>
            <Link href="/collections/all"
              className="inline-flex items-center px-6 py-2.5 bg-[#1a1a1a] text-white text-[11px] tracking-widest uppercase no-underline hover:bg-gray-800 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(o => (
              <Link key={o.id} href={`/account/orders/${o.id}`}
                className="flex items-center gap-4 px-5 py-4 no-underline hover:bg-gray-50 transition-colors group">
                {/* First item image */}
                <div className="w-12 h-12 bg-[#f5f2ed] overflow-hidden shrink-0">
                  {o.items?.[0]?.image
                    ? <img src={o.items[0].image} alt="" className="w-full h-full object-cover" />
                    : <Package size={20} strokeWidth={1} className="text-gray-300 m-auto mt-2" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1a1a1a]">{o.orderNumber}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {o.items?.length} item{o.items?.length !== 1 ? 's' : ''} ·{' '}
                    {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] ?? ''}`}>
                    {o.status}
                  </span>
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">${Number(o.total).toFixed(2)}</span>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Account details card */}
      <div className="bg-white border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Account Details</h2>
          <Link href="/account/profile" className="text-[12px] text-[#1a1a1a] underline hover:no-underline">Edit</Link>
        </div>
        <div className="space-y-1 text-[13px] text-gray-600">
          <p className="font-medium text-[#1a1a1a]">{user?.name}</p>
          <p>{user?.email}</p>
          {user?.phone && <p>{user.phone}</p>}
        </div>
      </div>
    </div>
  )
}