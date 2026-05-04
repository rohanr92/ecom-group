'use client'

import { useEffect, useState } from 'react'
import { FileDown, AlertCircle, CheckCircle2 } from 'lucide-react'

interface MiraklOrderRow {
  id: string
  orderNumber: string
  miraklOrderId: string
  miraklChannel: string | null
  miraklStatus: string | null
  email: string
  total: string
  status: string
  packingSlipUrl: string | null
  miraklSyncedAt: string | null
  createdAt: string
  itemCount: number
}

export default function OrdersPage() {
  const [rows, setRows] = useState<MiraklOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'auto_accepted'>('all')

  const load = async () => {
    setLoading(true)
    const url = new URL('/api/admin/mirakl/orders', window.location.origin)
    if (filter !== 'all') url.searchParams.set('filter', filter)
    const res = await fetch(url.toString())
    const d = await res.json()
    setRows(d.orders || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [filter])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['all', 'needs_review', 'auto_accepted'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[13px] rounded-lg border transition ${
              filter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'needs_review' ? 'Needs review' : 'Auto-accepted'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-2.5">Order #</th>
                <th className="px-5 py-2.5">Mirakl ID</th>
                <th className="px-5 py-2.5">Channel</th>
                <th className="px-5 py-2.5">Customer</th>
                <th className="px-5 py-2.5 text-right">Items</th>
                <th className="px-5 py-2.5 text-right">Total</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5">Synced</th>
                <th className="px-5 py-2.5">Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-[13px] text-gray-400">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="text-[13px] text-gray-500">No Mirakl orders yet</div>
                    <div className="text-[12px] text-gray-400 mt-1">
                      Orders will appear here when customers buy on Mirakl Connect channels.
                    </div>
                  </td>
                </tr>
              )}
              {!loading && rows.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-[13px]">
                    <a href={`/admin/orders/${o.id}`} className="text-gray-900 hover:underline font-medium">
                      {o.orderNumber}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-[12px] font-mono text-gray-500">{o.miraklOrderId}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-700">{o.miraklChannel || '-'}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-700 max-w-xs truncate">{o.email}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-700 text-right">{o.itemCount}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-900 text-right">${Number(o.total).toFixed(2)}</td>
                  <td className="px-5 py-3"><MiraklStatusBadge status={o.miraklStatus} /></td>
                  <td className="px-5 py-3 text-[12px] text-gray-500">
                    {o.miraklSyncedAt ? new Date(o.miraklSyncedAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-5 py-3">
                    {o.packingSlipUrl ? (
                      <a href={o.packingSlipUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px] text-blue-600 hover:underline">
                        <FileDown className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    ) : (
                      <span className="text-gray-300 text-[12px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MiraklStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-gray-400 text-[12px]">-</span>
  if (status === 'NEEDS_REVIEW') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
        <AlertCircle className="w-3 h-3" /> Needs review
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
      <CheckCircle2 className="w-3 h-3" /> {status}
    </span>
  )
}
