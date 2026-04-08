'use client'
import { useState, useEffect } from 'react'
import { Mail, Download, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/newsletter')
    const d = await res.json()
    setSubscribers(d.subscribers ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const exportCSV = () => {
    const csv = ['Email,Source,Date', ...subscribers.map(s =>
      `${s.email},${s.source},${new Date(s.createdAt).toLocaleDateString()}`
    )].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Exported successfully', 'success')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Newsletter Subscribers</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{subscribers.length} active subscribers</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Subscribers', value: subscribers.length },
          { label: 'From Footer', value: subscribers.filter(s => s.source === 'footer').length },
          { label: 'This Month', value: subscribers.filter(s => new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-[#1a1a1a]">{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <Mail size={14} className="text-gray-400" />
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex-1">Email</span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-24">Source</span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-32">Date</span>
        </div>

        {loading ? (
          <div className="space-y-0">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 animate-pulse">
                <div className="h-3 bg-gray-100 rounded flex-1" />
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-[13px]">No subscribers yet</div>
        ) : (
          subscribers.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <span className="text-[13px] text-[#1a1a1a] flex-1">{s.email}</span>
              <span className="text-[11px] text-gray-400 w-24 capitalize">{s.source}</span>
              <span className="text-[11px] text-gray-400 w-32">{new Date(s.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}