// src/app/api/admin/orders/[id]/packing-slip/route.ts
// For Mirakl orders: download PDF from Mirakl (ZIP → unzipped PDF)
// For direct orders: render a printable A4 HTML packing slip
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import JSZip from 'jszip'
import { prisma } from '@/lib/prisma'
import { fetchMiraklBinary } from '@/lib/mirakl/client'

const ADMIN_COOKIE = 'sl_admin_session'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { variant: { select: { sku: true, upc: true } } } },
      addresses: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // MIRAKL PATH: existing PDF download
  if (order.miraklOrderId) {
    try {
      const { buffer } = await fetchMiraklBinary(
        `/v2/orders/${order.miraklOrderId}/documents?types=DELIVERY_SLIP`
      )
      const zip = await JSZip.loadAsync(buffer)
      let pdfFile: JSZip.JSZipObject | null = null
      zip.forEach((relativePath, file) => {
        if (!pdfFile && !file.dir && relativePath.toLowerCase().endsWith('.pdf')) {
          pdfFile = file
        }
      })
      if (!pdfFile) {
        return NextResponse.json({ error: 'No PDF found in packing slip ZIP from Mirakl' }, { status: 404 })
      }
      const pdfBuffer = await (pdfFile as JSZip.JSZipObject).async('arraybuffer')
      const safeOrderNum = (order.orderNumber || order.miraklOrderId).replace(/[^a-zA-Z0-9_-]/g, '_')
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="packing-slip-${safeOrderNum}.pdf"`,
          'Cache-Control': 'private, no-cache',
        },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Mirakl packing slip download error:', msg)
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  // DIRECT ORDER PATH: render printable A4 HTML
  const ship = order.addresses?.find(a => a.type === 'SHIPPING') || order.addresses?.[0]
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const totalQty = order.items.reduce((sum, it) => sum + it.quantity, 0)

  const itemsRows = order.items.map((it, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>
        <div class="prod-name">${escapeHtml(it.name)}</div>
        <div class="prod-meta">
          ${it.color ? `<span>${escapeHtml(it.color)}</span>` : ''}
          ${it.variant?.sku ? `<span>SKU: ${escapeHtml(it.variant.sku)}</span>` : ''}
          ${it.variant?.upc ? `<span>UPC: ${escapeHtml(it.variant.upc)}</span>` : ''}
        </div>
      </td>
      <td class="size">${escapeHtml(it.size || '-')}</td>
      <td class="qty">${it.quantity}</td>
      <td class="check">☐</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Packing Slip - ${escapeHtml(order.orderNumber)}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background: #fff; font-size: 11pt; line-height: 1.5; padding: 8mm; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 24px; }
  .brand-name { font-size: 20pt; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; }
  .doc-title { font-size: 13pt; font-style: italic; color: #4a6741; }
  .meta-row { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
  .meta-block { flex: 1; padding: 12px 16px; border: 1px solid #e5e5e5; border-radius: 4px; }
  .meta-label { font-size: 8pt; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 6px; }
  .meta-value { font-size: 10pt; line-height: 1.5; }
  .section-title { font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #4a6741; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #4a6741; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  thead { background: #f5f3ed; }
  th { text-align: left; padding: 10px 8px; font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; color: #555; border-bottom: 1px solid #1a1a1a; }
  td { padding: 12px 8px; border-bottom: 1px solid #eee; vertical-align: top; font-size: 10pt; }
  .num { width: 24px; color: #999; }
  .size { width: 50px; font-weight: 600; }
  .qty { width: 40px; text-align: center; font-weight: 600; font-size: 12pt; }
  .check { width: 36px; text-align: center; font-size: 16pt; color: #1a1a1a; }
  .prod-name { font-weight: 600; margin-bottom: 4px; }
  .prod-meta { font-size: 9pt; color: #777; display: flex; gap: 12px; flex-wrap: wrap; }
  .totals { margin-top: 16px; text-align: right; font-size: 10pt; }
  .totals strong { font-size: 12pt; }
  .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e5e5; text-align: center; color: #888; font-size: 9pt; font-style: italic; }
  .print-controls { text-align: center; margin-bottom: 16px; }
  .print-controls button { background: #1a1a1a; color: #fff; border: none; padding: 10px 24px; font-size: 11pt; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border-radius: 4px; margin-right: 8px; }
  @media print { .print-controls { display: none !important; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="print-controls">
    <button onclick="window.print()">Print</button>
    <button onclick="window.close()" style="background:#fff;color:#1a1a1a;border:1px solid #ddd;">Close</button>
  </div>
  <div class="header">
    <div class="brand-name">Solomon &amp; Sage</div>
    <div class="doc-title">Packing Slip</div>
  </div>
  <div class="meta-row">
    <div class="meta-block">
      <div class="meta-label">Order Number</div>
      <div class="meta-value"><strong>${escapeHtml(order.orderNumber)}</strong></div>
      <div class="meta-label" style="margin-top:8px;">Order Date</div>
      <div class="meta-value">${orderDate}</div>
    </div>
    ${ship ? `
    <div class="meta-block">
      <div class="meta-label">Ship To</div>
      <div class="meta-value">
        <strong>${escapeHtml(ship.firstName)} ${escapeHtml(ship.lastName)}</strong><br>
        ${escapeHtml(ship.street)}${ship.street2 ? '<br>' + escapeHtml(ship.street2) : ''}<br>
        ${escapeHtml(ship.city)}, ${escapeHtml(ship.state)} ${escapeHtml(ship.zip)}<br>
        ${escapeHtml(ship.country)}
        ${ship.phone ? '<br>' + escapeHtml(ship.phone) : ''}
      </div>
    </div>
    ` : ''}
  </div>
  <div class="section-title">Items to Pack (${order.items.length} ${order.items.length === 1 ? 'item' : 'items'})</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product</th>
        <th>Size</th>
        <th class="qty">Qty</th>
        <th class="check">✓</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>
  <div class="totals">Total items to pack: <strong>${totalQty}</strong></div>
  <div class="footer">Thank you for your order. Questions? support@solomonlawrencegroup.com</div>
  <script>
    window.addEventListener('load', () => { setTimeout(() => window.print(), 300) })
  </script>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-cache',
    },
  })
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
