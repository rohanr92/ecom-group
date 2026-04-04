'use client'
// Save as: src/components/ProductReviews.tsx (NEW FILE)
// Drop-in replacement for the reviews section in src/app/products/[id]/page.tsx

import { useState, useEffect } from 'react'
import { Star, ChevronDown, ThumbsUp, CheckCircle, X } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
interface Review {
  id: string
  name: string
  rating: number
  title: string
  body: string
  size: string | null
  bodyType: string | null
  verified: boolean
  helpful: number
  createdAt: string
}

interface RatingBreakdown {
  [key: number]: number
}

interface ProductReviewsProps {
  productId: string
  productName: string
  initialRating?: number
  initialReviewCount?: number
  initialRatingBreakdown?: RatingBreakdown
}

// ── Star display ─────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          fill={i <= Math.round(rating) ? '#c8a882' : 'none'}
          color={i <= Math.round(rating) ? '#c8a882' : '#d1d5db'}
        />
      ))}
    </div>
  )
}

// ── Interactive star picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={24}
            strokeWidth={1.5}
            fill={i <= (hovered || value) ? '#c8a882' : 'none'}
            color={i <= (hovered || value) ? '#c8a882' : '#9ca3af'}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-[12px] text-gray-500">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  )
}

// ── Write Review Modal ────────────────────────────────────────────────────────
function WriteReviewModal({
  productId,
  productName,
  onClose,
  onSubmitted,
}: {
  productId: string
  productName: string
  onClose: () => void
  onSubmitted: () => void
}) {
  const [rating, setRating] = useState(0)
  const [form, setForm] = useState({
    name: '',
    email: '',
    title: '',
    reviewBody: '',
    size: '',
    bodyType: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
  const bodyTypes = ['Petite', 'Average', 'Tall', 'Plus Size', 'Athletic']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (rating === 0) { setError('Please select a star rating.'); return }
    if (!form.name.trim()) { setError('Please enter your name.'); return }
    if (!form.title.trim()) { setError('Please enter a review title.'); return }
    if (form.reviewBody.trim().length < 10) { setError('Review must be at least 10 characters.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review')
      setSuccess(true)
      setTimeout(() => { onSubmitted(); onClose() }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full md:max-w-xl md:rounded-none max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[11px] text-gray-400 tracking-widest uppercase">Write a Review</p>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-light italic text-[#1a1a1a] leading-tight mt-0.5">
              {productName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-[#1a1a1a] transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-16 text-center">
            <CheckCircle size={40} className="text-[#c8a882] mx-auto mb-4" strokeWidth={1.5} />
            <p className="font-[family-name:var(--font-display)] text-xl font-light italic text-[#1a1a1a] mb-2">
              Thank you for your review!
            </p>
            <p className="text-[13px] text-gray-500">
              Your review is pending approval and will appear shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

            {/* Star Rating */}
            <div>
              <label className="block text-[11px] text-gray-500 tracking-widest uppercase mb-2">
                Overall Rating <span className="text-red-400">*</span>
              </label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-gray-500 tracking-widest uppercase mb-1.5">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Jane D."
                  className="w-full border border-gray-200 px-3 py-2.5 text-[13px] text-[#1a1a1a] placeholder-gray-300 focus:outline-none focus:border-[#c8a882] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 tracking-widest uppercase mb-1.5">
                  Email (private)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="jane@email.com"
                  className="w-full border border-gray-200 px-3 py-2.5 text-[13px] text-[#1a1a1a] placeholder-gray-300 focus:outline-none focus:border-[#c8a882] transition-colors"
                />
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-[11px] text-gray-500 tracking-widest uppercase mb-1.5">
                Review Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Summarize your experience"
                maxLength={80}
                className="w-full border border-gray-200 px-3 py-2.5 text-[13px] text-[#1a1a1a] placeholder-gray-300 focus:outline-none focus:border-[#c8a882] transition-colors"
              />
            </div>

            {/* Review Body */}
            <div>
              <label className="block text-[11px] text-gray-500 tracking-widest uppercase mb-1.5">
                Your Review <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.reviewBody}
                onChange={e => setForm(f => ({ ...f, reviewBody: e.target.value }))}
                placeholder="Tell others about your experience with this product..."
                rows={5}
                maxLength={2000}
                className="w-full border border-gray-200 px-3 py-2.5 text-[13px] text-[#1a1a1a] placeholder-gray-300 focus:outline-none focus:border-[#c8a882] transition-colors resize-none"
              />
              <p className="text-[11px] text-gray-300 text-right mt-1">{form.reviewBody.length}/2000</p>
            </div>

            {/* Size & Body Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-gray-500 tracking-widest uppercase mb-1.5">
                  Size Purchased
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, size: f.size === s ? '' : s }))}
                      className={`px-2.5 py-1 text-[11px] border transition-all
                        ${form.size === s
                          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                          : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 tracking-widest uppercase mb-1.5">
                  Body Type
                </label>
                <div className="flex flex-col gap-1">
                  {bodyTypes.map(bt => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, bodyType: f.bodyType === bt ? '' : bt }))}
                      className={`text-left px-2.5 py-1 text-[11px] border transition-all
                        ${form.bodyType === bt
                          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                          : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-red-500 bg-red-50 px-3 py-2 border border-red-100">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1a1a1a] text-white text-[12px] tracking-widest uppercase py-3.5 hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Reviews are moderated and typically appear within 24-48 hours.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Individual Review Card ────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful)
  const [voted, setVoted] = useState(false)

  async function markHelpful() {
    if (voted) return
    setVoted(true)
    setHelpfulCount(c => c + 1)
    // fire and forget
    fetch(`/api/reviews/${review.id}/helpful`, { method: 'POST' })
  }

  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="py-6 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <Stars rating={review.rating} size={13} />
          <h4 className="font-[family-name:var(--font-display)] text-[15px] font-light italic text-[#1a1a1a] mt-1.5">
            {review.title}
          </h4>
        </div>
        <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">{date}</span>
      </div>

      <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{review.body}</p>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="font-medium text-[#1a1a1a]">{review.name}</span>
          {review.verified && (
            <span className="flex items-center gap-1 text-[#c8a882]">
              <CheckCircle size={11} strokeWidth={2} />
              Verified Purchase
            </span>
          )}
        </div>

        {(review.size || review.bodyType) && (
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            {review.size && <span>Size: <span className="text-[#1a1a1a]">{review.size}</span></span>}
            {review.bodyType && <span>Body Type: <span className="text-[#1a1a1a]">{review.bodyType}</span></span>}
          </div>
        )}

        <button
          onClick={markHelpful}
          className={`ml-auto flex items-center gap-1.5 text-[11px] tracking-wide transition-colors
            ${voted ? 'text-[#c8a882]' : 'text-gray-400 hover:text-[#1a1a1a]'}`}
        >
          <ThumbsUp size={12} strokeWidth={1.5} />
          Helpful ({helpfulCount})
        </button>
      </div>
    </div>
  )
}

// ── MAIN ProductReviews Component ─────────────────────────────────────────────
export default function ProductReviews({
  productId,
  productName,
  initialRating = 0,
  initialReviewCount = 0,
  initialRatingBreakdown = {},
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [showModal, setShowModal] = useState(false)
  const [showAll, setShowAll] = useState(false)

  // rating breakdown from live reviews
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>(initialRatingBreakdown)
  const [avgRating, setAvgRating] = useState(initialRating)
  const [reviewCount, setReviewCount] = useState(initialReviewCount)

  async function loadReviews() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews?productId=${productId}&sort=${sort}`)
      const data = await res.json()
      if (data.reviews) {
        setReviews(data.reviews)
        setReviewCount(data.reviews.length)

        // recompute avg & breakdown from live data
        if (data.reviews.length > 0) {
          const breakdown: RatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          data.reviews.forEach((r: Review) => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1 })
          setRatingBreakdown(breakdown)
          const avg = data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.reviews.length
          setAvgRating(Math.round(avg * 10) / 10)
        }
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadReviews() }, [productId, sort])

  const totalReviews = Object.values(ratingBreakdown).reduce((a, b) => a + b, 0)
  const visibleReviews = showAll ? reviews : reviews.slice(0, 4)

  return (
    <section id="reviews" className="border-t border-gray-100 py-12 bg-[#f8f6f1]">
      <div className="max-container px-4 md:px-10">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-light italic text-[#1a1a1a]">
            Ratings & Reviews
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="border border-[#1a1a1a] text-[#1a1a1a] text-[11px] tracking-widest uppercase px-6 py-2.5 hover:bg-[#1a1a1a] hover:text-white transition-all"
          >
            Write a Review
          </button>
        </div>

        {/* Rating Summary */}
        {reviewCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Average */}
            <div className="flex flex-col items-center justify-center text-center bg-white p-8">
              <p className="font-[family-name:var(--font-display)] text-6xl font-light italic text-[#1a1a1a]">
                {avgRating.toFixed(1)}
              </p>
              <Stars rating={avgRating} size={16} />
              <p className="text-[12px] text-gray-400 tracking-wide mt-2">{reviewCount} reviews</p>
            </div>

            {/* Breakdown */}
            <div className="flex flex-col justify-center gap-2 col-span-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratingBreakdown[star] ?? 0
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-[12px] text-gray-500 w-4 shrink-0">{star}</span>
                    <Star size={11} strokeWidth={1.5} fill="#c8a882" color="#c8a882" />
                    <div className="flex-1 h-1.5 bg-gray-200 overflow-hidden">
                      <div className="h-full bg-[#c8a882] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400 w-6 shrink-0">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Sort Controls */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
            <span className="text-[11px] text-gray-400 tracking-widest uppercase">Sort by:</span>
            {[
              { key: 'newest',  label: 'Newest' },
              { key: 'highest', label: 'Highest Rated' },
              { key: 'lowest',  label: 'Lowest Rated' },
              { key: 'helpful', label: 'Most Helpful' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`text-[11px] tracking-wide transition-colors pb-4 -mb-4 border-b-2
                  ${sort === opt.key
                    ? 'border-[#1a1a1a] text-[#1a1a1a] font-medium'
                    : 'border-transparent text-gray-400 hover:text-[#1a1a1a]'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-6 py-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse py-6 border-b border-gray-100">
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map(s => <div key={s} className="w-3 h-3 bg-gray-200 rounded-full" />)}
                </div>
                <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white">
            <p className="font-[family-name:var(--font-display)] text-xl font-light italic text-gray-400 mb-2">
              No reviews yet
            </p>
            <p className="text-[12px] text-gray-400 mb-6 tracking-wide">
              Be the first to share your thoughts
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="border border-[#1a1a1a] text-[#1a1a1a] text-[11px] tracking-widest uppercase px-8 py-3 hover:bg-[#1a1a1a] hover:text-white transition-all"
            >
              Write a Review
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white divide-y divide-gray-100 px-6">
              {visibleReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {reviews.length > 4 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="flex items-center gap-2 mx-auto text-[12px] tracking-widest uppercase text-[#1a1a1a] hover:text-[#c8a882] transition-colors"
                >
                  {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    className={`transition-transform ${showAll ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Write Review Modal */}
      {showModal && (
        <WriteReviewModal
          productId={productId}
          productName={productName}
          onClose={() => setShowModal(false)}
          onSubmitted={loadReviews}
        />
      )}
    </section>
  )
}