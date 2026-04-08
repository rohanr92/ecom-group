// Save as: src/app/api/admin/auth/login/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken, setAdminCookie } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const validEmail    = process.env.ADMIN_EMAIL
    const validPassword = process.env.ADMIN_PASSWORD

    if (email !== validEmail || password !== validPassword) {
      // Delay to prevent brute force
      await new Promise(r => setTimeout(r, 1000))
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await createAdminToken()
    await setAdminCookie(token)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}