import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { WizardData } from '@/components/wizard'
import { buildBriefSummary } from '@/INTEGRATION'

const resend = new Resend(process.env.RESEND_API_KEY)

// Sent from this address — must be verified in your Resend account
const FROM_ADDRESS = 'contact@webf5.au'

// Notification inbox — set in Vercel environment variables
// NOTIFY_EMAIL=briefs@webf5.au
const NOTIFY_TO = process.env.NOTIFY_EMAIL!

export async function POST(req: NextRequest) {
  try {
    const data: WizardData = await req.json()

    // ── Validation ────────────────────────────────────────────────────────
    const missing: string[] = []
    if (!data.bizName?.trim()) missing.push('business name')
    if (!data.bizEmail?.trim()) missing.push('email address')

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}. Please go back and complete these before submitting.` },
        { status: 400 }
      )
    }

    const summary = buildBriefSummary(data)

    // ── Notify you ────────────────────────────────────────────────────────
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: NOTIFY_TO,
      subject: `New brief — ${data.bizName.trim()}`,
      text: summary,
    })

    // ── Confirm to client ─────────────────────────────────────────────────
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.bizEmail.trim(),
      replyTo: 'contact@webf5.au',
      subject: `We've received your brief — ${data.bizName.trim()}`,
      text: [
        `Hi ${data.bizName.trim()},`,
        '',
        `Thank you for completing your discovery brief. We've received everything and will review it shortly.`,
        '',
        `You can expect to hear from us within 1 business day with a clear plan and a fixed-price quote tailored to your project.`,
        '',
        `If you have any questions in the meantime, just reply to this email or reach us at contact@webf5.au`,
        '',
        `Talk soon,`,
        `Josh`,
        `Web F5`,
        `contact@webf5.au`,
      ].join('\n'),
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    // Log the full error server-side for debugging
    console.error('Brief submission error:', err)

    // Return a safe message to the client — no internal detail exposed
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please try again, or email us directly at contact@webf5.au' },
      { status: 500 }
    )
  }
}