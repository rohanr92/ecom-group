// src/app/api/admin/orders/route.ts
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
  else if (!status) where.status = { not: 'PENDING' }
  if (search) where.OR = [
    { orderNumber: { contains: search, mode: 'insensitive' } },
    { email:       { contains: search, mode: 'insensitive' } },
  ]

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: { include: { variant: true } },
        addresses: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) })
}

export async function PATCH(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, status, trackingNumber, courier, trackingUrl } = await req.json()

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingNumber && { trackingNumber }),
        ...(courier && { courier }),
        ...(trackingUrl !== undefined && { trackingUrl }),
      },
      include: {
        items: { include: { variant: true } },
        addresses: true,
      },
    })

    // ── Customer email: order shipped ─────────────────────────────
    if (status === 'SHIPPED' && trackingNumber) {
      sendEmail(() => sendOrderShipped({
        email: order.email,
        name: order.email,
        orderNumber: order.orderNumber,
        orderId: order.id,
        trackingNumber,
        items: order.items,
        address: order.addresses?.[0] ?? null,
      }))

      // Admin notification: order shipped
      const { notifyAdminOrderShipped } = await import('@/lib/admin-notifications')
      sendEmail(() => notifyAdminOrderShipped({
        orderNumber: order.orderNumber,
        orderId: order.id,
        email: order.email,
        trackingNumber,
        courier: courier || null,
        isMirakl: !!order.miraklOrderId,
      }))
    }

    // ── Mirakl: push tracking back to Mirakl Connect ──────────────
    if (status === 'SHIPPED' && trackingNumber && order.miraklOrderId) {
      try {
        const { shipOrderOnMirakl } = await import('@/lib/mirakl/sync-orders')
        const raw = order.miraklRawData as any
        const miraklLines: Array<{
          id: string
          offer_sku?: string
          shop_sku?: string
          product_sku?: string
          quantity: number
        }> = raw?.order_lines || []

        const items = order.items
          .map((it: any) => {
            const variantSku: string = it.variant?.sku || ''
            if (!variantSku) return null
            const match = miraklLines.find((ml) =>
              [ml.offer_sku, ml.shop_sku, ml.product_sku].includes(variantSku)
            )
            return {
              orderLineId: match?.id ?? null,
              sku: variantSku,
              quantity: it.quantity,
            }
          })
          .filter((x: any) => x !== null) as Array<{
            orderLineId: string | null
            sku: string
            quantity: number
          }>

        if (items.length > 0) {
          const result = await shipOrderOnMirakl({
            miraklOrderId: order.miraklOrderId,
            trackingNumber,
            carrier: courier || 'Other',
            trackingUrl: trackingUrl || undefined,
            items,
          })

          if (!result.ok) {
            console.error(`[mirakl] Ship notification failed for ${order.miraklOrderId}:`, result.error)
          } else {
            console.log(`[mirakl] Ship notification sent for ${order.miraklOrderId}, action_id=${result.actionId}`)
          }
        }
      } catch (err) {
        console.error('[mirakl] Ship hook error:', err)
      }
    }

    // ── Customer email: order delivered ───────────────────────────
    if (status === 'DELIVERED') {
      sendEmail(() => sendOrderDelivered({
        email: order.email,
        name: order.email,
        orderNumber: order.orderNumber,
        orderId: order.id,
        items: order.items,
      }))
    }

    // ── Order cancelled: customer email + restore inventory + admin email
    if (status === 'CANCELLED') {
      sendEmail(() => sendOrderCancelled({
        email: order.email,
        name: order.email,
        orderNumber: order.orderNumber,
        total: Number(order.total),
      }))

      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: id },
      })
      for (const item of orderItems) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { inventory: { increment: item.quantity } },
          })
        }
      }

      // Admin notification: order cancelled
      const { notifyAdminOrderCancelled } = await import('@/lib/admin-notifications')
      sendEmail(() => notifyAdminOrderCancelled({
        orderNumber: order.orderNumber,
        orderId: order.id,
        email: order.email,
        total: Number(order.total),
      }))
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
