// Save as: src/app/api/admin/returns/route.ts (REPLACE existing)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { sendReturnApproved, sendEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where: any = {}
  if (status && status !== 'ALL') where.status = status
  if (search) where.OR = [
    { orderNumber: { contains: search, mode: 'insensitive' } },
    { email:       { contains: search, mode: 'insensitive' } },
  ]

  const returns = await prisma.returnRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { order: { include: { items: true, addresses: true } }, user: true },
  })
  return NextResponse.json({ returns })
}

export async function PATCH(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, status, refundAmount } = await req.json()

    const updated = await prisma.returnRequest.update({
      where: { id },
      data:  { status, ...(refundAmount !== undefined && { refundAmount }) },
    })

    // Send email when approved
    if (status === 'APPROVED') {
      sendEmail(() => sendReturnApproved({
        email:        updated.email,
        name:         updated.email,
        orderNumber:  updated.orderNumber,
        refundAmount: refundAmount ?? undefined,
      }))
    }

    // Mark order refunded when completed
    if (status === 'COMPLETED') {
      await prisma.order.update({ where: { id: updated.orderId }, data: { status: 'REFUNDED' } })
    }

    return NextResponse.json({ return: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}