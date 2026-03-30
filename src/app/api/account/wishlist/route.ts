// Save as: src/app/api/account/wishlist/route.ts (REPLACE existing)
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const items = await prisma.wishlistItem.findMany({
      where:   { userId: user.id },
      include: { product: { include: { variants: true } }, variant: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { productId, variantId } = await req.json()
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    const existing = await prisma.wishlistItem.findFirst({ where: { userId: user.id, productId } })
    if (existing) return NextResponse.json({ message: 'Already in wishlist', item: existing })

    const item = await prisma.wishlistItem.create({
      data: { userId: user.id, productId, variantId: variantId ?? null },
    })
    return NextResponse.json({ success: true, item })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { productId } = await req.json()
    await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}