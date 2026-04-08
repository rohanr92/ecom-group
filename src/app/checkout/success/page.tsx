'use client'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Order Confirmed - Thank You' }


import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Check, Truck, ShoppingBag } from 'lucide-react'
import { pushDataLayer } from '@/components/DataLayer'

function SuccessContent() {
  const params      = useSearchParams()
  const orderNumber = params.get('order') ?? ''
  const method      = params.get('method') ?? 'card'
  const error       = params.get('error')


  useEffect(() => {
  if (orderNumber && !error) {
    pushDataLayer({
      event: 'purchase',
      ecommerce: {
        transaction_id: orderNumber,
        currency: 'USD',
        payment_type: method,
      }
    })
  }
}, [orderNumber, error, method])

  // Payment failed / cancelled
  if (error) {
    const messages: Record<string, string> = {
      payment_failed:  'Your payment could not be processed. Please try again.',
      capture_failed:  'We could not capture your PayPal payment. Please try again.',
      missing_token:   'Invalid payment session. Please try again.',
    }
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">✕</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl italic font-light text-[#1a1a1a] mb-3">
            Payment Failed
          </h1>
          <p className="text-[13px] text-gray-500 tracking-wide mb-8">
            {messages[error] ?? 'Something went wrong. Please try again.'}
          </p>
          <Link href="/checkout"
            className="flex items-center justify-center w-full h-12 bg-[#1a1a1a] text-white text-xs tracking-widest uppercase no-underline hover:bg-gray-800 transition-colors mb-3">
            Try Again
          </Link>
          <Link href="/"
            className="flex items-center justify-center w-full h-12 border border-gray-300 text-[#1a1a1a] text-xs tracking-widest uppercase no-underline hover:border-[#1a1a1a] transition-colors">
            Return to Shop
          </Link>
        </div>
      </div>
    )
  }

  // Success
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">

        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-[#4a6741] flex items-center justify-center mx-auto mb-6">
          <Check size={30} strokeWidth={2.5} className="text-white" />
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-3xl italic font-light text-[#1a1a1a] mb-2">
          Order Confirmed!
        </h1>
        <p className="text-[13px] text-gray-500 tracking-wide mb-8">
          {method === 'paypal'
            ? 'Your PayPal payment was successful.'
            : 'Your payment was processed successfully.'}
        </p>

        {/* Order number box */}
        {orderNumber && (
          <div className="bg-[#f8f6f1] border border-gray-100 px-6 py-5 mb-8">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">Order Number</p>
            <p className="font-[family-name:var(--font-display)] text-2xl italic font-light text-[#1a1a1a]">
              {orderNumber}
            </p>
            <p className="text-[11px] text-gray-400 tracking-wide mt-2">
              A confirmation email is on its way to you
            </p>
          </div>
        )}

        {/* What happens next */}
        <div className="text-left space-y-3 mb-8 px-2">
          {[
            { icon: <Check size={13} strokeWidth={2} />, text: 'Order confirmed & saved' },
            { icon: <Truck size={13} strokeWidth={1.5} />, text: 'We\'ll email you when it ships' },
            { icon: <ShoppingBag size={13} strokeWidth={1.5} />, text: 'Estimated delivery: 5–7 business days' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#f8f6f1] flex items-center justify-center text-[#4a6741] shrink-0">
                {item.icon}
              </div>
              <p className="text-[12px] text-gray-500 tracking-wide">{item.text}</p>
            </div>
          ))}
        </div>

        <Link href="/"
          className="flex items-center justify-center w-full h-12 bg-[#1a1a1a] text-white text-xs tracking-widest uppercase no-underline hover:bg-gray-800 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-gray-400 tracking-wide">Loading...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}