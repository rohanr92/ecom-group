// Save as: src/app/api/paypal/create-order/route.ts (REPLACE existing)
import { NextRequest, NextResponse } from 'next/server'

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
  if (!data.access_token) {
    throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`)
  }
  return data.access_token
}

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'USD' } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const accessToken = await getAccessToken()

    // Get the base URL — works for both localhost and production
    const baseUrl = req.headers.get('origin')
      ?? process.env.NEXTAUTH_URL
      ?? 'http://localhost:3000'

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization:      `Bearer ${accessToken}`,
        'Content-Type':     'application/json',
        'PayPal-Request-Id': `sl-${Date.now()}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: `sl-${Date.now()}`,
            description:  'Solomon Lawrence Order',
            amount: {
              currency_code: currency,
              value:         amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name:          'Solomon Lawrence',
          locale:              'en-US',
          landing_page:        'LOGIN',
          shipping_preference: 'NO_SHIPPING',
          user_action:         'PAY_NOW',
          return_url: `${baseUrl}/api/paypal/capture-order`,
          cancel_url: `${baseUrl}/checkout?cancelled=true`,
        },
      }),
    })

    const order = await res.json()

    if (!res.ok) {
      console.error('PayPal create order failed:', JSON.stringify(order))
      return NextResponse.json(
        { error: order.message ?? 'Failed to create PayPal order' },
        { status: res.status }
      )
    }

    // Find approve link
    const approveLink =
      order.links?.find((l: any) => l.rel === 'approve')?.href ??
      order.links?.find((l: any) => l.rel === 'payer-action')?.href

    console.log('✅ PayPal order created:', order.id)
    console.log('🔗 Approve URL:', approveLink)

    return NextResponse.json({
      orderId:    order.id,
      approveUrl: approveLink,
      status:     order.status,
    })

  } catch (err: any) {
    console.error('PayPal create-order error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}