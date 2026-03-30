// Save as: src/app/api/cms/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const key  = req.nextUrl.searchParams.get('key')
  const slug = req.nextUrl.searchParams.get('slug')

  try {
    if (slug) {
      const page = await prisma.cmsPage.findUnique({ where: { slug } })
      return NextResponse.json({ page })
    }
    if (key) {
      const setting = await prisma.cmsSetting.findUnique({ where: { key } })
      return NextResponse.json({ value: setting?.value ?? null })
    }
    return NextResponse.json({ error: 'key or slug required' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}