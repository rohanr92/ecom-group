// Save as: src/app/api/account/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, hashPassword, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, email, phone, currentPassword, newPassword } = await req.json()
    const data: any = {}

    if (name)  data.name  = name
    if (email) data.email = email.toLowerCase()
    if (phone) data.phone = phone

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 })
      const valid = await verifyPassword(currentPassword, user.passwordHash ?? '')
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      if (newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
      data.passwordHash = await hashPassword(newPassword)
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data })
    return NextResponse.json({ success: true, user: { id: updated.id, name: updated.name, email: updated.email } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}