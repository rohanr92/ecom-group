// Save as: src/app/api/auth/register/route.ts (REPLACE existing)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSession } from '@/lib/auth'
import { sendWelcomeEmail, sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, emailOptIn } = await req.json()

    if (!name || !email || !password)
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })

    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing)
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash, emailOptIn: emailOptIn ?? true, role: 'CUSTOMER' },
    })

    await createSession(user.id)

    // Send welcome email (non-blocking)
    sendEmail(() => sendWelcomeEmail({ email: user.email, name: user.name ?? 'there' }))

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}