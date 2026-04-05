// Save as: src/app/admin/orders/[id]/page.tsx (NEW FILE — create folder first)
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Check, Truck, Package, Mail, MapPin,
  CreditCard, ExternalLink, AlertCircle, CheckCircle2
} from 'lucide-react'

// ── US couriers with tracking URL templates ──────────────────────
const COURIERS = [
  { name: 'UPS',       code: 'ups',       url: (t: string) => `https://www.ups.com/track?tracknum=${t}` },
  { name: 'FedEx',     code: 'fedex',     url: (t: string) => `https://www.fedex.com/fedextrack/?trknbr=${t}` },
  { name: 'USPS',      code: 'usps',      url: (t: string) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}` },
  { name: 'DHL',       code: 'dhl',       url: (t: string) => `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${t}` },
  { name: 'OnTrac',    code: 'ontrac',    url: (t: string) => `https://www.ontrac.com/tracking/?number=${t}` },
  { name: 'LaserShip', code: 'lasership', url: (t: string) => `https://www.lasership.com/track/${t}` },
  { name: 'Amazon',    code: 'amazon',    url: (t: string) => `https://track.amazon.com/tracking/${t}` },
  { name: 'Other',     code: 'other',     url: (t: string) => '' },
]

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-gray-100 text-gray-600',
}

const STATUS_STEPS = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

