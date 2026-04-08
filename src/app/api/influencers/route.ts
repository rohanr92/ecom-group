import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, handle, followerCount, message } = await req.json()

    if (!name || !email || !handle) {
      return NextResponse.json({ error: 'Name, email and handle are required' }, { status: 400 })
    }

    // Save to DB
    const application = await prisma.influencerApplication.create({
      data: { name, email, handle, followerCount: followerCount ?? '', message: message ?? '' }
    })

    // Send notification email to admin
   const adminEmail = process.env.ADMIN_NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL ?? process.env.RESEND_TEST_EMAIL
    if (adminEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'Solomon & Sage <onboarding@resend.dev>',
        to: adminEmail,
        subject: `New Influencer Application — ${name}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px;">
            <h2 style="color:#1a1a1a;font-weight:400;font-style:italic;">New Influencer Application</h2>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;"/>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Handle:</strong> ${handle}</p>
            <p><strong>Followers:</strong> ${followerCount}</p>
            <p><strong>Message:</strong><br/>${message}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;"/>
            <p style="font-size:12px;color:#888;">Submitted at ${new Date().toLocaleString()}</p>
          </div>
        `
      })
    }

    // Send confirmation to applicant
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Solomon & Sage <onboarding@resend.dev>',
      to: process.env.NODE_ENV !== 'production' ? (process.env.RESEND_TEST_EMAIL ?? email) : email,
      subject: 'We received your application — Solomon & Sage',
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:#1a1a1a;padding:32px 40px;">
            <div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:4px;">Solomon & Sage</div>
          </div>
          <div style="padding:40px;">
            <h2 style="font-size:24px;font-weight:400;font-style:italic;color:#1a1a1a;">Thank you, ${name.split(' ')[0]}!</h2>
            <p style="color:#666;font-size:14px;line-height:1.8;">
              We've received your creator program application and will review it within 3–5 business days.
              If you're a great fit, we'll reach out to ${email} with next steps.
            </p>
            <p style="color:#666;font-size:14px;line-height:1.8;">
              In the meantime, follow us on social media to stay up to date with our latest drops.
            </p>
          </div>
          <div style="background:#f5f2ed;padding:24px 40px;text-align:center;">
            <p style="font-size:11px;color:#aaa;">© ${new Date().getFullYear()} Solomon & Sage Group LLC</p>
          </div>
        </div>
      `
    })

    return NextResponse.json({ success: true, id: application.id })
  } catch (err: any) {
    console.error('Influencer application error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}