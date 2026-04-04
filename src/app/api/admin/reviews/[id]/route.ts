import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action } = body

    if (action === 'approve') {
      const review = await prisma.review.update({
        where: { id },
        data: { approved: true },
      })
      return NextResponse.json({ success: true, review })
    }

    if (action === 'reject') {
      await prisma.review.delete({ where: { id } })
      return NextResponse.json({ success: true, deleted: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (err: any) {
    console.error('Review PATCH error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}