import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db, reviewSends, reviewSenderLeads } from '@/lib/db'
import { buildReviewEmailHtml, buildReviewEmailSubject } from '@/lib/review-email'

const resend   = new Resend(process.env.RESEND_API_KEY)
const FROM     = 'contact@webf5.au'

export async function POST(req: NextRequest) {
  try {
    const { senderName, fromBusiness, fromEmail, platform, reviewUrl, customMessage, recipients, logoBase64 } = await req.json()

    if (!senderName?.trim())   return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
    if (!fromEmail?.trim())    return NextResponse.json({ error: 'Your email is required.' }, { status: 400 })
    if (!fromBusiness?.trim()) return NextResponse.json({ error: 'Business name is required.' }, { status: 400 })
    if (!platform)             return NextResponse.json({ error: 'Platform is required.' }, { status: 400 })
    if (!reviewUrl?.trim())    return NextResponse.json({ error: 'Review link is required.' }, { status: 400 })
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'At least one recipient is required.' }, { status: 400 })
    }

    type R = { name: string; email: string }
    const valid = (recipients as R[]).filter(r => r.name?.trim() && r.email?.trim())
    if (valid.length === 0) return NextResponse.json({ error: 'No valid recipients found.' }, { status: 400 })

    // Public route: cap at 10 recipients to prevent abuse
    if (valid.length > 10) return NextResponse.json({ error: 'Maximum 10 recipients per send.' }, { status: 400 })

    // Save send log + lead in parallel
    await Promise.all([
      db.insert(reviewSends).values({
        fromBusiness:   fromBusiness.trim(),
        platform,
        reviewUrl:      reviewUrl.trim(),
        customMessage:  customMessage?.trim() || null,
        recipientCount: valid.length,
      }),
      db.insert(reviewSenderLeads).values({
        senderName:     senderName.trim(),
        senderEmail:    fromEmail.trim(),
        businessName:   fromBusiness.trim(),
        platform,
        recipientCount: valid.length,
      }),
    ])

    const errors: string[] = []
    let sent = 0

    for (const r of valid) {
      let attachments: { content: string; filename: string; content_type: string; content_id: string; inline: boolean }[] | undefined
      if (logoBase64) {
        const match = (logoBase64 as string).match(/^data:(image\/[a-z+]+);base64,(.+)$/)
        if (match) {
          attachments = [{ content: match[2], filename: 'logo', content_type: match[1], content_id: 'logo', inline: true }]
        }
      }

      const res = await resend.emails.send({
        from:    `${fromBusiness.trim()} via Web F5 <${FROM}>`,
        to:      r.email.trim(),
        replyTo: fromEmail?.trim() || FROM,
        subject: buildReviewEmailSubject(fromBusiness.trim(), platform),
        html:    buildReviewEmailHtml({
          recipientName: r.name.trim(),
          fromBusiness:  fromBusiness.trim(),
          platform,
          reviewUrl:     reviewUrl.trim(),
          fromEmail:     fromEmail?.trim() || undefined,
          customMessage: customMessage?.trim() || undefined,
          hasLogo:       !!logoBase64,
        }),
        ...(attachments ? { attachments } : {}),
      })

      if (res.error) errors.push(res.error.message)
      else sent++
    }

    return NextResponse.json({ success: true, sent, errors })

  } catch (err) {
    console.error('Public review send error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
