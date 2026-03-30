// Save as: src/components/StripePaymentForm.tsx
'use client'
import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Lock, Loader2 } from 'lucide-react'

interface Props {
  amount:      number
  orderData:   Record<string, any>
  onSuccess:   (orderNumber: string) => void
  onError:     (msg: string) => void
}

export default function StripePaymentForm({ amount, orderData, onSuccess, onError }: Props) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setLoading(true)

    try {
      // 1. Submit payment elements
      const { error: submitError } = await elements.submit()
      if (submitError) { onError(submitError.message ?? 'Payment error'); setLoading(false); return }

      // 2. Save order to DB first
      const orderRes = await fetch('/api/orders/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...orderData, paymentMethod: 'STRIPE' }),
      })
      const orderJson = await orderRes.json()
      if (!orderRes.ok) { onError(orderJson.error); setLoading(false); return }

      // 3. Confirm payment with Stripe
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?order=${orderJson.orderNumber}`,
          payment_method_data: {
            billing_details: {
              email: orderData.email,
              name:  `${orderData.address?.firstName} ${orderData.address?.lastName}`,
            },
          },
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        onError(confirmError.message ?? 'Payment failed')
      } else {
        onSuccess(orderJson.orderNumber)
      }
    } catch (err: any) {
      onError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />

      <button
        onClick={handleSubmit}
        disabled={loading || !stripe}
        className="w-full h-12 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-widest uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 size={14} className="animate-spin" /> Processing...</>
          : <><Lock size={13} strokeWidth={1.5} /> Pay ${amount.toFixed(2)}</>
        }
      </button>
      <p className="text-center text-[10px] text-gray-400 tracking-wide">
        🔒 Payments are encrypted and processed securely by Stripe
      </p>
    </div>
  )
}