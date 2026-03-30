// Save as: src/lib/email.ts (NEW FILE)
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM    = process.env.RESEND_FROM_EMAIL ?? 'Solomon Lawrence <onboarding@resend.dev>'
const SITE    = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const TO_OVERRIDE = process.env.NODE_ENV !== 'production' ? process.env.RESEND_TEST_EMAIL : null

// ── Shared styles ─────────────────────────────────────────────────
const s = {
  body:        'background:#f8f6f1;margin:0;padding:0;font-family:Georgia,serif;',
  container:   'max-width:600px;margin:0 auto;background:#ffffff;',
  header:      'background:#1a1a1a;padding:32px 40px;',
  logo:        'color:#ffffff;font-size:20px;font-weight:700;letter-spacing:4px;text-decoration:none;',
  tagline:     'color:#c8a882;font-size:11px;letter-spacing:3px;margin-top:4px;font-style:italic;',
  content:     'padding:40px;',
  h1:          'font-size:26px;color:#1a1a1a;font-weight:400;font-style:italic;margin:0 0 8px;',
  subtitle:    'font-size:13px;color:#888;letter-spacing:1px;margin:0 0 32px;',
  divider:     'border:none;border-top:1px solid #f0ece4;margin:24px 0;',
  label:       'font-size:10px;color:#999;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;',
  value:       'font-size:14px;color:#1a1a1a;margin:0 0 16px;',
  itemRow:     'display:flex;gap:16px;padding:16px 0;border-bottom:1px solid #f0ece4;',
  itemImg:     'width:70px;height:85px;object-fit:cover;background:#f5f2ed;flex-shrink:0;',
  btn:         'display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:14px 32px;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:24px 0;',
  btnOutline:  'display:inline-block;background:transparent;color:#1a1a1a;text-decoration:none;padding:12px 28px;font-size:11px;letter-spacing:3px;text-transform:uppercase;border:1px solid #1a1a1a;margin:8px 4px;',
  footer:      'background:#f5f2ed;padding:24px 40px;text-align:center;',
  footerText:  'font-size:11px;color:#aaa;letter-spacing:1px;margin:4px 0;',
  statusBadge: (color: string) => `display:inline-block;background:${color};color:#fff;font-size:10px;letter-spacing:2px;padding:4px 12px;text-transform:uppercase;border-radius:2px;`,
  infoBox:     'background:#f8f6f1;padding:20px 24px;margin:20px 0;border-left:3px solid #c8a882;',
  infoBoxGreen:'background:#f0f7f0;padding:20px 24px;margin:20px 0;border-left:3px solid #4a6741;',
}

// ── Email wrapper (shared HTML shell) ─────────────────────────────
function wrap(content: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>Solomon Lawrence</title>
</head>
<body style="${s.body}">
<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" style="padding:24px 16px;">
<div style="${s.container}">

  <!-- Header -->
  <div style="${s.header}">
    <div style="${s.logo}">SOLOMON LAWRENCE</div>
    <div style="${s.tagline}">California Women's Fashion</div>
  </div>

  <!-- Content -->
  <div style="${s.content}">
    ${content}
  </div>

  <!-- Footer -->
  <div style="${s.footer}">
    <p style="${s.footerText}">© ${new Date().getFullYear()} Solomon Lawrence Group LLC. All rights reserved.</p>
    <p style="${s.footerText}">California, United States</p>
    <p style="${s.footerText}">
      <a href="${SITE}" style="color:#999;text-decoration:none;">solomonlawrence.com</a>
      &nbsp;·&nbsp;
      <a href="${SITE}/policies/privacy" style="color:#999;text-decoration:none;">Privacy</a>
      &nbsp;·&nbsp;
      <a href="${SITE}/account/orders" style="color:#999;text-decoration:none;">My Orders</a>
    </p>
  </div>
</div>
</td></tr>
</table>
</body>
</html>`
}

// ── Item rows HTML helper ─────────────────────────────────────────
function itemsHtml(items: any[]): string {
  return items.map(item => `
    <div style="${s.itemRow}">
      <img src="${item.image || ''}" alt="${item.name}" style="${s.itemImg}" />
      <div style="flex:1;">
        <p style="font-size:14px;color:#1a1a1a;margin:0 0 4px;">${item.name}</p>
        <p style="font-size:12px;color:#888;margin:0 0 4px;">${item.size} · ${item.color}</p>
        <p style="font-size:12px;color:#888;margin:0 0 8px;">Qty: ${item.quantity}</p>
        <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">$${(Number(item.price) * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  `).join('')
}

