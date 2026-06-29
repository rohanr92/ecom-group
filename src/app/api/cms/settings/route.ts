import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { unstable_cache, revalidateTag } from 'next/cache'

const getSettings = unstable_cache(
  async () => {
    const settings = await prisma.cmsSetting.findMany()
    const result: Record<string, any> = {}
    settings.forEach(s => { result[s.key] = s.value })
    return result
  },
  ['cms-settings'],
  { revalidate: 300, tags: ['cms-settings'] }
)

export async function GET(req: NextRequest) {
  try {
    const result = await getSettings()
    return NextResponse.json({ settings: result }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { key, value } = await req.json()
    if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })

    await prisma.cmsSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    revalidateTag('cms-settings', 'max')
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
