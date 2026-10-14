import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db, reviewSends } from '@/lib/db'
import { buildReviewEmailHtml, buildReviewEmailSubject } from '@/lib/review-email'
import { desc } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'contact@webf5.au'

// ── POST — send review requests ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { fromBusiness, platform, reviewUrl, customMessage, recipients } = await req.json()

    if (!fromBusiness?.trim()) return NextResponse.json({ error: 'From business is required.' }, { status: 400 })
    if (!platform) return NextResponse.json({ error: 'Platform is required.' }, { status: 400 })
    if (!reviewUrl?.trim()) return NextResponse.json({ error: 'Review URL is required.' }, { status: 400 })
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'At least one recipient is required.' }, { status: 400 })
    }

    const validRecipients = recipients.filter(
      (r: { name: string; email: string }) => r.name?.trim() && r.email?.trim()
    )
    if (validRecipients.length === 0) {
      return NextResponse.json({ error: 'No valid recipients found.' }, { status: 400 })
    }

    // Resend supports batch sending up to 100 per call
    const BATCH_SIZE = 100
    let sent = 0
    const errors: string[] = []

    for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
      const batch = validRecipients.slice(i, i + BATCH_SIZE)
      const emailBatch = batch.map((r: { name: string; email: string }) => ({
        from:    `${fromBusiness} via Web F5 <${FROM}>`,
        to:      r.email.trim(),
        replyTo: FROM,
        subject: buildReviewEmailSubject(fromBusiness.trim(), platform),
        html:    buildReviewEmailHtml({
          recipientName: r.name.trim(),
          fromBusiness:  fromBusiness.trim(),
          platform,
          reviewUrl:     reviewUrl.trim(),
          customMessage: customMessage?.trim() || undefined,
        }),
      }))

      const result = await resend.batch.send(emailBatch)
      if (result.error) {
        errors.push(result.error.message)
      } else {
        sent += batch.length
      }
    }

    // Log to DB
    await db.insert(reviewSends).values({
      fromBusiness:   fromBusiness.trim(),
      platform,
      reviewUrl:      reviewUrl.trim(),
      customMessage:  customMessage?.trim() || null,
      recipientCount: sent,
    })

    return NextResponse.json({ success: true, sent, errors })

  } catch (err) {
    console.error('Review send error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

// ── GET — fetch send log ───────────────────────────────────────────────────

export async function GET() {
  try {
    const logs = await db
      .select()
      .from(reviewSends)
      .orderBy(desc(reviewSends.createdAt))
      .limit(100)

    return NextResponse.json({ logs })
  } catch (err) {
    console.error('Review log error:', err)
    return NextResponse.json({ error: 'Failed to load send log.' }, { status: 500 })
  }
}
