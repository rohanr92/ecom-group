import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { navItemId, heading, position } = await req.json()
    const section = await prisma.navSection.create({
      data: { navItemId, heading, position },
    })
    return NextResponse.json({ section })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}