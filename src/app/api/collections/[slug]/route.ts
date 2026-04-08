import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: {
              include: {
                variants: true,
                reviews: {
                  where: { approved: true },
                  select: { rating: true },
                },
              },
            },
          },
        },
      },
    })

    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const products = collection.products.map((cp: any) => {
      const approvedReviews = cp.product.reviews ?? []
      const reviewCount = approvedReviews.length
      const avgRating = reviewCount > 0
        ? Math.round((approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount) * 10) / 10
        : 0

      return {
        ...cp.product,
        variants: cp.product.variants,
        reviewCount,
        avgRating,
      }
    })

    return NextResponse.json({ collection, products })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}