// Save as: src/app/api/admin/collections/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

// GET — list all collections with product count + assigned slots
export async function GET(req: NextRequest) {
  const auth = await getAdminFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [collections, slots] = await Promise.all([
      prisma.collection.findMany({
        include: {
          _count: { select: { products: true } },
          slots:  true,
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.collectionSlot.findMany({
        include: { collection: { select: { id: true, name: true, slug: true } } },
        orderBy: { slot: 'asc' },
      }),
    ])
    return NextResponse.json({ collections, slots })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — create a new collection
export async function POST(req: NextRequest) {
  const auth = await getAdminFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, description, image, productIds = [] } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const collection = await prisma.collection.create({
      data: {
        name:        name.trim(),
        slug,
        description: description?.trim() || null,
        image:       image?.trim() || null,
        products: productIds.length > 0 ? {
          create: productIds.map((pid: string, i: number) => ({
            productId: pid,
            sortOrder: i,
          })),
        } : undefined,
      },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json({ success: true, collection })
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'A collection with this name already exists' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — update collection name/description/image/products/active state
export async function PATCH(req: NextRequest) {
  const auth = await getAdminFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, name, description, image, isActive, productIds } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const data: any = {}
    if (name        !== undefined) { data.name = name.trim(); data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
    if (description !== undefined) data.description = description || null
    if (image       !== undefined) data.image = image || null
    if (isActive    !== undefined) data.isActive = isActive

    // If productIds provided, replace all products in collection
    if (productIds !== undefined) {
      await prisma.collectionProduct.deleteMany({ where: { collectionId: id } })
      data.products = {
        create: productIds.map((pid: string, i: number) => ({
          productId: pid,
          sortOrder: i,
        })),
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data,
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json({ success: true, collection })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — delete a collection
export async function DELETE(req: NextRequest) {
  const auth = await getAdminFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.collection.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}