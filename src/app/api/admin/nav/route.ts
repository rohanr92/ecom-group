import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

// GET — fetch all nav items with sections, links, featured
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tab = searchParams.get('tab') ?? 'women'

    const items = await prisma.navItem.findMany({
      where: { tab, isActive: true },
      orderBy: { position: 'asc' },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: { links: { orderBy: { position: 'asc' } } },
        },
        featured: true,
      },
    })
    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — create nav item
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { label, href, tab, isSale, position } = body

    const item = await prisma.navItem.create({
      data: { label, href, tab: tab ?? 'women', isSale: isSale ?? false, position: position ?? 0 },
    })
    return NextResponse.json({ item })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — update nav item, section, link, or featured
export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { type, id, ...data } = body

    if (type === 'item') {
      const item = await prisma.navItem.update({ where: { id }, data })
      return NextResponse.json({ item })
    }
    if (type === 'section') {
      const section = await prisma.navSection.update({ where: { id }, data })
      return NextResponse.json({ section })
    }
    if (type === 'link') {
      const link = await prisma.navLink.update({ where: { id }, data })
      return NextResponse.json({ link })
    }
    if (type === 'featured') {
      const featured = await prisma.navFeatured.upsert({
        where: { navItemId: data.navItemId },
        update: { image: data.image, label: data.label, href: data.href },
        create: { navItemId: data.navItemId, image: data.image, label: data.label, href: data.href },
      })
      return NextResponse.json({ featured })
    }
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — delete nav item, section, or link
export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type, id } = await req.json()
    if (type === 'item')    await prisma.navItem.delete({ where: { id } })
    if (type === 'section') await prisma.navSection.delete({ where: { id } })
    if (type === 'link')    await prisma.navLink.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}