import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db, reviewRecipients, reviewSends } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { buildReviewEmailHtml, buildReviewEmailSubject } from '@/lib/review-email'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'contact@webf5.au'

// PATCH — toggle reviewed status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { reviewed } = await req.json()
  const [row] = await db
    .update(reviewRecipients)
    .set({ reviewed, reviewedAt: reviewed ? new Date() : null })
    .where(eq(reviewRecipients.id, id))
    .returning()
  return NextResponse.json(row)
}

// POST — resend to this recipient
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Load recipient + original send details
  const [recipient] = await db.select().from(reviewRecipients).where(eq(reviewRecipients.id, id))
  if (!recipient) return NextResponse.json({ error: 'Recipient not found.' }, { status: 404 })

  const [send] = await db.select().from(reviewSends).where(eq(reviewSends.id, recipient.sendId))
  if (!send) return NextResponse.json({ error: 'Send record not found.' }, { status: 404 })

  const result = await resend.emails.send({
    from:    `${send.fromBusiness} via Web F5 <${FROM}>`,
    to:      recipient.email,
    replyTo: FROM,
    subject: buildReviewEmailSubject(send.fromBusiness, send.platform),
    html:    buildReviewEmailHtml({
      recipientName: recipient.name,
      fromBusiness:  send.fromBusiness,
      platform:      send.platform,
      reviewUrl:     send.reviewUrl,
      customMessage: send.customMessage ?? undefined,
    }),
  })

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
