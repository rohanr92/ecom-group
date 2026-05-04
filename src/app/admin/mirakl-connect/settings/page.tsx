'use client'
// Settings tab — connection test, dry-run mode info, config status

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

interface SettingsData {
  envCheck: {
    clientId: boolean
    clientSecret: boolean
    sellerId: boolean
    cronSecret: boolean
  }
  dryRun: boolean
  connection: { ok: boolean; message: string; details?: any }
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/mirakl/settings')
    const d = await res.json()
    setData(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const retest = async () => {
    setTesting(true)
    await load()
    setTesting(false)
  }

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-[13px]">
        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        Loading settings...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Mode banner */}
      <div className={`rounded-xl border p-4 ${
        data.dryRun ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start gap-3">
          {data.dryRun ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
          )}
          <div className="flex-1">
            <div className={`text-[14px] font-semibold ${data.dryRun ? 'text-amber-900' : 'text-green-900'}`}>
              {data.dryRun ? 'DRY-RUN MODE ACTIVE' : 'LIVE MODE'}
            </div>
            <p className={`mt-1 text-[13px] ${data.dryRun ? 'text-amber-800' : 'text-green-800'}`}>
              {data.dryRun
                ? 'Sync runs are simulated. No real orders are created and no inventory is pushed to Mirakl.'
                : 'Sync runs are LIVE. Real orders will be created and inventory will be pushed to Mirakl.'}
            </p>
          </div>
        </div>
      </div>

      {/* Connection */}
      <Section title="Connection">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            {data.connection.ok ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
            )}
            <div>
              <div className={`text-[13px] font-medium ${data.connection.ok ? 'text-green-700' : 'text-red-700'}`}>
                {data.connection.ok ? 'Connected' : 'Connection failed'}
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">{data.connection.message}</div>
            </div>
          </div>
          <button
            onClick={retest}
            disabled={testing}
            className="text-[12px] px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Re-test'}
          </button>
        </div>
      </Section>

      {/* Configuration */}
      <Section title="Configuration">
        <ConfigRow label="MIRAKL_CONNECT_CLIENT_ID" set={data.envCheck.clientId} />
        <ConfigRow label="MIRAKL_CONNECT_CLIENT_SECRET" set={data.envCheck.clientSecret} />
        <ConfigRow label="MIRAKL_CONNECT_SELLER_ID" set={data.envCheck.sellerId} />
        <ConfigRow label="MIRAKL_CRON_SECRET" set={data.envCheck.cronSecret} />
      </Section>

      {/* How to flip dry-run */}
      <Section title="Switch to live mode">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-[12px] text-blue-900">
            To switch from dry-run to live mode, edit your <code className="bg-blue-100 px-1 rounded">.env.local</code> on the server:
            <pre className="mt-2 bg-white border border-blue-100 rounded p-2 text-[11px] font-mono text-gray-800">{`MIRAKL_DRY_RUN=false`}</pre>
            Then rebuild and restart:
            <pre className="mt-2 bg-white border border-blue-100 rounded p-2 text-[11px] font-mono text-gray-800">{`npm run build && pm2 restart solomon-sage`}</pre>
            <p className="mt-2">⚠️ Once you go live, real orders from Mirakl will be created in your DB and inventory will be pushed. Monitor sync logs closely for the first day.</p>
          </div>
        </div>
      </Section>

      {/* Cron */}
      <Section title="Cron schedule">
        <p className="text-[13px] text-gray-700">Both syncs are designed to run every 5 minutes via cron on your VPS.</p>
        <pre className="bg-gray-50 border border-gray-200 rounded p-2 mt-2 text-[11px] font-mono text-gray-800 overflow-x-auto">
{`*/5 * * * * curl -s -H "Authorization: Bearer $MIRAKL_CRON_SECRET" https://solomonandsage.com/api/mirakl/cron/orders > /tmp/mirakl-orders.log 2>&1
*/5 * * * * curl -s -H "Authorization: Bearer $MIRAKL_CRON_SECRET" https://solomonandsage.com/api/mirakl/cron/inventory > /tmp/mirakl-inventory.log 2>&1`}
        </pre>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-[13px] font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function ConfigRow({ label, set }: { label: string; set: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <code className="text-[12px] font-mono text-gray-700">{label}</code>
      {set ? (
        <span className="inline-flex items-center gap-1 text-[11px] text-green-700">
          <CheckCircle2 className="w-3.5 h-3.5" /> Set
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] text-red-700">
          <XCircle className="w-3.5 h-3.5" /> Missing
        </span>
      )}
    </div>
  )
}