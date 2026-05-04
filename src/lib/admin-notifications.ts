// src/lib/admin-notifications.ts
// Sends admin notifications to ADMIN_NOTIFICATION_EMAIL for store events.
// Pattern matches existing email.ts: fire-and-forget, never throws.

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Solomon & Sage <noreply@solomonandsage.com>'
const ADMIN_TO = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'support@solomonlawrencegroup.com'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://solomonandsage.com'

// Shared dark/clean styling consistent with your existing emails
const wrapAdmin = (title: string, content: string) => `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="background:#f8f6f1;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:24px 16px;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #ebe7df;">
  <div style="background:#1a1a1a;padding:24px 32px;">
    <div style="color:#ffffff;font-size:11px;letter-spacing:3px;font-weight:700;">SOLOMON &amp; SAGE</div>
    <div style="color:#c8a882;font-size:11px;letter-spacing:2px;margin-top:6px;font-style:italic;">Admin notification</div>
  </div>
  <div style="padding:28px 32px;">
    <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 18px;font-weight:600;">${title}</h2>
    ${content}
  </div>
  <div style="background:#f5f2ed;padding:16px 32px;text-align:center;font-size:11px;color:#aaa;letter-spacing:1px;">
    Solomon &amp; Sage admin alerts · sent automatically
  </div>
</div>
</td></tr></table>
</body></html>`

const fmt$ = (n: number | string) => `$${Number(n).toFixed(2)}`

// ───────────────────────────────────────────────────────────────────
// Event-specific functions
// ───────────────────────────────────────────────────────────────────

export async function notifyAdminNewOrder(data: {
  orderNumber: string
  orderId: string
  email: string
  total: number | string
  itemCount: number
  isMirakl?: boolean
  miraklChannel?: string | null
}) {
  const channel = data.isMirakl ? `Mirakl${data.miraklChannel ? ` · ${data.miraklChannel}` : ''}` : 'solomonandsage.com'
  const html = wrapAdmin(`🛒 New order — ${data.orderNumber}`, `
    <table width="100%" style="border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:6px 0;color:#888;">Channel</td><td style="padding:6px 0;color:#1a1a1a;font-weight:600;">${channel}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Customer</td><td style="padding:6px 0;color:#1a1a1a;">${data.email}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Items</td><td style="padding:6px 0;color:#1a1a1a;">${data.itemCount}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Total</td><td style="padding:6px 0;color:#1a1a1a;font-weight:700;font-size:16px;">${fmt$(data.total)}</td></tr>
    </table>
    <p style="margin:24px 0 0;"><a href="${SITE}/admin/orders/${data.orderId}" style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;display:inline-block;">Open order</a></p>
  `)
  return resend.emails.send({
    from: FROM, to: ADMIN_TO,
    subject: `🛒 New order ${data.orderNumber} — ${fmt$(data.total)}`,
    html,
  })
}

export async function notifyAdminOrderShipped(data: {
  orderNumber: string
  orderId: string
  email: string
  trackingNumber: string
  courier?: string | null
  isMirakl?: boolean
}) {
  const html = wrapAdmin(`📦 Order shipped — ${data.orderNumber}`, `
    <table width="100%" style="border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:6px 0;color:#888;">Customer</td><td style="padding:6px 0;color:#1a1a1a;">${data.email}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Carrier</td><td style="padding:6px 0;color:#1a1a1a;">${data.courier || 'Other'}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Tracking</td><td style="padding:6px 0;color:#1a1a1a;font-family:monospace;">${data.trackingNumber}</td></tr>
      ${data.isMirakl ? `<tr><td colspan="2" style="padding:6px 0;color:#7c3aed;font-size:12px;">Tracking auto-pushed to Mirakl</td></tr>` : ''}
    </table>
    <p style="margin:24px 0 0;"><a href="${SITE}/admin/orders/${data.orderId}" style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;display:inline-block;">Open order</a></p>
  `)
  return resend.emails.send({
    from: FROM, to: ADMIN_TO,
    subject: `📦 Shipped: ${data.orderNumber}`,
    html,
  })
}

export async function notifyAdminOrderCancelled(data: {
  orderNumber: string
  orderId: string
  email: string
  total: number | string
  reason?: string | null
}) {
  const html = wrapAdmin(`❌ Order cancelled — ${data.orderNumber}`, `
    <table width="100%" style="border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:6px 0;color:#888;">Customer</td><td style="padding:6px 0;color:#1a1a1a;">${data.email}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Total refund</td><td style="padding:6px 0;color:#dc2626;font-weight:700;">${fmt$(data.total)}</td></tr>
      ${data.reason ? `<tr><td style="padding:6px 0;color:#888;">Reason</td><td style="padding:6px 0;color:#1a1a1a;">${data.reason}</td></tr>` : ''}
    </table>
    <p style="margin:16px 0 0;color:#888;font-size:12px;">Inventory has been restored automatically.</p>
    <p style="margin:24px 0 0;"><a href="${SITE}/admin/orders/${data.orderId}" style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;display:inline-block;">Open order</a></p>
  `)
  return resend.emails.send({
    from: FROM, to: ADMIN_TO,
    subject: `❌ Cancelled: ${data.orderNumber} — ${fmt$(data.total)} refund`,
    html,
  })
}

export async function notifyAdminReturnRequested(data: {
  returnId: string
  orderNumber: string
  email: string
  reason: string
}) {
  const html = wrapAdmin(`↩️ Return requested — ${data.orderNumber}`, `
    <table width="100%" style="border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:6px 0;color:#888;">Customer</td><td style="padding:6px 0;color:#1a1a1a;">${data.email}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Order</td><td style="padding:6px 0;color:#1a1a1a;">${data.orderNumber}</td></tr>
      <tr><td style="padding:6px 0;color:#888;vertical-align:top;">Reason</td><td style="padding:6px 0;color:#1a1a1a;">${data.reason}</td></tr>
    </table>
    <p style="margin:24px 0 0;"><a href="${SITE}/admin/orders" style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;display:inline-block;">Review return</a></p>
  `)
  return resend.emails.send({
    from: FROM, to: ADMIN_TO,
    subject: `↩️ Return requested: ${data.orderNumber}`,
    html,
  })
}