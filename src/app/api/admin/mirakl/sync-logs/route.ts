// src/app/api/admin/mirakl/sync-logs/route.ts

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
  const type = url.searchParams.get('type')

  const logs = await prisma.miraklSyncLog.findMany({
    where: type && (type === 'orders' || type === 'inventory') ? { syncType: type } : {},
    orderBy: { startedAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({
    logs: logs.map((l) => ({
      ...l,
      startedAt: l.startedAt.toISOString(),
      completedAt: l.completedAt?.toISOString() || null,
    })),
  })
}