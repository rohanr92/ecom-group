import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('orderNumber')?.trim()
  const email = searchParams.get('email')?.trim().toLowerCase()

  if (!orderNumber || !email) {
    return NextResponse.json({ error: 'Order number and email are required.' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        email: { equals: email, mode: 'insensitive' },
        status: { not: 'PENDING' },
      },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'No order found with that order number and email. Please check and try again.' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}