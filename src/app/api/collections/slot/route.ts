// Save as: src/app/api/collections/slot/route.ts (REPLACE entire file)
// PUBLIC route — no auth required — used by frontend to fetch products for a display slot
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const slot  = req.nextUrl.searchParams.get('slot')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '10')

  if (!slot) return NextResponse.json({ error: 'slot required' }, { status: 400 })

  try {
    const slotRow = await prisma.collectionSlot.findUnique({
      where: { slot },
      include: {
        collection: {
          include: {
            products: {
              include: { product: { include: { variants: true } } },
              orderBy: { sortOrder: 'asc' },
              take: limit,
            },
          },
        },
      },
    })

    if (!slotRow?.collection) {
      return NextResponse.json({ products: [], source: 'empty' })
    }

    const products = slotRow.collection.products.map(cp => cp.product)
    return NextResponse.json({
      products,
      collection: { id: slotRow.collection.id, name: slotRow.collection.name },
      source: 'collection',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}