// Save as: src/app/api/admin/products/route.ts (REPLACE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

// ── GET — list products ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url      = new URL(req.url)
  const page     = parseInt(url.searchParams.get('page')  ?? '1')
  const limit    = parseInt(url.searchParams.get('limit') ?? '20')
  const search   = url.searchParams.get('search') ?? ''
  const status   = url.searchParams.get('status') ?? ''  // 'active' | 'draft' | ''
  const skip     = (page - 1) * limit

  const where: any = {}
  if (search) where.name = { contains: search, mode: 'insensitive' }
  if (status === 'active') where.isActive = true
  if (status === 'draft')  where.isActive = false

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: true, _count: { select: { variants: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])
    return NextResponse.json({ products, total, page, limit })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── POST — create product ───────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    // Handle duplicate action
    if (body.action === 'duplicate' && body.productId) {
      return await duplicateProduct(body.productId)
    }

    const { name, description, price, comparePrice, category, images, badge, details, variants, isActive } = body
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const slug = generateSlug(name)

    const product = await prisma.product.create({
      data: {
        name:         name.trim(),
        slug,
        description:  description ?? '',
        price:        parseFloat(price) || 0,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        category:     category ?? '',
        images:       images ?? [],
        badge:        badge ?? null,
        details:      details ?? [],
        isActive:     isActive ?? true,
        variants: variants?.length ? {
          create: variants.map((v: any) => ({
            size:     v.size ?? '',
            color:    v.color ?? '',
            sku:      v.sku ?? '',
            price:    v.price ? parseFloat(v.price) : parseFloat(price) || 0,
            stock:    parseInt(v.stock) || 0,
            isActive: true,
          })),
        } : undefined,
      },
      include: { variants: true },
    })
    return NextResponse.json({ success: true, product })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── PATCH — update product ──────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Handle set as draft / publish toggle
    if (body.action === 'setDraft') {
      const product = await prisma.product.update({
        where: { id },
        data:  { isActive: false },
      })
      return NextResponse.json({ success: true, product })
    }
    if (body.action === 'publish') {
      const product = await prisma.product.update({
        where: { id },
        data:  { isActive: true },
      })
      return NextResponse.json({ success: true, product })
    }

    const data: any = {}
    const fields = ['name','description','price','comparePrice','category','images','badge','details','isActive']
    fields.forEach(f => { if (body[f] !== undefined) data[f] = body[f] })
    if (body.name) data.slug = generateSlug(body.name)
    if (body.price)        data.price        = parseFloat(body.price)
    if (body.comparePrice !== undefined) {
  data.comparePrice = body.comparePrice === '' || body.comparePrice === null 
    ? null 
    : parseFloat(body.comparePrice)
}

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { variants: true },
    })
    return NextResponse.json({ success: true, product })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── DELETE ──────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── Helpers ─────────────────────────────────────────────────────
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).slice(2, 7)
}

async function duplicateProduct(productId: string) {
  try {
    const original = await prisma.product.findUnique({
      where:   { id: productId },
      include: { variants: true },
    })
    if (!original) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const newName = `${original.name} (Copy)`
    const newSlug = generateSlug(newName)

    const duplicate = await prisma.product.create({
      data: {
        name:         newName,
        slug:         newSlug,
        description:  original.description,
        price:        original.price,
        comparePrice: original.comparePrice,
        category:     original.category,
        images:       original.images as any,
        badge:        original.badge,
        details:      original.details as any,
        isActive:     false, // always draft
        variants: original.variants.length ? {
          create: original.variants.map(v => ({
            size:     v.size,
            color:    v.color,
            sku:      v.sku ? v.sku + '-copy' : '',
            price:    v.price,
            stock:    v.stock,
            isActive: v.isActive,
          })),
        } : undefined,
      },
      include: { variants: true },
    })
    return NextResponse.json({ success: true, product: duplicate })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}