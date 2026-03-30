// Save as: src/app/account/returns/page.tsx
'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { RotateCcw, Check, ChevronDown, Package } from 'lucide-react'

const REASONS = [
  'Item does not fit',
  'Item looks different than pictured',
  'Received wrong item',
  'Item arrived damaged',
  'Changed my mind',
  'Found a better price elsewhere',
  'Duplicate order',
  'Other',
]

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

function ReturnsContent() {
  const params      = useSearchParams()
  const prefillId   = params.get('order') ?? ''
  const prefillNum  = params.get('orderNumber') ?? ''

  const [tab,        setTab]        = useState<'history' | 'new'>(prefillId ? 'new' : 'history')
  const [returns,    setReturns]    = useState<any[]>([])
  const [orders,     setOrders]     = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState('')

  // Form state
  const [selectedOrder, setSelectedOrder] = useState(prefillId)
  const [reason,        setReason]        = useState('')
  const [details,       setDetails]       = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch('/api/account/returns').then(r => r.json()),
      fetch('/api/account/orders').then(r => r.json()),
    ]).then(([retData, ordData]) => {
      setReturns(retData.returns ?? [])
      // Only show delivered/shipped orders eligible for return
      setOrders(ordData.orders?.filter((o: any) =>
        o.status === 'DELIVERED' || o.status === 'SHIPPED'
      ) ?? [])
      setLoading(false)
    })
  }, [])

  const selectedOrderData = orders.find(o => o.id === selectedOrder)

  const toggleItem = (itemId: string) => setSelectedItems(prev => {
    const next = new Set(prev)
    next.has(itemId) ? next.delete(itemId) : next.add(itemId)
    return next
  })

  const submitReturn = async () => {
    if (!selectedOrder) { setError('Please select an order'); return }
    if (!reason)        { setError('Please select a reason'); return }
    if (selectedItems.size === 0) { setError('Please select at least one item to return'); return }

    setSubmitting(true); setError('')

    const items = selectedOrderData?.items
      ?.filter((i: any) => selectedItems.has(i.id))
      ?.map((i: any) => ({ name: i.name, size: i.size, color: i.color, qty: i.quantity }))

    const res  = await fetch('/api/account/returns', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        orderId:     selectedOrder,
        orderNumber: selectedOrderData?.orderNumber,
        reason, details, items,
      }),
    })
    const data = await res.json()

    if (res.ok) {
      setSubmitted(true)
      // Refresh returns list
      fetch('/api/account/returns').then(r => r.json()).then(d => setReturns(d.returns ?? []))
    } else {
      setError(data.error ?? 'Failed to submit return')
    }
    setSubmitting(false)
  }

  const inp  = "w-full px-3 py-2.5 border border-gray-300 text-[13px] text-[#1a1a1a] tracking-wide outline-none focus:border-[#1a1a1a] transition-colors bg-white"

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 p-5">
        <h1 className="text-[18px] font-semibold text-[#1a1a1a] mb-1">Returns & Exchanges</h1>
        <p className="text-[13px] text-gray-500">Returns accepted within 30 days of delivery. Items must be unworn with tags attached.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'history', label: 'Return History' },
            { key: 'new',     label: 'Start a Return' },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key as any); setSubmitted(false) }}
              className={`flex-1 py-3 text-[13px] font-medium border-none cursor-pointer border-b-2 transition-colors bg-white
                ${tab === t.key ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Return history ── */}
        {tab === 'history' && (
          <div className="p-5">
            {loading ? (
              <p className="text-[13px] text-gray-400 text-center py-8">Loading...</p>
            ) : returns.length === 0 ? (
              <div className="text-center py-8">
                <RotateCcw size={32} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
                <p className="text-[13px] text-gray-400 mb-2">No return requests yet</p>
                <button onClick={() => setTab('new')}
                  className="text-[13px] text-[#1a1a1a] underline hover:no-underline bg-transparent border-none cursor-pointer">
                  Start a return
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {returns.map(r => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">Order {r.orderNumber}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">Reason: {r.reason}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Submitted {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status] ?? ''}`}>
                        {r.status}
                      </span>
                    </div>
                    {r.status === 'APPROVED' && (
                      <div className="mt-3 pt-3 border-t border-gray-100 text-[12px] text-[#4a6741]">
                        ✓ Your return has been approved. Please ship items back within 7 days.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── New return form ── */}
        {tab === 'new' && (
          <div className="p-5">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[#4a6741] flex items-center justify-center mx-auto mb-4">
                  <Check size={24} strokeWidth={2.5} className="text-white" />
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-xl italic font-light text-[#1a1a1a] mb-2">
                  Return Request Submitted
                </h2>
                <p className="text-[13px] text-gray-500 mb-6 max-w-sm mx-auto">
                  We've received your request and will review it within 1–2 business days. You'll receive an email confirmation shortly.
                </p>
                <button onClick={() => { setTab('history'); setSubmitted(false); setSelectedItems(new Set()); setReason(''); setDetails('') }}
                  className="text-[13px] text-[#1a1a1a] underline hover:no-underline bg-transparent border-none cursor-pointer">
                  View return history
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[12px] tracking-wide">
                    {error}
                  </div>
                )}

                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={32} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-[13px] text-gray-400">No eligible orders for return.</p>
                    <p className="text-[12px] text-gray-400 mt-1">Orders must be delivered or shipped to start a return.</p>
                  </div>
                ) : (
                  <>
                    {/* Select order */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-2">
                        Select Order
                      </label>
                      <select value={selectedOrder} onChange={e => { setSelectedOrder(e.target.value); setSelectedItems(new Set()) }}
                        className={inp}>
                        <option value="">Choose an order...</option>
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>
                            {o.orderNumber} — {new Date(o.createdAt).toLocaleDateString()} — ${Number(o.total).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select items */}
                    {selectedOrderData && (
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-2">
                          Select Items to Return
                        </label>
                        <div className="space-y-2">
                          {selectedOrderData.items?.map((item: any) => (
                            <label key={item.id}
                              className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors rounded-lg
                                ${selectedItems.has(item.id) ? 'border-[#1a1a1a] bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                              <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleItem(item.id)}
                                className="w-4 h-4 accent-[#1a1a1a] shrink-0" />
                              <div className="w-10 h-10 bg-[#f5f2ed] overflow-hidden shrink-0 rounded">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{item.name}</p>
                                <p className="text-[11px] text-gray-400">{item.size} · {item.color} × {item.quantity}</p>
                              </div>
                              <p className="text-[13px] font-semibold text-[#1a1a1a] shrink-0">${Number(item.price).toFixed(2)}</p>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reason */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 tracking-widests uppercase mb-2">
                        Reason for Return
                      </label>
                      <select value={reason} onChange={e => setReason(e.target.value)} className={inp}>
                        <option value="">Select a reason...</option>
                        {REASONS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>

                    {/* Additional details */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 tracking-widests uppercase mb-2">
                        Additional Details (optional)
                      </label>
                      <textarea value={details} onChange={e => setDetails(e.target.value)}
                        placeholder="Tell us more about the issue..."
                        rows={3}
                        className={`${inp} resize-none`} />
                    </div>

                    {/* Policy note */}
                    <div className="bg-[#f8f6f1] p-4 text-[12px] text-gray-500 tracking-wide leading-relaxed">
                      <p className="font-semibold text-[#1a1a1a] mb-1">Return Policy</p>
                      <p>Items must be returned within 30 days of delivery. Items must be unworn, unwashed, and in original condition with all tags attached. Final sale items cannot be returned.</p>
                    </div>

                    <button onClick={submitReturn} disabled={submitting}
                      className="w-full h-12 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-widests uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50">
                      {submitting ? 'Submitting...' : 'Submit Return Request'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReturnsPage() {
  return <Suspense><ReturnsContent /></Suspense>
}