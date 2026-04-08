import { NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/admin-auth'

// DELETE — logout
export async function DELETE() {
  try {
    clearAdminCookie()
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
