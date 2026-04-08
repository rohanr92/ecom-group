// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      include: {
        variants: true,
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Calculate rating data from approved reviews
    const approvedReviews = product.reviews
    const reviewCount = approvedReviews.length
    const avgRating = reviewCount > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
    for (const r of approvedReviews) {
      ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] ?? 0) + 1
    }

    return NextResponse.json({
      product: {
        ...product,
        reviewCount,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingBreakdown,
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}