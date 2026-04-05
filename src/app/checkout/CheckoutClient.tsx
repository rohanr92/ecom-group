// Save as: src/app/checkout/page.tsx (REPLACE existing)
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Navbar from '@/components/Navbar'
import { useCart } from '@/components/CartContext'
import {
  Truck, Gift, Mail, Lock, Check, CreditCard,
  ChevronDown, Info, Package, MapPin, MessageCircle,
  ShieldCheck, Tag, Loader2, ArrowLeft
} from 'lucide-react'

// ── Stripe setup ──────────────────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Styles ────────────────────────────────────────────────────────
const inp = "w-full px-3 py-2.5 border border-gray-300 text-[13px] text-[#1a1a1a] tracking-wide outline-none focus:border-[#1a1a1a] transition-colors bg-white placeholder:text-gray-300"
const lbl = "block text-[11px] text-gray-500 tracking-wide mb-1"
const req = <span className="text-red-500 ml-0.5">*</span>

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

const DELIVERY_OPTIONS = [
  { id: 'standard',  label: 'Standard Shipping', eta: 'Arrives in 5–7 business days', price: 0   },
  { id: 'express',   label: 'Express Shipping',   eta: 'Arrives in 2–3 business days', price: 22  },
  { id: 'overnight', label: 'Overnight Shipping',  eta: 'Arrives next business day',    price: 38  },
]

// ── Inner Stripe form (must be inside <Elements>) ─────────────────
function StripeForm({
  amount, orderData, onSuccess, onError,
}: {
  amount: number
  orderData: any
  onSuccess: (orderNumber: string) => void
  onError:   (msg: string) => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
 
  const handlePay = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    try {
      // Step 1 — validate the payment element fields
      const { error: submitErr } = await elements.submit()
      if (submitErr) {
        onError(submitErr.message ?? 'Please check your card details')
        setLoading(false)
        return
      }
 
      // Step 2 — confirm payment with Stripe FIRST (charges the card)
      const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              email: orderData.email,
              name:  `${orderData.address?.firstName} ${orderData.address?.lastName}`,
              address: {
                line1:       orderData.address?.street,
                city:        orderData.address?.city,
                state:       orderData.address?.state,
                postal_code: orderData.address?.zip,
                country:     'US',
              },
            },
          },
          // No return_url — we handle redirect ourselves
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: 'if_required', // stay on page if possible
      })
 
      // Step 3 — if Stripe charge failed, stop here — do NOT save order
      if (confirmErr) {
        onError(confirmErr.message ?? 'Payment failed. Please try a different card.')
        setLoading(false)
        return
      }
 
      // Step 4 — payment succeeded → now save order to DB
      if (paymentIntent?.status === 'succeeded') {
        const orderRes  = await fetch('/api/orders/create', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            ...orderData,
            paymentMethod:   'STRIPE',
            stripePaymentId: paymentIntent.id, // pass real Stripe ID for verification
          }),
        })
        const orderJson = await orderRes.json()
 
        if (!orderRes.ok) {
          onError(orderJson.error ?? 'Payment succeeded but order failed to save. Contact support.')
          setLoading(false)
          return
        }
 
        onSuccess(orderJson.orderNumber)
      } else {
        onError('Payment was not completed. Please try again.')
      }
 
    } catch (err: any) {
      onError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        onClick={handlePay}
        disabled={loading || !stripe}
        className="w-full h-12 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-widest uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 size={14} className="animate-spin" /> Processing...</>
          : <><Lock size={13} strokeWidth={1.5} /> Pay ${amount.toFixed(2)}</>
        }
      </button>
      <p className="text-center text-[10px] text-gray-400 tracking-wide">
        🔒 Secured by Stripe — your card is charged only after verification
      </p>
    </div>
  )
}

