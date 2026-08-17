import { NextRequest, NextResponse } from 'next/server'
import { db, briefDrafts } from '@/lib/db'
import { eq, and, lt, isNotNull, lte, sql } from 'drizzle-orm'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Max 2 daily reminder emails per draft
const MAX_REMINDERS = 2

// Send reminder if inactive for 48 hours
const INACTIVITY_THRESHOLD_MS = 48 * 60 * 60 * 1000

export const runtime = 'nodejs'

// Vercel cron calls this with Authorization header
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const cutoff = new Date(now.getTime() - INACTIVITY_THRESHOLD_MS)

  // Find in-progress guest drafts that:
  // - have an email + consent
  // - were active more than 48 hours ago
  // - haven't hit the reminder cap
  const drafts = await db.query.briefDrafts.findMany({
    where: and(
      eq(briefDrafts.status, 'in_progress'),
      eq(briefDrafts.consentFollowupEmail, true),
      isNotNull(briefDrafts.guestEmail),
      isNotNull(briefDrafts.guestToken),
      lt(briefDrafts.lastActivityAt, cutoff),
      lt(briefDrafts.reminderCount, MAX_REMINDERS),
    ),
  })

  let sent = 0
  for (const draft of drafts) {
    if (!draft.guestEmail || !draft.guestToken) continue

    // Skip expired drafts
    if (draft.expiresAt && draft.expiresAt < now) continue

    const resumeUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.webf5.com.au'}/brief/resume/${draft.guestToken}`
    const unsubUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.webf5.com.au'}/api/brief/unsubscribe?token=${draft.guestToken}`

    const isSecond = draft.reminderCount >= 1

    await resend.emails.send({
      from: 'contact@webf5.au',
      to: draft.guestEmail,
      replyTo: 'contact@webf5.au',
      subject: isSecond
        ? `Last reminder — your Web F5 brief is waiting`
        : `Don't lose your progress — finish your Web F5 brief`,
      text: [
        `Hi,`,
        ``,
        isSecond
          ? `This is our last reminder about your Web F5 website brief (step ${draft.currentStep} of 11). After this we'll leave you alone — but your progress is still saved.`
          : `You started a Web F5 website brief but didn't quite finish it. We've saved your progress at step ${draft.currentStep} of 11.`,
        ``,
        `Pick up where you left off:`,
        resumeUrl,
        ``,
        `The brief takes about 20 minutes and helps us give you an accurate fixed-price quote — no vague timelines, no surprises.`,
        ``,
        `Talk soon,`,
        `Josh`,
        `Web F5`,
        ``,
        `—`,
        `Don't want reminders? Unsubscribe: ${unsubUrl}`,
      ].join('\n'),
    }).catch(console.error)

    await db.update(briefDrafts)
      .set({
        reminderCount: draft.reminderCount + 1,
        lastReminderSentAt: now,
      })
      .where(eq(briefDrafts.id, draft.id))

    sent++
  }

  return NextResponse.json({ sent })
}
