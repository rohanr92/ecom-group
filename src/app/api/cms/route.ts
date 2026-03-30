// Save as: src/app/api/cms/route.ts  (CREATE or REPLACE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  const key  = req.nextUrl.searchParams.get('key')

  try {
    if (slug) {
      const page = await prisma.cmsPage.findUnique({ where: { slug } })
      return NextResponse.json({ page: page ?? null })
    }
    if (key) {
      const setting = await prisma.cmsSetting.findUnique({ where: { key } })
      return NextResponse.json({ value: setting?.value ?? null })
    }
    return NextResponse.json({ error: 'slug or key required' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}