// ── Main Checkout Page ────────────────────────────────────────────
export default function CheckoutClient({ initialUser }: { initialUser: any }) {
  const { items, totalPrice, totalCount, clearCart } = useCart()

  // Steps
  const [step, setStep] = useState<'address' | 'payment'>('address')

  // Order success
  const [orderPlaced, setOrderPlaced]   = useState(false)
  const [orderNumber, setOrderNumber]   = useState('')

  // Address form
  const [addr, setAddr] = useState({
    email: '', firstName: '', lastName: '', street: '', street2: '',
    city: '', state: '', zip: '', country: 'United States', phone: '',
    isPOBox: false,
  })
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({})

  // Delivery
  const [deliveryId, setDeliveryId] = useState('standard')
  const delivery = DELIVERY_OPTIONS.find(d => d.id === deliveryId)!

  // Promo
  const [promoOpen,    setPromoOpen]    = useState(false)
  const [promoCode,    setPromoCode]    = useState('')
  const [promoResult,  setPromoResult]  = useState<{ discount: number; code: string } | null>(null)
  const [promoError,   setPromoError]   = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  // Gift
  const [giftOpen, setGiftOpen] = useState(false)
  const [giftMsg,  setGiftMsg]  = useState('')

  // Donation
  const [donation, setDonation] = useState<number | null>(null)

  // Payment method
  const [payMethod, setPayMethod] = useState<'stripe' | 'paypal'>('stripe')

  // Stripe clientSecret
  const [clientSecret,    setClientSecret]    = useState<string | null>(null)
  const [clientSecretErr, setClientSecretErr] = useState('')
  const [paypalLoading,   setPaypalLoading]   = useState(false)
  const [paymentError,    setPaymentError]    = useState('')
const [user, setUser] = useState<any>(initialUser)
  const [userLoading, setUserLoading] = useState(false)

  useEffect(() => {
    if (initialUser) {
      setAddr(p => ({
        ...p,
        email:     initialUser.email     ?? p.email,
        firstName: initialUser.firstName ?? p.firstName,
        lastName:  initialUser.lastName  ?? p.lastName,
      }))
    }
  }, [])

  // ── Computed totals ─────────────────────────────────────────────
  const discount    = promoResult?.discount ?? 0
  const tax         = (totalPrice - discount) * 0.08
  const donationAmt = donation ?? 0
  const orderTotal  = totalPrice - discount + delivery.price + tax + donationAmt

  // ── Fetch Stripe clientSecret when reaching payment step ────────
  useEffect(() => {
    if (step !== 'payment' || payMethod !== 'stripe' || clientSecret) return
    ;(async () => {
      try {
        const res  = await fetch('/api/stripe/payment-intent', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            amount: orderTotal,
            metadata: {
              email: addr.email,
              name:  `${addr.firstName} ${addr.lastName}`,
              city:  addr.city,
              items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, qty: i.quantity }))),
            },
          }),
        })
        const data = await res.json()
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setClientSecretErr(data.error ?? 'Failed to initialize payment')
        }
      } catch (err: any) {
        setClientSecretErr(err.message)
      }
    })()
  }, [step, payMethod, orderTotal])

  // ── Validate address ────────────────────────────────────────────
  const validateAddr = () => {
    const e: Record<string, string> = {}
    if (!addr.email)     e.email     = 'Required'
    if (!addr.firstName) e.firstName = 'Required'
    if (!addr.lastName)  e.lastName  = 'Required'
    if (!addr.street)    e.street    = 'Required'
    if (!addr.city)      e.city      = 'Required'
    if (!addr.state)     e.state     = 'Required'
    if (!addr.zip)       e.zip       = 'Required'
    if (!addr.phone)     e.phone     = 'Required'
    setAddrErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Validate promo ──────────────────────────────────────────────
  const applyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res  = await fetch('/api/promo/validate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: promoCode, orderTotal: totalPrice }),
      })
      const data = await res.json()
      if (res.ok) {
        setPromoResult({ discount: data.discount, code: data.code })
      } else {
        setPromoError(data.error ?? 'Invalid promo code')
        setPromoResult(null)
      }
    } catch {
      setPromoError('Failed to validate promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  // ── PayPal handler ──────────────────────────────────────────────
   const handlePayPal = async () => {
    setPaypalLoading(true)
    setPaymentError('')
    try {
      // 1. Create PayPal order → get approveUrl
      const ppRes  = await fetch('/api/paypal/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount: orderTotal }),
      })
      const ppData = await ppRes.json()
 
      if (!ppRes.ok || !ppData.orderId) {
        setPaymentError(ppData.error ?? 'Failed to connect to PayPal')
        setPaypalLoading(false)
        return
      }
 
      // 2. Save order to DB with PENDING status before redirecting
      const orderRes  = await fetch('/api/orders/create-pending', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...buildOrderData(),
          paymentMethod: 'PAYPAL',
          paypalOrderId: ppData.orderId,
          status:        'PENDING',
        }),
      })
      const orderJson = await orderRes.json()
 
      if (!orderRes.ok) {
        setPaymentError(orderJson.error ?? 'Failed to save order')
        setPaypalLoading(false)
        return
      }
 
      // 3. Redirect to PayPal approval page
      // PayPal will redirect back to /api/paypal/capture-order after approval
      window.location.href = ppData.approveUrl
 
    } catch (err: any) {
      setPaymentError(err.message ?? 'Something went wrong with PayPal')
      setPaypalLoading(false)
    }
  }

  // ── Build orderData object ──────────────────────────────────────
  const buildOrderData = () => ({
    email:        addr.email,
    items:        items.map(i => ({
      id:        i.id,
      name:      i.name,
      size:      i.size,
      color:     i.color,
      image:     i.image,
      price:     i.price,
      quantity:  i.quantity,
      variantId: `${i.id}-${i.size}-${i.color}`,
      sku:       `${i.id}-${i.size}-${i.color}`,
    })),
    address: {
      firstName: addr.firstName,
      lastName:  addr.lastName,
      street:    addr.street,
      street2:   addr.street2,
      city:      addr.city,
      state:     addr.state,
      zip:       addr.zip,
      country:   addr.country,
      phone:     addr.phone,
    },
    subtotal:     totalPrice,
    shippingCost: delivery.price,
    tax,
    discount,
    total:        orderTotal,
    promoCode:    promoResult?.code ?? null,
    notes:        giftMsg || null,
  })

  // ── Success screen ──────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#4a6741] flex items-center justify-center mx-auto mb-6">
              <Check size={30} strokeWidth={2.5} className="text-white" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl italic font-light text-[#1a1a1a] mb-2">
              Order Confirmed!
            </h1>
            <p className="text-[13px] text-gray-500 tracking-wide mb-1">
              Thank you, <span className="text-[#1a1a1a] font-medium">{addr.firstName}</span>.
            </p>
            <p className="text-[13px] text-gray-500 tracking-wide mb-8">
              Confirmation sent to <span className="text-[#1a1a1a]">{addr.email}</span>
            </p>
            <div className="bg-[#f8f6f1] border border-gray-100 px-6 py-5 mb-8">
              <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">Order Number</p>
              <p className="font-[family-name:var(--font-display)] text-2xl italic font-light text-[#1a1a1a]">
                {orderNumber}
              </p>
              <p className="text-[11px] text-gray-400 tracking-wide mt-2">{delivery.eta}</p>
            </div>
            <Link href="/"
              className="flex items-center justify-center w-full h-12 bg-[#1a1a1a] text-white text-xs tracking-widest uppercase no-underline hover:bg-gray-800 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── Step progress ── */}
      <div className="border-b border-gray-100 py-4 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-0">
          {[
            { key: 'address', label: 'Address',  icon: <MapPin size={13} strokeWidth={1.5} /> },
            { key: 'payment', label: 'Payment',  icon: <CreditCard size={13} strokeWidth={1.5} /> },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all
                  ${s.key === step
                    ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                    : step === 'payment' && s.key === 'address'
                      ? 'border-[#4a6741] bg-[#4a6741] text-white'
                      : 'border-gray-300 bg-white text-gray-300'}`}>
                  {step === 'payment' && s.key === 'address'
                    ? <Check size={12} strokeWidth={2.5} />
                    : s.icon}
                </div>
                <span className={`text-[10px] tracking-widest uppercase ${s.key === step ? 'text-[#1a1a1a] font-semibold' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < 1 && <div className={`w-24 md:w-40 h-px mx-3 mb-5 ${step === 'payment' ? 'bg-[#4a6741]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-3 space-y-4">

              {/* ══ STEP 1: ADDRESS ════════════════════════════════ */}
              {step === 'address' && (
                <>
                  {/* Sign in prompt — guests only */}
                  {!userLoading && !user && (
                    <div className="bg-white border border-gray-200 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide mb-0.5">Already Have an Account?</p>
                        <p className="text-[12px] text-gray-500 tracking-wide">Sign in for a faster checkout.</p>
                      </div>
                      <Link href="/account"
                        className="px-6 py-2.5 border border-[#1a1a1a] text-[#1a1a1a] text-[11px] font-semibold tracking-widest uppercase no-underline hover:bg-[#1a1a1a] hover:text-white transition-colors whitespace-nowrap">
                        Sign In
                      </Link>
                    </div>
                  )}
                  {/* Guest form */}
                  <div className="bg-white border border-gray-200">
                    <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                      <p className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Contact & Shipping</p>
                    </div>
                    <div className="px-5 py-5 space-y-3">

                      {/* Email */}
                      <div>
                        <label className={lbl}>Email Address{req}</label>
                        <input type="email" value={addr.email}
                          onChange={e => setAddr(p => ({ ...p, email: e.target.value }))}
                          placeholder="you@example.com"
                          className={`${inp} ${addrErrors.email ? 'border-red-400' : ''}`} />
                        {addrErrors.email && <p className="text-red-500 text-[11px] mt-0.5">{addrErrors.email}</p>}
                      </div>

                      {/* Name */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>First Name{req}</label>
                          <input value={addr.firstName}
                            onChange={e => setAddr(p => ({ ...p, firstName: e.target.value }))}
                            className={`${inp} ${addrErrors.firstName ? 'border-red-400' : ''}`} />
                          {addrErrors.firstName && <p className="text-red-500 text-[11px] mt-0.5">{addrErrors.firstName}</p>}
                        </div>
                        <div>
                          <label className={lbl}>Last Name{req}</label>
                          <input value={addr.lastName}
                            onChange={e => setAddr(p => ({ ...p, lastName: e.target.value }))}
                            className={`${inp} ${addrErrors.lastName ? 'border-red-400' : ''}`} />
                          {addrErrors.lastName && <p className="text-red-500 text-[11px] mt-0.5">{addrErrors.lastName}</p>}
                        </div>
                      </div>

                      {/* Country */}
                      <div>
                        <label className={lbl}>Country{req}</label>
                        <select value={addr.country}
                          onChange={e => setAddr(p => ({ ...p, country: e.target.value }))}
                          className={inp}>
                          {['United States','Canada','United Kingdom','Australia','Bangladesh','Other'].map(c =>
                            <option key={c}>{c}</option>)}
                        </select>
                      </div>

                      {/* Street */}
                      <div>
                        <label className={lbl}>Street Address{req}</label>
                        <input value={addr.street}
                          onChange={e => setAddr(p => ({ ...p, street: e.target.value }))}
                          placeholder="123 Main Street"
                          className={`${inp} ${addrErrors.street ? 'border-red-400' : ''}`} />
                        {addrErrors.street && <p className="text-red-500 text-[11px] mt-0.5">{addrErrors.street}</p>}
                      </div>

                      {/* Apt */}
                      <div>
                        <label className={lbl}>Apt, Suite, Unit (optional)</label>
                        <input value={addr.street2}
                          onChange={e => setAddr(p => ({ ...p, street2: e.target.value }))}
                          placeholder="Apartment, suite, unit"
                          className={inp} />
                      </div>

                      {/* PO Box */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={addr.isPOBox}
                          onChange={e => setAddr(p => ({ ...p, isPOBox: e.target.checked }))}
                          className="w-3.5 h-3.5 accent-[#1a1a1a]" />
                        <span className="text-[12px] text-gray-500 tracking-wide">PO Box</span>
                      </label>

                      {/* City / State / Zip */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={lbl}>City{req}</label>
                          <input value={addr.city}
                            onChange={e => setAddr(p => ({ ...p, city: e.target.value }))}
                            className={`${inp} ${addrErrors.city ? 'border-red-400' : ''}`} />
                          {addrErrors.city && <p className="text-red-500 text-[11px] mt-0.5">{addrErrors.city}</p>}
                        </div>
                        <div>
                          <label className={lbl}>State{req}</label>
                          <select value={addr.state}
                            onChange={e => setAddr(p => ({ ...p, state: e.target.value }))}
                            className={`${inp} ${addrErrors.state ? 'border-red-400' : ''}`}>
                            <option value="">Select</option>
                            {US_STATES.map(s => <option key={s}>{s}</option>)}
                          </select>
                          {addrErrors.state && <p className="text-red-500 text-[11px] mt-0.5">{addrErrors.state}</p>}
                        </div>
                        <div>
                          <label className={lbl}>ZIP{req}</label>
                          <input value={addr.zip}
                            onChange={e => setAddr(p => ({ ...p, zip: e.target.value }))}
                            className={`${inp} ${addrErrors.zip ? 'border-red-400' : ''}`} />
                          {addrErrors.zip && <p className="text-red-500 text-[11px] mt-0.5">{addrErrors.zip}</p>}
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className={lbl}>Phone{req}</label>
                        <div className="flex">
                          <span className="px-3 py-2.5 border border-r-0 border-gray-300 bg-gray-50 text-[13px] text-gray-500">+1</span>
                          <input value={addr.phone} type="tel"
                            onChange={e => setAddr(p => ({ ...p, phone: e.target.value }))}
                            placeholder="(XXX) XXX-XXXX"
                            className={`${inp} flex-1 ${addrErrors.phone ? 'border-red-400' : ''}`} />
                        </div>
                        {addrErrors.phone && <p className="text-red-500 text-[11px] mt-0.5">{addrErrors.phone}</p>}
                      </div>

                      {/* Delivery options */}
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-[12px] font-semibold text-[#1a1a1a] tracking-wide mb-3">Shipping Method</p>
                        <div className="space-y-2">
                          {DELIVERY_OPTIONS.map(opt => (
                            <label key={opt.id}
                              className={`flex items-center justify-between px-4 py-3 border cursor-pointer transition-colors
                                ${deliveryId === opt.id ? 'border-[#1a1a1a] bg-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                                  ${deliveryId === opt.id ? 'border-[#1a1a1a]' : 'border-gray-300'}`}>
                                  {deliveryId === opt.id && <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />}
                                </div>
                                <input type="radio" className="sr-only" checked={deliveryId === opt.id}
                                  onChange={() => setDeliveryId(opt.id)} />
                                <div>
                                  <p className="text-[12px] text-[#1a1a1a] font-medium tracking-wide">{opt.label}</p>
                                  <p className="text-[11px] text-[#4a6741] tracking-wide">{opt.eta}</p>
                                </div>
                              </div>
                              <span className="text-[12px] font-medium text-[#1a1a1a]">
                                {opt.price === 0 ? <span className="text-[#4a6741]">Free</span> : `$${opt.price.toFixed(2)}`}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => validateAddr() && setStep('payment')}
                        className="w-full h-12 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-widest uppercase border-none cursor-pointer hover:bg-gray-800 transition-colors mt-2">
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ══ STEP 2: PAYMENT ════════════════════════════════ */}
              {step === 'payment' && (
                <>
                  {/* Address summary */}
                  <div className="bg-white border border-gray-200 px-5 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <MapPin size={13} strokeWidth={1.5} className="text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-[12px] text-gray-500 tracking-wide leading-relaxed">
                          <span className="text-[#1a1a1a] font-medium">{addr.firstName} {addr.lastName}</span>
                          {' · '}{addr.street}, {addr.city}, {addr.state} {addr.zip}
                          {' · '}{delivery.label}
                          {delivery.price > 0 ? ` ($${delivery.price})` : ' (Free)'}
                        </p>
                      </div>
                      <button onClick={() => setStep('address')}
                        className="text-[11px] text-[#1a1a1a] underline bg-transparent border-none cursor-pointer whitespace-nowrap shrink-0 hover:text-gray-500">
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Gift options */}
                  <div className="bg-white border border-gray-200 px-5 py-4">
                    <button onClick={() => setGiftOpen(o => !o)}
                      className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Gift size={14} strokeWidth={1.5} className="text-[#c8a882]" />
                        <span className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Gift Options</span>
                      </div>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${giftOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {giftOpen && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <label className={lbl}>Gift message (optional)</label>
                        <textarea value={giftMsg} onChange={e => setGiftMsg(e.target.value)}
                          placeholder="Add a personal gift message..."
                          className="w-full px-3 py-2 border border-gray-300 text-[12px] outline-none focus:border-[#1a1a1a] transition-colors resize-none h-20 tracking-wide placeholder:text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Contact info recap */}
                  <div className="bg-white border border-gray-200 px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={13} strokeWidth={1.5} className="text-[#c8a882]" />
                      <span className="text-[12px] font-semibold text-[#1a1a1a] tracking-wide">Contact Info</span>
                    </div>
                    <p className="text-[12px] text-gray-500 tracking-wide">{addr.email} · +1 {addr.phone}</p>
                  </div>

                  {/* Payment */}
                  <div className="bg-white border border-gray-200 px-5 py-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard size={14} strokeWidth={1.5} className="text-[#c8a882]" />
                      <h3 className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Payment</h3>
                    </div>

                    {/* Payment method tabs */}
                    <div className="flex mb-4 border border-gray-300">
                      <button onClick={() => setPayMethod('stripe')}
                        className={`flex-1 py-2.5 text-[11px] tracking-widest uppercase border-none cursor-pointer transition-colors flex items-center justify-center gap-1.5
                          ${payMethod === 'stripe' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                        <CreditCard size={12} strokeWidth={1.5} /> Credit Card
                      </button>
                      <button onClick={() => setPayMethod('paypal')}
                        className={`flex-1 py-2.5 text-[11px] tracking-widest uppercase border-none cursor-pointer transition-colors
                          ${payMethod === 'paypal' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                        <span className="font-black">Pay</span><span className="font-black">Pal</span>
                      </button>
                    </div>

                    {/* Payment error */}
                    {paymentError && (
                      <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[12px] tracking-wide">
                        {paymentError}
                      </div>
                    )}

                    {/* ── Stripe ── */}
                    {payMethod === 'stripe' && (
                      <>
                        {clientSecretErr && (
                          <p className="text-red-500 text-[12px] mb-3">{clientSecretErr}</p>
                        )}
                        {!clientSecret && !clientSecretErr && (
                          <div className="flex items-center justify-center py-8 gap-2 text-gray-400 text-[12px]">
                            <Loader2 size={16} className="animate-spin" /> Loading payment form...
                          </div>
                        )}
                        {clientSecret && (
                          <Elements
                            stripe={stripePromise}
                            options={{
                              clientSecret,
                              appearance: {
                                theme: 'stripe',
                                variables: {
                                  colorPrimary:    '#1a1a1a',
                                  colorBackground: '#ffffff',
                                  colorText:       '#1a1a1a',
                                  colorDanger:     '#c0392b',
                                  borderRadius:    '0px',
                                  fontSizeBase:    '13px',
                                },
                              },
                            }}
                          >
                            <StripeForm
                              amount={orderTotal}
                              orderData={buildOrderData()}
                              onSuccess={(num) => {
                                clearCart()
                                setOrderNumber(num)
                                setOrderPlaced(true)
                              }}
                              onError={(msg) => setPaymentError(msg)}
                            />
                          </Elements>
                        )}
                      </>
                    )}

                    {/* ── PayPal ── */}
                    {payMethod === 'paypal' && (
                      <div className="space-y-3">
                        <p className="text-[12px] text-gray-500 tracking-wide text-center py-2">
                          You'll be redirected to PayPal to complete your payment securely.
                        </p>
                        <button onClick={handlePayPal} disabled={paypalLoading}
                          className="w-full h-12 bg-[#ffc439] border border-[#f0b429] text-[#003087] font-bold cursor-pointer hover:brightness-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {paypalLoading
                            ? <Loader2 size={16} className="animate-spin text-[#003087]" />
                            : <><span className="font-black text-[#003087] text-[15px]">Pay</span><span className="font-black text-[#0070ba] text-[15px]">Pal</span></>
                          }
                        </button>
                        <p className="text-center text-[10px] text-gray-400 tracking-wide">
                          🔒 Secured by PayPal — Pay in 4 interest-free installments available
                        </p>
                      </div>
                    )}



                    {/* Donation */}
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="flex items-start gap-2 mb-3">
                        <ShieldCheck size={13} strokeWidth={1.5} className="text-[#c8a882] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[12px] font-semibold text-[#1a1a1a] tracking-wide">Solomon Lawrence Cares</p>
                          <p className="text-[11px] text-gray-400 tracking-wide">Support sustainable fashion initiatives</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 5, 15, 25].map(amt => (
                          <button key={amt} onClick={() => setDonation(donation === amt ? null : amt)}
                            className={`py-2 text-[11px] tracking-wide border transition-colors cursor-pointer
                              ${donation === amt ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-[#1a1a1a]'}`}>
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── RIGHT: Order Summary ── */}
{/* ── RIGHT: Order Summary ── */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 sticky top-24">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-[12px] font-semibold tracking-widest uppercase text-[#1a1a1a]">
                    Order Summary ({totalCount} items)
                  </h2>
                </div>

                {/* Items */}
                <div className="px-5 py-4 space-y-3 max-h-56 overflow-y-auto border-b border-gray-100">
                  {items.length === 0
                    ? <p className="text-[12px] text-gray-400 tracking-wide">Your bag is empty.</p>
                    : items.map(item => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                        <div className="relative shrink-0">
                          <div className="w-14 aspect-[3/4] overflow-hidden bg-[#f5f2ed]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[9px] font-bold flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-[#1a1a1a] leading-snug tracking-wide truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400 tracking-wide">{item.size} · {item.color}</p>
                        </div>
                        <p className="text-[12px] text-[#1a1a1a] font-medium shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))
                  }
                </div>

                {/* Promo code */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex gap-2">
                    <input
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value); setPromoError('') }}
                      placeholder="Promo code"
                      disabled={!!promoResult}
                      className="flex-1 px-3 py-2 text-[12px] border border-gray-300 outline-none focus:border-[#1a1a1a] tracking-wide placeholder:text-gray-300 disabled:bg-gray-50"
                    />
                    <button
                      onClick={applyPromo}
                      disabled={promoLoading || !!promoResult}
                      className="px-4 py-2 bg-[#1a1a1a] text-white text-[11px] tracking-widest uppercase border-none cursor-pointer hover:bg-gray-800 shrink-0 disabled:opacity-50"
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="text-red-500 text-[11px] mt-1">{promoError}</p>}
                  {promoResult && (
                    <div className="mt-2 flex items-center justify-between text-[12px]">
                      <span className="text-[#4a6741]">✓ {promoResult.code} applied!</span>
                      <button
                        onClick={() => { setPromoResult(null); setPromoCode('') }}
                        className="text-gray-400 underline bg-transparent border-none cursor-pointer text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="px-5 py-4 space-y-2.5 text-[13px]">
                  <div className="flex justify-between text-gray-500 tracking-wide">
                    <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
                  </div>
                  {promoResult && (
                    <div className="flex justify-between text-[#4a6741] tracking-wide">
                      <span>Promo ({promoResult.code})</span>
                      <span>-${promoResult.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 tracking-wide">
                    <span>Shipping</span>
                    <span className={delivery.price === 0 ? 'text-[#4a6741]' : ''}>
                      {delivery.price === 0 ? 'Free' : `$${delivery.price.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 tracking-wide">
                    <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  {donation && (
                    <div className="flex justify-between text-gray-500 tracking-wide">
                      <span>Donation</span><span>${donation.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline border-t border-gray-100 pt-3 mt-1">
                    <span className="text-[13px] font-semibold tracking-widest uppercase text-[#1a1a1a]">Total</span>
                    <span className="font-[family-name:var(--font-display)] text-xl font-light text-[#1a1a1a]">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Chat */}
                <div className="px-5 pb-5 border-t border-gray-100 pt-3 text-center">
                  <p className="text-[11px] text-gray-500 tracking-wide mb-1.5">Questions about your order?</p>
                  <button className="flex items-center justify-center gap-1.5 mx-auto text-[11px] text-[#1a1a1a] tracking-wide bg-transparent border-none cursor-pointer hover:underline">
                    <MessageCircle size={12} strokeWidth={1.5} /> Chat with us
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="bg-white border-t border-gray-100 py-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-5 flex-wrap">
            {['Shipping & Delivery','Returns & Exchanges','Privacy Policy'].map(l => (
              <Link key={l} href="#" className="text-[11px] text-gray-400 tracking-wide hover:text-[#1a1a1a] no-underline">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} strokeWidth={1.5} className="text-[#4a6741]" />
            <span className="text-[11px] text-gray-400 tracking-wide">Secure Checkout</span>
          </div>
        </div>
      </footer>
    </div>
  )
}