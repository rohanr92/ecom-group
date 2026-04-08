import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

// GET — fetch all products with sale status
export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        badge: true,
        category: true,
        images: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ products })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — apply or remove sale discount on products
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { productIds, discountPercent, action } = await req.json()
    // action: 'apply' | 'remove'

    if (!productIds?.length) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 })
    }

    if (action === 'remove') {
      // Restore original price and remove sale badge
      for (const id of productIds) {
        const product = await prisma.product.findUnique({ where: { id } })
        if (!product) continue

        // If comparePrice exists, that was the original — restore it
        const originalPrice = product.comparePrice ?? product.price

        await prisma.product.update({
          where: { id },
          data: {
            price: originalPrice,
            comparePrice: null,
            badge: null,
          },
        })
      }

      // Remove from sale collection
      await syncSaleCollection()
      return NextResponse.json({ success: true, action: 'removed', count: productIds.length })
    }

    // action === 'apply'
    if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) {
      return NextResponse.json({ error: 'Invalid discount percentage' }, { status: 400 })
    }

    for (const id of productIds) {
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) continue

      // Use existing comparePrice as original, or current price if not already on sale
      const originalPrice = product.comparePrice && Number(product.comparePrice) > Number(product.price)
        ? product.comparePrice
        : product.price

      const discountedPrice = Math.round(Number(originalPrice) * (1 - discountPercent / 100) * 100) / 100

      await prisma.product.update({
        where: { id },
        data: {
          price: discountedPrice,
          comparePrice: originalPrice,
          badge: 'Sale',
        },
      })
    }

    // Sync sale collection
    await syncSaleCollection()

    return NextResponse.json({ success: true, action: 'applied', count: productIds.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Sync sale collection — auto add/remove products with Sale badge
async function syncSaleCollection() {
  try {
    // Find or create sale collection
    let saleCollection = await prisma.collection.findFirst({
      where: { slug: 'sale' },
    })

    if (!saleCollection) {
      saleCollection = await prisma.collection.create({
        data: {
          name: 'Sale',
          slug: 'sale',
          description: 'Sale items',
          isActive: true,
          sortOrder: 99,
        },
      })
    }

    // Get all products with Sale badge
    const saleProducts = await prisma.product.findMany({
      where: { badge: 'Sale', isActive: true },
      select: { id: true },
    })

    // Remove all existing products from sale collection
    await prisma.collectionProduct.deleteMany({
      where: { collectionId: saleCollection.id },
    })

    // Add current sale products
    if (saleProducts.length > 0) {
      await prisma.collectionProduct.createMany({
        data: saleProducts.map((p, i) => ({
          collectionId: saleCollection!.id,
          productId: p.id,
          position: i,
        })),
        skipDuplicates: true,
      })
    }
  } catch (err) {
    console.error('Failed to sync sale collection:', err)
  }
}