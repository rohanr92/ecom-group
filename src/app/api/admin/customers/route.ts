// Save as: src/app/api/admin/customers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    // Get unique customers from orders (since guests don't have accounts)
    const orders = await prisma.order.findMany({
      where: search ? { email: { contains: search, mode: 'insensitive' } } : {},
      include: { items: true, addresses: true },
      orderBy: { createdAt: 'desc' },
    })

    // Group by email
    const customerMap: Record<string, any> = {}
    orders.forEach(o => {
      if (!customerMap[o.email]) {
        const addr = o.addresses?.[0]
        customerMap[o.email] = {
          email:       o.email,
          name:        addr ? `${addr.firstName} ${addr.lastName}` : o.email,
          city:        addr?.city ?? '—',
          country:     addr?.country ?? '—',
          orders:      0,
          totalSpent:  0,
          lastOrder:   o.createdAt,
        }
      }
      customerMap[o.email].orders++
      customerMap[o.email].totalSpent += Number(o.total)
      if (o.createdAt > customerMap[o.email].lastOrder) {
        customerMap[o.email].lastOrder = o.createdAt
      }
    })

    const customers = Object.values(customerMap)
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)

    return NextResponse.json({ customers, total: customers.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}