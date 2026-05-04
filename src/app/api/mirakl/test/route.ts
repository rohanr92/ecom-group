// src/app/api/mirakl/test/route.ts
// GET /api/mirakl/test
// Tests the Mirakl Connect connection. Protected by MIRAKL_TEST_SECRET header.

import { NextResponse } from 'next/server';
import { testConnection, listOrders } from '@/lib/mirakl/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const secret = req.headers.get('x-mirakl-test-secret');
  const expected = process.env.MIRAKL_TEST_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const connTest = await testConnection();
    if (!connTest.ok) {
      return NextResponse.json(
        { ok: false, step: 'auth', ...connTest },
        { status: 502 },
      );
    }

    const orders = await listOrders({ limit: 5 });
    return NextResponse.json({
      ok: true,
      auth: connTest,
      orders: {
        count: orders.data?.length ?? 0,
        sample_field_names: orders.data?.[0] ? Object.keys(orders.data[0]) : [],
      },
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