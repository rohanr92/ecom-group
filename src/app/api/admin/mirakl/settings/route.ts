// src/app/api/admin/mirakl/settings/route.ts

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { testConnection } from '@/lib/mirakl/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sl_admin_session')?.value
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const connection = await testConnection()

  return NextResponse.json({
    envCheck: {
      clientId: !!process.env.MIRAKL_CONNECT_CLIENT_ID,
      clientSecret: !!process.env.MIRAKL_CONNECT_CLIENT_SECRET,
      sellerId: !!process.env.MIRAKL_CONNECT_SELLER_ID,
      cronSecret: !!process.env.MIRAKL_CRON_SECRET,
    },
    dryRun: process.env.MIRAKL_DRY_RUN !== 'false',
    connection,
  })
}