// ══════════════════════════════════════════════════════════════════
// ── EMAIL TEMPLATES ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

// 1. Order Confirmation
export async function sendOrderConfirmation(data: {
  email: string; name: string; orderNumber: string; items: any[];
  subtotal: number; shipping: number; tax: number; discount: number;
  total: number; address: any; paymentMethod: string; orderId: string;
}) {
  const html = wrap(`
    <h1 style="${s.h1}">Thank you for your order.</h1>
    <p style="${s.subtitle}">Order ${data.orderNumber} · Confirmation</p>

    <div style="${s.infoBoxGreen}">
      <p style="margin:0;font-size:13px;color:#4a6741;">
        ✓ &nbsp;We've received your order and are getting it ready.
        You'll receive a shipping confirmation with tracking details soon.
      </p>
    </div>

    <hr style="${s.divider}"/>
    <p style="font-size:16px;font-weight:600;color:#1a1a1a;margin:0 0 16px;">Your Items</p>
    ${itemsHtml(data.items)}

    <hr style="${s.divider}"/>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="font-size:13px;color:#888;padding:4px 0;">Subtotal</td><td align="right" style="font-size:13px;color:#1a1a1a;">$${data.subtotal.toFixed(2)}</td></tr>
      <tr><td style="font-size:13px;color:#888;padding:4px 0;">Shipping</td><td align="right" style="font-size:13px;color:#1a1a1a;">${data.shipping === 0 ? 'Free' : '$' + data.shipping.toFixed(2)}</td></tr>
      <tr><td style="font-size:13px;color:#888;padding:4px 0;">Tax</td><td align="right" style="font-size:13px;color:#1a1a1a;">$${data.tax.toFixed(2)}</td></tr>
      ${data.discount > 0 ? `<tr><td style="font-size:13px;color:#4a6741;padding:4px 0;">Discount</td><td align="right" style="font-size:13px;color:#4a6741;">-$${data.discount.toFixed(2)}</td></tr>` : ''}
      <tr><td style="font-size:15px;color:#1a1a1a;font-weight:700;padding:12px 0 4px;border-top:1px solid #f0ece4;">Total</td><td align="right" style="font-size:15px;color:#1a1a1a;font-weight:700;padding:12px 0 4px;border-top:1px solid #f0ece4;">$${data.total.toFixed(2)}</td></tr>
    </table>

    ${data.address ? `
    <hr style="${s.divider}"/>
    <p style="${s.label}">Shipping To</p>
    <p style="${s.value}">${data.address.firstName} ${data.address.lastName}<br/>
    ${data.address.street}${data.address.street2 ? ', ' + data.address.street2 : ''}<br/>
    ${data.address.city}, ${data.address.state} ${data.address.zip}<br/>
    ${data.address.country}</p>
    ` : ''}

    <center>
      <a href="${SITE}/account/orders/${data.orderId}" style="${s.btn}">View Order Status</a>
    </center>
  `, `Order ${data.orderNumber} confirmed — $${data.total.toFixed(2)}`)

  return resend.emails.send({ from: FROM, to: TO_OVERRIDE ?? data.email, subject: `Order Confirmed — ${data.orderNumber}`, html })
}

// 2. Order Shipped
export async function sendOrderShipped(data: {
  email: string; name: string; orderNumber: string; orderId: string;
  trackingNumber: string; items: any[]; address: any;
}) {
  const html = wrap(`
    <h1 style="${s.h1}">Your order is on its way.</h1>
    <p style="${s.subtitle}">Order ${data.orderNumber} · Shipped</p>

    <div style="${s.infoBoxGreen}">
      <p style="${s.label}">Tracking Number</p>
      <p style="margin:4px 0 0;font-size:18px;color:#1a1a1a;font-weight:600;letter-spacing:2px;">${data.trackingNumber}</p>
    </div>

    <hr style="${s.divider}"/>
    <p style="font-size:16px;font-weight:600;color:#1a1a1a;margin:0 0 16px;">Items Shipped</p>
    ${itemsHtml(data.items)}

    ${data.address ? `
    <hr style="${s.divider}"/>
    <p style="${s.label}">Delivering To</p>
    <p style="${s.value}">${data.address.firstName} ${data.address.lastName}<br/>
    ${data.address.street}<br/>
    ${data.address.city}, ${data.address.state} ${data.address.zip}</p>
    ` : ''}

    <center>
      <a href="${SITE}/account/orders/${data.orderId}" style="${s.btn}">Track Your Order</a>
    </center>

    <p style="font-size:12px;color:#999;text-align:center;margin-top:8px;">
      Delivery usually takes 5–7 business days. Contact us if you have questions.
    </p>
  `, `Your order ${data.orderNumber} has shipped — tracking: ${data.trackingNumber}`)

  return resend.emails.send({ from: FROM, to: TO_OVERRIDE ?? data.email, subject: `Your Order Has Shipped — ${data.orderNumber}`, html })
}

