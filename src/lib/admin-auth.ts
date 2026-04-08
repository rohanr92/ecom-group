import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_COOKIE = 'sl_admin_session'

async function validateAdminToken(token: string | undefined): Promise<boolean> {
  if (!token || token.length < 64) return false
  try {
    const session = await prisma.adminSession.findUnique({ where: { token } })
    if (!session) return false
    if (session.expiresAt < new Date()) {
      await prisma.adminSession.delete({ where: { token } }).catch(() => {})
      return false
    }
    return true
  } catch {
    return false
  }
}

export async function getAdminFromRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return validateAdminToken(token)
}

export async function getAdminFromCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE)?.value
    return validateAdminToken(token)
  } catch {
    return false
  }
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (token) {
    await prisma.adminSession.delete({ where: { token } }).catch(() => {})
  }
  cookieStore.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}