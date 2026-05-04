// src/app/api/admin/mirakl/sync/route.ts
// Manual sync trigger from admin UI (uses cookie auth, not header secret)

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { syncOrders } from '@/lib/mirakl/sync-orders'
import { syncInventory } from '@/lib/mirakl/sync-inventory'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('sl_admin_session')?.value
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const type = url.searchParams.get('type')

  try {
    if (type === 'orders') {
      const result = await syncOrders()
      return NextResponse.json({
        ok: true,
        type: 'orders',
        dry_run: process.env.MIRAKL_DRY_RUN !== 'false',
        ...result,
      })
    } else if (type === 'inventory') {
      const result = await syncInventory()
      return NextResponse.json({
        ok: true,
        type: 'inventory',
        dry_run: process.env.MIRAKL_DRY_RUN !== 'false',
        ...result,
      })
    } else {
      return NextResponse.json({ error: 'type must be orders or inventory' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}