// 3. Order Delivered
export async function sendOrderDelivered(data: {
  email: string; name: string; orderNumber: string; orderId: string; items: any[];
}) {
  const html = wrap(`
    <h1 style="${s.h1}">Your order has been delivered.</h1>
    <p style="${s.subtitle}">Order ${data.orderNumber} · Delivered</p>

    <div style="${s.infoBox}">
      <p style="margin:0;font-size:13px;color:#666;">
        We hope you love your new pieces. If anything isn't quite right,
        you can start a return within 30 days.
      </p>
    </div>

    <hr style="${s.divider}"/>
    ${itemsHtml(data.items)}

    <center>
      <a href="${SITE}/account/orders/${data.orderId}" style="${s.btnOutline}">View Order</a>
      <a href="${SITE}/account/returns" style="${s.btnOutline}">Start a Return</a>
    </center>

    <hr style="${s.divider}"/>
    <p style="font-size:13px;color:#888;text-align:center;">
      Loved your experience? Leave a review on your purchased items.
    </p>
  `, `Your order ${data.orderNumber} has been delivered`)

  return resend.emails.send({ from: FROM, to: TO_OVERRIDE ?? data.email, subject: `Delivered — ${data.orderNumber}`, html })
}

// 4. Order Cancelled
export async function sendOrderCancelled(data: {
  email: string; name: string; orderNumber: string; total: number; reason?: string;
}) {
  const html = wrap(`
    <h1 style="${s.h1}">Your order has been cancelled.</h1>
    <p style="${s.subtitle}">Order ${data.orderNumber} · Cancelled</p>

    <div style="${s.infoBox}">
      <p style="margin:0;font-size:13px;color:#666;">
        Your order <strong>${data.orderNumber}</strong> has been cancelled.
        ${data.reason ? `Reason: ${data.reason}.` : ''}
        If you paid by card or PayPal, your refund of <strong>$${data.total.toFixed(2)}</strong> will appear within 5–10 business days.
      </p>
    </div>

    <center>
      <a href="${SITE}" style="${s.btn}">Continue Shopping</a>
    </center>
  `, `Order ${data.orderNumber} cancelled`)

  return resend.emails.send({ from: FROM, to: TO_OVERRIDE ?? data.email, subject: `Order Cancelled — ${data.orderNumber}`, html })
}

// 5. Return Request Received
export async function sendReturnReceived(data: {
  email: string; name: string; orderNumber: string; reason: string; items: any[];
}) {
  const html = wrap(`
    <h1 style="${s.h1}">Return request received.</h1>
    <p style="${s.subtitle}">Order ${data.orderNumber} · Return Pending</p>

    <div style="${s.infoBox}">
      <p style="margin:0;font-size:13px;color:#666;">
        We've received your return request and will review it within <strong>1–2 business days</strong>.
        You'll receive an email once your return is approved with next steps.
      </p>
    </div>

    <hr style="${s.divider}"/>
    <p style="${s.label}">Reason for Return</p>
    <p style="${s.value}">${data.reason}</p>

    <p style="${s.label}">Items Being Returned</p>
    ${data.items.map((item: any) => `
      <p style="font-size:13px;color:#1a1a1a;margin:4px 0;">
        · ${item.name} — ${item.size}, ${item.color} × ${item.qty}
      </p>
    `).join('')}

    <hr style="${s.divider}"/>
    <p style="font-size:12px;color:#999;">
      Return Policy: Items must be returned within 30 days of delivery, unworn with tags attached.
    </p>
  `, `Return request received for order ${data.orderNumber}`)

  return resend.emails.send({ from: FROM, to: TO_OVERRIDE ?? data.email, subject: `Return Request Received — ${data.orderNumber}`, html })
}

