import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [saltHex, stored] = hash.split(':')
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256)
    const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex === stored
  } catch { return false }
}

function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const ownerEmail = process.env.ADMIN_EMAIL
    const ownerPasswordHash = process.env.ADMIN_PASSWORD_HASH

    if (!ownerEmail || !ownerPasswordHash) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    if (email.trim().toLowerCase() === ownerEmail.toLowerCase()) {
      const valid = await verifyPassword(password, ownerPasswordHash)
      if (!valid) {
        await new Promise(r => setTimeout(r, 500))
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const token = generateToken()
      await prisma.adminSession.create({
        data: {
          token,
          adminId: null,
          role: 'owner',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })

      const cookieStore = await cookies()
      cookieStore.set('sl_admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      cookieStore.set('sl_admin_role', JSON.stringify({ role: 'owner', permissions: ['all'], name: 'Owner' }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      return NextResponse.json({ success: true, role: 'owner' })
    }

    // ── DB admin user login ──
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    }).catch(() => null)

    await new Promise(r => setTimeout(r, 500))

    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const dbValid = await verifyPassword(password, adminUser.passwordHash)
    if (!dbValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLogin: new Date() },
    })

    const dbToken = generateToken()
    await prisma.adminSession.create({
      data: {
        token: dbToken,
        adminId: adminUser.id,
        role: adminUser.role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const dbCookieStore = await cookies()
    dbCookieStore.set('sl_admin_session', dbToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    dbCookieStore.set('sl_admin_role', JSON.stringify({
      role: adminUser.role,
      permissions: adminUser.permissions,
      name: adminUser.name,
      id: adminUser.id,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({ success: true, role: adminUser.role })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}