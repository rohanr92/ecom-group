import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const q     = url.searchParams.get('q') ?? ''
    const limit = parseInt(url.searchParams.get('limit') ?? '200')

    const where: any = { isActive: true }
    if (q.trim()) {
      where.OR = [
        { name:        { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category:    { contains: q, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      take: limit,
      include: {
        variants: true,
        reviews: { select: { rating: true } }
      }
    })

    const formatted = products.map((p: any) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      reviewCount: p.reviews?.length ?? 0,
      avgRating: p.reviews?.length
        ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
        : 0,
    }))

    return NextResponse.json({ products: formatted })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
