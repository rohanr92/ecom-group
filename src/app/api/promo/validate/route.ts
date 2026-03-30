// Save as: src/app/api/promo/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { code, orderTotal } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 })
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 })
    }

    if (promo.usesLeft !== null && promo.usesLeft <= 0) {
      return NextResponse.json({ error: 'Promo code has been used up' }, { status: 400 })
    }

    if (promo.minOrder && orderTotal < Number(promo.minOrder)) {
      return NextResponse.json(
        { error: `Minimum order of $${promo.minOrder} required` },
        { status: 400 }
      )
    }

    const discount = promo.type === 'PERCENT'
      ? (orderTotal * Number(promo.value)) / 100
      : Number(promo.value)

    return NextResponse.json({
      valid:    true,
      type:     promo.type,
      value:    Number(promo.value),
      discount: Math.round(discount * 100) / 100,
      code:     promo.code,
    })
  } catch (err: any) {
    console.error('Promo validate error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}