// Save as: src/app/api/admin/cms/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const settings = await prisma.cmsSetting.findMany()
    const result: Record<string, any> = {}
    settings.forEach(s => { result[s.key] = s.value })
    return NextResponse.json({ settings: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { key, value } = await req.json()
    const setting = await prisma.cmsSetting.upsert({
      where:  { key },
      update: { value },
      create: { key, value },
    })
    return NextResponse.json({ success: true, setting })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}