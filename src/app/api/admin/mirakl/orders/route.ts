// src/app/api/admin/mirakl/orders/route.ts

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('sl_admin_session')?.value
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const filter = url.searchParams.get('filter') || 'all'

  const where: any = { miraklOrderId: { not: null } }

  if (filter === 'needs_review') {
    where.miraklStatus = 'NEEDS_REVIEW'
  } else if (filter === 'auto_accepted') {
    where.miraklStatus = { not: 'NEEDS_REVIEW' }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      _count: { select: { items: true } },
    },
  })

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      miraklOrderId: o.miraklOrderId,
      miraklChannel: o.miraklChannel,
      miraklStatus: o.miraklStatus,
      email: o.email,
      total: o.total.toString(),
      status: o.status,
      packingSlipUrl: o.packingSlipUrl,
      miraklSyncedAt: o.miraklSyncedAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
      itemCount: o._count.items,
    })),
  })
}