export default function OrderDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const orderId  = params?.id as string

  const [order,    setOrder]    = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(false)
  const [toast,    setToast]    = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Shipping fields
  const [courier,   setCourier]   = useState('ups')
  const [tracking,  setTracking]  = useState('')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!orderId) return
    fetch(`/api/admin/orders/${orderId}`)
      .then(r => r.json())
      .then(d => {
        if (d.order) {
          setOrder(d.order)
          setTracking(d.order.trackingNumber ?? '')
          if (d.order.courier) setCourier(d.order.courier)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [orderId])

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const body: any = { id: orderId, status: newStatus }
      if (newStatus === 'SHIPPED') {
        if (!tracking) { showToast('Please enter a tracking number before marking as shipped', 'error'); setUpdating(false); return }
             const courierObj = COURIERS.find(c => c.code === courier)
        body.trackingNumber = tracking
        body.courier = courier
        body.trackingUrl = courierObj ? courierObj.url(tracking) : ''
      }
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (res.ok) {
        setOrder((p: any) => ({ ...p, status: newStatus, trackingNumber: tracking || p.trackingNumber, courier }))
        showToast(`Status updated to ${newStatus}`, 'success')
      } else showToast(d.error ?? 'Failed to update', 'error')
    } finally { setUpdating(false) }
  }

   const saveTracking = async () => {
    if (!tracking) return
    setUpdating(true)
    try {
      const courierObj = COURIERS.find(c => c.code === courier)
      const trackingUrl = courierObj ? courierObj.url(tracking) : ''
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, trackingNumber: tracking, courier, trackingUrl }),
      })
    } finally { setUpdating(false) }
  }


  const getTrackingUrl = () => {
    if (!tracking) return ''
    const c = COURIERS.find(c => c.code === (order?.courier ?? courier))
    return c ? c.url(tracking) : ''
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  if (loading) return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1a1a1a] rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )

  if (!order) return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-[14px] text-gray-400">Order not found</p>
        <Link href="/admin/orders" className="text-[12px] text-[#1a1a1a] underline mt-3 block">← Back to orders</Link>
      </div>
    </div>
  )

  const trackingUrl = getTrackingUrl()
  const currentCourier = COURIERS.find(c => c.code === courier)

  return (
    <div className="p-6 space-y-5">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders"
            className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-[#1a1a1a] no-underline rounded-lg transition-colors">
            <ArrowLeft size={15} strokeWidth={1.5} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[18px] font-semibold text-[#1a1a1a]">{order.orderNumber}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                {order.status}
              </span>
            </div>
            <p className="text-[12px] text-gray-500 mt-0.5">{fmtDate(order.createdAt)} at {fmtTime(order.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Progress timeline */}
      {!['CANCELLED','REFUNDED'].includes(order.status) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const idx  = STATUS_STEPS.indexOf(order.status)
              const done = idx >= i
              const curr = idx === i
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold transition-all
                      ${done ? 'bg-[#4a6741] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {done ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                    </div>
                    <span className={`text-[11px] tracking-wide whitespace-nowrap font-medium
                      ${curr ? 'text-[#1a1a1a]' : done ? 'text-[#4a6741]' : 'text-gray-400'}`}>
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 mb-5 rounded-full ${STATUS_STEPS.indexOf(order.status) > i ? 'bg-[#4a6741]' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Update status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 tracking-wide">Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {['CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s => (
                <button key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating || order.status === s}
                  className={`px-4 py-2 text-[12px] font-medium rounded-lg border cursor-pointer transition-colors disabled:opacity-40
                    ${order.status === s
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#1a1a1a] hover:text-[#1a1a1a]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Shipping & Tracking */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide flex items-center gap-2">
              <Truck size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Shipping & Tracking
            </h2>

            {/* Courier selector */}
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Courier</label>
              <div className="grid grid-cols-4 gap-2">
                {COURIERS.map(c => (
                  <button key={c.code} onClick={() => setCourier(c.code)}
                    className={`px-3 py-2 text-[12px] rounded-lg border cursor-pointer transition-all text-center
                      ${courier === c.code
                        ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] font-semibold'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a1a1a]'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking number */}
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Tracking Number</label>
              <div className="flex gap-2">
                <input value={tracking} onChange={e => setTracking(e.target.value)}
                  placeholder="Enter tracking number..."
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] font-mono outline-none focus:border-[#1a1a1a]" />
                <button onClick={saveTracking} disabled={updating || !tracking}
                  className="px-4 py-2 bg-white border border-gray-300 text-[12px] text-gray-700 rounded-lg cursor-pointer hover:border-[#1a1a1a] disabled:opacity-40 transition-colors">
                  Save
                </button>
                <button onClick={() => updateStatus('SHIPPED')} disabled={updating || !tracking}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4a6741] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-green-800 disabled:opacity-40 transition-colors whitespace-nowrap">
                  <Truck size={13} /> Mark Shipped
                </button>
              </div>
            </div>

            {/* Tracking link */}
            {order.trackingNumber && (
              <div className="bg-[#f8f6f1] rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold tracking-widest uppercase mb-1">Current Tracking</p>
                  <p className="text-[13px] font-mono text-[#1a1a1a] font-semibold">{order.trackingNumber}</p>
                  {order.courier && (
                    <p className="text-[11px] text-gray-400 mt-0.5 capitalize">
                      via {COURIERS.find(c => c.code === order.courier)?.name ?? order.courier}
                    </p>
                  )}
                </div>
                {(() => {
                  const savedCourier = COURIERS.find(c => c.code === order.courier)
                  const url = savedCourier ? savedCourier.url(order.trackingNumber) : ''
                  return url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-lg no-underline hover:bg-gray-800 transition-colors whitespace-nowrap">
                      <ExternalLink size={13} /> Track Package
                    </a>
                  ) : null
                })()}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Package size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Items ({order.items?.length})
            </h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-14 h-14 bg-[#f5f2ed] overflow-hidden rounded-lg shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={20} strokeWidth={1} className="text-gray-300" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.size} · {item.color} × {item.quantity}</p>
                  </div>
                  <p className="text-[14px] font-semibold text-[#1a1a1a] shrink-0">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <Mail size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Customer
            </h2>
            <p className="text-[13px] font-medium text-[#1a1a1a]">{order.email}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Paid via <span className="capitalize font-medium text-gray-600">{order.paymentMethod?.toLowerCase()}</span>
            </p>
          </div>

          {/* Shipping address */}
          {order.addresses?.[0] && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                <MapPin size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Shipping Address
              </h2>
              <div className="text-[13px] text-gray-600 leading-relaxed">
                <p className="font-medium text-[#1a1a1a]">{order.addresses[0].firstName} {order.addresses[0].lastName}</p>
                <p>{order.addresses[0].street}</p>
                <p>{order.addresses[0].city}, {order.addresses[0].state} {order.addresses[0].zip}</p>
                <p>{order.addresses[0].country}</p>
              </div>
            </div>
          )}

          {/* Payment summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <CreditCard size={14} strokeWidth={1.5} className="text-[#c8a882]" /> Payment
            </h2>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{Number(order.shippingCost) === 0 ? 'Free' : `$${Number(order.shippingCost).toFixed(2)}`}</span></div>
              <div className="flex justify-between text-gray-500"><span>Tax</span><span>${Number(order.tax).toFixed(2)}</span></div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-[#4a6741]">
                  <span>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-[#1a1a1a] border-t border-gray-100 pt-2 text-[15px]">
                <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
            {order.stripePaymentId && <p className="text-[10px] text-gray-400 mt-3 font-mono break-all">Stripe: {order.stripePaymentId}</p>}
            {order.paypalOrderId   && <p className="text-[10px] text-gray-400 mt-1  font-mono break-all">PayPal: {order.paypalOrderId}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}