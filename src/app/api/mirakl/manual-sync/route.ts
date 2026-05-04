// src/app/api/mirakl/manual-sync/route.ts
// POST /api/mirakl/manual-sync?type=orders
// POST /api/mirakl/manual-sync?type=inventory
// Manual sync trigger — used by admin UI in Phase 5.

import { NextResponse } from 'next/server';
import { syncOrders } from '@/lib/mirakl/sync-orders';
import { syncInventory } from '@/lib/mirakl/sync-inventory';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: Request) {
  // For now, use the test secret. In Phase 5 we'll switch to admin auth.
  const secret = req.headers.get('x-mirakl-test-secret');
  if (!process.env.MIRAKL_TEST_SECRET || secret !== process.env.MIRAKL_TEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  try {
    if (type === 'orders') {
      const result = await syncOrders();
      return NextResponse.json({
        ok: true,
        type: 'orders',
        dry_run: process.env.MIRAKL_DRY_RUN !== 'false',
        ...result,
      });
    } else if (type === 'inventory') {
      const result = await syncInventory();
      return NextResponse.json({
        ok: true,
        type: 'inventory',
        dry_run: process.env.MIRAKL_DRY_RUN !== 'false',
        ...result,
      });
    } else {
      return NextResponse.json(
        { error: 'type query param must be "orders" or "inventory"' },
        { status: 400 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}