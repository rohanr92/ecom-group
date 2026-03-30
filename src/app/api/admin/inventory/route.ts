// Save as: src/app/api/admin/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const variants = await prisma.productVariant.findMany({
      include: { product: true },
      orderBy: { inventory: 'asc' },
    })
    return NextResponse.json({ variants })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, inventory } = await req.json()
    const variant = await prisma.productVariant.update({
      where: { id },
      data:  { inventory },
    })
    return NextResponse.json({ variant })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}