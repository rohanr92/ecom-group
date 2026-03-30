// Save as: src/app/api/orders/create-pending/route.ts (NEW FILE)
// Used by PayPal — saves order as PENDING before redirect to PayPal
// PayPal capture route updates it to CONFIRMED after approval
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      tax, discount, total, paypalOrderId, promoCode, notes,
    } = body

    if (!email || !items?.length || !address || !total || !paypalOrderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Look up real product UUIDs
    const dbProducts = await prisma.product.findMany({
      include: { variants: true },
    })

    const orderItemsData = []
    for (const item of items) {
      const dbProduct = dbProducts.find(
        p => p.name.toLowerCase() === item.name.toLowerCase()
      )
      if (!dbProduct) continue

      const dbVariant = dbProduct.variants.find(
        v => v.size.toLowerCase()  === item.size.toLowerCase() &&
             v.color.toLowerCase() === item.color.toLowerCase()
      ) ?? dbProduct.variants[0]

      if (!dbVariant) continue

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
      return NextResponse.json({ error: 'No valid products found' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        orderNumber:   generateOrderNumber(),
        email,
        status:        'PENDING', // will be updated to CONFIRMED by capture route
        subtotal:      subtotal     ?? 0,
        shippingCost:  shippingCost ?? 0,
        tax:           tax          ?? 0,
        discount:      discount     ?? 0,
        total,
        paymentMethod: 'PAYPAL',
        paypalOrderId,
        promoCode:     promoCode ?? null,
        notes:         notes     ?? null,

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
    })

    console.log(`📦 PayPal pending order saved: ${order.orderNumber}`)

    return NextResponse.json({
      success:     true,
      orderId:     order.id,
      orderNumber: order.orderNumber,
    })

  } catch (err: any) {
    console.error('Create pending order error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}