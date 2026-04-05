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
              },
            },
          },
        },
      },
    })

    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Map products WITH variants included
    const products = collection.products.map((cp: any) => ({
      ...cp.product,
      variants: cp.product.variants,
    }))

    return NextResponse.json({ collection, products })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}