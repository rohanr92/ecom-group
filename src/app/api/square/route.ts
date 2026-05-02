import { NextRequest, NextResponse } from 'next/server'
import { SquareClient, SquareEnvironment } from 'square'
import { randomUUID } from 'crypto'


const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: SquareEnvironment.Production,
})

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'USD', sourceId, note } = await req.json()

    const response = await client.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(Math.round(Number(amount) * 100)),
        currency,
      },
      note,
    })

    return NextResponse.json({ payment: response.payment })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
