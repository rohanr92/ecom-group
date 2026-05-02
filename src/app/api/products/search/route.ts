import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get('q') ?? ''
    const limit  = parseInt(url.searchParams.get('limit') ?? '6')

    if (!search.trim()) return NextResponse.json({ products: [] })

    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { name:        { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category:    { contains: search, mode: 'insensitive' } },
        ]
      },
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        images: true,
      }
    })

    return NextResponse.json({ products })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
