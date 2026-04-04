// Save as: src/app/api/reviews/route.ts (NEW FILE)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET — fetch approved reviews for a product
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const sort = searchParams.get('sort') || 'newest'

  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const orderBy: any =
    sort === 'highest' ? { rating: 'desc' } :
    sort === 'lowest'  ? { rating: 'asc' } :
    sort === 'helpful' ? { helpful: 'desc' } :
    { createdAt: 'desc' }

  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy,
    select: {
      id: true,
      name: true,
      rating: true,
      title: true,
      body: true,
      size: true,
      bodyType: true,
      verified: true,
      helpful: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ reviews })
}

// POST — submit a new review (goes into pending/unapproved state)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, name, email, rating, title, reviewBody, size, bodyType } = body

    if (!productId || !name || !rating || !title || !reviewBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }

    // check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // optionally link to user account
    let userId: string | null = null
    try {
      const user = await getUserFromRequest(req)
      if (user) userId = user.id
    } catch {}

    // check if this email already reviewed this product (avoid duplicates)
    if (email) {
      const existing = await prisma.review.findFirst({
        where: { productId, name, approved: true },
      })
      // soft check — don't hard block, just note
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        name,
        rating: Number(rating),
        title,
        body: reviewBody,
        size: size || null,
        bodyType: bodyType || null,
        verified: !!userId, // verified if logged in
        approved: false, // MUST be approved by admin before showing
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Your review has been submitted and is pending approval. Thank you!',
    })
  } catch (err: any) {
    console.error('Review POST error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}