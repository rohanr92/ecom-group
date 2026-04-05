import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { sectionId, label, href, position } = await req.json()
    const link = await prisma.navLink.create({
      data: { sectionId, label, href, position },
    })
    return NextResponse.json({ link })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}