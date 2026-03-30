// Save as: src/app/account/orders/[id]/page.tsx
'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, Package, MapPin, CreditCard, RotateCcw, Check } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
}

const STATUS_STEPS = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order,   setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/account/orders')
      .then(r => r.json())
      .then(d => {
        const found = d.orders?.find((o: any) => o.id === id)
        setOrder(found ?? null)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="bg-white border border-gray-200 p-12 text-center text-[13px] text-gray-400">Loading order...</div>
  )

  if (!order) return (
    <div className="bg-white border border-gray-200 p-12 text-center">
      <p className="text-[14px] text-gray-400 mb-4">Order not found</p>
      <Link href="/account/orders" className="text-[#1a1a1a] underline text-[13px]">Back to orders</Link>
    </div>
  )

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const addr        = order.addresses?.[0]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 p-5">
        <Link href="/account/orders"
          className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-[#1a1a1a] no-underline mb-4 transition-colors">
          <ArrowLeft size={13} /> Back to orders
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[18px] font-semibold text-[#1a1a1a]">{order.orderNumber}</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Placed {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status] ?? ''}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Order timeline */}
      {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
        <div className="bg-white border border-gray-200 p-5">
          <h2 className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Order Progress</h2>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done    = currentStep >= i
              const current = currentStep === i
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                      ${done ? 'bg-[#4a6741] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {done ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                    </div>
                    <span className={`text-[10px] tracking-wide whitespace-nowrap ${current ? 'text-[#1a1a1a] font-semibold' : done ? 'text-[#4a6741]' : 'text-gray-400'}`}>
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 mb-4 ${currentStep > i ? 'bg-[#4a6741]' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
          {order.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-[13px] text-[#4a6741]">
              <Truck size={14} strokeWidth={1.5} />
              Tracking number: <span className="font-mono font-semibold">{order.trackingNumber}</span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-gray-200 p-5">
        <h2 className="text-[13px] font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
          <Package size={15} strokeWidth={1.5} className="text-[#c8a882]" />
          Items Ordered
        </h2>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-16 h-20 bg-[#f5f2ed] overflow-hidden shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#1a1a1a]">{item.name}</p>
                <p className="text-[12px] text-gray-500 mt-0.5">{item.size} · {item.color}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="text-[13px] font-semibold text-[#1a1a1a] shrink-0">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping address */}
        {addr && (
          <div className="bg-white border border-gray-200 p-5">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <MapPin size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Shipping Address
            </h2>
            <div className="text-[13px] text-gray-600 leading-relaxed space-y-0.5">
              <p className="font-medium text-[#1a1a1a]">{addr.firstName} {addr.lastName}</p>
              <p>{addr.street}{addr.street2 ? `, ${addr.street2}` : ''}</p>
              <p>{addr.city}, {addr.state} {addr.zip}</p>
              <p>{addr.country}</p>
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-white border border-gray-200 p-5">
          <h2 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
            <CreditCard size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Order Summary
          </h2>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{Number(order.shippingCost) === 0 ? 'Free' : `$${Number(order.shippingCost).toFixed(2)}`}</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax</span><span>${Number(order.tax).toFixed(2)}</span></div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-[#4a6741]"><span>Discount</span><span>-${Number(order.discount).toFixed(2)}</span></div>
            )}
            <div className="flex justify-between font-semibold text-[#1a1a1a] border-t border-gray-100 pt-2 text-[14px]">
              <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-gray-400 capitalize">Paid via {order.paymentMethod?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Return button */}
      {(order.status === 'DELIVERED' || order.status === 'SHIPPED') && (
        <div className="bg-[#f8f6f1] border border-gray-200 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[13px] font-semibold text-[#1a1a1a] mb-1">Need to return something?</p>
            <p className="text-[12px] text-gray-500">Returns are accepted within 30 days of delivery.</p>
          </div>
          <Link href={`/account/returns?order=${order.id}&orderNumber=${order.orderNumber}`}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#1a1a1a] text-[#1a1a1a] text-[11px] tracking-widest uppercase no-underline hover:bg-[#1a1a1a] hover:text-white transition-colors">
            <RotateCcw size={13} strokeWidth={1.5} /> Start Return
          </Link>
        </div>
      )}
    </div>
  )
}