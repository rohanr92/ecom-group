// Save as: src/app/api/admin/auth/check/route.ts (REPLACE existing)
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token       = cookieStore.get('sl_admin_session')?.value
    const roleCookie  = cookieStore.get('sl_admin_role')?.value

    if (!token || token.length < 10) {
      return NextResponse.json({ admin: false }, { status: 401 })
    }

    let role = null
    if (roleCookie) {
      try { role = JSON.parse(roleCookie) } catch {}
    }

    return NextResponse.json({ admin: true, role })
  } catch {
    return NextResponse.json({ admin: false }, { status: 401 })
  }
}