// Save as: src/components/WishlistButton.tsx (NEW FILE)
'use client'
import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
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
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready,   setReady]   = useState(false)

  // Check if already in wishlist on mount
  useEffect(() => {
    fetch('/api/account/wishlist')
      .then(r => {
        if (!r.ok) { setReady(true); return null }
        return r.json()
      })
      .then(d => {
        if (!d) return
        const exists = d.items?.some((i: any) => i.productId === productId)
        setSaved(!!exists)
        setReady(true)
      })
      .catch(() => setReady(true))
  }, [productId])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Check login
    const meRes = await fetch('/api/auth/me')
    if (!meRes.ok) {
      router.push(`/account/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    setLoading(true)

    if (saved) {
      const res = await fetch('/api/account/wishlist', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId }),
      })
      if (res.ok) setSaved(false)
    } else {
      const res = await fetch('/api/account/wishlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId, variantId: variantId ?? null }),
      })
      if (res.ok) setSaved(true)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading || !ready}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`flex items-center gap-1.5 bg-transparent border-none cursor-pointer transition-all disabled:opacity-40 ${className}`}>
      <Heart
        size={size}
        strokeWidth={1.5}
        className={`transition-all duration-200 ${
          saved
            ? 'fill-[#1a1a1a] text-[#1a1a1a]'
            : 'fill-transparent text-[#1a1a1a] hover:fill-[#1a1a1a]/10'
        }`}
      />
      {showLabel && (
        <span className="text-[12px] tracking-wide text-[#1a1a1a]">
          {saved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}