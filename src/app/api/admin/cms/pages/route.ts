// Save as: src/app/api/admin/cms/pages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const pages = await prisma.cmsPage.findMany({ orderBy: { slug: 'asc' } })
    return NextResponse.json({ pages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { slug, title, sections } = await req.json()
    const page = await prisma.cmsPage.upsert({
      where:  { slug },
      update: { title, sections },
      create: { slug, title, sections: sections ?? [] },
    })
    return NextResponse.json({ success: true, page })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, title, sections, isActive } = await req.json()
    const data: any = {}
    if (title    !== undefined) data.title    = title
    if (sections !== undefined) data.sections = sections
    if (isActive !== undefined) data.isActive = isActive
    const page = await prisma.cmsPage.update({ where: { id }, data })
    return NextResponse.json({ success: true, page })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}