import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

// GET — fetch all footer columns with links + settings
export async function GET(req: NextRequest) {
  try {
    const columns = await prisma.footerColumn.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    })

    const settingsRaw = await prisma.footerSettings.findMany()
    const settings: Record<string, any> = {}
    settingsRaw.forEach(s => { settings[s.key] = s.value })

    return NextResponse.json({ columns, settings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — create column or link
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    if (body.type === 'column') {
      const column = await prisma.footerColumn.create({
        data: {
          heading: body.heading ?? 'New Column',
          position: body.position ?? 0,
        },
        include: { links: true },
      })
      return NextResponse.json({ column })
    }

    if (body.type === 'link') {
      const link = await prisma.footerLink.create({
        data: {
          label: body.label ?? 'New Link',
          href: body.href ?? '#',
          position: body.position ?? 0,
          footerColumnId: body.columnId,
        },
      })
      return NextResponse.json({ link })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — update column, link, or settings
export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    if (body.type === 'column') {
      const column = await prisma.footerColumn.update({
        where: { id: body.id },
        data: {
          ...(body.heading !== undefined && { heading: body.heading }),
          ...(body.position !== undefined && { position: body.position }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
      })
      return NextResponse.json({ column })
    }

    if (body.type === 'link') {
      const link = await prisma.footerLink.update({
        where: { id: body.id },
        data: {
          ...(body.label !== undefined && { label: body.label }),
          ...(body.href !== undefined && { href: body.href }),
          ...(body.position !== undefined && { position: body.position }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
          ...(body.openInNewTab !== undefined && { openInNewTab: body.openInNewTab }),
        },
      })
      return NextResponse.json({ link })
    }

    if (body.type === 'settings') {
      await prisma.footerSettings.upsert({
        where: { key: body.key },
        update: { value: body.value },
        create: { key: body.key, value: body.value },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — remove column or link
export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    if (body.type === 'column') {
      await prisma.footerColumn.delete({ where: { id: body.id } })
      return NextResponse.json({ success: true })
    }

    if (body.type === 'link') {
      await prisma.footerLink.delete({ where: { id: body.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}