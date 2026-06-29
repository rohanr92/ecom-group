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

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { filename, contentType } = await req.json()
    const clean  = filename.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
    const key    = `products/${Date.now()}-${clean}`

    const command = new PutObjectCommand({
      Bucket:      process.env.AWS_S3_BUCKET!,
      Key:         key,
      ContentType: contentType,
    })

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

    console.log('CDN_URL value:', process.env.CDN_URL)

    const cdnUrl    = process.env.CDN_URL
    const publicUrl = cdnUrl
      ? `${cdnUrl}/${key}`
      : `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    console.log('publicUrl:', publicUrl)

    return NextResponse.json({ signedUrl, publicUrl })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}