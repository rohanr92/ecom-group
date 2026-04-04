// Save as: src/app/api/admin/orders/route.ts (REPLACE existing)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { sendOrderShipped, sendOrderDelivered, sendOrderCancelled, sendEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page   = parseInt(searchParams.get('page') ?? '1')
  const limit  = 20

  const where: any = {}
  if (status && status !== 'ALL') where.status = status
  if (search) where.OR = [
    { orderNumber: { contains: search, mode: 'insensitive' } },
    { email:       { contains: search, mode: 'insensitive' } },
  ]

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, take: limit,
      include: { items: true, addresses: true },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) })
}

export async function PATCH(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, status, trackingNumber, courier } = await req.json()

const order = await prisma.order.update({
  where: { id },
  data:  {
    ...(status         && { status }),
    ...(trackingNumber && { trackingNumber }),
    ...(courier        && { courier }),
  },
    })

    // ── Trigger emails based on new status ───────────────────────
    if (status === 'SHIPPED' && trackingNumber) {
      sendEmail(() => sendOrderShipped({
        email:          order.email,
        name:           order.email,
        orderNumber:    order.orderNumber,
        orderId:        order.id,
        trackingNumber,
        items:          order.items,
        address:        order.addresses?.[0] ?? null,
      }))
    }

    if (status === 'DELIVERED') {
      sendEmail(() => sendOrderDelivered({
        email:       order.email,
        name:        order.email,
        orderNumber: order.orderNumber,
        orderId:     order.id,
        items:       order.items,
      }))
    }

    if (status === 'CANCELLED') {
      sendEmail(() => sendOrderCancelled({
        email:       order.email,
        name:        order.email,
        orderNumber: order.orderNumber,
        total:       Number(order.total),
      }))
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}