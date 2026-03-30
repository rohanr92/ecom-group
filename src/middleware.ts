// Save as: src/middleware.ts (REPLACE existing)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const USER_COOKIE  = 'sl_session'
const ADMIN_COOKIE = 'sl_admin_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── ADMIN ROUTES ──────────────────────────────────────────────
  const isAdminLogin = pathname === '/admin/login'
  const isAdminApi   = pathname.startsWith('/api/admin/auth')
  const isAdminRoute = pathname.startsWith('/admin') && !isAdminLogin && !isAdminApi

  if (isAdminRoute) {
    const adminToken = request.cookies.get(ADMIN_COOKIE)?.value
    if (!adminToken || adminToken.length < 10) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Redirect logged-in admin away from login page
  if (isAdminLogin) {
    const adminToken = request.cookies.get(ADMIN_COOKIE)?.value
    if (adminToken && adminToken.length > 10) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // ── CUSTOMER ACCOUNT ROUTES ───────────────────────────────────
  const isLoginPage    = pathname === '/account/login'
  const isRegisterPage = pathname === '/account/register'
  const isGuestOnly    = isLoginPage || isRegisterPage
  const isProtected    = pathname === '/account' ||
    (pathname.startsWith('/account/') && !isGuestOnly)

  const userToken = request.cookies.get(USER_COOKIE)?.value

  if (userToken && isGuestOnly) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  if (!userToken && isProtected) {
    const url = new URL('/account/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/account',
    '/account/:path*',
  ],
}