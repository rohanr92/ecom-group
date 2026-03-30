// Save as: src/app/api/auth/forgot-password/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordReset, sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true })

    // Generate reset token and store it
    const token     = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store in user_sessions table reusing the infrastructure
    await prisma.userSession.create({
      data: { userId: user.id, token: `reset_${token}`, expiresAt },
    })

    sendEmail(() => sendPasswordReset({
      email: user.email,
      name:  user.name ?? 'there',
      resetToken: token,
    }))

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}