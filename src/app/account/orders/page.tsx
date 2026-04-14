'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Truck, ArrowRight, Search, AlertCircle, CreditCard } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-gray-100 text-gray-600',
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [tab,     setTab]     = useState<'orders' | 'pending'>('orders')

  useEffect(() => {
    fetch('/api/account/orders')
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setLoading(false) })
  }, [])

  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const confirmedOrders = orders.filter(o => o.status !== 'PENDING')

  const filtered = (tab === 'pending' ? pendingOrders : confirmedOrders).filter(o =>
    !search || o.orderNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 p-5">
        <h1 className="text-[18px] font-semibold text-[#1a1a1a] mb-1">Order History</h1>
        <p className="text-[13px] text-gray-500">{confirmedOrders.length} orders</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button onClick={() => setTab('orders')}
          className={`px-5 py-3 text-[12px] tracking-wide border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0
            ${tab === 'orders' ? 'border-b-[#1a1a1a] text-[#1a1a1a] font-semibold' : 'border-b-transparent text-gray-400 hover:text-[#1a1a1a]'}`}>
          My Orders
        </button>
        <button onClick={() => setTab('pending')}
          className={`px-5 py-3 text-[12px] tracking-wide border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 flex items-center gap-2
            ${tab === 'pending' ? 'border-b-[#1a1a1a] text-[#1a1a1a] font-semibold' : 'border-b-transparent text-gray-400 hover:text-[#1a1a1a]'}`}>
          Pending Payments
          {pendingOrders.length > 0 && (
            <span className="bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {pendingOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending tab notice */}
      {tab === 'pending' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[12px] text-amber-700 leading-relaxed">
            These orders have not been paid yet. Payment was not completed through PayPal. You can complete payment or ignore — unpaid orders will not be processed.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-gray-200 p-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <Search size={14} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number..."
            className="bg-transparent border-none outline-none text-[13px] text-gray-600 placeholder:text-gray-400 flex-1" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-[13px] text-gray-400">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <Package size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
          <p className="text-[14px] text-gray-400 mb-4">
            {tab === 'pending' ? 'No pending payments' : 'No orders found'}
          </p>
          {tab === 'orders' && (
            <Link href="/" className="inline-flex px-6 py-2.5 bg-[#1a1a1a] text-white text-[11px] tracking-widest uppercase no-underline hover:bg-gray-800 transition-colors">
              Continue Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id} className="bg-white border border-gray-200">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-wrap gap-3">
                <div className="flex items-center gap-4 text-[12px] text-gray-500 flex-wrap gap-y-1">
                  <span><span className="text-gray-400">Order</span> <span className="font-semibold text-[#1a1a1a]">{o.orderNumber}</span></span>
                  <span>{new Date(o.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="font-semibold text-[#1a1a1a]">${Number(o.total).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] ?? ''}`}>
                    {o.status === 'PENDING' ? 'Payment Pending' : o.status}
                  </span>
                  {o.status !== 'PENDING' && (
                    <Link href={`/account/orders/${o.id}`}
                      className="text-[12px] text-[#1a1a1a] flex items-center gap-1 no-underline hover:gap-2 transition-all font-medium">
                      Details <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-4 flex gap-3 overflow-x-auto">
                {o.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 min-w-0 shrink-0">
                    <div className="w-14 h-14 bg-[#f5f2ed] overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-[#1a1a1a] truncate max-w-[120px]">{item.name}</p>
                      <p className="text-[11px] text-gray-400">{item.size} · {item.color} × {item.quantity}</p>
                      <p className="text-[12px] text-[#1a1a1a] font-medium">${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                {o.status === 'PENDING' && o.paypalOrderId && (
                  <a href={`https://www.paypal.com/checkoutnow?token=${o.paypalOrderId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#ffc439] border border-[#f0b429] text-[#003087] text-[11px] font-bold no-underline hover:brightness-105 transition-all">
                    <CreditCard size={13} />
                    Complete Payment with PayPal
                  </a>
                )}
                {o.trackingNumber && (
                  <div className="flex items-center gap-2 text-[12px] text-[#4a6741]">
                    <Truck size={13} strokeWidth={1.5} />
                    {o.courier && <span className="font-medium">{o.courier}:</span>}
                    {o.trackingUrl ? (
                      <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer"
                        className="font-mono font-medium underline hover:no-underline text-[#4a6741]">
                        {o.trackingNumber}
                      </a>
                    ) : (
                      <span className="font-mono font-medium">{o.trackingNumber}</span>
                    )}
                  </div>
                )}
                {(o.status === 'DELIVERED' || o.status === 'SHIPPED') && (
                  <Link href={`/account/returns?order=${o.id}`}
                    className="text-[12px] text-[#1a1a1a] underline hover:no-underline no-underline">
                    Return items
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}