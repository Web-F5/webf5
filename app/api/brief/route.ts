import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { auth } from '@clerk/nextjs/server'
import type { WizardData } from '@/components/wizard'
import { buildBriefSummary, buildFileLinks } from '@/INTEGRATION'
import { db, briefDrafts } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = 'contact@webf5.au'
const NOTIFY_TO = process.env.NOTIFY_EMAIL!


export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
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
    const fileLinks = buildFileLinks(data)

    // ── Notify Josh (with brief as .md attachment) ────────────────────────
    const briefFilename = `brief-${data.bizName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`
    const briefContent = `${summary}\n\n── Uploaded files ───────────────────────────────────────\n${fileLinks}`
    const briefBase64 = Buffer.from(briefContent, 'utf-8').toString('base64')

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: NOTIFY_TO,
      subject: `New brief — ${data.bizName.trim()}`,
      text: `New brief received from ${data.bizName.trim()} (${data.bizEmail.trim()}).\n\nSee attached .md file for the full brief.`,
      attachments: [
        {
          filename: briefFilename,
          content: briefBase64,
        },
      ],
    })

    // ── Confirm to client (no brief content) ─────────────────────────────
    const clientName = data.contactName?.trim() || data.bizName.trim()
    const clientEmailText = [
      `Hi ${clientName},`,
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
    ].join('\n')

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.bizEmail.trim(),
      replyTo: 'contact@webf5.au',
      subject: `We've received your brief — ${data.bizName.trim()}`,
      text: clientEmailText,
    })

    // Mark the draft as submitted so we stop sending reminders
    const guestToken = req.headers.get('x-guest-token')
    if (userId) {
      // For signed-in users we don't have a guestToken, mark by userId
      try {
        await db.update(briefDrafts)
          .set({ status: 'submitted' })
          .where(and(eq(briefDrafts.userId, userId), eq(briefDrafts.status, 'in_progress')))
      } catch { /* non-critical */ }
    } else if (guestToken) {
      try {
        await db.update(briefDrafts)
          .set({ status: 'submitted' })
          .where(eq(briefDrafts.guestToken, guestToken))
      } catch { /* non-critical */ }
    }

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