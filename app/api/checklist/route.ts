import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db, checklistLeads } from '@/lib/db'
import { buildChecklistEmailHtml, buildChecklistNotifyEmailHtml } from '@/lib/checklist-email'
import { renderChecklistPdf } from '@/lib/checklist-pdf'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'contact@webf5.au'
const NOTIFY = 'leads@webf5.au'

export async function POST(req: NextRequest) {
  try {
    const { name, businessName, email, industry } = await req.json()

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    const nameClean = name.trim()
    const bizClean  = businessName?.trim() || null
    const emailClean = email.trim().toLowerCase()

    await db.insert(checklistLeads).values({
      name:         nameClean,
      businessName: bizClean,
      email:        emailClean,
      industry:     industry || null,
    })

    const [emailHtml, notifyHtml, pdfBuffer] = await Promise.all([
      Promise.resolve(buildChecklistEmailHtml(nameClean)),
      Promise.resolve(buildChecklistNotifyEmailHtml(nameClean, bizClean ?? undefined, emailClean, industry)),
      renderChecklistPdf(nameClean),
    ])

    const pdfAttachment = {
      filename: 'website-checklist-web-f5.pdf',
      content:  pdfBuffer,
    }

    await Promise.all([
      resend.emails.send({
        from:    FROM,
        to:      emailClean,
        replyTo: 'contact@webf5.au',
        subject: 'Your 12-Point Website Checklist — Web F5',
        html:    emailHtml,
        attachments: [pdfAttachment],
      }),
      resend.emails.send({
        from:    FROM,
        to:      NOTIFY,
        replyTo: emailClean,
        subject: `Checklist lead — ${bizClean || nameClean}`,
        html:    notifyHtml,
        attachments: [pdfAttachment],
      }),
    ])

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Checklist lead error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
