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

    const amountInCents = BigInt(Math.round(Number(amount) * 100))

    const response = await client.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: amountInCents,
        currency,
      },
      note,
    })

    // Serialize BigInt values in response to strings
    const payment = JSON.parse(
      JSON.stringify(response.payment, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    )

    return NextResponse.json({ payment })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
