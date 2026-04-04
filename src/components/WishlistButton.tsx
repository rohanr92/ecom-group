// Save as: src/components/WishlistButton.tsx (REPLACE)
'use client'
import { useState, useEffect } from 'react'
import { Heart, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WishlistButtonProps {
  productId:  string
  variantId?: string
  className?: string
  size?:      number
  showLabel?: boolean
}

export default function WishlistButton({
  productId,
  variantId,
  className  = '',
  size       = 20,
  showLabel  = false,
}: WishlistButtonProps) {
  const router = useRouter()
  const [saved,    setSaved]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [ready,    setReady]    = useState(false)
  const [toast,    setToast]    = useState<string | null>(null)

  // Check if already in wishlist on mount
  useEffect(() => {
    fetch('/api/account/wishlist')
      .then(r => {
        if (!r.ok) { setReady(true); return null }
        return r.json()
      })
      .then(d => {
        if (!d) { setReady(true); return }
        const exists = d.items?.some((i: any) => i.productId === productId)
        setSaved(!!exists)
        setReady(true)
      })
      .catch(() => setReady(true))
  }, [productId])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const meRes = await fetch('/api/auth/me')
    if (!meRes.ok) {
      router.push(`/account/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (saved) {
      setLoading(true)
      const res = await fetch('/api/account/wishlist', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId }),
      })
      if (res.ok) {
        setSaved(false)
        showToast('Removed from wishlist')
      }
      setLoading(false)
      return
    }

    // Check if already exists first
    setLoading(true)
    const res = await fetch('/api/account/wishlist', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId, variantId: variantId ?? null }),
    })
    const data = await res.json()

    if (data.message === 'Already in wishlist') {
      showToast('Already in your wishlist')
      setSaved(true)
    } else if (res.ok && data.success) {
      setSaved(true)
      showToast('Added to wishlist')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={toggle}
        disabled={loading || !ready}
        title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        className={`flex items-center gap-1.5 bg-transparent border-none cursor-pointer transition-all disabled:opacity-40 ${className}`}
      >
        <Heart
          size={size}
          strokeWidth={1.5}
          style={{
            fill:       saved ? '#c0392b' : 'transparent',
            color:      saved ? '#c0392b' : '#1a1a1a',
            transition: 'all 0.2s ease',
            transform:  saved ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        {showLabel && (
          <span style={{ fontSize: '12px', letterSpacing: '0.06em', color: saved ? '#c0392b' : '#1a1a1a', textTransform: 'uppercase' }}>
            {saved ? 'Saved' : 'Save'}
          </span>
        )}
      </button>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a1a1a',
          color: '#fff',
          fontSize: '11px',
          letterSpacing: '0.06em',
          padding: '6px 12px',
          whiteSpace: 'nowrap',
          borderRadius: '2px',
          pointerEvents: 'none',
          zIndex: 999,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}