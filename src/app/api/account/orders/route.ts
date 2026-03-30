// Save as: src/app/api/account/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const orders = await prisma.order.findMany({
      where:   { email: user.email },
      include: { items: true, addresses: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ orders })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}