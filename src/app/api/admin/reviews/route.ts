// Save as: src/app/api/admin/reviews/route.ts (NEW FILE)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

// GET — list all reviews (pending + approved) for admin
export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') || 'pending' // pending | approved | all

  const where: any = {}
  if (filter === 'pending')  where.approved = false
  if (filter === 'approved') where.approved = true

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
  })

  const pendingCount  = await prisma.review.count({ where: { approved: false } })
  const approvedCount = await prisma.review.count({ where: { approved: true } })

  return NextResponse.json({ reviews, pendingCount, approvedCount })
}

