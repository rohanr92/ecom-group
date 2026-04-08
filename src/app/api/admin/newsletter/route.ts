import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ subscribers, total: subscribers.length })
}