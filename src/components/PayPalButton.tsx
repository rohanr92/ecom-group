// Save as: src/components/PayPalButton.tsx
'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  amount:    number
  orderData: Record<string, any>
  onSuccess: (orderNumber: string) => void
  onError:   (msg: string) => void
}

export default function PayPalButton({ amount, orderData, onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false)

  const handlePayPal = async () => {
    setLoading(true)
    try {
      // 1. Create PayPal order
      const res = await fetch('/api/paypal/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount }),
      })
      const { orderId, error } = await res.json()
      if (error) { onError(error); setLoading(false); return }

      // 2. Save order to DB
      const orderRes = await fetch('/api/orders/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...orderData, paymentMethod: 'PAYPAL', paypalOrderId: orderId }),
      })
      const orderJson = await orderRes.json()
      if (!orderRes.ok) { onError(orderJson.error); setLoading(false); return }

      // 3. Redirect to PayPal approval page
      const approveUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`
      window.location.href = approveUrl

    } catch (err: any) {
      onError(err.message)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayPal}
      disabled={loading}
      className="w-full h-12 bg-[#ffc439] border border-[#f0b429] text-[#003087] text-[13px] font-bold tracking-wide cursor-pointer hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading
        ? <Loader2 size={16} className="animate-spin text-[#003087]" />
        : <><span className="font-black text-[#003087]">Pay</span><span className="font-black text-[#0070ba]">Pal</span></>
      }
    </button>
  )
}