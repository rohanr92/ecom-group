'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Upload, Search, Copy, Trash2, Check, Image, Film,
  Grid, List, X, Download, Link, AlertCircle, CheckCircle2,
  FolderOpen, RefreshCw, Eye
} from 'lucide-react'

interface MediaFile {
  key: string
  url: string
  size: number
  lastModified: string
  type: 'image' | 'video'
  name: string
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [filtered, setFiltered] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<string[]>([])
  const [preview, setPreview] = useState<MediaFile | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/media')
      const data = await res.json()
      setFiles(data.files ?? [])
    } catch {
      showToast('Failed to load media', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  useEffect(() => {
    let result = files
    if (filter !== 'all') result = result.filter(f => f.type === filter)
    if (search) result = result.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    setFiltered(result)
  }, [files, filter, search])

  const uploadFiles = async (fileList: FileList) => {
    setUploading(true)
    setUploadProgress(0)
    const total = fileList.length
    let done = 0

    for (const file of Array.from(fileList)) {
      try {
        // Get presigned URL
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        })
        const { uploadUrl, fileUrl } = await res.json()

        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        })

        done++
        setUploadProgress(Math.round((done / total) * 100))
      } catch {
        showToast(`Failed to upload ${file.name}`, 'error')
      }
    }

    setUploading(false)
    setUploadProgress(0)
    showToast(`${done} file${done !== 1 ? 's' : ''} uploaded`, 'success')
    fetchFiles()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteSelected = async () => {
  setDeleting(true)
  try {
    await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: selected }),
    })
    showToast(`${selected.length} file${selected.length !== 1 ? 's' : ''} deleted`, 'success')
    setSelected([])
    setShowDeleteModal(false)
    fetchFiles()
  } catch {
    showToast('Failed to delete', 'error')
  } finally {
    setDeleting(false)
  }
}

  const toggleSelect = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const imageCount = files.filter(f => f.type === 'image').length
  const videoCount = files.filter(f => f.type === 'video').length
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  return (
    <div className="p-6 space-y-5">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="bg-white border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] font-semibold text-[#1a1a1a] flex items-center gap-2">
            <FolderOpen size={16} strokeWidth={1.5} className="text-[#c8a882]" />
            Media Library
          </h1>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {imageCount} images · {videoCount} videos · {formatSize(totalSize)} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchFiles}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] text-gray-600 cursor-pointer hover:border-[#1a1a1a] transition-colors bg-white">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800 transition-colors">
            <Upload size={13} /> Upload Files
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden"
            onChange={e => e.target.files && uploadFiles(e.target.files)} />
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Images', value: imageCount, icon: <Image size={14} />, color: 'text-blue-500' },
          { label: 'Videos', value: videoCount, icon: <Film size={14} />, color: 'text-purple-500' },
          { label: 'Total Size', value: formatSize(totalSize), icon: <FolderOpen size={14} />, color: 'text-[#c8a882]' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 p-4 flex items-center gap-3">
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className="text-[18px] font-semibold text-[#1a1a1a]">{s.value}</p>
              <p className="text-[11px] text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-[#1a1a1a] bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
        {uploading ? (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#1a1a1a] h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-[12px] text-gray-500">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <>
            <Upload size={20} className="text-gray-300 mx-auto mb-2" />
            <p className="text-[13px] text-gray-500">Drop images or videos here, or click to browse</p>
            <p className="text-[11px] text-gray-400 mt-1">Supports JPG, PNG, WebP, GIF, MP4, MOV, WebM</p>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 p-3 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-200 px-3 py-2">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            className="flex-1 text-[13px] outline-none border-none bg-transparent" />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"><X size={12} /></button>}
        </div>

        {/* Filter tabs */}
        <div className="flex border border-gray-200">
          {(['all', 'image', 'video'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 text-[12px] border-none cursor-pointer capitalize transition-colors
                ${filter === f ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {f === 'all' ? `All (${files.length})` : f === 'image' ? `Images (${imageCount})` : `Videos (${videoCount})`}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex border border-gray-200">
          <button onClick={() => setView('grid')}
            className={`px-3 py-2 border-none cursor-pointer transition-colors ${view === 'grid' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <Grid size={13} />
          </button>
          <button onClick={() => setView('list')}
            className={`px-3 py-2 border-none cursor-pointer transition-colors ${view === 'list' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <List size={13} />
          </button>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[12px] text-gray-500">{selected.length} selected</span>
            <button onClick={() => setSelected([])}
              className="px-3 py-2 text-[12px] border border-gray-200 cursor-pointer hover:bg-gray-50 bg-white text-gray-600">
              Deselect All
            </button>
            <button onClick={() => setShowDeleteModal(true)} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] border border-red-200 text-red-500 bg-white cursor-pointer hover:bg-red-50 disabled:opacity-50">
              <Trash2 size={12} /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Media grid/list */}
      {loading ? (
        <div className="bg-white border border-gray-200 p-16 text-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-gray-400">Loading media...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-16 text-center">
          <FolderOpen size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-[13px] text-gray-400">{search ? 'No files match your search' : 'No media files yet. Upload some files to get started.'}</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(file => (
            <div key={file.key}
              className={`relative group bg-white border-2 cursor-pointer transition-all
                ${selected.includes(file.key) ? 'border-[#1a1a1a]' : 'border-gray-200 hover:border-gray-400'}`}
              onClick={() => toggleSelect(file.key)}>
              {/* Thumbnail */}
              <div className="aspect-square overflow-hidden bg-gray-50">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-900">
                    <Film size={20} className="text-white/60" />
                    <p className="text-[9px] text-white/40 uppercase tracking-wider">Video</p>
                  </div>
                )}
              </div>

              {/* Selected overlay */}
              {selected.includes(file.key) && (
                <div className="absolute inset-0 bg-[#1a1a1a]/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); setPreview(file) }}
                  className="w-6 h-6 bg-white/95 flex items-center justify-center border-none cursor-pointer shadow-sm hover:bg-white">
                  <Eye size={11} className="text-gray-600" />
                </button>
                <button onClick={e => { e.stopPropagation(); copyUrl(file.url) }}
                  className="w-6 h-6 bg-white/95 flex items-center justify-center border-none cursor-pointer shadow-sm hover:bg-white">
                  {copied === file.url ? <Check size={11} className="text-[#4a6741]" /> : <Copy size={11} className="text-gray-600" />}
                </button>
              </div>

              {/* Filename */}
              <div className="p-1.5">
                <p className="text-[10px] text-gray-600 truncate">{file.name}</p>
                <p className="text-[9px] text-gray-400">{formatSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="bg-white border border-gray-200">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-[11px] font-semibold tracking-widest uppercase text-gray-400 w-10">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={e => setSelected(e.target.checked ? filtered.map(f => f.key) : [])}
                    className="cursor-pointer" />
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold tracking-widest uppercase text-gray-400">File</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold tracking-widest uppercase text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold tracking-widests uppercase text-gray-400">Size</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold tracking-widests uppercase text-gray-400">Date</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(file => (
                <tr key={file.key} className={`hover:bg-gray-50 cursor-pointer ${selected.includes(file.key) ? 'bg-gray-50' : ''}`}
                  onClick={() => toggleSelect(file.key)}>
                  <td className="py-3 px-4">
                    <input type="checkbox" checked={selected.includes(file.key)}
                      onChange={() => toggleSelect(file.key)} onClick={e => e.stopPropagation()} className="cursor-pointer" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 shrink-0 overflow-hidden">
                        {file.type === 'image' ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                            <Film size={14} className="text-white/60" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[12px] text-[#1a1a1a] font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px] font-mono">{file.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${file.type === 'image' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {file.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{formatSize(file.size)}</td>
                  <td className="py-3 px-4 text-gray-500">{formatDate(file.lastModified)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setPreview(file)}
                        className="text-gray-400 hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer p-1">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => copyUrl(file.url)}
                        className="text-gray-400 hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer p-1">
                        {copied === file.url ? <Check size={13} className="text-[#4a6741]" /> : <Copy size={13} />}
                      </button>
                      <a href={file.url} download target="_blank"
                        className="text-gray-400 hover:text-[#1a1a1a] p-1">
                        <Download size={13} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}>
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">{preview.name}</p>
                <p className="text-[11px] text-gray-400">{formatSize(preview.size)} · {formatDate(preview.lastModified)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyUrl(preview.url)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] text-gray-600 cursor-pointer hover:border-[#1a1a1a] bg-white">
                  {copied === preview.url ? <><Check size={12} className="text-[#4a6741]" /> Copied!</> : <><Copy size={12} /> Copy URL</>}
                </button>
                <a href={preview.url} download target="_blank"
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] text-gray-600 no-underline hover:border-[#1a1a1a]">
                  <Download size={12} /> Download
                </a>
                <button onClick={() => setPreview(null)}
                  className="w-8 h-8 flex items-center justify-center border border-gray-200 cursor-pointer hover:border-[#1a1a1a] bg-white">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Media preview */}
            <div className="p-4 bg-gray-50 flex items-center justify-center min-h-[300px]">
              {preview.type === 'image' ? (
                <img src={preview.url} alt={preview.name} className="max-w-full max-h-[60vh] object-contain" />
              ) : (
                <video src={preview.url} controls className="max-w-full max-h-[60vh]" />
              )}
            </div>

            {/* URL bar */}
            <div className="p-4 border-t border-gray-200">
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">File URL</label>
              <div className="flex gap-2">
                <input readOnly value={preview.url}
                  className="flex-1 px-3 py-2 border border-gray-200 text-[12px] font-mono text-gray-600 bg-gray-50 outline-none" />
                <button onClick={() => copyUrl(preview.url)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] text-white text-[12px] border-none cursor-pointer hover:bg-gray-800">
                  {copied === preview.url ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {showDeleteModal && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#1a1a1a]">
            Delete {selected.length} file{selected.length !== 1 ? 's' : ''}?
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">
            This will permanently delete from S3 and cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={() => setShowDeleteModal(false)}
          className="flex-1 px-4 py-2.5 text-[12px] border border-gray-200 cursor-pointer hover:bg-gray-50 bg-white text-gray-600">
          Cancel
        </button>
        <button onClick={deleteSelected} disabled={deleting}
          className="flex-1 px-4 py-2.5 text-[12px] bg-red-500 text-white border-none cursor-pointer hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
          {deleting
            ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
            : <><Trash2 size={12} /> Delete Permanently</>}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}
