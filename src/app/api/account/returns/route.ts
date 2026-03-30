// Save as: src/app/api/account/returns/route.ts (REPLACE existing)
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendReturnReceived, sendEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const returns = await prisma.returnRequest.findMany({
    where:   { email: user.email },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ returns })
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { orderId, orderNumber, reason, details, items } = await req.json()

    if (!orderId || !reason || !items?.length)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const order = await prisma.order.findFirst({ where: { id: orderId, email: user.email } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const alreadyRequested = await prisma.returnRequest.findFirst({
      where: { orderId, status: { not: 'REJECTED' } },
    })
    if (alreadyRequested)
      return NextResponse.json({ error: 'A return request already exists for this order' }, { status: 409 })

    const returnReq = await prisma.returnRequest.create({
      data: {
        userId: user.id, orderId,
        orderNumber: orderNumber ?? order.orderNumber,
        email: user.email, reason, details: details ?? null, items, status: 'PENDING',
      },
    })

    // Send confirmation email to customer
    sendEmail(() => sendReturnReceived({
      email:       user.email,
      name:        user.name ?? '',
      orderNumber: returnReq.orderNumber,
      reason,
      items,
    }))

    return NextResponse.json({ success: true, return: returnReq })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}