// PUBLIC route — cached — used by frontend to fetch products for a display slot
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

const getSlotProducts = (slot: string, limit: number) =>
  unstable_cache(
    async () => {
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
      if (!slotRow?.collection) return { products: [], source: 'empty' }
      return {
        products: slotRow.collection.products.map(cp => cp.product),
        collection: { id: slotRow.collection.id, name: slotRow.collection.name },
        source: 'collection',
      }
    },
    [`slot-${slot}-${limit}`],
    { revalidate: 120, tags: ['slot-products', `slot-${slot}`] }
  )()

export async function GET(req: NextRequest) {
  const slot  = req.nextUrl.searchParams.get('slot')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '10')
  if (!slot) return NextResponse.json({ error: 'slot required' }, { status: 400 })
  try {
    const data = await getSlotProducts(slot, limit)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
