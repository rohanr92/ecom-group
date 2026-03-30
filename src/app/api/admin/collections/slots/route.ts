// Save as: src/app/api/admin/collections/slots/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/admin-auth'

// Define the 5 display slots
const DEFAULT_SLOTS = [
  { slot: 'homepage_new_arrivals', label: 'Homepage — New Arrivals' },
  { slot: 'homepage_bestsellers',  label: 'Homepage — Best Sellers' },
  { slot: 'homepage_also_interest',label: 'Homepage — Also of Interest' },
  { slot: 'cart_picked_for_you',   label: 'Cart — Picked For You' },
  { slot: 'cart_also_like',        label: 'Cart — You Might Also Like' },
]

// GET — get all slot assignments (creates defaults if missing)
export async function GET(req: NextRequest) {
  try {
    // Upsert all default slots to make sure they exist
    for (const s of DEFAULT_SLOTS) {
      await prisma.collectionSlot.upsert({
        where:  { slot: s.slot },
        update: {},
        create: { slot: s.slot, label: s.label },
      })
    }

    const slots = await prisma.collectionSlot.findMany({
      include: { collection: { select: { id: true, name: true, slug: true } } },
      orderBy: { slot: 'asc' },
    })
    return NextResponse.json({ slots })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — assign a collection to a slot
export async function PATCH(req: NextRequest) {
  const auth = await getAdminFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slot, collectionId } = await req.json()
    if (!slot) return NextResponse.json({ error: 'slot required' }, { status: 400 })

    const updated = await prisma.collectionSlot.upsert({
      where:  { slot },
      update: { collectionId: collectionId || null },
      create: {
        slot,
        label:        DEFAULT_SLOTS.find(s => s.slot === slot)?.label ?? slot,
        collectionId: collectionId || null,
      },
      include: { collection: { select: { id: true, name: true, slug: true } } },
    })
    return NextResponse.json({ success: true, slot: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}