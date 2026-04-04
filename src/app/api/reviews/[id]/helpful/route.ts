// Save as: src/app/api/reviews/[id]/helpful/route.ts (NEW FILE)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.review.update({
      where: { id: params.id },
      data: { helpful: { increment: 1 } },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}