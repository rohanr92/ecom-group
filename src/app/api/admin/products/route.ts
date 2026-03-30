// Save as: src/app/api/admin/products/route.ts (REPLACE existing)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')
    const category = searchParams.get('category')
    const id       = searchParams.get('id')

    // Single product fetch
    if (id) {
      const product = await prisma.product.findUnique({
        where:   { id },
        include: { variants: true },
      })
      return NextResponse.json({ products: product ? [product] : [] })
    }

    const where: any = {}
    if (search)   where.name     = { contains: search,   mode: 'insensitive' }
    if (category) where.category = { contains: category, mode: 'insensitive' }

    const products = await prisma.product.findMany({
      where,
      include:  { variants: true },
      orderBy:  { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, slug, description, details, price, comparePrice,
      category, badge, images, isActive,
    } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug:         slug || name.toLowerCase().replace(/\s+/g, '-'),
        description:  description  ?? '',
        details:      details      ?? [],
        price,
        comparePrice: comparePrice ?? null,
        category,
        badge:        badge        ?? null,
        images:       images       ?? [],
        isActive:     isActive     ?? true,
      },
    })
    return NextResponse.json({ product })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json()
    const product = await prisma.product.update({
      where: { id },
      data: {
        name:         data.name,
        slug:         data.slug,
        description:  data.description,
        details:      data.details,
        price:        data.price,
        comparePrice: data.comparePrice ?? null,
        category:     data.category,
        badge:        data.badge ?? null,
        images:       data.images,
        isActive:     data.isActive,
      },
    })
    return NextResponse.json({ product })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}