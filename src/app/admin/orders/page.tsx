'use client'
// Save as: src/app/admin/orders/page.tsx (REPLACE)
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Package, RotateCcw, Check, Mail } from 'lucide-react'

type Tab = 'orders' | 'returns'

const ORDER_STATUSES  = ['ALL','PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']
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

export default function OrdersPage() {
  const router = useRouter()
  const [tab,     setTab]     = useState<Tab>('orders')
  const [orders,  setOrders]  = useState<any[]>([])
  const [returns, setReturns] = useState<any[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [status,  setStatus]  = useState('ALL')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(1)

  // return detail still uses panel since returns don't need courier
  const [selectedReturn,    setSelectedReturn]    = useState<any>(null)
  const [updating,          setUpdating]          = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page) })
    if (status !== 'ALL') p.set('status', status)
    if (search)           p.set('search', search)
    const res = await fetch(`/api/admin/orders?${p}`)
    const d   = await res.json()
    setOrders(d.orders ?? [])
    setTotal(d.total   ?? 0)
    setLoading(false)
  }, [status, search, page])

  const loadReturns = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (status !== 'ALL') p.set('status', status)
    if (search)           p.set('search', search)
    const res = await fetch(`/api/admin/returns?${p}`)
    const d   = await res.json()
    setReturns(d.returns ?? [])
    setLoading(false)
  }, [status, search])

  useEffect(() => {
    setSelectedReturn(null)
    if (tab === 'orders')  loadOrders()
    if (tab === 'returns') loadReturns()
  }, [tab, loadOrders, loadReturns])

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

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">{tab === 'orders' ? 'Orders' : 'Return Requests'}</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {tab === 'orders' ? `${total} total orders` : `${returns.length} return requests`}
          </p>
        </div>
      </div>

      {/* Tabs */}
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

        {/* Status filters */}
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
              placeholder="Search by order number or email..."
              className="bg-transparent border-none outline-none text-[13px] text-gray-700 placeholder:text-gray-400 flex-1" />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ ORDERS TAB ══ */}
      {tab === 'orders' && (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-[13px] text-gray-400">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-[13px] text-gray-400">No orders found</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Order', 'Customer', 'Date', 'Total', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(o => (
                    <tr key={o.id}
                      onClick={() => router.push(`/admin/orders/${o.id}`)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <div className="flex items-center gap-1.5 flex-wrap">
  <p className="text-[13px] font-semibold text-[#1a1a1a]">{o.orderNumber}</p>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
  {o.miraklOrderId && (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
        o.miraklStatus === 'NEEDS_REVIEW'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-purple-100 text-purple-700'
      }`}
      title={o.miraklChannel ? `From ${o.miraklChannel}` : 'Mirakl order'}
    >
      {o.miraklStatus === 'NEEDS_REVIEW' ? 'Mirakl ⚠' : 'Mirakl'}
    </span>
  )}
</div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{o.items?.length} items</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[12px] text-gray-700 truncate max-w-[160px]">{o.email}</p>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-500">{fmtDate(o.createdAt)}</td>
                      <td className="px-4 py-3 text-[13px] font-semibold text-[#1a1a1a]">${Number(o.total).toFixed(2)}</td>
                      <td className="px-4 py-3">
                       <div className="flex flex-col gap-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[o.status] ?? ''}`}>
                            {o.status === 'PENDING' ? 'Payment Pending' : o.status}
                          </span>
                          {o.status === 'PENDING' && (
                            <span className="text-[9px] text-amber-600 px-2">Payment not confirmed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-400">
                        {o.trackingNumber && <span className="font-mono text-[10px]">{o.trackingNumber}</span>}
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
      )}

      {/* ══ RETURNS TAB ══ */}
      {tab === 'returns' && (
        <div className={`grid gap-4 ${selectedReturn ? 'grid-cols-1 xl:grid-cols-5' : 'grid-cols-1'}`}>
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
                      <tr key={r.id} onClick={() => setSelectedReturn(r)}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedReturn?.id === r.id ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3"><p className="text-[13px] font-semibold text-[#1a1a1a]">{r.orderNumber}</p></td>
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

          {selectedReturn && (
            <div className="xl:col-span-3 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-[16px] font-semibold text-[#1a1a1a]">Return — {selectedReturn.orderNumber}</h2>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${RETURN_STATUS_COLORS[selectedReturn.status]}`}>
                        {selectedReturn.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500">Submitted {fmtDate(selectedReturn.createdAt)} at {fmtTime(selectedReturn.createdAt)}</p>
                  </div>
                  <button onClick={() => setSelectedReturn(null)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl leading-none">×</button>
                </div>
                {selectedReturn.status === 'PENDING' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button onClick={() => updateReturnStatus(selectedReturn.id, 'APPROVED')} disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#4a6741] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-green-800 disabled:opacity-50">
                      <Check size={13} /> Approve Return
                    </button>
                    <button onClick={() => updateReturnStatus(selectedReturn.id, 'REJECTED')} disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-red-700 disabled:opacity-50">
                      <X size={13} /> Reject Return
                    </button>
                  </div>
                )}
                {selectedReturn.status === 'APPROVED' && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-500 tracking-widests uppercase mb-2">Mark as Completed</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">$</span>
                        <input type="number" id="refund-amount" defaultValue={Number(selectedReturn.order?.total).toFixed(2)}
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-[12px] outline-none focus:border-[#1a1a1a]" />
                      </div>
                      <button onClick={() => {
                        const amt = parseFloat((document.getElementById('refund-amount') as HTMLInputElement)?.value)
                        updateReturnStatus(selectedReturn.id, 'COMPLETED', amt)
                      }} disabled={updating}
                        className="px-4 py-2 bg-[#1a1a1a] text-white text-[12px] rounded-lg border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50">
                        Complete & Refund
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <Mail size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-400">Email</p>
                    <p className="font-medium text-[#1a1a1a]">{selectedReturn.email}</p>
                    {selectedReturn.details && <><p className="text-[11px] text-gray-400 mt-2">Details</p><p className="text-gray-600">{selectedReturn.details}</p></>}
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Reason</p>
                    <p className="font-medium text-[#1a1a1a]">{selectedReturn.reason}</p>
                    {selectedReturn.refundAmount && <><p className="text-[11px] text-gray-400 mt-2">Refund Amount</p><p className="font-semibold text-[#4a6741]">${Number(selectedReturn.refundAmount).toFixed(2)}</p></>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}