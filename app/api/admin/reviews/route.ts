import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db, reviewSends, reviewRatings, reviewRecipients } from '@/lib/db'
import { buildReviewEmailHtml, buildReviewEmailSubject } from '@/lib/review-email'
import { desc, eq } from 'drizzle-orm'

const resend   = new Resend(process.env.RESEND_API_KEY)
const FROM     = 'contact@webf5.au'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://webf5.com.au'

// ── POST — send review requests ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { fromBusiness, fromEmail, platform, reviewUrl, customMessage, recipients, useFilter, logoBase64 } = await req.json()

    if (!fromBusiness?.trim()) return NextResponse.json({ error: 'From business is required.' }, { status: 400 })
    if (!platform)             return NextResponse.json({ error: 'Platform is required.' }, { status: 400 })
    if (!reviewUrl?.trim())    return NextResponse.json({ error: 'Review URL is required.' }, { status: 400 })
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'At least one recipient is required.' }, { status: 400 })
    }

    type R = { name: string; email: string }
    const valid = (recipients as R[]).filter(r => r.name?.trim() && r.email?.trim())
    if (valid.length === 0) return NextResponse.json({ error: 'No valid recipients found.' }, { status: 400 })

    // Insert the send log row first to get its ID
    const [sendRow] = await db.insert(reviewSends).values({
      fromBusiness:   fromBusiness.trim(),
      platform,
      reviewUrl:      reviewUrl.trim(),
      customMessage:  customMessage?.trim() || null,
      recipientCount: valid.length,
    }).returning({ id: reviewSends.id })

    // Always store recipients for tracking
    await db.insert(reviewRecipients).values(
      valid.map(r => ({
        sendId: sendRow.id,
        name:   r.name.trim(),
        email:  r.email.trim(),
      }))
    )

    // If using the satisfaction filter, generate a token per recipient
    let tokenMap: Record<string, string> = {}

    if (useFilter) {
      const tokenRows = await db.insert(reviewRatings).values(
        valid.map(r => ({
          sendId:         sendRow.id,
          recipientName:  r.name.trim(),
          recipientEmail: r.email.trim(),
          fromBusiness:   fromBusiness.trim(),
          platform,
          reviewUrl:      reviewUrl.trim(),
        }))
      ).returning({ id: reviewRatings.id, recipientEmail: reviewRatings.recipientEmail })

      for (const row of tokenRows) {
        tokenMap[row.recipientEmail] = row.id
      }
    }

    const BATCH_SIZE = 100
    let sent = 0
    const errors: string[] = []

    for (let i = 0; i < valid.length; i += BATCH_SIZE) {
      const batch = valid.slice(i, i + BATCH_SIZE)
      const emailBatch = batch.map((r: R) => {
        const token     = tokenMap[r.email.trim()]
        const ratingUrl = token ? `${BASE_URL}/review?t=${token}` : undefined

        let attachments: { content: string; filename: string; content_type: string; content_id: string; inline: boolean }[] | undefined
        if (logoBase64) {
          const match = (logoBase64 as string).match(/^data:(image\/[a-z+]+);base64,(.+)$/)
          if (match) {
            attachments = [{ content: match[2], filename: 'logo', content_type: match[1], content_id: 'logo', inline: true }]
          }
        }

        return {
          from:    `${fromBusiness.trim()} via Web F5 <${FROM}>`,
          to:      r.email.trim(),
          replyTo: FROM,
          subject: buildReviewEmailSubject(fromBusiness.trim(), platform),
          html:    buildReviewEmailHtml({
            recipientName: r.name.trim(),
            fromBusiness:  fromBusiness.trim(),
            platform,
            reviewUrl:     reviewUrl.trim(),
            fromEmail:     fromEmail?.trim() || undefined,
            customMessage: customMessage?.trim() || undefined,
            ratingUrl,
            hasLogo:       !!logoBase64,
          }),
          ...(attachments ? { attachments } : {}),
        }
      })

      const result = await resend.batch.send(emailBatch)
      if (result.error) errors.push(result.error.message)
      else sent += batch.length
    }

    return NextResponse.json({ success: true, sent, errors })

  } catch (err) {
    console.error('Review send error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

// ── GET — fetch send log with recipients ──────────────────────────────────

export async function GET() {
  try {
    const [logs, allRecipients] = await Promise.all([
      db.select().from(reviewSends).orderBy(desc(reviewSends.createdAt)).limit(100),
      db.select().from(reviewRecipients).orderBy(reviewRecipients.createdAt),
    ])

    // Group recipients by sendId
    const byBatch: Record<string, typeof allRecipients> = {}
    for (const r of allRecipients) {
      if (!byBatch[r.sendId]) byBatch[r.sendId] = []
      byBatch[r.sendId].push(r)
    }

    return NextResponse.json({ logs, recipients: byBatch })
  } catch (err) {
    console.error('Review log error:', err)
    return NextResponse.json({ error: 'Failed to load send log.' }, { status: 500 })
  }
}
