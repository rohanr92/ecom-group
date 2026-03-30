// Save as: src/app/admin/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, Package, AlertTriangle, ArrowRight, Clock } from 'lucide-react'

function StatCard({ label, value, change, prefix = '', icon: Icon, color }: any) {
  const up = change >= 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] text-gray-500 tracking-wide font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} strokeWidth={1.5} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-[#1a1a1a] mb-1">
        {prefix}{typeof value === 'number' && prefix === '$' ? value.toFixed(2) : value.toLocaleString()}
      </p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] font-medium ${up ? 'text-[#4a6741]' : 'text-red-500'}`}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change).toFixed(1)}% vs last 30 days
        </div>
      )}
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-gray-100 text-gray-600',
}

export default function AdminHome() {
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <div className="animate-pulse text-gray-400 text-[13px] tracking-wide">Loading dashboard...</div>
    </div>
  )

  const s = data?.stats
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">{greeting}, let's get started.</h1>
        <p className="text-[13px] text-gray-500 mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* Quick action pills */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: `${data?.recentOrders?.filter((o: any) => o.status === 'PENDING').length ?? 0} orders to fulfill`, href: '/admin/orders?status=PENDING', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: `${data?.lowStockItems?.length ?? 0} low stock alerts`, href: '/admin/inventory', color: 'bg-red-50 text-red-600 border-red-200' },
        ].map(pill => (
          <Link key={pill.href} href={pill.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[12px] font-medium no-underline hover:opacity-80 transition-opacity ${pill.color}`}>
            <AlertTriangle size={12} />
            {pill.label}
          </Link>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue"   value={s?.revenue?.value ?? 0}   change={s?.revenue?.change}  prefix="$" icon={DollarSign} color="bg-[#4a6741]" />
        <StatCard label="Total Orders"    value={s?.orders?.value ?? 0}    change={s?.orders?.change}              icon={ShoppingBag} color="bg-[#1a1a1a]" />
        <StatCard label="Customers"       value={s?.customers?.value ?? 0}                                         icon={Users}       color="bg-blue-500" />
        <StatCard label="Active Products" value={s?.products?.value ?? 0}                                          icon={Package}     color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Sales chart — simple bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Sales — Last 14 days</h2>
          </div>
          <div className="flex items-end gap-1.5 h-36">
            {(data?.salesByDay ?? []).map((d: any) => {
              const max = Math.max(...(data?.salesByDay ?? []).map((x: any) => x.amount), 1)
              const pct = (d.amount / max) * 100
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-[#1a1a1a] rounded-t-sm transition-all group-hover:bg-[#4a6741]"
                      style={{ height: `${Math.max(pct, 2)}%`, minHeight: 2, maxHeight: '144px' }}
                      title={`$${d.amount.toFixed(2)}`}
                    />
                  </div>
                  <span className="text-[8px] text-gray-400 rotate-45 origin-left whitespace-nowrap">
                    {d.date.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-4">Order Status</h2>
          <div className="space-y-2.5">
            {(data?.statusBreakdown ?? []).map((s: any) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {s.status}
                </span>
                <span className="text-[13px] font-semibold text-[#1a1a1a]">{s.count}</span>
              </div>
            ))}
            {(!data?.statusBreakdown?.length) && (
              <p className="text-[12px] text-gray-400">No orders yet</p>
            )}
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[12px] text-[#1a1a1a] flex items-center gap-1 no-underline hover:gap-2 transition-all">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-0 divide-y divide-gray-100">
            {(data?.recentOrders ?? []).slice(0, 6).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[13px] font-medium text-[#1a1a1a]">{o.orderNumber}</p>
                  <p className="text-[11px] text-gray-400">{o.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? ''}`}>
                    {o.status}
                  </span>
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">${Number(o.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
            {!data?.recentOrders?.length && (
              <p className="text-[12px] text-gray-400 py-4 text-center">No orders yet</p>
            )}
          </div>
        </div>

        {/* Top products + Low stock */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-3">Top Products</h2>
            <div className="space-y-2">
              {(data?.topProducts ?? []).map((p: any, i: number) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-400 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#1a1a1a] truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.qty} sold</p>
                  </div>
                  <span className="text-[12px] font-semibold text-[#1a1a1a] shrink-0">${p.revenue.toFixed(0)}</span>
                </div>
              ))}
              {!data?.topProducts?.length && <p className="text-[12px] text-gray-400">No data yet</p>}
            </div>
          </div>

          {/* Low stock */}
          {data?.lowStockItems?.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-red-500" />
                <h2 className="text-[13px] font-semibold text-red-700">Low Stock Alert</h2>
              </div>
              <div className="space-y-2">
                {data.lowStockItems.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] text-red-700 font-medium truncate max-w-[120px]">{v.product}</p>
                      <p className="text-[10px] text-red-400">{v.size} · {v.color}</p>
                    </div>
                    <span className="text-[12px] font-bold text-red-600">{v.inventory} left</span>
                  </div>
                ))}
              </div>
              <Link href="/admin/inventory" className="text-[11px] text-red-600 flex items-center gap-1 no-underline hover:gap-2 transition-all mt-3">
                Manage inventory <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}