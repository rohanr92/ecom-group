// src/app/api/admin/orders/[id]/packing-slip/route.ts
// Downloads packing slip from Mirakl (ZIP), unzips, returns PDF to browser.
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import JSZip from 'jszip'
import { prisma } from '@/lib/prisma'
import { fetchMiraklBinary } from '@/lib/mirakl/client'

const ADMIN_COOKIE = 'sl_admin_session'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // Admin auth
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const order = await prisma.order.findUnique({
    where: { id },
    select: { miraklOrderId: true, orderNumber: true },
  })

  if (!order?.miraklOrderId) {
    return NextResponse.json({ error: 'Not a Mirakl order' }, { status: 404 })
  }

  try {
    // 1. Fetch the ZIP from Mirakl
    const { buffer } = await fetchMiraklBinary(
      `/v2/orders/${order.miraklOrderId}/documents?types=DELIVERY_SLIP`
    )

    // 2. Unzip
    const zip = await JSZip.loadAsync(buffer)

    // 3. Find the first PDF inside
    let pdfFile: JSZip.JSZipObject | null = null
    let pdfName = ''
    zip.forEach((relativePath, file) => {
      if (!pdfFile && !file.dir && relativePath.toLowerCase().endsWith('.pdf')) {
        pdfFile = file
        pdfName = relativePath
      }
    })

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'No PDF found in packing slip ZIP from Mirakl' },
        { status: 404 }
      )
    }

    // 4. Extract PDF bytes
    const pdfBuffer = await (pdfFile as JSZip.JSZipObject).async('arraybuffer')

    // 5. Stream PDF to browser
    const safeOrderNum = (order.orderNumber || order.miraklOrderId).replace(/[^a-zA-Z0-9_-]/g, '_')
    const downloadName = `packing-slip-${safeOrderNum}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Packing slip download error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}