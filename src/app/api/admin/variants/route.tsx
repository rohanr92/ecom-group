// Save as: src/app/api/admin/variants/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { productId, variants } = await req.json()

    if (!productId || !variants) {
      return NextResponse.json({ error: 'Missing productId or variants' }, { status: 400 })
    }

    // Upsert each variant
    const results = []
    for (const v of variants) {
      if (v.id && !v.isNew) {
        // Update existing
        const updated = await prisma.productVariant.update({
          where: { id: v.id },
          data: {
            size:      v.size,
            color:     v.color,
            colorHex:  v.colorHex,
            sku:       v.sku,
            inventory: v.inventory,
          },
        })
        results.push(updated)
      } else {
        // Create new — check SKU doesn't exist
        const existing = await prisma.productVariant.findUnique({ where: { sku: v.sku } })
        if (existing) {
          // Update if exists
          const updated = await prisma.productVariant.update({
            where: { sku: v.sku },
            data: { size: v.size, color: v.color, colorHex: v.colorHex, inventory: v.inventory },
          })
          results.push(updated)
        } else {
          const created = await prisma.productVariant.create({
            data: {
              productId,
              size:      v.size,
              color:     v.color,
              colorHex:  v.colorHex,
              sku:       v.sku,
              inventory: v.inventory,
            },
          })
          results.push(created)
        }
      }
    }

    return NextResponse.json({ variants: results })
  } catch (err: any) {
    console.error('Variants API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await prisma.productVariant.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}