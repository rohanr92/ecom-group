// Save as: src/app/api/auth/reset-password/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    if (password.length < 8)  return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const session = await prisma.userSession.findUnique({
      where:   { token: `reset_${token}` },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } })
    await prisma.userSession.delete({ where: { token: `reset_${token}` } })

    // Log the user in automatically
    await createSession(session.userId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}