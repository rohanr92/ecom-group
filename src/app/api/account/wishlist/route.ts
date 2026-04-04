// Save as: src/app/api/account/wishlist/route.ts
// Make sure the folder src/app/api/account/wishlist/ exists first
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Reads the sl_session cookie and returns the user — same pattern as other account routes
async function getUser(req: NextRequest) {
  const token = req.cookies.get('sl_session')?.value
  if (!token) return null
  try {
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: { user: true },
    })
    if (!session || session.expiresAt < new Date()) return null
    return session.user
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const items = await prisma.wishlistItem.findMany({
      where:   { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ items })
  } catch (err: any) {
    console.error('Wishlist GET error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { productId, variantId } = await req.json()
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    const existing = await prisma.wishlistItem.findFirst({
      where: { userId: user.id, productId },
    })
    if (existing) return NextResponse.json({ message: 'Already in wishlist', item: existing })

    const item = await prisma.wishlistItem.create({
      data: { userId: user.id, productId, variantId: variantId ?? null },
    })
    return NextResponse.json({ success: true, item })
  } catch (err: any) {
    console.error('Wishlist POST error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { productId } = await req.json()
    await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Wishlist DELETE error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}