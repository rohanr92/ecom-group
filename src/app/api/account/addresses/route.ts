// Save as: src/app/api/account/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const addresses = await prisma.userAddress.findMany({
    where:   { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json({ addresses })
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { label, firstName, lastName, street, street2, city, state, zip, country, phone, isDefault } = body

    // If setting as default, unset all others
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: user.id },
        data:  { isDefault: false },
      })
    }

    const address = await prisma.userAddress.create({
      data: { userId: user.id, label: label ?? 'Home', firstName, lastName, street, street2: street2 ?? null, city, state, zip, country: country ?? 'United States', phone: phone ?? null, isDefault: isDefault ?? false },
    })
    return NextResponse.json({ address })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, ...data } = await req.json()

    if (data.isDefault) {
      await prisma.userAddress.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
    }

    const address = await prisma.userAddress.update({
      where: { id },
      data,
    })
    return NextResponse.json({ address })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.userAddress.delete({ where: { id } })
  return NextResponse.json({ success: true })
}