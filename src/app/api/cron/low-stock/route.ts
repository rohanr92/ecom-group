// src/app/api/cron/low-stock/route.ts
// Daily check for low stock variants → emails admin if any are running low

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, sendLowStockAlert } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

const LOW_STOCK_THRESHOLD = 5  // Alert when inventory <= this number

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.LOW_STOCK_CRON_SECRET}`
  if (!process.env.LOW_STOCK_CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const lowVariants = await prisma.productVariant.findMany({
      where: { inventory: { lte: LOW_STOCK_THRESHOLD } },
      include: { product: { select: { name: true } } },
      orderBy: { inventory: 'asc' },
    })

    if (lowVariants.length === 0) {
      return NextResponse.json({ ok: true, message: 'No low stock items', count: 0 })
    }

    const items = lowVariants.map((v) => ({
      product: v.product?.name ?? 'Unknown',
      sku: v.sku,
      size: v.size,
      color: v.color,
      inventory: v.inventory,
    }))

    // Override the recipient to use ADMIN_NOTIFICATION_EMAIL
    const ADMIN_TO = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'support@solomonlawrencegroup.com'
    process.env.ADMIN_EMAIL = ADMIN_TO  // ensure sendLowStockAlert uses our admin email

    await sendEmail(() => sendLowStockAlert({ items }))

    return NextResponse.json({
      ok: true,
      count: lowVariants.length,
      threshold: LOW_STOCK_THRESHOLD,
      items: items.map((i) => `${i.sku} (${i.inventory})`),
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}