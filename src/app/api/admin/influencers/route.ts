import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const applications = await prisma.influencerApplication.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ applications })
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  const application = await prisma.influencerApplication.update({
    where: { id },
    data: { status }
  })
  return NextResponse.json({ application })
}