// Save as: src/app/api/stripe/payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert dollars to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderEmail:    metadata?.email    ?? '',
        orderItems:    metadata?.items    ?? '',
        shippingName:  metadata?.name     ?? '',
        shippingCity:  metadata?.city     ?? '',
      },
    })

    return NextResponse.json({
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (err: any) {
    console.error('Stripe payment-intent error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}