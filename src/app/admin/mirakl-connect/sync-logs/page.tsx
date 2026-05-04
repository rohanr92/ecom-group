'use client'
// Sync Logs page — full history with filtering

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Activity } from 'lucide-react'

interface SyncLog {
  id: string
  syncType: string
  status: string
  itemsProcessed: number
  itemsSucceeded: number
  itemsFailed: number
  durationMs: number | null
  errorMessage: string | null
  details: any
  wasDryRun: boolean
  startedAt: string
  completedAt: string | null
}

export default function SyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'orders' | 'inventory'>('all')

  const load = async () => {
    setLoading(true)
    const url = new URL('/api/admin/mirakl/sync-logs', window.location.origin)
    if (filter !== 'all') url.searchParams.set('type', filter)
    const res = await fetch(url.toString())
    const d = await res.json()
    setLogs(d.logs || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [filter])

  const toggle = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'orders', 'inventory'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[13px] rounded-lg border transition ${
              filter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-2.5 w-8"></th>
              <th className="px-5 py-2.5">Started</th>
              <th className="px-5 py-2.5">Type</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Processed</th>
              <th className="px-5 py-2.5">Duration</th>
              <th className="px-5 py-2.5">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-[13px] text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-[13px] text-gray-400">
                  No sync logs yet
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <>
                  <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggle(log.id)}>
                    <td className="px-5 py-3 text-gray-400">
                      {expanded.has(log.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-gray-700 whitespace-nowrap">
                      {new Date(log.startedAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-gray-700 capitalize">{log.syncType}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-5 py-3 text-[13px] text-gray-700">
                      {log.itemsProcessed} <span className="text-green-600">({log.itemsSucceeded}✓)</span>{' '}
                      {log.itemsFailed > 0 && <span className="text-red-600">({log.itemsFailed}✗)</span>}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-gray-700">
                      {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td className="px-5 py-3 text-[12px]">
                      {log.wasDryRun ? (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">DRY</span>
                      ) : (
                        <span className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded">LIVE</span>
                      )}
                    </td>
                  </tr>
                  {expanded.has(log.id) && (
                    <tr key={`${log.id}-detail`} className="bg-gray-50">
                      <td colSpan={7} className="px-5 py-4">
                        {log.errorMessage && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-[12px] text-red-800 font-mono">
                            {log.errorMessage}
                          </div>
                        )}
                        <pre className="text-[11px] text-gray-700 bg-white p-3 rounded border border-gray-200 max-h-96 overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    dry_run: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}