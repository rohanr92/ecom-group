'use client'
// Mirakl Connect Dashboard — sync status overview + manual sync buttons

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Clock, Package, ShoppingBag, Activity } from 'lucide-react'

interface DashboardData {
  connection: { ok: boolean; message: string }
  dryRun: boolean
  inventory: {
    total: number
    synced: number
    pending: number
    failed: number
    lastSync: string | null
  }
  orders: {
    miraklOrdersTotal: number
    needsReview: number
    autoAccepted: number
    lastSync: string | null
  }
  recentSyncs: Array<{
    id: string
    syncType: string
    status: string
    startedAt: string
    itemsProcessed: number
    itemsSucceeded: number
    itemsFailed: number
    wasDryRun: boolean
  }>
}

function relativeTime(date: string | null): string {
  if (!date) return 'Never'
  const diff = Date.now() - new Date(date).getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

export default function MiraklDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncingOrders, setSyncingOrders] = useState(false)
  const [syncingInventory, setSyncingInventory] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/mirakl/dashboard')
      const d = await res.json()
      setData(d)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const triggerSync = async (type: 'orders' | 'inventory') => {
    if (type === 'orders') setSyncingOrders(true)
    else setSyncingInventory(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/mirakl/sync?type=${type}`, { method: 'POST' })
      const d = await res.json()
      if (d.ok) {
        setMessage({
          type: 'success',
          text: `${type} sync done (${d.dry_run ? 'DRY RUN' : 'LIVE'}): processed ${d.processed}, succeeded ${d.succeeded ?? d.pushed ?? 0}, failed ${d.failed}`,
        })
        load()
      } else {
        setMessage({ type: 'error', text: d.error || 'Sync failed' })
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    }

    setSyncingOrders(false)
    setSyncingInventory(false)
  }

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-[13px]">
        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${
        data.connection.ok
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        {data.connection.ok ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
        <div className="flex-1">
          <div className={`text-[14px] font-medium ${data.connection.ok ? 'text-green-900' : 'text-red-900'}`}>
            {data.connection.ok ? 'Connected to Mirakl Connect' : 'Connection failed'}
          </div>
          <div className={`text-[12px] ${data.connection.ok ? 'text-green-700' : 'text-red-700'}`}>
            {data.connection.message}
          </div>
        </div>
        {data.dryRun && (
          <div className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded text-[11px] font-semibold uppercase tracking-wide">
            Dry-run mode
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => triggerSync('orders')}
          disabled={syncingOrders}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-[13px] font-medium rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${syncingOrders ? 'animate-spin' : ''}`} />
          {syncingOrders ? 'Syncing orders...' : 'Sync Orders Now'}
        </button>
        <button
          onClick={() => triggerSync('inventory')}
          disabled={syncingInventory}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 border border-gray-300 text-gray-900 text-[13px] font-medium rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${syncingInventory ? 'animate-spin' : ''}`} />
          {syncingInventory ? 'Pushing inventory...' : 'Sync Inventory Now'}
        </button>
      </div>

      {/* Message banner */}
      {message && (
        <div className={`rounded-lg p-3 text-[13px] ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Variants synced"
          value={`${data.inventory.synced} / ${data.inventory.total}`}
          sub={data.inventory.failed > 0 ? `${data.inventory.failed} failed` : 'All clean'}
          tone={data.inventory.failed > 0 ? 'warning' : 'success'}
        />
        <StatCard
          icon={Clock}
          label="Last inventory sync"
          value={relativeTime(data.inventory.lastSync)}
          sub={data.inventory.lastSync ? new Date(data.inventory.lastSync).toLocaleString() : '—'}
          tone="default"
        />
        <StatCard
          icon={ShoppingBag}
          label="Mirakl orders"
          value={String(data.orders.miraklOrdersTotal)}
          sub={data.orders.needsReview > 0 ? `${data.orders.needsReview} need review` : 'All processed'}
          tone={data.orders.needsReview > 0 ? 'warning' : 'success'}
        />
        <StatCard
          icon={Clock}
          label="Last order sync"
          value={relativeTime(data.orders.lastSync)}
          sub={data.orders.lastSync ? new Date(data.orders.lastSync).toLocaleString() : '—'}
          tone="default"
        />
      </div>

      {/* Recent syncs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-500" />
            <h2 className="text-[14px] font-semibold text-gray-900">Recent Sync Activity</h2>
          </div>
          <a href="/admin/mirakl-connect/sync-logs" className="text-[12px] text-gray-500 hover:text-gray-900">
            View all →
          </a>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-2.5">When</th>
              <th className="px-5 py-2.5">Type</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Processed</th>
              <th className="px-5 py-2.5">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.recentSyncs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[13px] text-gray-400">
                  No sync activity yet
                </td>
              </tr>
            ) : (
              data.recentSyncs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-[13px] text-gray-700">{relativeTime(log.startedAt)}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-700 capitalize">{log.syncType}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-5 py-3 text-[13px] text-gray-700">
                    {log.itemsProcessed} ({log.itemsSucceeded}✓ {log.itemsFailed}✗)
                  </td>
                  <td className="px-5 py-3 text-[12px]">
                    {log.wasDryRun ? (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">DRY</span>
                    ) : (
                      <span className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded">LIVE</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: any
  label: string
  value: string
  sub: string
  tone: 'success' | 'warning' | 'default'
}) {
  const subColor = tone === 'success' ? 'text-green-700' : tone === 'warning' ? 'text-amber-700' : 'text-gray-500'
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      <div className={`mt-1 text-[12px] ${subColor}`}>{sub}</div>
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