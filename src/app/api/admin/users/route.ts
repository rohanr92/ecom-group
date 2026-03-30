// Save as: src/app/api/admin/users/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

// Password hash using Web Crypto
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt    = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2,'0')).join('')
  const key     = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits    = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256)
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('')
  return `${saltHex}:${hashHex}`
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [saltHex, stored] = hash.split(':')
    const salt    = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
    const encoder = new TextEncoder()
    const key     = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits    = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256)
    const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('')
    return hashHex === stored
  } catch { return false }
}

// GET — list all admin users
export async function GET(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, name: true, email: true, role: true,
      permissions: true, isActive: true, lastLogin: true,
      invitedBy: true, createdAt: true,
    },
  })
  return NextResponse.json({ users })
}

// POST — create new admin user
export async function POST(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, email, password, role, permissions } = await req.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password and role are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })

    const passwordHash = await hashPassword(password)
    const user = await prisma.adminUser.create({
      data: {
        name,
        email:       email.toLowerCase(),
        passwordHash,
        role,
        permissions: permissions ?? ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] ?? [],
        isActive:    true,
      },
    })

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — update admin user
export async function PATCH(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, name, role, permissions, isActive, newPassword } = await req.json()

    const data: any = {}
    if (name        !== undefined) data.name        = name
    if (role        !== undefined) data.role        = role
    if (permissions !== undefined) data.permissions = permissions
    if (isActive    !== undefined) data.isActive    = isActive
    if (newPassword) {
      if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      data.passwordHash = await hashPassword(newPassword)
    }

    const user = await prisma.adminUser.update({ where: { id }, data })
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — remove admin user
export async function DELETE(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.adminUser.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

// ── Default permissions per role ──────────────────────────────────
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner:   ['all'],
  manager: ['orders.view','orders.edit','orders.fulfill','returns.view','returns.edit','products.view','products.edit','products.create','inventory.edit','customers.view','discounts.view','discounts.edit','analytics.view'],
  editor:  ['orders.view','orders.edit','orders.fulfill','returns.view','products.view','products.edit','products.create','inventory.edit'],
  viewer:  ['orders.view','products.view','customers.view','analytics.view','inventory.view'],
}