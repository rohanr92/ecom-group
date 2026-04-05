// src/app/api/admin/media/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'
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

const IMAGE_EXTS = ['jpg','jpeg','png','webp','gif','svg','avif']
const VIDEO_EXTS = ['mp4','mov','webm','avi','mkv','m4v']

function getType(key: string): 'image' | 'video' {
  const ext = key.split('.').pop()?.toLowerCase() ?? ''
  return VIDEO_EXTS.includes(ext) ? 'video' : 'image'
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const files: any[] = []
    let continuationToken: string | undefined

    // Paginate through all S3 objects
    do {
      const cmd = new ListObjectsV2Command({
        Bucket: BUCKET,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      })
      const res = await s3.send(cmd)

      for (const obj of res.Contents ?? []) {
        if (!obj.Key || obj.Key.endsWith('/')) continue
        const name = obj.Key.split('/').pop() ?? obj.Key
        files.push({
          key:          obj.Key,
          url:          `${CDN}/${obj.Key}`,
          size:         obj.Size ?? 0,
          lastModified: obj.LastModified?.toISOString() ?? '',
          type:         getType(obj.Key),
          name,
        })
      }

      continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
    } while (continuationToken)

    // Sort newest first
    files.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())

    return NextResponse.json({ files, total: files.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { keys } = await req.json()
    if (!keys?.length) return NextResponse.json({ error: 'No keys provided' }, { status: 400 })

    const cmd = new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: keys.map((key: string) => ({ Key: key })),
        Quiet: true,
      },
    })

    await s3.send(cmd)
    return NextResponse.json({ deleted: keys.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
