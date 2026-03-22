import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { WizardData } from '@/components/wizard'
import { buildBriefSummary } from '@/INTEGRATION'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const data: WizardData = await req.json()

    // 1. Validate
    if (!data.bizName || !data.bizEmail) {
      return NextResponse.json(
        { error: 'Business name and email are required.' },
        { status: 400 }
      )
    }

    const summary = buildBriefSummary(data)

    // 2. Notify you
    await resend.emails.send({
      from: 'briefs@yourdomain.com.au',
      to: process.env.NOTIFY_EMAIL!,
      subject: `New brief — ${data.bizName}`,
      text: summary,
    })

    // 3. Confirm to client
    await resend.emails.send({
      from: 'hello@yourdomain.com.au',
      to: data.bizEmail,
      subject: `We've received your brief, ${data.bizName}!`,
      text: `Hi ${data.bizName},\n\nThank you for completing your discovery brief. We'll review everything and be in touch within 1 business day with your personalised recommendation.\n\nTalk soon,\nThe Web F5 Team`,
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Brief submission error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}