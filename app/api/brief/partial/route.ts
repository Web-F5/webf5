// app/api/brief/partial/route.ts
// Fires on Step 3 Continue when name + email + phone are present.
// Sends a lightweight lead notification to leads@webf5.au.
// Does not affect the full brief submission flow.

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface PartialData {
  bizName: string
  bizEmail: string
  contactName?: string
  bizPhone: string
  startType?: string
  domainStatus?: string
  bizTagline?: string
  bizDesc?: string
}

export async function POST(req: NextRequest) {
  try {
    const data: PartialData = await req.json()

    // Silently ignore if required fields are missing —
    // this route should only be called when they're present,
    // but guard anyway
    if (!data.bizName?.trim() || !data.bizEmail?.trim() || !data.bizPhone?.trim()) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const timestamp = new Date().toLocaleString('en-AU', {
      timeZone: 'Australia/Melbourne',
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    const lines = [
      `New partial brief — ${data.bizName.trim()}`,
      `Captured: ${timestamp}`,
      '',
      '── Contact ──────────────────────────',
      `Name:   ${data.bizName.trim()}`,
      `Contact: ${data.contactName?.trim() || '—'}`,
      `Email:  ${data.bizEmail.trim()}`,
      `Phone:  ${data.bizPhone.trim()}`,
      '',
      '── What they told us ────────────────',
      `Project type:  ${data.startType || 'not specified'}`,
      `Domain:        ${data.domainStatus || 'not specified'}`,
      `Tagline:       ${data.bizTagline?.trim() || '—'}`,
      `Description:   ${data.bizDesc?.trim() || '—'}`,
      '',
      '── Next step ────────────────────────',
      'This person started the brief but may not have completed it.',
      'If no full brief arrives within 24 hours, consider following up.',
    ]

    await resend.emails.send({
      from: 'contact@webf5.au',
      to: process.env.LEADS_EMAIL ?? process.env.NOTIFY_EMAIL!,
      subject: `New lead — ${data.bizName.trim()} (partial brief)`,
      text: lines.join('\n'),
    })

    return NextResponse.json({ ok: true })

  } catch (err) {
    // Log but don't surface to client — this is a background operation
    console.error('Partial brief capture error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}