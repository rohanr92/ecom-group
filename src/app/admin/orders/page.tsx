// Save as: src/app/admin/orders/page.tsx (REPLACE existing)
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search, X, Truck, Check, Package, RotateCcw,
  ArrowRight, ChevronDown, Filter, Mail, MapPin,
  CreditCard, Clock, AlertTriangle
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
type Tab = 'orders' | 'returns'

const ORDER_STATUSES = ['ALL','PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']
const RETURN_STATUSES = ['ALL','PENDING','APPROVED','REJECTED','COMPLETED']

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-gray-100 text-gray-600',
}

const RETURN_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

const STATUS_STEPS = ['CONFIRMED','PROCESSING','SHIPPED','DELIVERED']

// ── Main component ─────────────────────────────────────────────────
export default function OrdersPage() {
  const [tab,          setTab]          = useState<Tab>('orders')
  const [orders,       setOrders]       = useState<any[]>([])
  const [returns,      setReturns]      = useState<any[]>([])
  const [total,        setTotal]        = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [status,       setStatus]       = useState('ALL')
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const [selectedOrder,setSelectedOrder]= useState<any>(null)
  const [selectedReturn,setSelectedReturn]=useState<any>(null)
  const [updating,     setUpdating]     = useState(false)
  const [tracking,     setTracking]     = useState('')

  // ── Load orders ────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (status !== 'ALL') params.set('status', status)
    if (search)           params.set('search', search)
    const res  = await fetch(`/api/admin/orders?${params}`)
    const d    = await res.json()
    setOrders(d.orders ?? [])
    setTotal(d.total   ?? 0)
    setLoading(false)
  }, [status, search, page])

  // ── Load returns ───────────────────────────────────────────────
  const loadReturns = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status !== 'ALL') params.set('status', status)
    if (search)           params.set('search', search)
    const res  = await fetch(`/api/admin/returns?${params}`)
    const d    = await res.json()
    setReturns(d.returns ?? [])
    setLoading(false)
  }, [status, search])

  useEffect(() => {
    setSelectedOrder(null)
    setSelectedReturn(null)
    if (tab === 'orders')  loadOrders()
    if (tab === 'returns') loadReturns()
  }, [tab, loadOrders, loadReturns])

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setUpdating(true)
    const body: any = { id, status: newStatus }
    if (newStatus === 'SHIPPED' && tracking) body.trackingNumber = tracking
    await fetch('/api/admin/orders', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await loadOrders()
    setSelectedOrder((p: any) => p ? { ...p, status: newStatus, trackingNumber: tracking || p.trackingNumber } : null)
    setUpdating(false)
  }

  const updateReturnStatus = async (id: string, newStatus: string, refundAmount?: number) => {
    setUpdating(true)
    await fetch('/api/admin/returns', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, refundAmount }),
    })
    await loadReturns()
    setSelectedReturn((p: any) => p ? { ...p, status: newStatus } : null)
    setUpdating(false)
  }

  // ── Helpers ────────────────────────────────────────────────────
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })

  // ══════════════════════════════════════════════════════════════
  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-full">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">
            {tab === 'orders' ? 'Orders' : 'Return Requests'}
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {tab === 'orders' ? `${total} total orders` : `${returns.length} return requests`}
          </p>
        </div>
      </div>

      {/* ── Main tabs ── */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex border-b border-gray-100">
          <button onClick={() => { setTab('orders'); setStatus('ALL'); setSearch('') }}
            className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-none cursor-pointer border-b-2 transition-colors bg-white
              ${tab === 'orders' ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            <Package size={14} strokeWidth={1.5} /> Orders
          </button>
          <button onClick={() => { setTab('returns'); setStatus('ALL'); setSearch('') }}
            className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-none cursor-pointer border-b-2 transition-colors bg-white relative
              ${tab === 'returns' ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            <RotateCcw size={14} strokeWidth={1.5} /> Returns
            {returns.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {returns.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex border-b border-gray-50 overflow-x-auto">
          {(tab === 'orders' ? ORDER_STATUSES : RETURN_STATUSES).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-4 py-2.5 text-[12px] whitespace-nowrap border-none cursor-pointer border-b-2 transition-colors bg-white
                ${status === s ? 'border-[#1a1a1a] text-[#1a1a1a] font-semibold' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'orders' ? 'Search by order number or email...' : 'Search by order number or email...'}
              className="bg-transparent border-none outline-none text-[13px] text-gray-700 placeholder:text-gray-400 flex-1" />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ ORDERS TAB ══════════════════════════════════════════ */}
      {tab === 'orders' && (
        <div className={`grid gap-4 ${selectedOrder ? 'grid-cols-1 xl:grid-cols-5' : 'grid-cols-1'}`}>

          {/* Orders table */}
          <div className={selectedOrder ? 'xl:col-span-2' : ''}>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-[13px] text-gray-400">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-[13px] text-gray-400">No orders found</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Order', 'Customer', 'Date', 'Total', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(o => (
                      <tr key={o.id}
                        onClick={() => { setSelectedOrder(o); setTracking(o.trackingNumber ?? '') }}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedOrder?.id === o.id ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-semibold text-[#1a1a1a]">{o.orderNumber}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{o.items?.length} items</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] text-gray-700 truncate max-w-[120px]">{o.email}</p>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-500">{fmtDate(o.createdAt)}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#1a1a1a]">${Number(o.total).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[o.status] ?? ''}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <p className="text-[12px] text-gray-500">
                  Showing {Math.min((page-1)*20+1, total)}–{Math.min(page*20, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                    className="px-3 py-1.5 text-[12px] border border-gray-300 rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-50 bg-white">
                    Previous
                  </button>
                  <button onClick={() => setPage(p => p+1)} disabled={page*20 >= total}
                    className="px-3 py-1.5 text-[12px] border border-gray-300 rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-50 bg-white">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── ORDER DETAIL PANEL ── */}
          {selectedOrder && (
            <div className="xl:col-span-3 space-y-4">

              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-[17px] font-semibold text-[#1a1a1a]">{selectedOrder.orderNumber}</h2>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[selectedOrder.status]}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500">
                      {fmtDate(selectedOrder.createdAt)} at {fmtTime(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl leading-none">
                    ×
                  </button>
                </div>

                {/* Order progress timeline */}
                {!['CANCELLED','REFUNDED'].includes(selectedOrder.status) && (
                  <div className="flex items-center mb-5">
                    {STATUS_STEPS.map((step, i) => {
                      const idx  = STATUS_STEPS.indexOf(selectedOrder.status)
                      const done = idx >= i
                      const curr = idx === i
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                              ${done ? 'bg-[#4a6741] text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {done ? <Check size={12} strokeWidth={2.5} /> : i+1}
                            </div>
                            <span className={`text-[9px] tracking-wide whitespace-nowrap ${curr ? 'font-semibold text-[#1a1a1a]' : done ? 'text-[#4a6741]' : 'text-gray-400'}`}>
                              {step.charAt(0)+step.slice(1).toLowerCase()}
                            </span>
                          </div>
                          {i < STATUS_STEPS.length-1 && (
                            <div className={`flex-1 h-px mx-1.5 mb-4 ${STATUS_STEPS.indexOf(selectedOrder.status) > i ? 'bg-[#4a6741]' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Update status */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s => (
                      <button key={s}
                        onClick={() => updateOrderStatus(selectedOrder.id, s)}
                        disabled={updating || selectedOrder.status === s}
                        className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border cursor-pointer transition-colors disabled:opacity-40
                          ${selectedOrder.status === s
                            ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-[#1a1a1a] hover:text-[#1a1a1a]'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracking */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className="text-[11px] font-semibold text-gray-500 tracking-widests uppercase mb-2">Tracking Number</p>
                  <div className="flex gap-2">
                    <input value={tracking} onChange={e => setTracking(e.target.value)}
                      placeholder="Enter tracking number..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-[12px] font-mono outline-none focus:border-[#1a1a1a]" />
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'SHIPPED')}
                      disabled={updating || !tracking}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#4a6741] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-green-800 disabled:opacity-40 transition-colors">
                      <Truck size={13} /> Mark Shipped
                    </button>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Current: <span className="font-mono text-[#1a1a1a]">{selectedOrder.trackingNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Customer info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <Mail size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Customer
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-400 tracking-wide mb-1">Email</p>
                    <p className="text-[13px] text-[#1a1a1a] font-medium">{selectedOrder.email}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Paid via <span className="capitalize font-medium text-gray-600">{selectedOrder.paymentMethod?.toLowerCase()}</span>
                    </p>
                  </div>
                  {selectedOrder.addresses?.[0] && (
                    <div>
                      <p className="text-[11px] text-gray-400 tracking-wide mb-1 flex items-center gap-1">
                        <MapPin size={11} /> Shipping Address
                      </p>
                      <div className="text-[12px] text-gray-600 leading-relaxed">
                        <p className="font-medium text-[#1a1a1a]">
                          {selectedOrder.addresses[0].firstName} {selectedOrder.addresses[0].lastName}
                        </p>
                        <p>{selectedOrder.addresses[0].street}</p>
                        <p>{selectedOrder.addresses[0].city}, {selectedOrder.addresses[0].state} {selectedOrder.addresses[0].zip}</p>
                        <p>{selectedOrder.addresses[0].country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <Package size={14} strokeWidth={1.5} className="text-[#c8a882]" />
                  Items ({selectedOrder.items?.length})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-12 h-12 bg-[#f5f2ed] overflow-hidden rounded-lg shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-400">{item.size} · {item.color} × {item.quantity}</p>
                      </div>
                      <p className="text-[13px] font-semibold text-[#1a1a1a] shrink-0">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order totals */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <CreditCard size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Payment Summary
                </h3>
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${Number(selectedOrder.subtotal).toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{Number(selectedOrder.shippingCost) === 0 ? 'Free' : `$${Number(selectedOrder.shippingCost).toFixed(2)}`}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Tax</span><span>${Number(selectedOrder.tax).toFixed(2)}</span></div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-[#4a6741]"><span>Discount{selectedOrder.promoCode ? ` (${selectedOrder.promoCode})` : ''}</span><span>-${Number(selectedOrder.discount).toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-semibold text-[#1a1a1a] border-t border-gray-100 pt-2 text-[14px]">
                    <span>Total</span><span>${Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
                {selectedOrder.stripePaymentId && (
                  <p className="text-[11px] text-gray-400 mt-3 font-mono">
                    Stripe ID: {selectedOrder.stripePaymentId}
                  </p>
                )}
                {selectedOrder.paypalOrderId && (
                  <p className="text-[11px] text-gray-400 mt-1 font-mono">
                    PayPal ID: {selectedOrder.paypalOrderId}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ RETURNS TAB ═════════════════════════════════════════ */}
      {tab === 'returns' && (
        <div className={`grid gap-4 ${selectedReturn ? 'grid-cols-1 xl:grid-cols-5' : 'grid-cols-1'}`}>

          {/* Returns list */}
          <div className={selectedReturn ? 'xl:col-span-2' : ''}>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-[13px] text-gray-400">Loading returns...</div>
              ) : returns.length === 0 ? (
                <div className="p-12 text-center">
                  <RotateCcw size={32} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-[13px] text-gray-400">No return requests found</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Order', 'Customer', 'Date', 'Reason', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {returns.map(r => (
                      <tr key={r.id}
                        onClick={() => setSelectedReturn(r)}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedReturn?.id === r.id ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-semibold text-[#1a1a1a]">{r.orderNumber}</p>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600 truncate max-w-[120px]">{r.email}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-500">{fmtDate(r.createdAt)}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-600 truncate max-w-[120px]">{r.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${RETURN_STATUS_COLORS[r.status] ?? ''}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── RETURN DETAIL PANEL ── */}
          {selectedReturn && (
            <div className="xl:col-span-3 space-y-4">

              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-[16px] font-semibold text-[#1a1a1a]">
                        Return — {selectedReturn.orderNumber}
                      </h2>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${RETURN_STATUS_COLORS[selectedReturn.status]}`}>
                        {selectedReturn.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500">
                      Submitted {fmtDate(selectedReturn.createdAt)} at {fmtTime(selectedReturn.createdAt)}
                    </p>
                  </div>
                  <button onClick={() => setSelectedReturn(null)}
                    className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl leading-none">
                    ×
                  </button>
                </div>

                {/* Action buttons */}
                {selectedReturn.status === 'PENDING' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => updateReturnStatus(selectedReturn.id, 'APPROVED')}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#4a6741] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-green-800 disabled:opacity-50 transition-colors">
                      <Check size={13} /> Approve Return
                    </button>
                    <button
                      onClick={() => updateReturnStatus(selectedReturn.id, 'REJECTED')}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-red-700 disabled:opacity-50 transition-colors">
                      <X size={13} /> Reject Return
                    </button>
                  </div>
                )}
                {selectedReturn.status === 'APPROVED' && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-500 tracking-widests uppercase mb-2">Mark as Completed (Refund Processed)</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">$</span>
                        <input type="number"
                          id="refund-amount"
                          defaultValue={Number(selectedReturn.order?.total).toFixed(2)}
                          placeholder="Refund amount"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-[12px] outline-none focus:border-[#1a1a1a]" />
                      </div>
                      <button
                        onClick={() => {
                          const amt = parseFloat((document.getElementById('refund-amount') as HTMLInputElement)?.value)
                          updateReturnStatus(selectedReturn.id, 'COMPLETED', amt)
                        }}
                        disabled={updating}
                        className="px-4 py-2 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50 transition-colors">
                        Complete & Refund
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer & reason */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <Mail size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] text-gray-400 mb-0.5">Email</p>
                      <p className="text-[13px] text-[#1a1a1a] font-medium">{selectedReturn.email}</p>
                    </div>
                    {selectedReturn.user && (
                      <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">Customer Name</p>
                        <p className="text-[13px] text-[#1a1a1a]">{selectedReturn.user.name}</p>
                      </div>
                    )}
                    {selectedReturn.order?.addresses?.[0] && (
                      <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">Shipping Address</p>
                        <div className="text-[12px] text-gray-600 leading-relaxed">
                          <p>{selectedReturn.order.addresses[0].firstName} {selectedReturn.order.addresses[0].lastName}</p>
                          <p>{selectedReturn.order.addresses[0].street}</p>
                          <p>{selectedReturn.order.addresses[0].city}, {selectedReturn.order.addresses[0].state} {selectedReturn.order.addresses[0].zip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] text-gray-400 mb-0.5">Reason for Return</p>
                      <p className="text-[13px] text-[#1a1a1a] font-medium">{selectedReturn.reason}</p>
                    </div>
                    {selectedReturn.details && (
                      <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">Additional Details</p>
                        <p className="text-[13px] text-gray-600 leading-relaxed">{selectedReturn.details}</p>
                      </div>
                    )}
                    {selectedReturn.refundAmount && (
                      <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">Refund Amount</p>
                        <p className="text-[14px] font-semibold text-[#4a6741]">${Number(selectedReturn.refundAmount).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items being returned */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <Package size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Items Being Returned
                </h3>
                <div className="space-y-2">
                  {(Array.isArray(selectedReturn.items) ? selectedReturn.items : []).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-10 h-10 bg-[#f5f2ed] rounded-lg shrink-0 flex items-center justify-center">
                        <Package size={16} strokeWidth={1} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#1a1a1a]">{item.name}</p>
                        <p className="text-[11px] text-gray-400">{item.size} · {item.color} × {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Original order summary */}
              {selectedReturn.order && (
                <div className="bg-[#f8f6f1] rounded-xl border border-gray-200 p-5">
                  <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3">Original Order Summary</h3>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between text-gray-500"><span>Order Total</span><span className="font-semibold text-[#1a1a1a]">${Number(selectedReturn.order.total).toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Payment Method</span><span className="capitalize">{selectedReturn.order.paymentMethod?.toLowerCase()}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Order Status</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[selectedReturn.order.status]}`}>
                        {selectedReturn.order.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}