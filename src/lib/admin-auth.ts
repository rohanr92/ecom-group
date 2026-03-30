// Save as: src/lib/admin-auth.ts (REPLACE existing)
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'sl_admin_session'

export async function getAdminFromCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token       = cookieStore.get(ADMIN_COOKIE)?.value
    if (!token || token.length < 10) return false
    return true // middleware already validated token exists
  } catch {
    return false
  }
}

export async function getAdminFromRequest(req: NextRequest): Promise<boolean> {
  try {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    if (!token || token.length < 10) return false
    return true
  } catch {
    return false
  }
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  })
}