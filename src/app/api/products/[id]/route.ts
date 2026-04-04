// Save as: src/app/api/products/[id]/route.ts (REPLACE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find by slug first, then fall back to id
    const product = await prisma.product.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      include: { variants: true },
    })

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}