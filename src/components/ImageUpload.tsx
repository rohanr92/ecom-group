'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, AlertCircle, GripVertical } from 'lucide-react'
import imageCompression from 'browser-image-compression'

interface ImageUploadProps {
  images:    string[]
  onChange:  (urls: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading,    setUploading]    = useState<string | null>(null)
  const [progress,     setProgress]     = useState(0)
  const [dragOver,     setDragOver]     = useState(false)
  const [error,        setError]        = useState('')
  const [dragIndex,    setDragIndex]    = useState<number | null>(null)
  const [dragOverIdx,  setDragOverIdx]  = useState<number | null>(null)
  const inputRef       = useRef<HTMLInputElement>(null)
  const accumulatedRef = useRef<string[]>([])

  // ── Bulk upload ───────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr       = Array.from(files)
    const remaining = maxImages - images.length
    if (arr.length > remaining) {
      setError(`You can only upload ${remaining} more image${remaining !== 1 ? 's' : ''}`)
      return
    }
    const validFiles = arr.filter(file => {
      if (!file.type.startsWith('image/')) { setError(`${file.name} is not an image`); return false }
      return true
    })
    if (!validFiles.length) return

    accumulatedRef.current = [...images]

    for (const file of validFiles) {
      try {
        setError('')
        setUploading(file.name)
        setProgress(0)
        setProgress(10)

        const compressed = await imageCompression(file, {
          maxSizeMB:        2,
          maxWidthOrHeight: 2400,
          useWebWorker:     true,
          fileType:         'image/webp',
          initialQuality:   0.92,
          onProgress:       (p) => setProgress(10 + Math.round(p * 0.4)),
        })

        setProgress(55)

        const metaRes = await fetch('/api/admin/upload', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            filename:    file.name.replace(/\.[^.]+$/, '.webp'),
            contentType: 'image/webp',
          }),
        })
        if (!metaRes.ok) throw new Error('Failed to get upload URL')
        const { signedUrl, publicUrl } = await metaRes.json()

        setProgress(65)

        const uploadRes = await fetch(signedUrl, {
          method:  'PUT',
          body:    compressed,
          headers: { 'Content-Type': 'image/webp' },
        })
        if (!uploadRes.ok) throw new Error('Upload to S3 failed')

        setProgress(100)
        accumulatedRef.current = [...accumulatedRef.current, publicUrl]
        onChange(accumulatedRef.current)

      } catch (err: any) {
        setError(err.message || 'Upload failed')
      } finally {
        setUploading(null)
        setProgress(0)
      }
    }
  }, [images, maxImages, onChange])

  // ── Drop zone for new files ────────────────────────────────────
  const handleDropZone = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  // ── Drag to reorder ────────────────────────────────────────────
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    const ghost = document.createElement('div')
    ghost.style.opacity = '0'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragIndex === null || dragIndex === index) return
    setDragOverIdx(index)
  }

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIdx(null)
      return
    }
    const arr = [...images]
    const [moved] = arr.splice(dragIndex, 1)
    arr.splice(dropIndex, 0, moved)
    onChange(arr)
    setDragIndex(null)
    setDragOverIdx(null)
  }

  const handleImageDragEnd = () => {
    setDragIndex(null)
    setDragOverIdx(null)
  }

  const removeImage = (url: string) => onChange(images.filter(i => i !== url))

  return (
    <div className="space-y-4">

      {/* Image grid with drag to reorder */}
      {images.length > 0 && (
        <>
          <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <GripVertical size={12} className="text-gray-300" />
            Drag images to reorder · First image is the main photo
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((url, i) => (
              <div
                key={url}
                draggable
                onDragStart={e => handleImageDragStart(e, i)}
                onDragOver={e => handleImageDragOver(e, i)}
                onDrop={e => handleImageDrop(e, i)}
                onDragEnd={handleImageDragEnd}
                className={`relative group aspect-[3/4] bg-[#f9f9f9] overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing select-none
                  ${dragIndex === i ? 'opacity-40 scale-95 border-dashed border-gray-400' : ''}
                  ${dragOverIdx === i && dragIndex !== i ? 'border-[#1a1a1a] scale-105 shadow-lg' : 'border-gray-200'}
                `}
              >
                <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />

                {/* Position number */}
                <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold leading-none">{i + 1}</span>
                </div>

                {/* Main badge */}
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-[#c8a882] text-white text-[8px] font-semibold tracking-widest uppercase px-1.5 py-0.5">
                    Main
                  </span>
                )}

                {/* Grip handle top right */}
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-5 h-5 bg-white/80 flex items-center justify-center rounded shadow-sm">
                    <GripVertical size={11} className="text-gray-600" />
                  </div>
                </div>

                {/* Remove button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                  <button
                    onClick={e => { e.stopPropagation(); removeImage(url) }}
                    className="flex items-center gap-1 text-white text-[10px] bg-red-500/90 hover:bg-red-600 px-2 py-1 border-none cursor-pointer rounded">
                    <X size={10} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upload drop zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDropZone}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed transition-all cursor-pointer
            ${dragOver  ? 'border-[#1a1a1a] bg-[#f8f6f1]' : 'border-gray-300 bg-white hover:border-gray-400'}
            ${uploading ? 'cursor-not-allowed opacity-75' : ''}`}
        >
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            {uploading ? (
              <>
                <Loader2 size={28} strokeWidth={1.5} className="text-[#c8a882] mb-3 animate-spin" />
                <p className="text-[13px] font-medium text-[#1a1a1a] mb-2">
                  Uploading {uploading}...
                </p>
                <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#c8a882] transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{progress}%</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-[#f9f9f9] flex items-center justify-center mb-3">
                  <Upload size={20} strokeWidth={1.5} className="text-[#c8a882]" />
                </div>
                <p className="text-[13px] font-medium text-[#1a1a1a] mb-1">Drag & drop images here</p>
                <p className="text-[12px] text-gray-400 mb-3">or click to browse</p>
                <p className="text-[11px] text-gray-300">JPG, PNG, WEBP — any size accepted</p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  {images.length}/{maxImages} uploaded · Auto-compressed · 92% quality preserved
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 text-red-600 text-[12px]">
          <AlertCircle size={13} strokeWidth={1.5} />
          {error}
          <button onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">
            <X size={12} />
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)} />
    </div>
  )
}