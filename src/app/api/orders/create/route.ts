// Save as: src/app/api/orders/create/route.ts (REPLACE existing)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation, sendEmail } from '@/lib/email'

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random    = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SL-${timestamp}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email, items, address, subtotal, shippingCost,
      tax, discount, total, paymentMethod,
      stripePaymentId, paypalOrderId, promoCode, notes,
    } = body

    if (!email || !items?.length || !address || total === undefined || total === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

   // ── SQUARE: verify payment not already used ───────────────────
if (paymentMethod === 'SQUARE' && stripePaymentId && stripePaymentId !== 'FREE_ORDER') {
  // Check this Square payment hasn't already been used
  const existing = await prisma.order.findFirst({
    where: { stripePaymentId },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'This payment has already been processed.', orderNumber: existing.orderNumber },
      { status: 409 }
    )
  }
}

    // ── PAYPAL: verify capture status ─────────────────────────────
    if (paymentMethod === 'PAYPAL') {
      if (!paypalOrderId) {
        return NextResponse.json(
          { error: 'Payment not completed. No PayPal order ID received.' },
          { status: 400 }
        )
      }
    }

    // ── Look up real product UUIDs from DB ────────────────────────
    const dbProducts = await prisma.product.findMany({
      include: { variants: true },
    })

    const orderItemsData: any[] = []

    for (const item of items) {
      const dbProduct = dbProducts.find(
        p => p.name.toLowerCase() === item.name.toLowerCase()
      )
      if (!dbProduct) { console.warn(`Product not found: ${item.name}`); continue }

      const dbVariant = dbProduct.variants.find(
        v => v.size.toLowerCase()  === item.size.toLowerCase() &&
             v.color.toLowerCase() === item.color.toLowerCase()
      ) ?? dbProduct.variants[0]

      if (!dbVariant) { console.warn(`No variant for: ${item.name}`); continue }

      if (dbVariant.inventory < item.quantity) {
  return NextResponse.json({
    error: `Sorry, "${item.name}" (${item.size}, ${item.color}) only has ${dbVariant.inventory} left in stock.`
  }, { status: 400 })
}

      orderItemsData.push({
        productId: dbProduct.id,
        variantId: dbVariant.id,
        name:      item.name,
        size:      item.size,
        color:     item.color,
        image:     item.image,
        price:     item.price,
        quantity:  item.quantity,
      })
    }

    if (orderItemsData.length === 0) {
      return NextResponse.json(
        { error: 'No valid products found. Please clear your cart and try again.' },
        { status: 400 }
      )
    }

    // ── Create order — only reaches here if payment verified ──────
    const order = await prisma.order.create({
      data: {
        orderNumber:     generateOrderNumber(),
        email,
        status:          'CONFIRMED', // already verified above
        subtotal:        subtotal     ?? 0,
        shippingCost:    shippingCost ?? 0,
        tax:             tax          ?? 0,
        discount:        discount     ?? 0,
        total,
        paymentMethod:   paymentMethod   ?? 'STRIPE',
        stripePaymentId: stripePaymentId ?? null,
        paypalOrderId:   paypalOrderId   ?? null,
        promoCode:       promoCode       ?? null,
        notes:           notes           ?? null,

        items: {
          create: orderItemsData,
        },

        addresses: {
          create: {
            type:      'SHIPPING',
            firstName: address.firstName ?? '',
            lastName:  address.lastName  ?? '',
            street:    address.street    ?? '',
            street2:   address.street2   ?? null,
            city:      address.city      ?? '',
            state:     address.state     ?? '',
            zip:       address.zip       ?? '',
            country:   address.country   ?? 'United States',
            phone:     address.phone     ?? null,
          },
        },
      },
      include: { items: true, addresses: true },
    })

    // ── Decrease inventory only after confirmed order ──────────────
    for (const item of orderItemsData) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data:  { inventory: { decrement: item.quantity } },
      })
    }

  console.log(`✅ Order confirmed & saved: ${order.orderNumber}`)

// Send confirmation email
await sendEmail(() => sendOrderConfirmation({
  email:         email,
  name:          `${address.firstName} ${address.lastName}`,
  orderNumber:   order.orderNumber,
  orderId:       order.id,
  items:         orderItemsData,
  subtotal:      Number(subtotal ?? 0),
  shipping:      Number(shippingCost ?? 0),
  tax:           Number(tax ?? 0),
  discount:      Number(discount ?? 0),
  total:         Number(total),
  address:       address,
  paymentMethod: paymentMethod ?? 'STRIPE',
}))

return NextResponse.json({
  success:     true,
  orderId:     order.id,
  orderNumber: order.orderNumber,
})

  } catch (err: any) {
    console.error('❌ Create order error:', err)
    return NextResponse.json(
      { error: err.message ?? 'Failed to create order' },
      { status: 500 }
    )
  }
}