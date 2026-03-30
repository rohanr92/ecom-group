// Save as: src/app/api/admin/discounts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ promos })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const promo = await prisma.promoCode.create({ data: body })
    return NextResponse.json({ promo })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json()
    const promo = await prisma.promoCode.update({ where: { id }, data })
    return NextResponse.json({ promo })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await prisma.promoCode.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}