'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Package, Search, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState('')
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [order,    setOrder]    = useState<any>(null)
  const [error,    setError]    = useState('')

  const handleTrack = async () => {
    if (!orderNum.trim() || !email.trim()) {
      setError('Please enter both your order number and email address.')
      return
    }
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNum.trim())}&email=${encodeURIComponent(email.trim())}`)
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? 'Order not found. Please check your order number and email.')
      } else {
        setOrder(data.order)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const getSteps = (status: string) => {
    const steps = [
      { label: 'Order Confirmed',    key: 'CONFIRMED' },
      { label: 'Processing',         key: 'PROCESSING' },
      { label: 'Shipped',            key: 'SHIPPED' },
      { label: 'Out for Delivery',   key: 'OUT_FOR_DELIVERY' },
      { label: 'Delivered',          key: 'DELIVERED' },
    ]
    const order = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
    const currentIdx = order.indexOf(status)
    return steps.map((s, i) => ({
      ...s,
      done: i <= currentIdx,
      active: i === currentIdx,
    }))
  }

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <div style={{ background: 'var(--color-cream)', borderBottom: '1px solid #e8e4de', padding: '48px 0 40px' }}>
          <div className="max-container" style={{ padding: '0 clamp(16px,4vw,60px)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '12px' }}>Solomon & Sage</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-charcoal)', margin: 0 }}>Track Your Order</h1>
          </div>
        </div>

        <div className="max-container" style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,60px)', maxWidth: '600px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.7, marginBottom: '36px' }}>
            Enter your order number and email address to track your shipment. Your order number can be found in your confirmation email.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-charcoal)', display: 'block', marginBottom: '8px' }}>Order Number</label>
              <input value={orderNum} onChange={e => setOrderNum(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                placeholder="e.g. SL-123456"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-charcoal)', display: 'block', marginBottom: '8px' }}>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleTrack} disabled={loading}
              style={{ padding: '14px', background: 'var(--color-charcoal)', color: '#fff', border: 'none', fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Searching...' : <><Search size={14} /> Track Order</>}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', marginTop: '16px' }}>
              <AlertCircle size={16} color="#dc2626" />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Order Result */}
          {order && (
            <div style={{ border: '1px solid #e8e4de', padding: '28px', marginTop: '32px' }}>
              {/* Order header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f0ece6' }}>
                <Package size={20} strokeWidth={1.5} color="var(--color-accent)" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal)', margin: 0 }}>Order {order.orderNumber}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)', margin: '2px 0 0' }}>Placed {formatDate(order.createdAt)}</p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 10px', fontWeight: 600,
                  background: order.status === 'DELIVERED' ? '#dcfce7' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                  color: order.status === 'DELIVERED' ? '#166534' : order.status === 'CANCELLED' ? '#991b1b' : '#92400e',
                }}>
                  {order.status}
                </span>
              </div>

              {/* Tracking info */}
              {order.trackingNumber && (
                <div style={{ padding: '12px 16px', background: '#f8f6f1', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-mid)', margin: '0 0 2px' }}>Tracking Number</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal)', margin: 0 }}>{order.trackingNumber}</p>
                    {order.courier && <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)', margin: '2px 0 0' }}>{order.courier}</p>}
                  </div>
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-charcoal)', textDecoration: 'underline' }}>
                      Track →
                    </a>
                  )}
                </div>
              )}

              {/* Status steps */}
              {order.status !== 'CANCELLED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {getSteps(order.status).map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {step.done
                        ? <CheckCircle size={16} color="#4a6741" />
                        : step.active
                          ? <Clock size={16} color="var(--color-accent)" />
                          : <Clock size={16} color="#ddd" />
                      }
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: step.done ? 'var(--color-charcoal)' : '#aaa', fontWeight: step.active ? 600 : step.done ? 500 : 400, margin: 0, flex: 1 }}>
                        {step.label}
                      </p>
                      {step.active && <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current</span>}
                    </div>
                  ))}
                </div>
              )}

              {order.status === 'CANCELLED' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#fef2f2' }}>
                  <XCircle size={16} color="#dc2626" />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#dc2626', margin: 0 }}>This order has been cancelled.</p>
                </div>
              )}

              {/* Order items */}
              {order.items?.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0ece6' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '12px' }}>Items</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {order.items.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-charcoal)', margin: 0 }}>{item.productName}</p>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)', margin: '2px 0 0' }}>
                            {[item.size, item.color].filter(Boolean).join(' · ')} × {item.quantity}
                          </p>
                        </div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-charcoal)', margin: 0 }}>${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #f0ece6', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal)', margin: 0 }}>Total</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal)', margin: 0 }}>${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}