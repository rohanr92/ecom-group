import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ success: true, message: 'Already subscribed' })
      }
      // Reactivate if previously unsubscribed
      await prisma.newsletterSubscriber.update({
        where: { email: email.toLowerCase() },
        data: { isActive: true }
      })
      return NextResponse.json({ success: true, message: 'Resubscribed' })
    }

    // Save to DB
    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        source: source ?? 'footer',
      }
    })

    // Send welcome email to subscriber
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Solomon & Sage <onboarding@resend.dev>',
      to: process.env.NODE_ENV !== 'production'
        ? (process.env.RESEND_TEST_EMAIL ?? email)
        : email,
      subject: 'Welcome to Solomon & Sage',
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:#1a1a1a;padding:32px 40px;">
            <div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:4px;">Solomon & Sage</div>
            <div style="color:#c8a882;font-size:11px;letter-spacing:3px;margin-top:4px;font-style:italic;">California Women's Fashion</div>
          </div>
          <div style="padding:40px;">
            <h2 style="font-size:26px;font-weight:400;font-style:italic;color:#1a1a1a;margin:0 0 8px;">You're on the list.</h2>
            <p style="font-size:13px;color:#888;margin:0 0 24px;">Thank you for subscribing to Solomon & Sage.</p>
            <p style="font-size:14px;color:#666;line-height:1.8;">
              You'll be the first to know about new arrivals, exclusive offers, and insider news.
              We promise to only send you things worth reading.
            </p>
            <a href="https://solomonandsage.com/collections"
              style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:14px 32px;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:24px 0;">
              Shop New Arrivals
            </a>
          </div>
          <div style="background:#f5f2ed;padding:24px 40px;text-align:center;">
            <p style="font-size:11px;color:#aaa;margin:4px 0;">© ${new Date().getFullYear()} Solomon & Sage Group LLC. All rights reserved.</p>
            <p style="font-size:11px;color:#aaa;margin:4px 0;">
              <a href="https://solomonandsage.com/privacy" style="color:#aaa;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `
    })

    return NextResponse.json({ success: true, message: 'Subscribed successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}