// 6. Return Approved
export async function sendReturnApproved(data: {
  email: string; name: string; orderNumber: string; refundAmount?: number;
}) {
  const html = wrap(`
    <h1 style="${s.h1}">Your return has been approved.</h1>
    <p style="${s.subtitle}">Order ${data.orderNumber} · Return Approved</p>

    <div style="${s.infoBoxGreen}">
      <p style="margin:0;font-size:13px;color:#4a6741;">
        ✓ &nbsp;Your return request has been approved.
        ${data.refundAmount ? `A refund of <strong>$${data.refundAmount.toFixed(2)}</strong> will be processed once we receive the items.` : ''}
      </p>
    </div>

    <hr style="${s.divider}"/>
    <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0 0 12px;">Next Steps</p>
    <p style="font-size:13px;color:#666;margin:4px 0;">1. Pack your items securely in their original packaging if possible.</p>
    <p style="font-size:13px;color:#666;margin:4px 0;">2. Ship items back within <strong>7 days</strong> of this approval.</p>
    <p style="font-size:13px;color:#666;margin:4px 0;">3. Once received, your refund will be processed within 3–5 business days.</p>

    <center>
      <a href="${SITE}/account/returns" style="${s.btn}">View Return Status</a>
    </center>
  `, `Return approved for order ${data.orderNumber}`)

  return resend.emails.send({ from: FROM, to: TO_OVERRIDE ?? data.email, subject: `Return Approved — ${data.orderNumber}`, html })
}

// 7. Welcome / Account Created
export async function sendWelcomeEmail(data: {
  email: string; name: string;
}) {
  const html = wrap(`
    <h1 style="${s.h1}">Welcome to Solomon Lawrence.</h1>
    <p style="${s.subtitle}">Your account has been created</p>

    <p style="font-size:14px;color:#666;line-height:1.8;margin:0 0 24px;">
      Hello ${data.name.split(' ')[0]},<br/><br/>
      Thank you for creating an account with us. You now have access to your
      personal shopping dashboard where you can track orders, manage returns,
      save your favorite pieces, and more.
    </p>

    <hr style="${s.divider}"/>
    <p style="font-size:13px;font-weight:600;color:#1a1a1a;margin:0 0 12px;">What you can do with your account</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${[
        ['📦', 'Track Orders', 'Real-time updates on every order'],
        ['↩️', 'Easy Returns', 'Submit return requests in seconds'],
        ['♡', 'Wishlist', 'Save pieces for later'],
        ['📍', 'Address Book', 'Save multiple shipping addresses'],
      ].map(([icon, title, desc]) => `
        <tr>
          <td width="40" style="padding:8px 0;vertical-align:top;font-size:18px;">${icon}</td>
          <td style="padding:8px 0;">
            <p style="font-size:13px;font-weight:600;color:#1a1a1a;margin:0;">${title}</p>
            <p style="font-size:12px;color:#888;margin:2px 0 0;">${desc}</p>
          </td>
        </tr>
      `).join('')}
    </table>

    <center>
      <a href="${SITE}/account" style="${s.btn}">Go to My Account</a>
    </center>

    <center>
      <a href="${SITE}" style="${s.btnOutline}">Start Shopping</a>
    </center>
  `, `Welcome to Solomon Lawrence, ${data.name.split(' ')[0]}!`)

  return resend.emails.send({ from: FROM, to: TO_OVERRIDE ?? data.email, subject: `Welcome to Solomon Lawrence`, html })
}

// 8. Password Reset
export async function sendPasswordReset(data: {
  email: string; name: string; resetToken: string;
}) {
  const resetUrl = `${SITE}/account/reset-password?token=${data.resetToken}`
  const html = wrap(`
    <h1 style="${s.h1}">Reset your password.</h1>
    <p style="${s.subtitle}">Password Reset Request</p>

    <p style="font-size:14px;color:#666;line-height:1.8;margin:0 0 24px;">
      Hello ${data.name?.split(' ')[0] ?? 'there'},<br/><br/>
      We received a request to reset your password. Click the button below to
      choose a new password. This link expires in <strong>1 hour</strong>.
    </p>

    <center>
      <a href="${resetUrl}" style="${s.btn}">Reset Password</a>
    </center>

    <hr style="${s.divider}"/>
    <p style="font-size:12px;color:#999;text-align:center;">
      If you didn't request this, you can safely ignore this email.
      Your password will not change.
    </p>
    <p style="font-size:11px;color:#bbb;text-align:center;word-break:break-all;">
      Or copy this link: ${resetUrl}
    </p>
  `, 'Reset your Solomon Lawrence password')

  return resend.emails.send({ from: FROM, to: TO_OVERRIDE ?? data.email, subject: `Reset Your Password — Solomon Lawrence`, html })
}

