'use client'
// Save as: src/app/admin/customers/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { Search, Users, ShoppingBag, DollarSign } from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/customers?${params}`)
    const d   = await res.json()
    setCustomers(d.customers ?? [])
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0)
  const avgOrder     = customers.length > 0
    ? customers.reduce((s, c) => s + c.totalSpent / c.orders, 0) / customers.length
    : 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Customers</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">{customers.length} unique customers</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users,       color: 'bg-blue-500' },
          { label: 'Total Revenue',   value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-[#4a6741]' },
          { label: 'Avg Order Value', value: `$${avgOrder.toFixed(2)}`,     icon: ShoppingBag, color: 'bg-purple-500' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center shrink-0`}>
              <c.icon size={18} strokeWidth={1.5} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 tracking-wide">{c.label}</p>
              <p className="text-[18px] font-semibold text-[#1a1a1a]">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <Search size={14} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="bg-transparent border-none outline-none text-[13px] text-gray-600 placeholder:text-gray-400 flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[13px] text-gray-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-gray-400">No customers found</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {['Customer', 'Location', 'Orders', 'Total Spent', 'Last Order'].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f5f2ed] flex items-center justify-center text-[12px] font-semibold text-[#1a1a1a] shrink-0">
                        {c.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#1a1a1a]">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">{c.city}, {c.country}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#1a1a1a]">{c.orders}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#4a6741]">${c.totalSpent.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-500">
                    {new Date(c.lastOrder).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}