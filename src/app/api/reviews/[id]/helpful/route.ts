import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.review.update({
      where: { id },
      data: { helpful: { increment: 1 } },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