// 9. New Admin User Invite
export async function sendAdminInvite(data: {
  email: string; name: string; role: string; password: string; invitedBy: string;
}) {
  const html = wrap(`
    <h1 style="${s.h1}">You've been invited to the admin panel.</h1>
    <p style="${s.subtitle}">Solomon Lawrence · Admin Access</p>

    <div style="${s.infoBox}">
      <p style="margin:0;font-size:13px;color:#666;">
        <strong>${data.invitedBy}</strong> has invited you to manage the Solomon Lawrence admin dashboard
        with the role of <strong style="text-transform:capitalize;">${data.role}</strong>.
      </p>
    </div>

    <hr style="${s.divider}"/>
    <p style="${s.label}">Your Login Credentials</p>
    <p style="font-size:13px;color:#1a1a1a;margin:4px 0;"><strong>Email:</strong> ${data.email}</p>
    <p style="font-size:13px;color:#1a1a1a;margin:4px 0;"><strong>Temporary Password:</strong> <code style="background:#f5f2ed;padding:2px 8px;font-size:13px;">${data.password}</code></p>
    <p style="font-size:12px;color:#e05252;margin:12px 0 0;">⚠ Please change your password immediately after logging in.</p>

    <center>
      <a href="${SITE}/admin/login" style="${s.btn}">Access Admin Panel</a>
    </center>
  `, 'You have been invited to Solomon Lawrence admin')

  return resend.emails.send({ from: FROM, to: TO_OVERRIDE ?? data.email, subject: `Admin Access Invitation — Solomon Lawrence`, html })
}

// 10. Low Stock Alert (admin notification)
export async function sendLowStockAlert(data: {
  items: { product: string; sku: string; size: string; color: string; inventory: number }[];
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  const html = wrap(`
    <h1 style="${s.h1}">Low stock alert.</h1>
    <p style="${s.subtitle}">Inventory Warning · Action Required</p>

    <p style="font-size:14px;color:#666;margin:0 0 20px;">
      The following items are running low on inventory and may need restocking soon.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr style="background:#f5f2ed;">
        <th style="text-align:left;padding:10px 12px;font-size:11px;color:#888;letter-spacing:1px;">Product</th>
        <th style="text-align:left;padding:10px 12px;font-size:11px;color:#888;letter-spacing:1px;">SKU</th>
        <th style="text-align:left;padding:10px 12px;font-size:11px;color:#888;letter-spacing:1px;">Variant</th>
        <th style="text-align:right;padding:10px 12px;font-size:11px;color:#888;letter-spacing:1px;">Stock</th>
      </tr>
      ${data.items.map(item => `
        <tr style="border-bottom:1px solid #f0ece4;">
          <td style="padding:12px;font-size:13px;color:#1a1a1a;">${item.product}</td>
          <td style="padding:12px;font-size:12px;color:#888;font-family:monospace;">${item.sku}</td>
          <td style="padding:12px;font-size:12px;color:#888;">${item.size} · ${item.color}</td>
          <td style="padding:12px;text-align:right;font-size:13px;font-weight:700;color:${item.inventory === 0 ? '#e05252' : '#e08a00'};">
            ${item.inventory === 0 ? 'OUT OF STOCK' : `${item.inventory} left`}
          </td>
        </tr>
      `).join('')}
    </table>

    <center>
      <a href="${SITE}/admin/inventory" style="${s.btn}">Update Inventory</a>
    </center>
  `, `${data.items.length} items are low on stock`)

  return resend.emails.send({ from: FROM, to: adminEmail, subject: `⚠ Low Stock Alert — ${data.items.length} items need restocking`, html })
}

// ── Main send helper (catches errors gracefully) ──────────────────
export async function sendEmail(fn: () => Promise<any>): Promise<void> {
  try {
    const { error } = await fn()
    if (error) console.error('Email send error:', error)
  } catch (err) {
    console.error('Email send failed:', err)
    // Never throw — email failure should not break the main flow
  }
}