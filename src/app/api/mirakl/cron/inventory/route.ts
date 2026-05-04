// src/app/api/mirakl/cron/inventory/route.ts
// GET /api/mirakl/cron/inventory
// Triggered by cron every 5 min. Pushes DB inventory → Mirakl.

import { NextResponse } from 'next/server';
import { syncInventory } from '@/lib/mirakl/sync-inventory';
import { maybeAlertOnSyncFailure } from '@/lib/mirakl/alert';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const expected = `Bearer ${process.env.MIRAKL_CRON_SECRET}`;
  if (!process.env.MIRAKL_CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncInventory();
    await maybeAlertOnSyncFailure('inventory');
    return NextResponse.json({
      ok: true,
      dry_run: process.env.MIRAKL_DRY_RUN !== 'false',
      ...result,
    });
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