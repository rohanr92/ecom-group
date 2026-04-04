'use client'
// Save as: src/app/admin/reviews/page.tsx (NEW FILE)

import { useState, useEffect, useCallback } from 'react'
import { Star, Check, X, AlertCircle, MessageSquare } from 'lucide-react'

interface Review {
  id: string
  name: string
  rating: number
  title: string
  body: string
  size: string | null
  bodyType: string | null
  verified: boolean
  approved: boolean
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          strokeWidth={1.5}
          fill={i <= rating ? '#c8a882' : 'none'}
          color={i <= rating ? '#c8a882' : '#d1d5db'}
        />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews?filter=${filter}`, {
        credentials: 'include',
      })
      const data = await res.json()
      setReviews(data.reviews || [])
      setPendingCount(data.pendingCount || 0)
      setApprovedCount(data.approvedCount || 0)
    } catch {
      showToast('Failed to load reviews', 'error')
    }
    setLoading(false)
  }, [filter])

  useEffect(() => { loadReviews() }, [loadReviews])

  async function handleAction(reviewId: string, action: 'approve' | 'reject') {
    setActionLoading(reviewId)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showToast(
        action === 'approve' ? 'Review approved and published!' : 'Review rejected and deleted.',
        action === 'approve' ? 'success' : 'error'
      )
      loadReviews()
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error')
    }
    setActionLoading(null)
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 text-[13px] text-white shadow-lg transition-all
          ${toast.type === 'success' ? 'bg-[#1a1a1a]' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={16} strokeWidth={1.5} className="text-[#c8a882]" />
            <p className="text-[11px] text-gray-400 tracking-widest uppercase">Admin</p>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-light italic text-[#1a1a1a]">
            Reviews
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 p-5 text-center">
            <p className="text-3xl font-light text-[#c8a882] mb-1">{pendingCount}</p>
            <p className="text-[11px] text-gray-400 tracking-widest uppercase">Pending</p>
          </div>
          <div className="bg-white border border-gray-200 p-5 text-center">
            <p className="text-3xl font-light text-[#1a1a1a] mb-1">{approvedCount}</p>
            <p className="text-[11px] text-gray-400 tracking-widest uppercase">Published</p>
          </div>
          <div className="bg-white border border-gray-200 p-5 text-center">
            <p className="text-3xl font-light text-[#1a1a1a] mb-1">{pendingCount + approvedCount}</p>
            <p className="text-[11px] text-gray-400 tracking-widest uppercase">Total</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-6 mb-6 border-b border-gray-200 pb-0">
          {(['pending', 'approved', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-[12px] tracking-widest uppercase pb-3 border-b-2 transition-all -mb-px
                ${filter === tab
                  ? 'border-[#1a1a1a] text-[#1a1a1a] font-medium'
                  : 'border-transparent text-gray-400 hover:text-[#1a1a1a]'
                }`}
            >
              {tab === 'pending' && `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}`}
              {tab === 'approved' && 'Approved'}
              {tab === 'all' && 'All Reviews'}
            </button>
          ))}
        </div>

        {/* Reviews */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-48 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-[family-name:var(--font-display)] text-lg font-light italic text-gray-400">
              {filter === 'pending' ? 'No pending reviews' : 'No reviews found'}
            </p>
            {filter === 'pending' && (
              <p className="text-[12px] text-gray-400 mt-1">All reviews have been moderated.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Product & Meta */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-[11px] text-gray-400 tracking-widest uppercase bg-gray-100 px-2 py-0.5">
                        {review.product.name}
                      </span>
                      {!review.approved && (
                        <span className="text-[11px] text-amber-600 tracking-widest uppercase bg-amber-50 px-2 py-0.5 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {review.approved && (
                        <span className="text-[11px] text-green-600 tracking-widest uppercase bg-green-50 px-2 py-0.5 border border-green-200">
                          Published
                        </span>
                      )}
                      {review.verified && (
                        <span className="text-[11px] text-[#c8a882] tracking-widest uppercase">
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    {/* Rating & Title */}
                    <div className="flex items-center gap-3 mb-2">
                      <Stars rating={review.rating} />
                      <h3 className="font-[family-name:var(--font-display)] text-[15px] font-light italic text-[#1a1a1a]">
                        {review.title}
                      </h3>
                    </div>

                    {/* Body */}
                    <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{review.body}</p>

                    {/* Reviewer info */}
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      <span className="font-medium text-[#1a1a1a]">{review.name}</span>
                      {review.size && <span>Size: {review.size}</span>}
                      {review.bodyType && <span>Body Type: {review.bodyType}</span>}
                      <span>{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {!review.approved && (
                      <button
                        onClick={() => handleAction(review.id, 'approve')}
                        disabled={actionLoading === review.id}
                        className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-[11px] tracking-widest uppercase px-4 py-2 hover:bg-[#333] transition-colors disabled:opacity-50"
                      >
                        <Check size={12} strokeWidth={2} />
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(review.id, 'reject')}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 border border-red-300 text-red-500 text-[11px] tracking-widest uppercase px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <X size={12} strokeWidth={2} />
                      {review.approved ? 'Delete' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}