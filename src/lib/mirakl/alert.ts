// src/lib/mirakl/alert.ts
// Detects sync failure streaks and sends one email per streak.

import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@solomonandsage.com'
const TO = process.env.MIRAKL_ALERT_EMAIL || 'noreply@solomonandsage.com'
const RESEND_KEY = process.env.RESEND_API_KEY

/**
 * Call this AFTER a sync log row has been written.
 * If the most recent 3 logs of this syncType are all "error" and we haven't
 * already sent an alert for the most recent failure, send one and mark it.
 */
export async function maybeAlertOnSyncFailure(syncType: 'orders' | 'inventory'): Promise<void> {
  if (!RESEND_KEY) {
    console.warn('[mirakl-alert] RESEND_API_KEY not set, skipping alert')
    return
  }

  // Get the last 3 sync logs of this type
  const logs = await prisma.miraklSyncLog.findMany({
    where: { syncType },
    orderBy: { startedAt: 'desc' },
    take: 3,
  })

  // Need at least 3 to trigger
  if (logs.length < 3) return

  // All 3 must be errors
  const allErrors = logs.every((l) => l.status === 'error')
  if (!allErrors) return

  // If the most recent log already had an alert sent, skip (we already alerted for this streak)
  if (logs[0].alertSent) return

  // Compose & send
  const resend = new Resend(RESEND_KEY)
  const subject = `⚠️ Mirakl ${syncType} sync failing — 3 consecutive errors`

  const errorSummaries = logs
    .map((l, i) => {
      const t = new Date(l.startedAt).toISOString()
      const err = (l.errorMessage || '(no message)').slice(0, 200)
      return `${i + 1}. ${t}\n   ${err}`
    })
    .join('\n\n')

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width:600px; margin:0 auto; padding:20px;">
      <h2 style="color:#dc2626; margin:0 0 16px 0;">Mirakl ${syncType} sync failing</h2>
      <p style="color:#374151;">The last 3 ${syncType} sync runs all failed. Auto-recovery has not kicked in.</p>
      <div style="background:#fef2f2; border-left:4px solid #dc2626; padding:12px; margin:16px 0; font-family: monospace; font-size:12px; white-space:pre-wrap; color:#991b1b;">${escape(errorSummaries)}</div>
      <p style="color:#374151;">Check the dashboard:</p>
      <p><a href="https://solomonandsage.com/admin/mirakl-connect/sync-logs" style="background:#1a1a1a; color:white; padding:10px 16px; text-decoration:none; border-radius:6px; display:inline-block;">View sync logs</a></p>
      <p style="color:#9ca3af; font-size:12px; margin-top:24px;">You'll receive one email per failure streak. Once a sync succeeds, alerts reset for future failures.</p>
    </div>
  `

  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      subject,
      html,
    })

    // Mark the most recent log so we don't re-send for the same streak
    await prisma.miraklSyncLog.update({
      where: { id: logs[0].id },
      data: { alertSent: true },
    })

    console.log(`[mirakl-alert] Sent ${syncType} failure alert to ${TO}`)
  } catch (err) {
    console.error('[mirakl-alert] Failed to send alert:', err)
  }
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}