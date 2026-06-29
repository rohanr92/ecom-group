'use client'
import { useState, useRef } from 'react'
import { Upload, X, Loader2, FileText, Image as ImageIcon } from 'lucide-react'

interface Props {
  value: string
  onChange: (url: string) => void
}

export default function SizeChartUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isPdf = value?.toLowerCase().endsWith('.pdf')

  const handleFile = async (file: File) => {
    const okType = file.type.startsWith('image/') || file.type === 'application/pdf'
    if (!okType) { setError('Only image or PDF files allowed'); return }
    try {
      setError('')
      setUploading(true)
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
      const metaRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: `size-chart-${Date.now()}.${ext}`, contentType: file.type }),
      })
      if (!metaRes.ok) throw new Error('Failed to get upload URL')
      const { signedUrl, publicUrl } = await metaRes.json()
      const up = await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      if (!up.ok) throw new Error('Upload to S3 failed')
      onChange(publicUrl)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white">
          {isPdf ? (
            <div className="w-16 h-16 bg-red-50 flex items-center justify-center rounded">
              <FileText size={24} className="text-red-500" />
            </div>
          ) : (
            <img src={value} alt="Size chart" className="w-16 h-16 object-cover rounded border border-gray-100" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#1a1a1a]">
              {isPdf ? 'PDF size chart attached' : 'Image size chart attached'}
            </p>
            <a href={value} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-blue-600 hover:underline truncate block">
              View / open
            </a>
          </div>
          <button onClick={() => onChange('')}
            className="flex items-center gap-1 text-red-500 hover:text-red-600 text-[11px] bg-transparent border border-red-200 rounded px-2 py-1 cursor-pointer">
            <X size={12} /> Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed transition-all cursor-pointer border-gray-300 bg-white hover:border-gray-400 rounded-lg ${uploading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
            {uploading ? (
              <>
                <Loader2 size={24} className="text-[#c8a882] mb-2 animate-spin" />
                <p className="text-[12px] text-[#1a1a1a]">Uploading…</p>
              </>
            ) : (
              <>
                <div className="flex gap-2 mb-2">
                  <ImageIcon size={18} className="text-[#c8a882]" />
                  <FileText size={18} className="text-[#c8a882]" />
                </div>
                <p className="text-[13px] font-medium text-[#1a1a1a] mb-1">Upload size chart</p>
                <p className="text-[11px] text-gray-400">Click to browse — image or PDF</p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 text-red-600 text-[12px] rounded">
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 bg-transparent border-none cursor-pointer"><X size={12} /></button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  )
}
