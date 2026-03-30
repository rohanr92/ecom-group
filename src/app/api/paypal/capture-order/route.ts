// Save as: src/app/api/paypal/capture-order/route.ts (REPLACE existing)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PAYPAL_BASE = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  return data.access_token
}

// GET — PayPal redirects here after customer approves
// URL will be: /api/paypal/capture-order?token=ORDER_ID&PayerID=xxx
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  try {
    const { searchParams } = new URL(req.url)
    const paypalOrderId = searchParams.get('token')
    const payerId       = searchParams.get('PayerID')

    console.log('PayPal redirect received:', { paypalOrderId, payerId })

    if (!paypalOrderId) {
      return NextResponse.redirect(`${baseUrl}/checkout?error=missing_token`)
    }

    const accessToken = await getAccessToken()

    // Capture the payment
    const res = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const capture = await res.json()
    console.log('PayPal capture result:', capture.status)

    if (!res.ok || capture.status !== 'COMPLETED') {
      console.error('PayPal capture failed:', JSON.stringify(capture))
      return NextResponse.redirect(`${baseUrl}/checkout?error=payment_failed`)
    }

    // Update order status to CONFIRMED
    await prisma.order.updateMany({
      where: { paypalOrderId },
      data:  { status: 'CONFIRMED' },
    })

    // Decrease inventory
    const order = await prisma.order.findFirst({
      where:   { paypalOrderId },
      include: { items: true },
    })

    if (order?.items) {
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data:  { inventory: { decrement: item.quantity } },
        })
      }
    }

    console.log(`✅ PayPal order confirmed: ${order?.orderNumber}`)

    // Redirect to success page
    return NextResponse.redirect(
      `${baseUrl}/checkout/success?order=${order?.orderNumber ?? ''}&method=paypal`
    )

  } catch (err: any) {
    console.error('PayPal capture error:', err)
    return NextResponse.redirect(`${baseUrl}/checkout?error=capture_failed`)
  }
}