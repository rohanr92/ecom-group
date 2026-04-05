// src/app/api/admin/media/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getAdminFromRequest } from '@/lib/admin-auth'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET!
const CDN    = process.env.CDN_URL!

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { filename, contentType } = await req.json()
    if (!filename || !contentType) return NextResponse.json({ error: 'filename and contentType required' }, { status: 400 })

    // Clean filename and build S3 key
    const clean = filename
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, '-')
      .replace(/-+/g, '-')

    // Detect folder from content type
    const isVideo = contentType.startsWith('video/')
    const folder  = isVideo ? 'videos' : 'products'
    const key     = `${folder}/${Date.now()}-${clean}`

    const cmd = new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 300 })
    const fileUrl   = `${CDN}/${key}`

    return NextResponse.json({ uploadUrl, fileUrl, key })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
