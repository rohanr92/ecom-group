import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId, variants, replace } = await req.json()
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    if (replace) {
      await prisma.productVariant.deleteMany({ where: { productId } })
    }

    const created = []
    for (const v of variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId,
          color:     v.color,
          colorHex:  v.colorHex || '#1a1a1a',
          size:      v.size,
          sku:       v.sku,
          inventory: v.inventory ?? 0,
          images:    v.images ?? [],
        },
      })
      created.push(variant)
    }

    return NextResponse.json({ variants: created })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, images } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const variant = await prisma.productVariant.update({
      where: { id },
      data: { images },
    })

    return NextResponse.json({ variant })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
