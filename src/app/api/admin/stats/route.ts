// Save as: src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now      = new Date()
    const d30ago   = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const d60ago   = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // ── Current 30 days ──────────────────────────────────────
    const [orders, prevOrders, customers, products, lowStock] = await Promise.all([
      prisma.order.findMany({
        where:   { createdAt: { gte: d30ago }, status: { not: 'CANCELLED' } },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: d60ago, lt: d30ago }, status: { not: 'CANCELLED' } },
      }),
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.findMany({
        where:   { inventory: { lte: 5 } },
        include: { product: true },
        take: 5,
      }),
    ])

    const revenue     = orders.reduce((s, o) => s + Number(o.total), 0)
    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0)
    const revChange   = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0

    const orderCount     = orders.length
    const prevOrderCount = prevOrders.length
    const ordChange      = prevOrderCount > 0 ? ((orderCount - prevOrderCount) / prevOrderCount) * 100 : 0

    // ── Recent orders ─────────────────────────────────────────
    const recent = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { items: true },
    })

    // ── Sales by day (last 14 days) ───────────────────────────
    const salesByDay: Record<string, number> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      salesByDay[d.toISOString().split('T')[0]] = 0
    }
    orders.forEach(o => {
      const day = o.createdAt.toISOString().split('T')[0]
      if (salesByDay[day] !== undefined) {
        salesByDay[day] += Number(o.total)
      }
    })

    // ── Top products ──────────────────────────────────────────
    const itemCounts: Record<string, { name: string; qty: number; revenue: number }> = {}
    orders.forEach(o => {
      o.items.forEach((item: any) => {
        if (!itemCounts[item.name]) itemCounts[item.name] = { name: item.name, qty: 0, revenue: 0 }
        itemCounts[item.name].qty     += item.quantity
        itemCounts[item.name].revenue += Number(item.price) * item.quantity
      })
    })
    const topProducts = Object.values(itemCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // ── Order status breakdown ────────────────────────────────
    const allOrders = await prisma.order.groupBy({
      by:     ['status'],
      _count: { status: true },
    })
    const statusBreakdown = allOrders.map(s => ({
      status: s.status,
      count:  s._count.status,
    }))

    return NextResponse.json({
      stats: {
        revenue:     { value: revenue,     change: revChange,  prev: prevRevenue },
        orders:      { value: orderCount,  change: ordChange,  prev: prevOrderCount },
        customers:   { value: customers },
        products:    { value: products },
      },
      salesByDay:      Object.entries(salesByDay).map(([date, amount]) => ({ date, amount })),
      recentOrders:    recent,
      topProducts,
      statusBreakdown,
      lowStockItems:   lowStock.map(v => ({
        id:        v.id,
        sku:       v.sku,
        product:   v.product.name,
        size:      v.size,
        color:     v.color,
        inventory: v.inventory,
      })),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}