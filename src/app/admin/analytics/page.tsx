// Save as: src/app/admin/analytics/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingBag, Users, DollarSign } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#f59e0b', CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6', SHIPPED:   '#6366f1',
  DELIVERED:  '#10b981', CANCELLED: '#ef4444',
}

export default function AnalyticsPage() {
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="p-8 text-center text-[13px] text-gray-400">Loading analytics...</div>

  const s         = data?.stats
  const salesDays = data?.salesByDay ?? []
  const maxSale   = Math.max(...salesDays.map((d: any) => d.amount), 1)
  const totalSales= salesDays.reduce((s: number, d: any) => s + d.amount, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Analytics</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Last 30 days performance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Revenue',   value: `$${Number(s?.revenue?.value ?? 0).toFixed(2)}`, change: s?.revenue?.change, icon: DollarSign, color: 'text-[#4a6741]' },
          { label: 'Orders',    value: s?.orders?.value ?? 0,   change: s?.orders?.change,  icon: ShoppingBag, color: 'text-blue-600' },
          { label: 'Customers', value: s?.customers?.value ?? 0, icon: Users,       color: 'text-purple-600' },
          { label: '14-day Sales', value: `$${totalSales.toFixed(2)}`, icon: TrendingUp, color: 'text-[#1a1a1a]' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] text-gray-500 font-medium">{c.label}</p>
              <c.icon size={16} strokeWidth={1.5} className={c.color} />
            </div>
            <p className="text-2xl font-semibold text-[#1a1a1a]">{c.value}</p>
            {c.change !== undefined && (
              <p className={`text-[11px] mt-1 font-medium ${c.change >= 0 ? 'text-[#4a6741]' : 'text-red-500'}`}>
                {c.change >= 0 ? '↑' : '↓'} {Math.abs(c.change).toFixed(1)}% vs prev period
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-5">Sales — Last 14 Days</h2>
          <div className="flex items-end gap-2 h-48">
            {salesDays.map((d: any) => {
              const pct = (d.amount / maxSale) * 100
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full relative flex flex-col items-center">
                    <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 whitespace-nowrap">
                      ${d.amount.toFixed(0)}
                    </span>
                    <div className="w-full bg-[#1a1a1a] rounded-t group-hover:bg-[#4a6741] transition-colors"
                      style={{ height: `${Math.max(pct * 1.92, 2)}px` }} />
                  </div>
                  <span className="text-[9px] text-gray-400">{d.date.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order status donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {(data?.statusBreakdown ?? []).map((s: any) => {
              const total = (data?.statusBreakdown ?? []).reduce((sum: number, x: any) => sum + x.count, 0)
              const pct   = total > 0 ? (s.count / total) * 100 : 0
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-gray-600">{s.status}</span>
                    <span className="text-[12px] font-semibold text-[#1a1a1a]">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: STATUS_COLORS[s.status] ?? '#9ca3af' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-4">Top Products by Revenue</h2>
          {(data?.topProducts ?? []).length === 0 ? (
            <p className="text-[13px] text-gray-400">No sales data yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="text-right pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Units</th>
                  <th className="text-right pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.topProducts ?? []).map((p: any, i: number) => (
                  <tr key={p.name}>
                    <td className="py-2.5 text-[12px] text-gray-400">{i + 1}</td>
                    <td className="py-2.5 text-[13px] text-[#1a1a1a] font-medium">{p.name}</td>
                    <td className="py-2.5 text-[13px] text-gray-600 text-right">{p.qty}</td>
                    <td className="py-2.5 text-[13px] font-semibold text-[#4a6741] text-right">${p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-4">Summary</h2>
          <div className="space-y-3 text-[13px]">
            {[
              { label: 'Total Orders (30d)',  value: s?.orders?.value ?? 0 },
              { label: 'Total Revenue (30d)', value: `$${Number(s?.revenue?.value ?? 0).toFixed(2)}` },
              { label: 'Avg Order Value',     value: s?.orders?.value ? `$${(Number(s?.revenue?.value) / s?.orders?.value).toFixed(2)}` : '$0' },
              { label: 'Total Customers',     value: s?.customers?.value ?? 0 },
              { label: 'Active Products',     value: s?.products?.value ?? 0 },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{row.label}</span>
                <span className="font-semibold text-[#1a1a1a]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}