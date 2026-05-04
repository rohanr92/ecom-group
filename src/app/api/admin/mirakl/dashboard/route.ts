// src/app/api/admin/mirakl/dashboard/route.ts
// Returns dashboard stats for /admin/mirakl-connect

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { testConnection } from '@/lib/mirakl/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // Reuse admin auth
  const cookieStore = await cookies()
  const token = cookieStore.get('sl_admin_session')?.value
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [
    connection,
    inventoryStats,
    miraklOrdersCount,
    needsReviewCount,
    autoAcceptedCount,
    lastInventorySync,
    lastOrderSync,
    recentSyncs,
  ] = await Promise.all([
    testConnection(),
    Promise.all([
      prisma.productVariant.count({ where: { product: { isActive: true } } }),
      prisma.miraklInventoryState.count({ where: { isSynced: true } }),
      prisma.miraklInventoryState.count({ where: { isSynced: false, lastError: null } }),
      prisma.miraklInventoryState.count({ where: { isSynced: false, lastError: { not: null } } }),
    ]),
    prisma.order.count({ where: { miraklOrderId: { not: null } } }),
    prisma.order.count({ where: { miraklStatus: 'NEEDS_REVIEW' } }),
    prisma.order.count({
      where: {
        miraklOrderId: { not: null },
        miraklStatus: { not: 'NEEDS_REVIEW' },
      },
    }),
    prisma.miraklSyncLog.findFirst({
      where: { syncType: 'inventory', status: { in: ['success', 'partial'] } },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true },
    }),
    prisma.miraklSyncLog.findFirst({
      where: { syncType: 'orders', status: { in: ['success', 'partial'] } },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true },
    }),
    prisma.miraklSyncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        syncType: true,
        status: true,
        startedAt: true,
        itemsProcessed: true,
        itemsSucceeded: true,
        itemsFailed: true,
        wasDryRun: true,
      },
    }),
  ])

  const [total, synced, pending, failed] = inventoryStats

  return NextResponse.json({
    connection,
    dryRun: process.env.MIRAKL_DRY_RUN !== 'false',
    inventory: {
      total,
      synced,
      pending,
      failed,
      lastSync: lastInventorySync?.startedAt?.toISOString() || null,
    },
    orders: {
      miraklOrdersTotal: miraklOrdersCount,
      needsReview: needsReviewCount,
      autoAccepted: autoAcceptedCount,
      lastSync: lastOrderSync?.startedAt?.toISOString() || null,
    },
    recentSyncs: recentSyncs.map((s) => ({
      ...s,
      startedAt: s.startedAt.toISOString(),
    })),
  })
}