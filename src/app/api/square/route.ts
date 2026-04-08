import { NextRequest, NextResponse } from 'next/server'
import { SquareClient, SquareEnvironment } from 'square'
import { randomUUID } from 'crypto'

;(BigInt.prototype as any).toJSON = function() { return this.toString() }

const client = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: SquareEnvironment.Production,
})

export async function POST(req: NextRequest) {
  try {
    const { sourceId, amount, buyerEmail, note } = await req.json()

    const response = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount:   BigInt(Math.round(amount * 100)),
        currency: 'USD',
      },
      locationId:        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!,
      buyerEmailAddress: buyerEmail,
      note,
    })

    return NextResponse.json({ payment: response.result.payment })
  } catch (err: any) {
    console.error('Square error:', err)
    return NextResponse.json({ error: err.message ?? 'Payment failed' }, { status: 500 })
  }
}