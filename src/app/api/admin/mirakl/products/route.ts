// src/app/api/admin/mirakl/products/route.ts

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('sl_admin_session')?.value
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim() || ''
  const filter = url.searchParams.get('filter') || 'all'

  const where: any = { product: { isActive: true } }

  if (search) {
    where.OR = [
      { sku: { contains: search, mode: 'insensitive' } },
      { upc: { contains: search } },
      { product: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  if (filter === 'synced') {
    where.miraklInventoryState = { isSynced: true }
  } else if (filter === 'pending') {
    where.OR = [
      { miraklInventoryState: null },
      { miraklInventoryState: { isSynced: false, lastError: null } },
    ]
  } else if (filter === 'failed') {
    where.miraklInventoryState = { lastError: { not: null } }
  }

  const variants = await prisma.productVariant.findMany({
    where,
    take: 100,
    include: {
      product: { select: { name: true, price: true } },
      miraklInventoryState: true,
    },
    orderBy: [{ product: { name: 'asc' } }, { sku: 'asc' }],
  })

  // Summary always shows global counts (not affected by search/filter)
  const [total, synced, pending, failed] = await Promise.all([
    prisma.productVariant.count({ where: { product: { isActive: true } } }),
    prisma.miraklInventoryState.count({ where: { isSynced: true } }),
    prisma.productVariant.count({
      where: {
        product: { isActive: true },
        OR: [
          { miraklInventoryState: null },
          { miraklInventoryState: { isSynced: false, lastError: null } },
        ],
      },
    }),
    prisma.miraklInventoryState.count({ where: { lastError: { not: null } } }),
  ])

  return NextResponse.json({
    summary: { total, synced, pending, failed },
    variants: variants.map((v) => ({
      variantId: v.id,
      productName: v.product.name,
      sku: v.sku,
      upc: v.upc,
      size: v.size,
      color: v.color,
      inventory: v.inventory,
      price: Number(v.product.price),
      isSynced: v.miraklInventoryState?.isSynced ?? false,
      lastPushedInventory: v.miraklInventoryState?.lastPushedInventory ?? null,
      lastPushedPrice: v.miraklInventoryState ? Number(v.miraklInventoryState.lastPushedPrice) : null,
      lastSyncedAt: v.miraklInventoryState?.lastSyncedAt?.toISOString() ?? null,
      lastError: v.miraklInventoryState?.lastError ?? null,
    })),
  })
}