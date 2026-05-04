'use client'
// Products tab — shows every variant's Mirakl sync status

import { useEffect, useState } from 'react'
import { Search, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

interface VariantRow {
  variantId: string
  productName: string
  sku: string
  upc: string | null
  size: string
  color: string
  inventory: number
  price: number
  isSynced: boolean
  lastPushedInventory: number | null
  lastPushedPrice: number | null
  lastSyncedAt: string | null
  lastError: string | null
}

interface SummaryData {
  total: number
  synced: number
  pending: number
  failed: number
}

export default function ProductsPage() {
  const [rows, setRows] = useState<VariantRow[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'synced' | 'pending' | 'failed'>('all')

  const load = async () => {
    setLoading(true)
    const url = new URL('/api/admin/mirakl/products', window.location.origin)
    if (search) url.searchParams.set('search', search)
    if (filter !== 'all') url.searchParams.set('filter', filter)
    const res = await fetch(url.toString())
    const d = await res.json()
    setRows(d.variants || [])
    setSummary(d.summary || null)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [filter])

  return (
    <div className="space-y-4">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard label="Total variants" value={summary.total} tone="default" />
          <SummaryCard label="Synced to Mirakl" value={summary.synced} tone="success" />
          <SummaryCard label="Pending sync" value={summary.pending} tone="warning" />
          <SummaryCard label="Failed" value={summary.failed} tone="error" />
        </div>
      )}

      {/* Filter buttons + search */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'synced', 'pending', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[13px] rounded-lg border transition ${
              filter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="relative flex-1 max-w-sm ml-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') load() }}
            placeholder="Search SKU, UPC, or product name..."
            className="w-full pl-9 pr-3 py-1.5 text-[13px] border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-2.5">Product</th>
                <th className="px-5 py-2.5">SKU</th>
                <th className="px-5 py-2.5">UPC</th>
                <th className="px-5 py-2.5">Size / Color</th>
                <th className="px-5 py-2.5 text-right">Inventory</th>
                <th className="px-5 py-2.5 text-right">Price</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5">Last sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-[13px] text-gray-400">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-[13px] text-gray-400">No variants match</td></tr>
              ) : (
                rows.map((v) => (
                  <tr key={v.variantId} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-[13px] text-gray-900 max-w-xs truncate">{v.productName}</td>
                    <td className="px-5 py-3 text-[12px] font-mono text-gray-700">{v.sku}</td>
                    <td className="px-5 py-3 text-[12px] font-mono text-gray-500">{v.upc || '—'}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-700">{v.size} / {v.color}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-700 text-right">{v.inventory}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-700 text-right">${Number(v.price).toFixed(2)}</td>
                    <td className="px-5 py-3"><SyncStatusBadge variant={v} /></td>
                    <td className="px-5 py-3 text-[12px] text-gray-500">
                      {v.lastSyncedAt ? new Date(v.lastSyncedAt).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination hint */}
      {!loading && rows.length === 100 && (
        <div className="text-[12px] text-gray-500 text-center">
          Showing first 100. Refine the search or filter to find more.
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'default' | 'success' | 'warning' | 'error' }) {
  const colors = {
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-amber-200 bg-amber-50/50',
    error: 'border-red-200 bg-red-50/50',
  }
  return (
    <div className={`bg-white rounded-xl border p-4 ${colors[tone]}`}>
      <div className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  )
}

function SyncStatusBadge({ variant }: { variant: VariantRow }) {
  if (variant.lastError) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded" title={variant.lastError}>
        <AlertCircle className="w-3 h-3" /> Failed
      </span>
    )
  }
  if (variant.isSynced) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
        <CheckCircle2 className="w-3 h-3" /> Synced
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
      <Clock className="w-3 h-3" /> Pending
    </span>
  )
}