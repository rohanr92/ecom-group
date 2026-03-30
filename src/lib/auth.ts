// Save as: src/lib/auth.ts (NEW FILE)
// JWT-based auth using Next.js built-in features + bcrypt

import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE = 'sl_session'
const SESSION_DAYS   = 30

// ── Hash password (using Web Crypto — no bcrypt needed) ───────────
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt    = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2,'0')).join('')

  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  )
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('')
  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [saltHex, storedHash] = hash.split(':')
    const salt    = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    )
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial, 256
    )
    const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('')
    return hashHex === storedHash
  } catch {
    return false
  }
}

// ── Generate secure session token ─────────────────────────────────
export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('')
}

// ── Create session in DB + set cookie ─────────────────────────────
export async function createSession(userId: string) {
  const token     = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await prisma.userSession.create({
    data: { userId, token, expiresAt },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'lax',
    expires:   expiresAt,
    path:      '/',
  })

  return token
}

// ── Get current user from cookie ──────────────────────────────────
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token       = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const session = await prisma.userSession.findUnique({
      where:   { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.userSession.delete({ where: { token } })
      return null
    }

    return session.user
  } catch {
    return null
  }
}

// ── Get user from request (for API routes) ────────────────────────
export async function getUserFromRequest(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (!token) return null

    const session = await prisma.userSession.findUnique({
      where:   { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) return null
    return session.user
  } catch {
    return null
  }
}

// ── Logout: delete session + clear cookie ─────────────────────────
export async function logout() {
  const cookieStore = await cookies()
  const token       = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    await prisma.userSession.deleteMany({ where: { token } }).catch(() => {})
  }

  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', expires: new Date(0), path: '/',
  })
}