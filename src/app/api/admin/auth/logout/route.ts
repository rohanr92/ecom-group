// Save as: src/app/api/admin/auth/logout/route.ts (NEW FILE)
import { NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/admin-auth'

export async function POST() {
  await clearAdminCookie()
  return NextResponse.json({ success: true })
}