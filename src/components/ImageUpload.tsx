'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import imageCompression from 'browser-image-compression'

interface ImageUploadProps {
  images:    string[]
  onChange:  (urls: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState<string | null>(null)
  const [progress,  setProgress]  = useState(0)
  const [dragOver,  setDragOver]  = useState(false)
  const [error,     setError]     = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    setError('')
    setUploading(file.name)
    setProgress(0)

    try {
      // Compress — keeps quality at 92%, just reduces file size
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

      // Get presigned URL
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

      // Upload directly to S3
      const uploadRes = await fetch(signedUrl, {
        method:  'PUT',
        body:    compressed,
        headers: { 'Content-Type': 'image/webp' },
      })
      if (!uploadRes.ok) throw new Error('Upload to S3 failed')

      setProgress(100)
      onChange([...images, publicUrl])

    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(null)
      setProgress(0)
    }
  }, [images, onChange])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr       = Array.from(files)
    const remaining = maxImages - images.length
    if (arr.length > remaining) {
      setError(`You can only upload ${remaining} more image${remaining !== 1 ? 's' : ''}`)
      return
    }
    for (const file of arr) {
      if (!file.type.startsWith('image/')) { setError(`${file.name} is not an image`); continue }
      await uploadFile(file)
    }
  }, [images, maxImages, uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeImage = (url: string) => onChange(images.filter(i => i !== url))

  const moveLeft = (i: number) => {
    if (i === 0) return
    const arr = [...images]
    ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
    onChange(arr)
  }

  return (
    <div className="space-y-4">

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative group aspect-[3/4] bg-[#f5f2ed] overflow-hidden border border-gray-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#1a1a1a] text-white text-[8px] font-semibold tracking-widest uppercase px-1.5 py-0.5">
                  Main
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                {i > 0 && (
                  <button onClick={() => moveLeft(i)}
                    className="text-white text-[10px] bg-white/20 hover:bg-white/40 px-2 py-1 border-none cursor-pointer">
                    Set as main
                  </button>
                )}
                <button onClick={() => removeImage(url)}
                  className="flex items-center gap-1 text-white text-[10px] bg-red-500/80 hover:bg-red-600 px-2 py-1 border-none cursor-pointer">
                  <X size={10} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed transition-all cursor-pointer
            ${dragOver   ? 'border-[#1a1a1a] bg-[#f8f6f1]' : 'border-gray-300 bg-white hover:border-gray-400'}
            ${uploading  ? 'cursor-not-allowed opacity-75' : ''}`}
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
                <div className="w-12 h-12 bg-[#f5f2ed] flex items-center justify-center mb-3">
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

      <p className="text-[11px] text-gray-400">
        First image is the main product photo. Hover images to reorder or remove.
      </p>
    </div>
  )
}